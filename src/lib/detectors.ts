import { detect, tokenize } from "./chips";
import type { FlagHit } from "./flags";

/* Flags that need their own public lookups (server only, live mode only, nothing logged, 10 minute memo per query).
   same-username-everywhere  one handle on 3 or more services: GitHub, Keybase, Hacker News, Gravatar, plus Instagram when it is a chip
   in-the-news               Tavily news for the full name; shown only when the article also carries a second identifier
   just-changed-jobs         Tavily snippets with the name and a new role phrase; partial, snippets rarely carry dates */
const MS = 4000;
const UA = "innovators-guild-retail-ai/0.1 (local hackathon demo)";
const memo = new Map<string, { t: number; p: Promise<FlagHit[]> }>();
const MEMO_MS = 10 * 60 * 1000;

type Ids = { names: string[]; handles: Map<string, Set<string>>; emails: string[] };
function ids(query: string): Ids {
  const out: Ids = { names: [], handles: new Map(), emails: [] };
  const seen = (h: string, where: string) => {
    const k = h.toLowerCase();
    if (!/^[a-z0-9._-]{3,39}$/.test(k)) return;
    if (!out.handles.has(k)) out.handles.set(k, new Set());
    out.handles.get(k)!.add(where);
  };
  for (const raw of tokenize(query)) {
    const { kind, label } = detect(raw);
    if (kind === "name") out.names.push(label);
    else if (kind === "email") { out.emails.push(label); seen(label.split("@")[0], ""); }
    else if (kind === "handle") seen(label.replace(/^@/, ""), "");
    else if (kind === "github") seen(label.split("/")[1] ?? "", "");
    else if (kind === "instagram") seen(label.split("/")[1] ?? "", "Instagram");
  }
  return out;
}

const ok = async (url: string, signal: AbortSignal, headers: Record<string, string> = {}) => {
  const r = await fetch(url, { signal, cache: "no-store", headers: { "user-agent": UA, ...headers } });
  return r;
};
async function services(handle: string, signal: AbortSignal): Promise<string[]> {
  const gh = { accept: "application/vnd.github+json", ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
  const checks = await Promise.allSettled([
    ok(`https://api.github.com/users/${encodeURIComponent(handle)}`, signal, gh).then((r) => (r.status === 200 ? "GitHub" : null)),
    ok(`https://keybase.io/_/api/1.0/user/lookup.json?usernames=${encodeURIComponent(handle)}&fields=basics`, signal).then((r) => r.json())
      .then((j: { them?: unknown[] }) => (Array.isArray(j.them) && j.them[0] ? "Keybase" : null)),
    ok(`https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(handle)}.json`, signal).then((r) => r.json()).then((j: unknown) => (j ? "Hacker News" : null)),
    ok(`https://en.gravatar.com/${encodeURIComponent(handle)}.json`, signal).then((r) => (r.status === 200 ? "Gravatar" : null)),
  ]);
  return checks.flatMap((c) => (c.status === "fulfilled" && c.value ? [c.value] : []));
}

async function sameUsername(x: Ids, signal: AbortSignal): Promise<FlagHit> {
  const list = [...x.handles.entries()].slice(0, 3);
  if (!list.length) return { id: "same-username-everywhere", state: "skip", evidence: "No username or email in the query" };
  const found = await Promise.all(list.map(async ([h, where]) => {
    const s = new Set([...(await services(h, signal)), ...[...where].filter(Boolean)]);
    return { h, s: [...s] };
  }));
  const best = found.sort((a, b) => b.s.length - a.s.length)[0];
  const ev = found.map((f) => `${f.h}: ${f.s.join(", ") || "none"}`).join("; ");
  return { id: "same-username-everywhere", state: best.s.length >= 3 ? "yes" : "no", evidence: ev };
}

type Hit = { url: string; title: string; content?: string; published_date?: string };
async function tavily(body: Record<string, unknown>, signal: AbortSignal): Promise<Hit[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("No Tavily key");
  const r = await fetch("https://api.tavily.com/search", {
    method: "POST", signal, cache: "no-store",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}`, "user-agent": UA },
    body: JSON.stringify({ search_depth: "basic", max_results: 6, ...body }),
  });
  if (!r.ok) throw new Error(`Tavily ${r.status}`);
  return ((await r.json()) as { results?: Hit[] }).results ?? [];
}
const has = (h: Hit, s: string) => `${h.title} ${h.content ?? ""}`.toLowerCase().includes(s.toLowerCase());

async function inTheNews(x: Ids, signal: AbortSignal): Promise<FlagHit> {
  const name = x.names[0];
  if (!name) return { id: "in-the-news", state: "skip", evidence: "No name in the query" };
  const hits = (await tavily({ query: `"${name}"`, topic: "news", time_range: "year" }, signal)).filter((h) => has(h, name));
  /* A second identifier from the other chips (a handle, or an email's local part) rules out a namesake. */
  const second = [...x.handles.keys()];
  const sure = hits.filter((h) => second.some((s) => has(h, s)));
  if (sure.length) return { id: "in-the-news", state: "yes", evidence: `${sure.length} recent articles name you with ${second.find((s) => has(sure[0], s))}`, urls: sure.slice(0, 3).map((h) => h.url) };
  if (hits.length) return { id: "in-the-news", state: "maybe", evidence: `${hits.length} recent articles use the name, with no second identifier, so they may be a namesake`, urls: hits.slice(0, 3).map((h) => h.url) };
  return { id: "in-the-news", state: "no", evidence: "No recent news article uses the name" };
}

const NEW_ROLE = /(started a new position|starting a new position|new position as|new role|joined [^.]{0,40} as|excited to (announce|share)[^.]{0,60}(joined|joining|role)|happy to share that i.?m starting)/i;
async function jobChange(x: Ids, signal: AbortSignal): Promise<FlagHit> {
  const name = x.names[0];
  if (!name) return { id: "just-changed-jobs", state: "skip", evidence: "No name in the query" };
  const hits = (await tavily({ query: `"${name}" new position OR new role OR joined`, time_range: "year" }, signal)).filter((h) => has(h, name) && NEW_ROLE.test(`${h.title} ${h.content ?? ""}`));
  if (!hits.length) return { id: "just-changed-jobs", state: "no", evidence: "No result pairs the name with a new role" };
  /* Partial: shown only when a second identifier matches as well, otherwise kept as possible. */
  const second = [...x.handles.keys()];
  const sure = hits.filter((h) => /linkedin\.com\/(in|posts)\//i.test(h.url) || second.some((s) => has(h, s)));
  return { id: "just-changed-jobs", state: sure.length ? "yes" : "maybe", evidence: `${hits.length} results mention a new role`, urls: (sure.length ? sure : hits).slice(0, 3).map((h) => h.url) };
}

export function networkFlags(query: string, reqSignal?: AbortSignal): Promise<FlagHit[]> {
  const key = query.trim().toLowerCase();
  const m = memo.get(key);
  if (m && Date.now() - m.t < MEMO_MS) return m.p;
  const signal = reqSignal ? AbortSignal.any([reqSignal, AbortSignal.timeout(MS)]) : AbortSignal.timeout(MS);
  const x = ids(query);
  const safe = (id: FlagHit["id"], p: Promise<FlagHit>) => p.catch((e: unknown): FlagHit => ({ id, state: "skip", evidence: `Could not check: ${e instanceof Error ? (e.name === "TimeoutError" ? "timed out" : e.message) : "error"}` }));
  const p = Promise.all([safe("same-username-everywhere", sameUsername(x, signal)), safe("in-the-news", inTheNews(x, signal)), safe("just-changed-jobs", jobChange(x, signal))]);
  const entry = { t: Date.now(), p };
  memo.set(key, entry);
  p.then((r) => { if (r.some((f) => f.evidence.startsWith("Could not check"))) memo.delete(key); });
  return p;
}

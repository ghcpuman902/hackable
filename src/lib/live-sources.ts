/* Live sources, used only when SCAN_MODE=live (approved by Mangle on 24 Nov 2026 for free public APIs).
   Each source maps a real public reply onto ScanResult. Every check shares one short deadline and never
   throws: on any error or timeout it returns a "Could not check" result.

   leakCheck   LeakCheck public API (email)
   hibpTest    cached HIBP results for Mangle's preset emails only, plus LeakCheck and XposedOrNot breach names, merged
   hudsonRock  Hudson Rock Cavalier free OSINT (email and username)
   github      GitHub public REST, unauthenticated: profile and author emails in recent public commits
   social      Gravatar public profile (email hash) and Keybase (username)
   forum       Hacker News public profile (username).
   web         one search for the name: Tavily when TAVILY_API_KEY is set, otherwise DuckDuckGo HTML;
               linkedin reads the same results (LinkedIn itself is never fetched)
   GITHUB_TOKEN, when set, is sent as the Authorization header to the GitHub API. Keys are never logged.
   peopleSearch and publicContact have no free source, so live mode drops their cards (LIVE_DROPPED in synthetic.ts)
   and returns "skipped" if they are ever called. Live mode never returns synthetic data. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { HIBP_CACHE_EMAILS } from "./presets";
import { detect, tokenize } from "./chips";
import type { Facts, ScanResult, ScanTool } from "./synthetic";

const TIMEOUT_MS = 4000;
const UA = "innovators-guild-retail-ai/0.1 (local hackathon demo)";
const gh = (): Record<string, string> => ({
  accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Ids = { emails: string[]; usernames: string[]; github: string[]; names: string[] };

/* Which chips are emails, usernames or GitHub handles, using the same parsing as the search box. */
export function identifiers(query: string): Ids {
  const ids: Ids = { emails: [], usernames: [], github: [], names: [] };
  const add = (list: string[], v: string | undefined) => { if (v && !list.includes(v)) list.push(v); };
  for (const raw of tokenize(query)) {
    const { kind, label } = detect(raw);
    if (kind === "email") add(ids.emails, label);
    else if (kind === "handle") add(ids.usernames, label.replace(/^@/, ""));
    else if (kind === "github") add(ids.github, label.split("/")[1]);
    else if (kind === "name") add(ids.names, label);
  }
  /* A bare username is also tried as a GitHub login. */
  for (const u of ids.usernames) add(ids.github, u);
  const login = /^[a-z\d](?:[a-z\d-]{0,38})$/i;
  return { emails: ids.emails.slice(0, 3), usernames: ids.usernames.slice(0, 3), github: ids.github.filter((g) => login.test(g)).slice(0, 1), names: ids.names.slice(0, 1) };
}

async function getJson<T>(url: string, signal: AbortSignal, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json", ...headers }, signal, cache: "no-store" });
  const text = await res.text();
  let data: T | null = null;
  try { data = JSON.parse(text) as T; } catch { /* non-JSON reply */ }
  return { status: res.status, data };
}

const skipped = (why: string, found: string): ScanResult => ({ found, hit: false, source: "skipped", detail: why });
const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
const list = (xs: string[], n = 6) => xs.slice(0, n).join(", ") + (xs.length > n ? ` and ${xs.length - n} more` : "");

/* ---- LeakCheck public API: free, no key, email lookup ---- */
type LeakCheckReply = { success: boolean; found?: number; fields?: string[]; sources?: { name: string; date?: string }[]; error?: string };
type Leaks = { found: number; fields: string[]; sources: { name: string; date?: string }[] };

async function leakCheckEmail(email: string, signal: AbortSignal): Promise<Leaks> {
  const { status, data } = await getJson<LeakCheckReply>(`https://leakcheck.io/api/public?check=${encodeURIComponent(email)}`, signal);
  if (data?.success) {
    return { found: data.found ?? 0, fields: data.fields ?? [], sources: data.sources ?? [] };
  }
  if (data && /not found/i.test(data.error ?? "")) return { found: 0, fields: [], sources: [] };
  throw new Error(`LeakCheck HTTP ${status}${data?.error ? `: ${data.error}` : ""}`);
}

/* ---- Hudson Rock Cavalier free OSINT: infostealer logs by email or username ---- */
type HudsonReply = { message?: string; stealers?: { date_compromised?: string; operating_system?: string }[] };

async function hudson(kind: "email" | "username", value: string, signal: AbortSignal) {
  const url = `https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-${kind}?${kind}=${encodeURIComponent(value)}`;
  const { status, data } = await getJson<HudsonReply>(url, signal);
  if (!data || !Array.isArray(data.stealers)) throw new Error(`Hudson Rock HTTP ${status}${data?.message ? `: ${data.message}` : ""}`);
  return data.stealers.map((s) => s.date_compromised?.slice(0, 10) ?? "unknown date");
}

/* ---- GitHub public REST, unauthenticated: profile plus author emails in recent public commits ---- */
type GhUser = { login: string; name: string | null; public_repos: number; followers: number; created_at: string; email: string | null };
type GhRepo = { full_name: string; fork: boolean };
type GhCommit = { commit?: { author?: { email?: string } } };

async function github(login: string, signal: AbortSignal): Promise<ScanResult> {
  const [user, repos] = await Promise.all([
    getJson<GhUser>(`https://api.github.com/users/${login}`, signal, gh()),
    getJson<GhRepo[]>(`https://api.github.com/users/${login}/repos?sort=pushed&per_page=5&type=owner`, signal, gh()),
  ]);
  if (user.status === 404) return { found: "No GitHub profile", hit: false, source: "live", detail: `No GitHub user ${login}` };
  if (!user.data?.login) throw new Error(`GitHub HTTP ${user.status}${user.status === 403 ? " (rate limit)" : ""}`);
  const emails = new Set<string>();
  if (user.data.email) emails.add(user.data.email.toLowerCase());
  const own = (Array.isArray(repos.data) ? repos.data : []).filter((r) => !r.fork).slice(0, 2);
  const commits = await Promise.all(own.map((r) =>
    getJson<GhCommit[]>(`https://api.github.com/repos/${r.full_name}/commits?per_page=30&author=${login}`, signal, gh()).catch(() => null)));
  for (const c of commits) for (const x of Array.isArray(c?.data) ? c.data : []) {
    const e = x.commit?.author?.email?.toLowerCase();
    if (e && !e.endsWith("noreply.github.com")) emails.add(e);
  }
  const u = user.data;
  const profile = `@${u.login}${u.name ? ` (${u.name})` : ""}, ${plural(u.public_repos, "public repo")}, ${plural(u.followers, "follower")}, joined ${u.created_at.slice(0, 4)}`;
  const seen = [...emails];
  return seen.length
    ? { found: "Found: email in commits", hit: true, source: "live", detail: `${profile}; commit emails: ${list(seen)} (from ${own.map((r) => r.full_name).join(", ")})`,
        facts: { emails: seen, repos: own.map((r) => r.full_name) } }
    : { found: "Found: profile, no emails", hit: false, source: "live", detail: `${profile}; no personal email in recent public commits` };
}

/* ---- HIBP: cached results from the HIBP website, read only for Mangle's preset emails. No HIBP call is made
   for any other input. The file sits under the gitignored _agent/ folder; without it this source is skipped. ---- */
type HibpCache = { source?: string; accounts?: Record<string, { breaches?: { name: string; date?: string; dataClasses?: string[] }[]; pastes?: { name: string; date?: string }[] }> };
const HIBP_CACHE_PATH = path.join(process.cwd(), "_agent", "data", "hibp-cache.json");

async function hibpCache(): Promise<HibpCache | null> {
  try { return JSON.parse(await readFile(HIBP_CACHE_PATH, "utf8")) as HibpCache; } catch { return null; }
}

const checkedOn = (source?: string) => {
  const m = source?.match(/checked (\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "Have I Been Pwned";
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+m[2] - 1];
  return `Have I Been Pwned, checked ${+m[3]} ${month}`;
};

/* ---- XposedOrNot: free, no key, at most 2 requests a second ---- */
async function xposedOrNot(email: string, signal: AbortSignal): Promise<string[]> {
  const { status, data } = await getJson<{ breaches?: string[][]; Error?: string }>(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`, signal);
  if (data?.breaches) return data.breaches.flat();
  if (data?.Error && /not found/i.test(data.Error)) return [];
  throw new Error(`XposedOrNot HTTP ${status}${data?.Error ? `: ${data.Error}` : ""}`);
}

/* Breach lists name the same leak differently ("Chess.com (2023)", "Chess"; "ALIEN TXTBASE Stealer Logs", "AlienStealerLogs"). */
const norm = (n: string) => n.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]/g, "");
const first = (n: string) => n.toLowerCase().match(/[a-z0-9]+/)?.[0] ?? "";
const same = (a: string, b: string) => {
  const x = norm(a), y = norm(b);
  return x === y || (Math.min(x.length, y.length) >= 5 && (x.startsWith(y) || y.startsWith(x))) || (first(a).length >= 5 && first(a) === first(b));
};
const CREDS = /stealer|credential stuffing|combo|naz\.api/i;
const STEALER_LOG = /stealer\s*log/i;

type Once = <T>(key: string, f: () => Promise<T>) => Promise<T>;
type Runner = (ids: Ids, signal: AbortSignal, once: Once) => Promise<ScanResult>;

const leaksFor = (ids: Ids, signal: AbortSignal, once: Once) =>
  Promise.all(ids.emails.map((e) => once(`leakcheck:${e}`, () => leakCheckEmail(e, signal))));

const RUNNERS: Partial<Record<ScanTool, Runner>> = {
  leakCheck: async (ids, signal, once) => {
    if (!ids.emails.length) return skipped("No email in the query", "No email to check");
    const leaks = await leaksFor(ids, signal, once);
    const n = leaks.reduce((a, l) => a + l.found, 0);
    const pw = leaks.some((l) => l.found > 0 && l.fields.includes("password"));
    const fields = [...new Set(leaks.flatMap((l) => l.fields))];
    if (!n) return { found: "No leaks found", hit: false, source: "live", detail: "LeakCheck: no records" };
    return { found: pw ? `Found: passwords in ${n} leaks` : `Found: ${plural(n, "leak")}`, hit: true, source: "live",
      detail: `LeakCheck: ${plural(n, "record")}; fields: ${fields.join(", ") || "none listed"}`,
      facts: { passwords: pw, breaches: leaks.flatMap((l) => l.sources) } };
  },
  hibpTest: async (ids, signal, once) => {
    if (!ids.emails.length) return skipped("No email in the query", "No email to check");
    type Breach = NonNullable<Facts["breaches"]>[number];
    const merged: Breach[] = [];
    const add = (b: Breach) => {
      const m = merged.find((x) => x.email === b.email && same(x.name, b.name));
      if (!m) { merged.push(b); return; }
      m.date ??= b.date; m.passwords ||= b.passwords; m.creds ||= b.creds;
    };
    const pastes: NonNullable<Facts["pastes"]> = [];
    const checked: string[] = [], failed: string[] = [], counts: string[] = [];

    /* 1. Cached HIBP, only for the preset emails. */
    const presets = ids.emails.filter((e) => HIBP_CACHE_EMAILS.includes(e));
    const cache = presets.length ? await hibpCache() : null;
    if (cache?.accounts) {
      checked.push(checkedOn(cache.source));
      for (const e of presets) {
        const acc = cache.accounts[e];
        if (!acc) continue;
        for (const x of acc.breaches ?? []) add({ name: x.name, date: x.date, email: e, passwords: !!x.dataClasses?.includes("Passwords"), creds: CREDS.test(x.name) });
        for (const p of acc.pastes ?? []) pastes.push({ name: p.name, date: p.date, email: e, creds: CREDS.test(p.name) });
        counts.push(`HIBP cache ${e}: ${acc.breaches?.length ?? 0} breaches, ${acc.pastes?.length ?? 0} pastes`);
      }
    }
    /* 2. LeakCheck (shared with the Leaked passwords card) and 3. XposedOrNot, one email every 500ms. */
    const [leaks, xon] = await Promise.all([
      Promise.all(ids.emails.map((e) => once(`leakcheck:${e}`, () => leakCheckEmail(e, signal)).then((l) => ({ e, l }), () => null))),
      (async () => {
        const out: { e: string; names: string[] }[] = [];
        for (const [i, e] of ids.emails.entries()) {
          if (i) await wait(500);
          try { out.push({ e, names: await once(`xon:${e}`, () => xposedOrNot(e, signal)) }); } catch (err) { failed.push(err instanceof Error ? err.message : "XposedOrNot error"); break; }
        }
        return out;
      })(),
    ]);
    if (leaks.some(Boolean)) checked.push("LeakCheck"); else failed.push("LeakCheck");
    for (const r of leaks) if (r) { for (const x of r.l.sources) add({ name: x.name, date: x.date, email: r.e, creds: CREDS.test(x.name) }); counts.push(`LeakCheck ${r.e}: ${r.l.sources.length}`); }
    if (xon.length) checked.push("XposedOrNot");
    for (const r of xon) { for (const n of r.names) add({ name: n, email: r.e, creds: CREDS.test(n) }); counts.push(`XposedOrNot ${r.e}: ${r.names.length}`); }
    if (!checked.length) throw new Error(failed.join("; ") || "No breach source answered");

    const detail = `${counts.join("; ")}; merged ${merged.length}${failed.length ? `; could not check ${failed.join(", ")}` : ""}`;
    const facts: Facts = { breaches: merged, pastes, checked };
    return merged.length
      ? { found: `Found: ${plural(merged.length, "breach", "breaches")}`, hit: true, source: "live", detail, facts }
      : { found: "No breaches found", hit: false, source: "live", detail, facts };
  },
  hudsonRock: async (ids, signal, once) => {
    const q = [...ids.emails.map((v) => ["email", v] as const), ...ids.usernames.map((v) => ["username", v] as const)];
    if (!q.length) return skipped("No email or username in the query", "Nothing to check");
    /* Stealer log lists named in the cached HIBP results (preset emails only) are a hit on their own. */
    const presets = ids.emails.filter((e) => HIBP_CACHE_EMAILS.includes(e));
    const cache = presets.length ? await hibpCache() : null;
    const lists = [...new Set(presets.flatMap((e) => (cache?.accounts?.[e]?.breaches ?? []).filter((b) => STEALER_LOG.test(b.name)).map((b) => b.name)))];
    const devices = await Promise.all(q.map(([k, v]) => once(`hudson:${k}:${v}`, () => hudson(k, v, signal)))).then((x) => x.flat(), (e: unknown) => {
      if (!lists.length) throw e;
      return null;
    });
    const hr = devices === null ? "Hudson Rock: could not check"
      : devices.length ? `Hudson Rock: compromised ${list(devices)}` : `Hudson Rock: no infected device found for ${plural(q.length, "identifier")}`;
    if (devices?.length) return { found: `Found: ${plural(devices.length, "infected device")}`, hit: true, source: "live", detail: hr, facts: { devices, stealerLists: lists } };
    if (lists.length) return { found: "Found in a stealer log list", hit: true, source: "live", detail: `${checkedOn(cache?.source)}: ${list(lists)}; ${hr}`,
      facts: { devices: [], stealerLists: lists, noDevice: devices !== null } };
    return { found: "No stealer logs found", hit: false, source: "live", detail: hr };
  },
  github: async (ids, signal, once) => {
    if (!ids.github.length) return skipped("No GitHub handle in the query", "No GitHub handle");
    return once(`gh:${ids.github[0].toLowerCase()}`, () => github(ids.github[0], signal));
  },
  social: async (ids, signal, once) => {
    const user = ids.usernames[0];
    if (!ids.emails.length && !user) return skipped("No email or username in the query", "Nothing to check");
    const checks = await Promise.allSettled([
      ...ids.emails.map((e) => once(`grav:${e}`, () => gravatar(e, signal))),
      ...(user ? [once(`kb:${user.toLowerCase()}`, () => keybase(user, signal))] : []),
    ]);
    return profiles("social", checks, user);
  },
  forum: async (ids, signal, once) => {
    const user = ids.usernames[0];
    if (!user) return skipped("No username in the query", "No username to check");
    return profiles("forum", await Promise.allSettled([once(`hn:${user.toLowerCase()}`, () => hackerNews(user, signal))]), user);
  },
  web: async (ids, signal, once) => {
    if (!ids.names.length) return skipped("No name in the query", "No name to search");
    const { engine, urls } = await once(`search:${ids.names[0]}`, () => search(ids.names[0], signal));
    const domains = [...new Set(urls.map((u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } }).filter(Boolean))];
    return urls.length
      ? { found: `Found: ${plural(urls.length, "result")}`, hit: false, source: "live", detail: `${engine}: ${list(domains)}`, facts: { results: urls.length, domains } }
      : { found: "No results found", hit: false, source: "live", detail: `${engine}: no results` };
  },
  linkedin: async (ids, signal, once) => {
    if (!ids.names.length) return skipped("No name in the query", "No name to search");
    const { urls } = await once(`search:${ids.names[0]}`, () => search(ids.names[0], signal));
    const li = urls.filter((u) => /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\//i.test(u));
    return li.length
      ? { found: "Found: public profile", hit: false, source: "live", detail: `Search result: ${list(li, 2)}`, facts: { profiles: ["LinkedIn"] } }
      : { found: "Not in search results", hit: false, source: "live", detail: "No linkedin.com/in result for the name" };
  },
};

/* ---- profile checks: each resolves to a site name when a public profile exists, or null ---- */
type Profile = { site: string; linked?: string[] } | null;

async function gravatar(email: string, signal: AbortSignal): Promise<Profile> {
  const hash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  const { status, data } = await getJson<{ verified_accounts?: { service_label?: string; service_type?: string }[] }>(`https://api.gravatar.com/v3/profiles/${hash}`, signal);
  if (status === 404) return null;
  if (status !== 200 || !data) throw new Error(`Gravatar HTTP ${status}`);
  return { site: "Gravatar", linked: (data.verified_accounts ?? []).map((a) => a.service_label || a.service_type || "").filter(Boolean) };
}

async function keybase(user: string, signal: AbortSignal): Promise<Profile> {
  const { status, data } = await getJson<{ status?: { code: number }; them?: (object | null)[] }>(
    `https://keybase.io/_/api/1.0/user/lookup.json?usernames=${encodeURIComponent(user)}&fields=basics`, signal);
  if (!data?.them) throw new Error(`Keybase HTTP ${status}`);
  return data.them[0] ? { site: "Keybase" } : null;
}

async function hackerNews(user: string, signal: AbortSignal): Promise<Profile> {
  const { status, data } = await getJson<{ id?: string } | null>(`https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(user)}.json`, signal);
  if (status !== 200) throw new Error(`Hacker News HTTP ${status}`);
  return data?.id ? { site: "Hacker News" } : null;
}

function profiles(kind: "social" | "forum", checks: PromiseSettledResult<Profile>[], user?: string): ScanResult {
  const failed = checks.flatMap((c) => (c.status === "rejected" ? [c.reason instanceof Error ? c.reason.message : "error"] : []));
  if (failed.length === checks.length) throw new Error(failed.join("; "));
  const found = checks.flatMap((c) => (c.status === "fulfilled" && c.value ? [c.value] : []));
  const sites = [...new Set(found.map((p) => p.site))];
  const linked = [...new Set(found.flatMap((p) => p.linked ?? []))];
  const note = failed.length ? `; could not check ${failed.join(", ")}` : "";
  const facts = { profiles: sites, linked, username: user };
  if (!sites.length) return { found: kind === "forum" ? "No forum profiles found" : "No public profiles found", hit: false, source: "live", detail: `None found${note}`, facts };
  return { found: `Found: ${sites.join(", ")}`, hit: sites.includes("Gravatar"), source: "live",
    detail: `${sites.join(", ")}${linked.length ? ` (linked: ${linked.join(", ")})` : ""}${note}`, facts };
}

/* ---- one public web search for the name: Tavily when TAVILY_API_KEY is set, DuckDuckGo HTML otherwise or when Tavily fails ---- */
type Search = { engine: string; urls: string[] };
const TAVILY_MS = 2500;
async function tavily(name: string, key: string, signal: AbortSignal): Promise<Search> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST", signal, cache: "no-store",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}`, "user-agent": UA },
    body: JSON.stringify({ query: `"${name}"`, max_results: 10, search_depth: "basic" }),
  });
  if (!res.ok) throw new Error(`Tavily HTTP ${res.status}`);
  const data = (await res.json()) as { results?: { url: string }[] };
  return { engine: "Tavily", urls: [...new Set((data.results ?? []).map((r) => r.url))].slice(0, 10) };
}
async function search(name: string, signal: AbortSignal): Promise<Search> {
  const key = process.env.TAVILY_API_KEY;
  let note = "";
  if (key) {
    try { return await tavily(name, key, AbortSignal.any([signal, AbortSignal.timeout(TAVILY_MS)])); }
    catch (e) { note = ` (Tavily failed: ${e instanceof Error ? (e.name === "TimeoutError" ? "timed out" : e.message) : "error"})`; }
  }
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`"${name}"`)}`,
    { headers: { "user-agent": UA, accept: "text/html" }, signal, cache: "no-store" });
  if (res.status !== 200) throw new Error(`Search HTTP ${res.status}${res.status === 202 ? " (rate limited)" : ""}${note}`);
  const html = await res.text();
  const urls = [...html.matchAll(/result__url" href="[^"]*?uddg=([^&"]+)/g)].map((m) => decodeURIComponent(m[1]));
  return { engine: "DuckDuckGo" + note, urls: [...new Set(urls)].slice(0, 10) };
}
/* ---- one shared memo for every network call, keyed by the identifier it checks, kept for 10 minutes.
   A chip preloaded on its own (/api/preload) warms exactly the calls a later scan of all chips makes.
   A failed or aborted call is dropped, so the next scan tries it again. ---- */
const MEMO_MS = 10 * 60 * 1000;
const memo = new Map<string, { p: Promise<unknown>; done: boolean; t: number }>();
const shared: Once = (key, f) => {
  const now = Date.now();
  const hit = memo.get(key);
  if (hit && now - hit.t < MEMO_MS) return hit.p as ReturnType<typeof f>;
  const entry = { p: f() as Promise<unknown>, done: false, t: now };
  memo.set(key, entry);
  entry.p.then(() => { entry.done = true; }, () => { if (memo.get(key) === entry) memo.delete(key); });
  return entry.p as ReturnType<typeof f>;
};
const ready = (key: string) => { const m = memo.get(key); return !!m && m.done && Date.now() - m.t < MEMO_MS; };

/* True when every network call a scan of this query makes has already finished, so the cards can settle at once. */
export function warm(query: string): boolean {
  const ids = identifiers(query);
  const keys = [
    ...ids.emails.flatMap((e) => [`leakcheck:${e}`, `xon:${e}`, `hudson:email:${e}`, `grav:${e}`]),
    ...ids.usernames.map((u) => `hudson:username:${u}`),
    ...ids.usernames.slice(0, 1).flatMap((u) => [`kb:${u.toLowerCase()}`, `hn:${u.toLowerCase()}`]),
    ...ids.github.map((g) => `gh:${g.toLowerCase()}`),
    ...ids.names.map((n) => `search:${n}`),
  ];
  return keys.length > 0 && keys.every(ready);
}

export function makeLiveContext({ quiet = false } = {}) {
  const once = shared;
  return {
    check(tool: ScanTool, query: string, abortSignal?: AbortSignal): Promise<ScanResult> {
      const run = RUNNERS[tool] ?? (async () => skipped("No free live source", "Not checked"));
      const deadline = AbortSignal.timeout(TIMEOUT_MS);
      const signal = abortSignal ? AbortSignal.any([abortSignal, deadline]) : deadline;
      return run(identifiers(query), signal, once)
        .catch((e: unknown): ScanResult => ({
          found: "Could not check", hit: false, source: "unavailable",
          detail: e instanceof Error && e.name === "TimeoutError" ? `Timed out after ${TIMEOUT_MS / 1000}s` : e instanceof Error ? e.message : "Unknown error",
        }))
        .then((r) => { if (!quiet) console.info(`[scan:live] ${tool}: ${r.found} (${r.source}) | ${r.detail ?? ""}`); return r; });
    },
  };
}

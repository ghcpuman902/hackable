/* Live sources, used only when SCAN_MODE=live (approved by Mangle on 24 Nov 2026 for free public APIs).
   Each source maps a real public reply onto ScanResult. Every check shares one short deadline and never
   throws: on any error or timeout it returns a "Could not check" result.

   leakCheck   LeakCheck public API (email)
   hibpTest    HIBP when HIBP_API_KEY is set, otherwise the breach names LeakCheck already returned
   hudsonRock  Hudson Rock Cavalier free OSINT (email and username)
   github      GitHub public REST, unauthenticated: profile and author emails in recent public commits
   social      Gravatar public profile (email hash) and Keybase (username)
   forum       Hacker News and Reddit public profiles (username)
   web         one DuckDuckGo HTML search for the name; linkedin reads the same results (LinkedIn itself is never fetched)
   peopleSearch and publicContact have no free source, so live mode drops their cards (LIVE_DROPPED in synthetic.ts)
   and returns "skipped" if they are ever called. Live mode never returns synthetic data. */
import { createHash } from "node:crypto";
import { detect, tokenize } from "./chips";
import type { ScanResult, ScanTool } from "./synthetic";

const TIMEOUT_MS = 4000;
const UA = "innovators-guild-retail-ai/0.1 (local hackathon demo)";
const GH = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" };

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
    getJson<GhUser>(`https://api.github.com/users/${login}`, signal, GH),
    getJson<GhRepo[]>(`https://api.github.com/users/${login}/repos?sort=pushed&per_page=5&type=owner`, signal, GH),
  ]);
  if (user.status === 404) return { found: "No GitHub profile", hit: false, source: "live", detail: `No GitHub user ${login}` };
  if (!user.data?.login) throw new Error(`GitHub HTTP ${user.status}${user.status === 403 ? " (rate limit)" : ""}`);
  const emails = new Set<string>();
  if (user.data.email) emails.add(user.data.email.toLowerCase());
  const own = (Array.isArray(repos.data) ? repos.data : []).filter((r) => !r.fork).slice(0, 2);
  const commits = await Promise.all(own.map((r) =>
    getJson<GhCommit[]>(`https://api.github.com/repos/${r.full_name}/commits?per_page=30&author=${login}`, signal, GH).catch(() => null)));
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

/* ---- HIBP: only with HIBP_API_KEY (paid); never logged ---- */
async function hibp(email: string, key: string, signal: AbortSignal): Promise<string[]> {
  const res = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=true`,
    { headers: { "user-agent": UA, "hibp-api-key": key }, signal, cache: "no-store" });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`HIBP HTTP ${res.status}`);
  return ((await res.json()) as { Name: string }[]).map((b) => b.Name);
}

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
    const key = process.env.HIBP_API_KEY;
    const found = key
      ? (await Promise.all(ids.emails.map((e) => hibp(e, key, signal)))).flat().map((name): { name: string; date?: string } => ({ name }))
      : (await leaksFor(ids, signal, once)).flatMap((l) => l.sources);
    const via = key ? "HIBP" : "LeakCheck (HIBP skipped: no key)";
    const uniq = [...new Map(found.map((b) => [b.name, b])).values()];
    return uniq.length
      ? { found: `Found: ${plural(uniq.length, "breach", "breaches")}`, hit: true, source: "live",
          detail: `${via}: ${list(uniq.map((b) => (b.date ? `${b.name} (${b.date})` : b.name)))}`, facts: { breaches: uniq } }
      : { found: "No breaches found", hit: false, source: "live", detail: `${via}: none` };
  },
  hudsonRock: async (ids, signal) => {
    const q = [...ids.emails.map((v) => ["email", v] as const), ...ids.usernames.map((v) => ["username", v] as const)];
    if (!q.length) return skipped("No email or username in the query", "Nothing to check");
    const hits = (await Promise.all(q.map(([k, v]) => hudson(k, v, signal)))).flat();
    return hits.length
      ? { found: `Found: ${plural(hits.length, "infected device")}`, hit: true, source: "live", detail: `Hudson Rock: compromised ${list(hits)}`, facts: { devices: hits } }
      : { found: "No stealer logs found", hit: false, source: "live", detail: `Hudson Rock: no infostealer record for ${plural(q.length, "identifier")}` };
  },
  github: async (ids, signal) => {
    if (!ids.github.length) return skipped("No GitHub handle in the query", "No GitHub handle");
    return github(ids.github[0], signal);
  },
  social: async (ids, signal) => {
    const user = ids.usernames[0];
    if (!ids.emails.length && !user) return skipped("No email or username in the query", "Nothing to check");
    const checks = await Promise.allSettled([
      ...ids.emails.map((e) => gravatar(e, signal)),
      ...(user ? [keybase(user, signal)] : []),
    ]);
    return profiles("social", checks, user);
  },
  forum: async (ids, signal) => {
    const user = ids.usernames[0];
    if (!user) return skipped("No username in the query", "No username to check");
    return profiles("forum", await Promise.allSettled([hackerNews(user, signal), reddit(user, signal)]), user);
  },
  web: async (ids, signal, once) => {
    if (!ids.names.length) return skipped("No name in the query", "No name to search");
    const urls = await once(`ddg:${ids.names[0]}`, () => search(ids.names[0], signal));
    const domains = [...new Set(urls.map((u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } }).filter(Boolean))];
    return urls.length
      ? { found: `Found: ${plural(urls.length, "result")}`, hit: false, source: "live", detail: `DuckDuckGo: ${list(domains)}`, facts: { results: urls.length, domains } }
      : { found: "No results found", hit: false, source: "live", detail: "DuckDuckGo: no results" };
  },
  linkedin: async (ids, signal, once) => {
    if (!ids.names.length) return skipped("No name in the query", "No name to search");
    const urls = await once(`ddg:${ids.names[0]}`, () => search(ids.names[0], signal));
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

async function reddit(user: string, signal: AbortSignal): Promise<Profile> {
  const { status, data } = await getJson<{ data?: { name?: string } }>(`https://www.reddit.com/user/${encodeURIComponent(user)}/about.json`, signal);
  if (status === 404) return null;
  if (status !== 200 || !data?.data?.name) throw new Error(`Reddit HTTP ${status}`);
  return { site: "Reddit" };
}

function profiles(kind: "social" | "forum", checks: PromiseSettledResult<Profile>[], user?: string): ScanResult {
  const failed = checks.flatMap((c) => (c.status === "rejected" ? [c.reason instanceof Error ? c.reason.message : "error"] : []));
  if (failed.length === checks.length) throw new Error(failed.join("; "));
  const found = checks.flatMap((c) => (c.status === "fulfilled" && c.value ? [c.value] : []));
  const sites = found.map((p) => p.site);
  const linked = found.flatMap((p) => p.linked ?? []);
  const note = failed.length ? `; could not check ${failed.join(", ")}` : "";
  const facts = { profiles: sites, linked, username: user };
  if (!sites.length) return { found: kind === "forum" ? "No forum profiles found" : "No public profiles found", hit: false, source: "live", detail: `None found${note}`, facts };
  return { found: `Found: ${sites.join(", ")}`, hit: sites.includes("Gravatar"), source: "live",
    detail: `${sites.join(", ")}${linked.length ? ` (linked: ${linked.join(", ")})` : ""}${note}`, facts };
}

/* ---- one public web search for the name (DuckDuckGo HTML); returns result URLs ---- */
async function search(name: string, signal: AbortSignal): Promise<string[]> {
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`"${name}"`)}`,
    { headers: { "user-agent": UA, accept: "text/html" }, signal, cache: "no-store" });
  if (res.status !== 200) throw new Error(`Search HTTP ${res.status}${res.status === 202 ? " (rate limited)" : ""}`);
  const html = await res.text();
  const urls = [...html.matchAll(/result__url" href="[^"]*?uddg=([^&"]+)/g)].map((m) => decodeURIComponent(m[1]));
  return [...new Set(urls)].slice(0, 10);
}

export function makeLiveContext() {
  const memo = new Map<string, Promise<unknown>>();
  const once: Once = (key, f) => {
    if (!memo.has(key)) memo.set(key, f());
    return memo.get(key) as Promise<Awaited<ReturnType<typeof f>>>;
  };
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
        .then((r) => { console.info(`[scan:live] ${tool}: ${r.found} (${r.source}) | ${r.detail ?? ""}`); return r; });
    },
  };
}

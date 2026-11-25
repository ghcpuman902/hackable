/* Live sources, used only when SCAN_MODE=live (approved by Mangle on 24 Nov 2026 for free public APIs).
   Each source maps a real public reply onto ScanResult. Every check shares one short deadline and never
   throws: on any error or timeout it returns a "Could not check" result.

   leakCheck   LeakCheck public API (email)
   hibpTest    cached HIBP results for Mangle's preset emails only, plus LeakCheck and XposedOrNot breach names, merged
   hudsonRock  Hudson Rock Cavalier free OSINT (email and username)
   github      GitHub public REST: profiles, public commit email search and public user search
   social      Gravatar public profile (email hash) and Keybase (username)
   forum       Hacker News public profile (username).
   web         Tavily when TAVILY_API_KEY is set, otherwise DuckDuckGo HTML;
               linkedin reads the same results (LinkedIn itself is never fetched)
   GITHUB_TOKEN, when set, is sent as the Authorization header to the GitHub API. Keys are never logged.
   peopleSearch and publicContact have no free source, so live mode drops their cards (LIVE_DROPPED in synthetic.ts)
   and returns "skipped" if they are ever called. Live mode never returns synthetic data. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { HIBP_CACHE_EMAILS } from "./presets";
import { detect, tokenize } from "./chips";
import { pivotValue, type Pivot } from "./pivots";
import { verifyWebResults, type WebResult } from "./verify-web";
import type { Facts, ScanResult, ScanTool } from "./synthetic";

const TIMEOUT_MS = 4000;
const UA = "innovators-guild-retail-ai/0.1 (local hackathon demo)";
const gh = (): Record<string, string> => ({
  accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});
const githubLogin = /^[a-z\d][a-z\d-]{0,38}$/i;
const unique = (values: string[]) => [...new Map(values.map((value) => [value.toLowerCase(), value])).values()];
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
  return { emails: ids.emails.slice(0, 3), usernames: ids.usernames.slice(0, 3), github: ids.github.filter((g) => githubLogin.test(g)).slice(0, 1), names: ids.names.slice(0, 1) };
}

async function getJson<T>(url: string, signal: AbortSignal, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json", ...headers }, signal, cache: "no-store" });
  const text = await res.text();
  let data: T | null = null;
  try { data = JSON.parse(text) as T; } catch { /* non-JSON reply */ }
  return { status: res.status, data };
}

type LiveResult = ScanResult & { empty?: true };
const skipped = (why: string, found: string): LiveResult => ({ found, hit: false, source: "skipped", detail: why, empty: true });
const noFindings = (found: string, detail?: string, facts?: Facts): LiveResult =>
  ({ found, hit: false, source: "live", detail, facts, empty: true });
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

/* ---- GitHub public REST ---- */
const githubUser = z.object({
  login: z.string().regex(githubLogin),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  public_repos: z.number().optional(),
  followers: z.number().optional(),
  created_at: z.string().optional(),
});
type GhUser = z.infer<typeof githubUser>;
type GhRepo = { full_name: string; fork: boolean; private: boolean };
type GhCommit = { commit?: { author?: { email?: string } } };

function githubProfile(login: string, signal: AbortSignal, once: Once) {
  return once(`gh:user:${login.toLowerCase()}`, async () => {
    const { status, data } = await getJson<unknown>(`https://api.github.com/users/${login}`, signal, gh());
    if (status === 404) return null;
    const user = githubUser.safeParse(data);
    if (status !== 200 || !user.success) throw new Error(`GitHub profile HTTP ${status}`);
    return user.data;
  });
}

async function github(login: string, signal: AbortSignal, once: Once): Promise<LiveResult> {
  const user = await githubProfile(login, signal, once);
  if (!user) return noFindings("No GitHub profile");
  const { data } = await getJson<GhRepo[]>(`https://api.github.com/users/${login}/repos?sort=pushed&per_page=5&type=owner`, signal, gh());
  const own = (Array.isArray(data) ? data : []).filter((r) => !r.fork && r.private === false).slice(0, 2);
  const commits = await Promise.all(own.map((r) =>
    getJson<GhCommit[]>(`https://api.github.com/repos/${r.full_name}/commits?per_page=30&author=${login}`, signal, gh()).catch(() => null)));
  const seen = unique([user.email ?? "", ...commits.flatMap((c) =>
    Array.isArray(c?.data) ? c.data.map((x) => x.commit?.author?.email ?? "") : [],
  )].filter((email) => email && !/noreply\.github\.com$/i.test(email)));
  const profile = [
    `@${user.login}${user.name ? ` (${user.name})` : ""}`,
    user.public_repos === undefined ? "" : plural(user.public_repos, "public repo"),
    user.followers === undefined ? "" : plural(user.followers, "follower"),
    user.created_at ? `joined ${user.created_at.slice(0, 4)}` : "",
  ].filter(Boolean).join(", ");
  const urls = [`https://github.com/${user.login}`, ...own.map((r) => `https://github.com/${r.full_name}`)];
  return seen.length
    ? { found: "Found email on GitHub", hit: true, source: "live", detail: `${profile}. Public emails ${list(seen)}`,
        facts: { emails: seen, repos: own.map((r) => r.full_name), urls } }
    : { found: "Found GitHub profile", hit: false, source: "live", detail: profile, facts: { profiles: ["GitHub"], urls: urls.slice(0, 1) } };
}

const githubUsers = z.object({ items: z.array(z.object({ login: z.string().regex(githubLogin) })) });
const githubCommits = z.object({ items: z.array(z.object({
  author: z.object({ login: z.string().regex(githubLogin) }).nullish(),
  commit: z.object({ author: z.object({ email: z.string() }) }),
  repository: z.object({ full_name: z.string(), private: z.boolean() }),
})) });

async function searchGithub<T>(endpoint: "users" | "commits", query: string, schema: z.ZodType<{ items: T[] }>, signal: AbortSignal, once: Once) {
  return once(`gh:search:${endpoint}:${query.toLowerCase()}`, async () => {
    const url = `https://api.github.com/search/${endpoint}?q=${encodeURIComponent(query)}&per_page=3`;
    const { status, data } = await getJson<unknown>(url, signal, gh());
    const parsed = schema.safeParse(data);
    if (status !== 200 || !parsed.success) throw new Error(`GitHub search HTTP ${status}`);
    return parsed.data.items;
  });
}

function githubByName(name: string, signal: AbortSignal, once: Once) {
  const term = name.replace(/["\\]/g, " ").trim();
  return term ? searchGithub("users", `"${term}" in:fullname type:user`, githubUsers, signal, once) : Promise.resolve([]);
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
type ScanIds = Ids & { webTerms?: string[]; commitMatch?: LiveResult; githubNames?: string[] };
type Runner = (ids: ScanIds, signal: AbortSignal, once: Once) => Promise<LiveResult>;

async function successful<T>(checks: Promise<T>[]): Promise<T[]> {
  const settled = await Promise.allSettled(checks);
  const results = settled.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  const failure = settled.find((result) => result.status === "rejected");
  if (!results.length && failure) throw failure.reason;
  return results;
}

const leaksFor = (ids: Ids, signal: AbortSignal, once: Once) =>
  Promise.all(ids.emails.map((e) => once(`leakcheck:${e}`, () => leakCheckEmail(e, signal))));

const RUNNERS: Partial<Record<ScanTool, Runner>> = {
  leakCheck: async (ids, signal, once) => {
    if (!ids.emails.length) return skipped("No email in the query", "No email to check");
    const leaks = await leaksFor(ids, signal, once);
    const n = leaks.reduce((a, l) => a + l.found, 0);
    const pw = leaks.some((l) => l.found > 0 && l.fields.includes("password"));
    const fields = [...new Set(leaks.flatMap((l) => l.fields))];
    if (!n) return noFindings("No leaks found", "LeakCheck found no records");
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
          try { out.push({ e, names: await once(`xon:${e}`, () => xposedOrNot(e, signal)) }); } catch (err) { failed.push(isTimeout(err) ? "XposedOrNot timed out" : err instanceof Error ? err.message : "XposedOrNot error"); break; }
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
      : noFindings("No breaches found", detail, facts);
  },
  hudsonRock: async (ids, signal, once) => {
    const q = [...ids.emails.map((v) => ["email", v] as const), ...ids.usernames.map((v) => ["username", v] as const)];
    if (!q.length) return skipped("No email or username in the query", "Nothing to check");
    /* Stealer log lists named in the cached HIBP results (preset emails only) are a hit on their own. */
    const presets = ids.emails.filter((e) => HIBP_CACHE_EMAILS.includes(e));
    const cache = presets.length ? await hibpCache() : null;
    const lists = [...new Set(presets.flatMap((e) => (cache?.accounts?.[e]?.breaches ?? []).filter((b) => STEALER_LOG.test(b.name)).map((b) => b.name)))];
    const devices = await successful(q.map(([k, v]) => once(`hudson:${k}:${v}`, () => hudson(k, v, signal)))).then((x) => x.flat(), (e: unknown) => {
      if (!lists.length) throw e;
      return null;
    });
    const hr = devices === null ? "Hudson Rock: could not check"
      : devices.length ? `Hudson Rock: compromised ${list(devices)}` : `Hudson Rock: no infected device found for ${plural(q.length, "identifier")}`;
    if (devices?.length) return { found: `Found: ${plural(devices.length, "infected device")}`, hit: true, source: "live", detail: hr, facts: { devices, stealerLists: lists } };
    if (lists.length) return { found: "Found in a stealer log list", hit: true, source: "live", detail: `${checkedOn(cache?.source)}: ${list(lists)}; ${hr}`,
      facts: { devices: [], stealerLists: lists, noDevice: devices !== null } };
    return noFindings("No stealer logs found", hr);
  },
  github: async (ids, signal, once) => {
    if (!ids.github.length && !ids.githubNames?.length && !ids.commitMatch) return skipped("No GitHub identifier", "Nothing to check");
    const checks = ids.github.map((login) => once(`gh:${login.toLowerCase()}`, () => github(login, signal, once)));
    for (const name of ids.githubNames ?? []) {
      checks.push(githubByName(name, signal, once).then((users): LiveResult => users.length
        ? { found: "Found possible GitHub profiles", hit: false, source: "live",
            facts: { urls: users.map((user) => `https://github.com/${user.login}`) } }
        : noFindings("No GitHub profile")));
    }
    if (ids.commitMatch) checks.unshift(Promise.resolve(ids.commitMatch));
    const results = await successful(checks);
    const hits = results.filter((result) => result.hit);
    const first = hits[0];
    if (first) return { ...first, facts: {
      emails: unique(hits.flatMap((result) => result.facts?.emails ?? [])),
      repos: unique(hits.flatMap((result) => result.facts?.repos ?? [])),
      /* Each claim in the report needs a page to cite: the profile and the repos the email shows up in. */
      urls: unique(hits.flatMap((result) => result.facts?.urls ?? (result.facts?.repos ?? []).map((r) => `https://github.com/${r}`))),
    } };
    return results.find((result) => !result.empty) ?? noFindings("No GitHub profile");
  },
  social: async (ids, signal, once) => {
    const users = ids.usernames;
    if (!ids.emails.length && !users.length) return skipped("No email or username in the query", "Nothing to check");
    const checks = await Promise.allSettled([
      ...ids.emails.map((e) => once(`grav:${e}`, () => gravatar(e, signal))),
      ...users.map((user) => once(`kb:${user.toLowerCase()}`, () => keybase(user, signal))),
    ]);
    /* Only a username that has a Keybase profile goes in the facts, so the report never ties a handle to the wrong site. */
    const match = users.find((_, i) => {
      const check = checks[ids.emails.length + i];
      return check.status === "fulfilled" && check.value;
    });
    return profiles("social", checks, match);
  },
  forum: async (ids, signal, once) => {
    if (!ids.usernames.length) return skipped("No username in the query", "No username to check");
    const checks = await Promise.allSettled(ids.usernames.map((user) =>
      once(`hn:${user.toLowerCase()}`, () => hackerNews(user, signal))));
    const match = ids.usernames.find((_, index) => {
      const check = checks[index];
      return check.status === "fulfilled" && check.value;
    });
    return profiles("forum", checks, match);
  },
  web: async (ids, signal, once) => {
    const terms = ids.webTerms ?? ids.names;
    if (!terms.length) return skipped("No identifier in the query", "Nothing to search");
    const results = await searchTerms(terms, signal, once);
    const engine = unique(results.map((result) => result.engine)).join(", ");
    const raw = results.flatMap((result) => result.results).filter((result, index, all) => all.findIndex((other) => other.url === result.url) === index);
    const verified = await verifyWebResults(raw, { emails: ids.emails, handles: [...ids.usernames, ...ids.github], names: ids.names }, async (url) => {
      const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]), headers: { "user-agent": UA }, cache: "no-store" });
      return response.ok ? (await response.text()).slice(0, 100_000) : null;
    });
    /* The fetched page text was verification-only. Never send it to the report or browser. */
    const compact = verified.map((result) => ({ title: result.title, url: result.url, status: result.status }));
    const confirmed = compact.filter((result) => result.status === "confirmed");
    const possible = compact.filter((result) => result.status === "possible");
    const domains = [...new Set(confirmed.map((r) => { try { return new URL(r.url).hostname.replace(/^www\./, ""); } catch { return ""; } }).filter(Boolean))];
    return confirmed.length
      ? { found: `Found: ${plural(confirmed.length, "result")}`, hit: false, source: "live", detail: `${engine}: ${list(domains)}`, facts: { results: confirmed.length, domains, urls: confirmed.map((r) => r.url), webResults: confirmed, possibleWebResults: possible } }
      : noFindings("No results found", `${engine} found no results`);
  },
  linkedin: async (ids, signal, once) => {
    const terms = ids.webTerms ?? ids.names;
    if (!terms.length) return skipped("No identifier in the query", "Nothing to search");
    const results = await searchTerms(terms, signal, once);
    const li = unique(results.flatMap((result) => result.results.map((item) => item.url))).filter((u) => /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\//i.test(u));
    return li.length
      ? { found: "Found: public profile", hit: false, source: "live", detail: `Search result: ${list(li, 2)}`, facts: { profiles: ["LinkedIn"], urls: li.slice(0, 3) } }
      : noFindings("Not in search results", "No LinkedIn profile in the results");
  },
};

/* ---- profile checks: each resolves to a site name when a public profile exists, or null ---- */
type Profile = { site: string; linked?: string[]; url?: string } | null;
const gravatarProfile = z.object({
  display_name: z.string().nullish(),
  profile_url: z.string().nullish(),
  verified_accounts: z.array(z.object({
    service_label: z.string().optional(),
    service_type: z.string().optional(),
    url: z.string().optional(),
  })).default([]),
});
type Gravatar = NonNullable<Profile> & { name?: string; handle?: string };

async function gravatar(email: string, signal: AbortSignal): Promise<Gravatar | null> {
  const hash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  const { status, data } = await getJson<unknown>(`https://api.gravatar.com/v3/profiles/${hash}`, signal);
  if (status === 404) return null;
  const parsed = gravatarProfile.safeParse(data);
  if (status !== 200 || !parsed.success) throw new Error(`Gravatar HTTP ${status}`);
  const profile = parsed.data;
  const linkedHandle = profile.verified_accounts
    .map((account) => account.url?.match(/^https:\/\/github\.com\/([a-z\d-]+)\/?$/i)?.[1])
    .find(Boolean);
  const slug = profile.profile_url?.match(/^https:\/\/(?:www\.)?gravatar\.com\/([\w.-]+)\/?$/i)?.[1];
  return {
    site: "Gravatar",
    linked: profile.verified_accounts.map((a) => a.service_label || a.service_type || "").filter(Boolean),
    name: profile.display_name ?? undefined,
    handle: linkedHandle ?? (slug && !autoSlug(slug) ? slug : undefined),
    url: slug ? profile.profile_url ?? undefined : undefined,
  };
}

/* Gravatar makes up a slug for profiles that never chose one: a hash, or words with a hex tail
   ("devotedlypassionate12b997a1ec"). Neither is a handle the person uses anywhere else. */
export const autoSlug = (slug: string) => /^[a-f\d]{32,}$/i.test(slug) || /^[a-z]{4,}(?=[a-f\d]*\d)[a-f\d]{8,}$/i.test(slug);

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

const isTimeout = (e: unknown) => e instanceof Error && e.name === "TimeoutError";

function profiles(kind: "social" | "forum", checks: PromiseSettledResult<Profile>[], user?: string): LiveResult {
  const rejected = checks.flatMap((c) => (c.status === "rejected" ? [c.reason as unknown] : []));
  const failed = rejected.map((e) => (isTimeout(e) ? "timed out" : e instanceof Error ? e.message : "error"));
  /* Every check timing out keeps the TimeoutError, so the card reads "Timed out after 4s" like the others. */
  if (rejected.length === checks.length) throw rejected.every(isTimeout) ? rejected[0] : new Error(failed.join("; "));
  const found = checks.flatMap((c) => (c.status === "fulfilled" && c.value ? [c.value] : []));
  const sites = [...new Set(found.map((p) => p.site))];
  const linked = [...new Set(found.flatMap((p) => p.linked ?? []))];
  const note = failed.length ? `; could not check ${failed.join(", ")}` : "";
  const urls = found.flatMap((p) => (p.url ? [p.url] : []));
  const facts = { profiles: sites, linked, username: user, ...(urls.length ? { urls } : {}) };
  if (!sites.length) return noFindings(kind === "forum" ? "No forum profiles found" : "No public profiles found", `None found${note}`, facts);
  return { found: `Found: ${sites.join(", ")}`, hit: sites.includes("Gravatar"), source: "live",
    detail: `${sites.join(", ")}${linked.length ? ` (linked: ${linked.join(", ")})` : ""}${note}`, facts };
}

/* ---- public web search: Tavily, with DuckDuckGo as a fallback ---- */
type Search = { engine: string; results: WebResult[] };
const TAVILY_MS = 5000;
async function tavily(term: string, key: string, signal: AbortSignal): Promise<Search> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST", signal, cache: "no-store",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}`, "user-agent": UA },
    body: JSON.stringify({ query: `"${term}"`, max_results: 10, search_depth: "basic" }),
  });
  if (!res.ok) throw new Error(`Tavily HTTP ${res.status}`);
  const data = (await res.json()) as { results?: { url: string; title?: string; content?: string }[] };
  return { engine: "Tavily", results: (data.results ?? []).map((r) => ({ url: r.url, title: r.title ?? new URL(r.url).hostname, content: r.content })).filter((r) => !!r.url).slice(0, 10) };
}
async function search(term: string, signal: AbortSignal): Promise<Search> {
  const key = process.env.TAVILY_API_KEY;
  let note = "";
  if (key) {
    try { return await tavily(term, key, AbortSignal.any([signal, AbortSignal.timeout(TAVILY_MS)])); }
    catch (e) { note = ` (Tavily failed: ${e instanceof Error ? (e.name === "TimeoutError" ? "timed out" : e.message) : "error"})`; }
  }
  const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`"${term}"`)}`,
    { headers: { "user-agent": UA, accept: "text/html" }, signal, cache: "no-store" });
  if (res.status !== 200) throw new Error(`Search HTTP ${res.status}${res.status === 202 ? " (rate limited)" : ""}${note}`);
  const html = await res.text();
  const urls = [...html.matchAll(/result__url" href="[^"]*?uddg=([^&"]+)/g)].map((m) => decodeURIComponent(m[1]));
  return { engine: "DuckDuckGo" + note, results: [...new Set(urls)].slice(0, 10).map((url) => ({ url, title: new URL(url).hostname })) };
}
function searchTerms(terms: string[], signal: AbortSignal, once: Once) {
  return successful(terms.map((term) => once(`search:${term.toLowerCase()}`, () => search(term, signal))));
}

/* ---- one shared memo for every network call, keyed by the identifier it checks, kept for 10 minutes.
   A scan reuses any lookups started by /api/preload. A failed or aborted call
   is dropped, so the next scan tries it again. ---- */
const MEMO_MS = 10 * 60 * 1000;
const memo = new Map<string, { p: Promise<unknown>; t: number }>();
const shared: Once = (key, f) => {
  const now = Date.now();
  const hit = memo.get(key);
  if (hit && now - hit.t < MEMO_MS) return hit.p as ReturnType<typeof f>;
  const entry = { p: f() as Promise<unknown>, t: now };
  memo.set(key, entry);
  void entry.p.catch(() => { if (memo.get(key) === entry) memo.delete(key); });
  return entry.p as ReturnType<typeof f>;
};
/* fresh: skip the memo for this context's calls (the QA page's Rerun), but still share calls within the run
   and store the new results in the memo. */
function freshOnce(): Once {
  const local = new Map<string, Promise<unknown>>();
  return (key, f) => {
    if (!local.has(key)) {
      local.set(key, f());
      memo.delete(key);
      void shared(key, () => local.get(key) as ReturnType<typeof f>).catch(() => {});
    }
    return local.get(key) as ReturnType<typeof f>;
  };
}

export type { Pivot } from "./pivots";

function scanIdentifiers(query: string): ScanIds {
  const ids = identifiers(query);
  const tokens = tokenize(query);
  const single = tokens.length === 1 ? detect(tokens[0]) : null;
  if (single?.kind === "text" && /^[a-z][a-z\d-]{1,38}$/i.test(single.label)) {
    ids.usernames.push(single.label);
    ids.github.push(single.label);
  } else if (single?.kind === "text" && /^[\p{L}][\p{L}'’ .-]+$/u.test(single.label)) {
    ids.names.push(single.label);
  }
  if (single?.kind === "instagram" || single?.kind === "x") {
    const handle = single.label.split("/")[1];
    if (handle && /^[a-z\d][\w.-]{0,38}$/i.test(handle)) {
      ids.usernames.push(handle);
      if (githubLogin.test(handle)) ids.github.push(handle);
    }
  }
  /* A LinkedIn profile URL gives its slug as a handle, plus a "<slug> linkedin" web search. */
  const linkedinSlug = tokens.map((t) => detect(t)).find((d) => d.kind === "linkedin")?.label.match(/\/in\/([\w-]{2,100})/)?.[1];
  if (linkedinSlug) {
    ids.usernames.push(linkedinSlug);
    if (githubLogin.test(linkedinSlug)) ids.github.push(linkedinSlug);
  }
  const localParts = ids.emails.map((email) => email.slice(0, email.lastIndexOf("@")));
  const webTerms = unique([...ids.emails, ...localParts, ...ids.names, ...ids.usernames,
    ...ids.github, ...(single && !ids.emails.length ? [single.label.replace(/^@/, "")] : []),
    ...(linkedinSlug ? [`${linkedinSlug} linkedin`] : [])]);
  return { ...ids, webTerms, githubNames: ids.names };
}

async function expandIdentifiers(ids: ScanIds, signal: AbortSignal, once: Once, onPivot: (pivot: Pivot) => void): Promise<ScanIds> {
  const names: string[] = [];
  const handles: string[] = [];
  const pivot = (from: Pivot["from"], kind: Pivot["kind"], raw?: string | null) => {
    if (signal.aborted) return;
    const next = kind === "name" ? names : handles;
    if (next.length >= 2) return;
    /* An email's local part is already searched, so it never makes a chip of its own. */
    const localParts = ids.emails.map((e) => e.slice(0, e.lastIndexOf("@")));
    const value = pivotValue(raw, kind, [...ids.names, ...ids.github, ...ids.usernames, ...ids.emails, ...localParts, ...names, ...handles]);
    if (!value) return;
    next.push(value);
    onPivot({ from, kind, value });
  };
  const readGithubName = (user: GhUser | null) => {
    if (user) pivot("GitHub", "name", user.name);
  };

  const email = ids.emails[0];
  const local = email?.slice(0, email.lastIndexOf("@"));
  const initialLogins = unique([...ids.github, ...(local && githubLogin.test(local) ? [local] : [])]);
  const profiles = initialLogins.map((login) => githubProfile(login, signal, once).then((user) => {
    if (user) pivot("GitHub", "handle", user.login);
    readGithubName(user);
  }));

  const name = ids.names[0];
  if (name && !email && !initialLogins.length) {
    profiles.push(githubByName(name, signal, once).then(async (users) => {
      if (users.length !== 1) return;
      const user = await githubProfile(users[0].login, signal, once);
      if (user?.name?.trim().toLowerCase() === name.toLowerCase()) pivot("GitHub", "handle", user.login);
    }));
  }

  const avatars = ids.emails.map((address) => once(`grav:${address}`, () => gravatar(address, signal))
    .then((profile) => {
      if (!profile) return;
      pivot("Gravatar", "name", profile.name);
      pivot("Gravatar", "handle", profile.handle);
    }));

  let commitMatch: LiveResult | undefined;
  const emailSearches: Promise<void>[] = [];
  if (email && /^[^"\\\s]+$/.test(email)) {
    emailSearches.push(searchGithub("commits", `author-email:"${email}" is:public`, githubCommits, signal, once)
      .then(async (commits) => {
        const matches = commits.filter((item) => item.repository.private === false && item.commit.author.email.toLowerCase() === email);
        if (!matches.length) return;
        commitMatch = { found: "Found email in public commits", hit: true, source: "live",
          facts: { emails: [email], repos: unique(matches.map((item) => item.repository.full_name)) } };
        const login = matches.find((item) => item.author)?.author?.login;
        if (!login) return;
        pivot("GitHub", "handle", login);
        readGithubName(await githubProfile(login, signal, once));
      }));
    if (process.env.GITHUB_TOKEN) {
      emailSearches.push(searchGithub("users", `"${email}" in:email type:user`, githubUsers, signal, once)
        .then(async (users) => {
          const login = users[0]?.login;
          if (!login) return;
          const user = await githubProfile(login, signal, once);
          if (user?.email?.toLowerCase() !== email) return;
          pivot("GitHub", "handle", user.login);
          readGithubName(user);
        }));
    }
  }
  await Promise.allSettled([...profiles, ...avatars, ...emailSearches]);

  return {
    ...ids,
    github: unique([...initialLogins, ...handles.filter((handle) => githubLogin.test(handle))]),
    usernames: unique([...ids.usernames, ...ids.github, ...handles]).slice(0, 5),
    webTerms: unique([...(ids.webTerms ?? []), ...names, ...handles]),
    githubNames: unique([...names, ...ids.names]).slice(0, 2),
    commitMatch,
  };
}

function deadline(signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

export function makeLiveContext({ quiet = false, fresh = false } = {}) {
  const once = fresh ? freshOnce() : shared;
  const runCheck = (tool: ScanTool, ids: ScanIds, signal: AbortSignal, lookup: Once = once): Promise<LiveResult> => {
    const run = RUNNERS[tool] ?? (async () => skipped("No free live source", "Not checked"));
    return run(ids, signal, lookup)
      .catch((e: unknown): LiveResult => ({
        found: "Could not check", hit: false, source: "unavailable",
        detail: e instanceof Error && e.name === "TimeoutError" ? `Timed out after ${TIMEOUT_MS / 1000}s` : e instanceof Error ? e.message : "Unknown error",
      }))
      .then((r) => {
        if (!quiet) console.info(`[scan:live] ${tool}: ${r.found} (${r.source}) | ${r.detail ?? ""}`);
        return r;
      });
  };

  return {
    check(tool: ScanTool, query: string, abortSignal?: AbortSignal) {
      return runCheck(tool, identifiers(query), deadline(abortSignal));
    },
    scan(query: string, abortSignal: AbortSignal, onPivot: (pivot: Pivot) => void) {
      const ids = scanIdentifiers(query);
      const local = new Map<string, Promise<unknown>>();
      const lookup: Once = (key, fetch) => {
        const cached = local.get(key);
        if (cached) return cached as ReturnType<typeof fetch>;
        const result = once(key, fetch);
        local.set(key, result);
        return result;
      };
      const signal = deadline(abortSignal);
      // Share web searches with LinkedIn and start each as soon as its term is known.
      const startSearch = (terms: string[]) => {
        void searchTerms(terms, deadline(abortSignal), lookup).catch(() => {});
      };
      startSearch(ids.webTerms ?? []);
      const expanded = expandIdentifiers(ids, signal, lookup, (pivot) => {
        onPivot(pivot);
        startSearch([pivot.value]);
      });
      return async (tool: ScanTool) => {
        if (tool === "hibpTest" || tool === "leakCheck") return runCheck(tool, ids, deadline(abortSignal), lookup);
        return runCheck(tool, await expanded, deadline(abortSignal), lookup);
      };
    },
  };
}

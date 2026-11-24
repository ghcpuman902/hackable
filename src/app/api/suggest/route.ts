import { CAT_ORDER, normUrl, SUG_MAX, SUG_MIN, type SugCat, type SugGroup, type SugRow } from "@/lib/suggest";
import { presetFor } from "@/lib/presets";

/* Name search for the search box: public results only, live mode only, keys stay on the server and queries are never logged.
   LinkedIn and Instagram use Tavily with a site filter, personal sites use Tavily web, GitHub uses the users search API.
   Without TAVILY_API_KEY only GitHub runs; without GITHUB_TOKEN as well the page falls back to prefix completion.
   Each group has 4s; a group that fails or times out comes back as failed and the page offers its prefix instead. */
const MS = 4000;
const CACHE_MS = 10 * 60 * 1000;
const cache = new Map<string, { t: number; groups: SugGroup[] }>();
const UA = "innovators-guild-retail-ai/0.1 (local hackathon demo)";
const SOCIAL = /(^|\.)(linkedin|instagram|github|facebook|x|twitter|tiktok|youtube|reddit|medium|pinterest|flickr|threads|quora|wikipedia|soundcloud|vimeo)\.(com|org|net)$/i;

type Hit = { url: string; title: string; content?: string };
async function tavily(query: string, key: string, signal: AbortSignal, domains?: string[], max = 5): Promise<Hit[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST", signal, cache: "no-store",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}`, "user-agent": UA },
    body: JSON.stringify({ query, max_results: max, search_depth: "basic", ...(domains ? { include_domains: domains } : {}) }),
  });
  if (!res.ok) throw new Error(`Tavily ${res.status}`);
  return ((await res.json()) as { results?: Hit[] }).results ?? [];
}

const words = (s: string) => s.toLowerCase().split(/\s+/).filter(Boolean);
const names = (title: string, q: string) => { const t = title.toLowerCase(); return words(q).every((w) => t.includes(w)) || t.replace(/\s/g, "").includes(q.toLowerCase().replace(/\s/g, "")); };
const clip = (s: string, n = 60) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

async function linkedin(q: string, key: string, signal: AbortSignal): Promise<SugRow[]> {
  const hits = await tavily(`"${q}" site:linkedin.com/in`, key, signal, ["linkedin.com"]);
  return hits.filter((h) => /linkedin\.com\/in\/[^/?#]+/i.test(h.url) && names(h.title, q)).map((h) => {
    const [name, ...rest] = h.title.replace(/\s*\|\s*LinkedIn\s*$/i, "").split(/\s+[-–|]\s+/);
    return { cat: "linkedin" as const, title: clip(name), detail: clip(rest.join(", ") || "LinkedIn"), value: normUrl(h.url.match(/linkedin\.com\/in\/[^/?#]+/i)![0]) };
  });
}
async function instagram(q: string, key: string, signal: AbortSignal): Promise<SugRow[]> {
  const hits = await tavily(`"${q}" site:instagram.com`, key, signal, ["instagram.com"]);
  return hits.flatMap((h) => {
    const m = h.url.match(/instagram\.com\/([a-z0-9._]{2,30})\/?(?:[?#]|$)/i);
    if (!m || /^(p|reel|reels|explore|stories|accounts)$/i.test(m[1]) || !names(h.title, q)) return [];
    return [{ cat: "instagram" as const, title: clip(h.title.split(/\s+[(•|@-]/)[0] || m[1]), detail: "@" + m[1], value: "instagram.com/" + m[1].toLowerCase() }];
  });
}
async function web(q: string, key: string, signal: AbortSignal): Promise<SugRow[]> {
  const hits = await tavily(q, key, signal, undefined, 8);
  /* A site whose domain is the name itself (a personal site) comes first, and is offered as the bare domain. */
  const own = (h: Hit) => host(h.url).replace(/[^a-z0-9]/gi, "").includes(q.toLowerCase().replace(/[^a-z0-9]/g, ""));
  return hits.filter((h) => !SOCIAL.test(host(h.url)) && (own(h) || names(h.title + " " + (h.content ?? "").slice(0, 300), q)))
    .sort((a, b) => Number(own(b)) - Number(own(a)))
    .map((h) => ({ cat: "web" as const, title: clip(h.title), detail: host(h.url), value: own(h) ? host(h.url) : normUrl(h.url) }));
}
async function github(q: string, token: string, signal: AbortSignal): Promise<SugRow[]> {
  const res = await fetch(`https://api.github.com/search/users?per_page=5&q=${encodeURIComponent(q.includes(" ") ? `${q} in:name` : q)}`, {
    signal, cache: "no-store",
    headers: { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", authorization: `Bearer ${token}`, "user-agent": UA },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const items = ((await res.json()) as { items?: { login: string }[] }).items ?? [];
  return items.map((u) => ({ cat: "github" as const, title: u.login, detail: "github.com/" + u.login, value: "github.com/" + u.login.toLowerCase() }));
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { q?: unknown; cat?: unknown };
  const q = typeof body.q === "string" ? body.q.trim().replace(/\s+/g, " ").slice(0, 80) : "";
  const only = CAT_ORDER.includes(body.cat as SugCat) ? (body.cat as SugCat) : null;
  if (process.env.SCAN_MODE !== "live" || q.length < SUG_MIN || presetFor(q)) return Response.json({ groups: [] });
  const tav = process.env.TAVILY_API_KEY, tok = process.env.GITHUB_TOKEN;
  const runners: Partial<Record<SugCat, (s: AbortSignal) => Promise<SugRow[]>>> = {
    ...(tav ? { linkedin: (s) => linkedin(q, tav, s), instagram: (s) => instagram(q, tav, s), web: (s) => web(q, tav, s) } : {}),
    ...(tok ? { github: (s) => github(q, tok, s) } : {}),
  };
  const cats = CAT_ORDER.filter((c) => runners[c] && (!only || c === only));
  const key = `${cats.join(",")}|${q.toLowerCase()}|3`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < CACHE_MS) return Response.json({ groups: hit.groups });
  const signal = AbortSignal.any([req.signal, AbortSignal.timeout(MS)]);
  const settled = await Promise.allSettled(cats.map((c) => runners[c]!(signal)));
  /* Up to SUG_MAX rows in all, shared out across the groups in turn so one source cannot fill the list. */
  const lists = settled.map((r) => (r.status === "fulfilled" ? dedupe(r.value) : []));
  const take = lists.map(() => 0);
  for (let n = 0, round = 0; n < SUG_MAX && round < SUG_MAX; round++) for (let i = 0; i < lists.length && n < SUG_MAX; i++) if (take[i] < lists[i].length) { take[i]++; n++; }
  const groups: SugGroup[] = cats.map((cat, i) => ({ cat, rows: lists[i].slice(0, take[i]), ...(settled[i].status === "rejected" ? { failed: true } : {}) }));
  if (!req.signal.aborted && groups.every((g) => !g.failed)) cache.set(key, { t: Date.now(), groups });
  return Response.json({ groups });
}

function dedupe(rows: SugRow[]) {
  const seen = new Set<string>();
  return rows.filter((r) => (seen.has(r.value) ? false : (seen.add(r.value), true)));
}

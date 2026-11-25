/* Source links for a live report, attached in code after the model writes (round 2, R1). Pure, no React.
   Every card (the bold summary, WARNING, CAUTION, TIP, NOTE) ends up with at least one link from what the checks
   actually found: GitHub profile, repo and commit pages, the Gravatar profile, LinkedIn and Tavily result pages, news
   articles behind a flag, or the page of the breach or stealer log service that answered. Nothing here makes up a URL:
   finding URLs are copied from the results, and the service pages are the fixed home pages below.
   The CAUTION card also links the first picked pattern on /patterns. The model's own footnotes are never relied on. */
import type { FlagHit } from "./flags";
import type { Signal } from "../data/pattern-catalogue";
import type { Findings } from "./pattern-score";

export type Topic = "github" | "gravatar" | "breach" | "stealer" | "linkedin" | "news" | "job" | "web" | "forum";
export type Evidence = { url: string; label: string; topic: Topic };

/* The check services themselves: where a person can see the same breach or stealer log result. */
export const SERVICE_PAGES = {
  hibp: { url: "https://haveibeenpwned.com/", label: "Have I Been Pwned" },
  leakcheck: { url: "https://leakcheck.io/", label: "LeakCheck" },
  xposedornot: { url: "https://xposedornot.com/", label: "XposedOrNot" },
  hudsonrock: { url: "https://www.hudsonrock.com/", label: "Hudson Rock" },
} as const;

const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const isHttps = (u: unknown): u is string => typeof u === "string" && /^https:\/\/[^\s<>()]+$/.test(u);

function githubLabel(u: string): string {
  const path = (() => { try { return new URL(u).pathname.replace(/^\/|\/$/g, ""); } catch { return ""; } })();
  return path ? `GitHub ${path}` : "GitHub";
}

/* Every link the checks found, strongest first, one entry per URL. */
export function evidenceFrom(findings: Findings, flags: readonly FlagHit[] = []): Evidence[] {
  const out: Evidence[] = [];
  const push = (url: unknown, label: string, topic: Topic) => { if (isHttps(url) && !out.some((e) => e.url === url)) out.push({ url, label, topic }); };
  const live = (t: keyof Findings) => { const r = findings[t]; return r && r.source !== "skipped" && r.source !== "unavailable" ? r : undefined; };
  const gh = live("github");
  /* A by-name GitHub search ("possible profiles") may be a namesake, so only the person's own profile and repos count. */
  if (gh && (gh.hit || /^Found GitHub profile/i.test(gh.found))) for (const u of gh.facts?.urls ?? []) push(u, githubLabel(u), "github");
  for (const u of live("social")?.facts?.urls ?? []) push(u, /gravatar\.com/i.test(u) ? "Gravatar" : host(u), /gravatar\.com/i.test(u) ? "gravatar" : "forum");
  for (const u of live("forum")?.facts?.urls ?? []) push(u, host(u), "forum");
  for (const f of flags) {
    if (f.state !== "yes") continue;
    const topic: Topic = f.id === "in-the-news" ? "news" : f.id === "just-changed-jobs" ? "job" : "web";
    for (const u of f.urls ?? []) push(u, host(u), topic);
  }
  for (const u of live("linkedin")?.facts?.urls ?? []) push(u, "LinkedIn", "linkedin");
  const stealer = live("hudsonRock");
  if (stealer?.hit) push(SERVICE_PAGES.hudsonrock.url, SERVICE_PAGES.hudsonrock.label, "stealer");
  const hibp = live("hibpTest");
  if (hibp?.hit) {
    const checked = (hibp.facts?.checked ?? []).join(" ");
    const named = (hibp.facts?.breaches ?? []).length > 0;
    if (/HIBP|Have I Been Pwned/i.test(checked) && named) push(SERVICE_PAGES.hibp.url, SERVICE_PAGES.hibp.label, "breach");
    if (/XposedOrNot/i.test(checked)) push(SERVICE_PAGES.xposedornot.url, SERVICE_PAGES.xposedornot.label, "breach");
    if (/LeakCheck/i.test(checked)) push(SERVICE_PAGES.leakcheck.url, SERVICE_PAGES.leakcheck.label, "breach");
  }
  if (live("leakCheck")?.hit) push(SERVICE_PAGES.leakcheck.url, SERVICE_PAGES.leakcheck.label, "breach");
  /* Web search results last: they are the loosest link to the person. */
  for (const u of live("web")?.facts?.urls ?? []) push(u, host(u), "web");
  return out;
}

/* Which topics a card's words are about. */
const TOPIC_WORDS: [Topic, RegExp][] = [
  ["github", /\b(github|commits?|repos?|repositor(y|ies)|code)\b/i],
  ["gravatar", /\bgravatar\b/i],
  ["stealer", /\b(stealer|infected|infostealer|malware|device|cookies?|session)\b/i],
  ["breach", /\b(breach(es|ed)?|leak(s|ed)?|passwords?|pwned|data dumps?)\b/i],
  ["linkedin", /\blinkedin\b/i],
  ["news", /\b(news|articles?|press)\b/i],
  ["job", /\b(new (job|role|position)|changed jobs?|recruit(er|ment)?)\b/i],
  ["forum", /\b(hacker news|keybase|forums?)\b/i],
  ["web", /\b(search(es)?|web|online|results?)\b/i],
];
export const topicsOf = (text: string): Topic[] => TOPIC_WORDS.filter(([, re]) => re.test(text)).map(([t]) => t);

/* The finding topics behind each scoring signal, so a CAUTION card links the finding that picked its pattern. */
export const SIGNAL_TOPIC: Partial<Record<Signal, Topic>> = {
  "public-commit-email": "github", "github-profile": "github", "breach-any": "breach", "breach-password": "breach",
  "breach-travel": "breach", "breach-marketplace": "breach", "stealer-log": "stealer", gravatar: "gravatar",
  "linkedin-presence": "linkedin", "news-mentions": "news", "job-change": "job", "dev-forum-activity": "forum",
  "crypto-activity": "breach", "phone-exposed": "breach", "address-exposed": "breach", "email-exposed": "breach",
};

export type PickedForCard = { id: string; name: string; signals: Signal[] };

const DEF = /^\[\^([^\]\s]+)\]:[ \t]*\[([^\]]+)\]\(([^)\s]+)\)[ \t]*$/;

/* Adds footnotes so every card has a finding link, and the CAUTION card links the first picked pattern.
   md is cleaned report markdown (report-md.ts). Returns the markdown with the new footnote definitions appended. */
export function attachSources(md: string, evidence: readonly Evidence[], picks: readonly PickedForCard[] = []): string {
  if (!md.trim()) return md;
  const defs = new Map<string, { label: string; url: string }>();
  const body: string[] = [];
  for (const line of md.split("\n")) {
    const m = line.match(DEF);
    if (m) defs.set(m[1], { label: m[2], url: m[3] });
    else body.push(line);
  }
  const idFor = new Map<string, string>([...defs].map(([id, d]) => [d.url, id]));
  let n = 0;
  const ref = (url: string, label: string) => {
    let id = idFor.get(url);
    if (!id) {
      do id = `s${++n}`; while (defs.has(id));
      defs.set(id, { label, url });
      idFor.set(url, id);
    }
    return `[^${id}]`;
  };
  const evidenceUrls = new Set(evidence.map((e) => e.url));
  const first = picks[0];
  const chunks = body.join("\n").split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean);
  let sawLead = false;
  const out = chunks.map((chunk) => {
    const card = /^>\s*\[!(\w+)\]/.exec(chunk);
    const lead = !card && !sawLead && chunk.startsWith("**");
    if (!card && !chunk.startsWith("#")) sawLead = true;
    if (!card && !lead) return chunk;
    const type = card?.[1].toUpperCase();
    const markers = [...chunk.matchAll(/\[\^([^\]\s]+)\](?!:)/g)].map((m) => defs.get(m[1])?.url).filter(Boolean) as string[];
    const add: string[] = [];
    if (type === "CAUTION" && first) {
      const own = `/patterns#${first.id}`;
      if (!markers.includes(own)) add.push(ref(own, first.name));
    }
    if (!markers.some((u) => evidenceUrls.has(u)) && evidence.length) {
      const text = chunk.replace(/\[\^[^\]\s]+\]/g, "");
      const want = type === "CAUTION" && first
        ? [...new Set(first.signals.map((s) => SIGNAL_TOPIC[s]).filter((t): t is Topic => !!t)), ...topicsOf(text)]
        : topicsOf(text);
      const e = want.map((t) => evidence.find((x) => x.topic === t)).find(Boolean) ?? evidence[0];
      add.push(ref(e.url, e.label));
    }
    return add.length ? chunk + add.join("") : chunk;
  });
  const used = new Set(out.flatMap((c) => [...c.matchAll(/\[\^([^\]\s]+)\](?!:)/g)].map((m) => m[1])));
  const defLines = [...defs].filter(([id]) => used.has(id)).map(([id, d]) => `[^${id}]: [${d.label}](${d.url})`);
  return out.join("\n\n") + (defLines.length ? "\n\n" + defLines.join("\n") : "");
}

/* Deterministic pattern scoring (round 2, R1). Pure: no network, no React.
   1. signalsFrom: what the checks actually found, in the catalogue's Signal vocabulary.
   2. scorePatterns: each catalogue pattern scored against the signals, the profile and the traits.
   3. pickPatterns: the ones at or over the threshold, best first, at most three.
   The reasons for each pick are returned for debugging and for the QA notes; they are never shown to users. */
import { PATTERN_CATALOGUE, type PatternMeta, type Signal, type Trait } from "../data/pattern-catalogue";
import type { FlagHit, FlagId, SelfFlagId } from "./flags";
import type { ProfileId } from "./patterns";
import type { ScanResult, ScanTool } from "./synthetic";

export const THRESHOLD = 4;
export const MAX_PICKS = 3;
/* A pattern needs real findings behind it: profile, traits and prevalence only add to a signal score of at least this. */
export const MIN_SIGNAL = 2;
const PREVALENCE_ORDER = { "very common": 0, common: 1, emerging: 2, rare: 3 } as const;

export type Findings = Partial<Record<ScanTool, ScanResult>>;

/* Breach names that point at crypto (an exchange, wallet or crypto forum account). A lead, not proof of holdings. */
const CRYPTO_BREACH = /coinbase|binance|kraken|bitfinex|bitstamp|gemini|crypto|bitcoin|\bbtc\b|ledger|trezor|metamask|blockchain|coinmarketcap|kucoin|bybit|okx|gate\.io|nicehash|\bnft\b|opensea/i;

const live = (r?: ScanResult) => !!r && r.source !== "skipped" && r.source !== "unavailable";

/* Signals read from the scan's tool results and the flags that were shown ("yes" only). */
export function signalsFrom(findings: Findings, flags: readonly Pick<FlagHit, "id" | "state">[] = []): Signal[] {
  const yes = new Set<FlagId>(flags.filter((f) => f.state === "yes").map((f) => f.id));
  const out = new Set<Signal>();
  const add = (s: Signal, on: boolean) => { if (on) out.add(s); };
  const gh = findings.github;
  const ghOwn = live(gh) && (!!gh!.hit || /^Found GitHub profile/i.test(gh!.found));
  const breaches = [...(findings.hibpTest?.facts?.breaches ?? []), ...(findings.leakCheck?.facts?.breaches ?? [])];
  const breachAny = (live(findings.hibpTest) && !!findings.hibpTest!.hit) || (live(findings.leakCheck) && !!findings.leakCheck!.hit);
  const socials = live(findings.social) ? findings.social!.facts?.profiles ?? [] : [];
  const forums = live(findings.forum) ? findings.forum!.facts?.profiles ?? [] : [];

  add("public-commit-email", yes.has("public-email-in-commits"));
  add("github-profile", ghOwn);
  add("breach-any", breachAny);
  add("breach-password", yes.has("passwords-in-breaches"));
  add("breach-travel", yes.has("travel-site-breach"));
  add("breach-marketplace", yes.has("marketplace-breach"));
  add("stealer-log", yes.has("stealer-log-hit"));
  add("gravatar", socials.includes("Gravatar"));
  add("linkedin-presence", live(findings.linkedin) && (findings.linkedin!.facts?.profiles ?? []).includes("LinkedIn"));
  add("same-username-many-sites", yes.has("same-username-everywhere"));
  add("news-mentions", yes.has("in-the-news"));
  add("crypto-activity", breaches.some((b) => CRYPTO_BREACH.test(b.name)));
  add("phone-exposed", yes.has("phone-number-exposed"));
  add("address-exposed", yes.has("home-address-exposed"));
  add("job-change", yes.has("just-changed-jobs"));
  add("dev-forum-activity", forums.includes("Hacker News") || socials.includes("Keybase"));
  /* The email is out in the open: in a breach, in public commits or on a public Gravatar profile. */
  add("email-exposed", breachAny || yes.has("public-email-in-commits") || socials.includes("Gravatar"));
  /* public-role and large-following have no free, reliable check yet; they come only from the classifier's traits. */
  return [...out];
}

/* Traits the person ticked themselves. Never inferred. */
export const SELF_TRAITS: Record<SelfFlagId, Trait | null> = {
  "recently-moved": "recent-mover", "travelling-soon": "traveller", "selling-online": "online-seller", "big-life-event": null,
};

export const TRAITS = ["developer", "job-seeker", "executive", "finance-staff", "hr-staff", "crypto-holder", "traveller", "recent-mover",
  "older-person", "public-figure", "parent", "online-seller", "small-business", "journalist-activist", "student", "general"] as const satisfies readonly Trait[];
/* The classifier's profiles: every profile in fraud-patterns.json except no-profile, which the classifier calls "none". */
export const CLASS_PROFILES = ["high-value-individual", "target-of-spies", "crypto-worker", "romance-target"] as const satisfies readonly Exclude<ProfileId, "no-profile">[];
export type Classification = { profile: (typeof CLASS_PROFILES)[number] | "none"; traits: Trait[]; by: "model" | "fallback"; note?: string };

/* Deterministic profile and traits from the signals alone, for when the classifier has no key, times out or fails.
   Only what the findings show; "none" unless a crypto account turned up in a breach. */
export function fromSignals(signals: readonly Signal[], extraTraits: readonly Trait[] = []): Classification {
  const s = new Set(signals);
  const traits: Trait[] = [];
  const add = (t: Trait, on: boolean) => { if (on && !traits.includes(t)) traits.push(t); };
  for (const t of extraTraits) add(t, true);
  add("developer", s.has("github-profile") || s.has("public-commit-email") || s.has("dev-forum-activity"));
  add("job-seeker", s.has("job-change"));
  add("crypto-holder", s.has("crypto-activity"));
  add("traveller", s.has("breach-travel"));
  add("online-seller", s.has("breach-marketplace"));
  return { profile: s.has("crypto-activity") ? "crypto-worker" : "none", traits: traits.slice(0, 4), by: "fallback" };
}

/* Two signals follow from traits rather than checks: a public role (executive, public figure) and a large following.
   Only traits with evidence count here: ones the person reported about themselves. A trait the classifier guessed
   still adds its trait point in scoring, but it never becomes a signal on its own. */
export function withTraitSignals(signals: readonly Signal[], evidencedTraits: readonly Trait[]): Signal[] {
  const traits = evidencedTraits;
  const out = new Set(signals);
  if (traits.includes("executive") || traits.includes("public-figure")) out.add("public-role");
  if (traits.includes("public-figure")) out.add("large-following");
  return [...out];
}

export type PickReason = { signals: { signal: Signal; weight: number }[]; profile: number; traits: Trait[]; prevalence: number };
export type Scored = { id: string; score: number; signalScore: number; reasons: PickReason; order: number; meta: PatternMeta };

function prevalenceBonus(p: PatternMeta): number {
  const { level, trend } = p.prevalence;
  if (level === "very common") return 2;
  if (level === "common") return 1;
  if (level === "emerging" && trend === "rising") return 1;
  return 0;
}

export type ScoreInput = { signals: readonly Signal[]; profile?: ProfileId | "none" | null; traits?: readonly Trait[] };

/* Every catalogue pattern with its score. "general" is everyone, so it never counts as a matching trait, and no
   profile is no evidence of targeting, so a pattern aimed at "no-profile" gets no profile bonus either (tuned on the
   first live run: the bonus put a payroll scam on a developer whose only findings were a commit email and a Gravatar). */
export function scorePatterns({ signals, profile, traits = [] }: ScoreInput, catalogue: readonly PatternMeta[] = PATTERN_CATALOGUE): Scored[] {
  const pid: ProfileId | null = !profile || profile === "none" || profile === "no-profile" ? null : profile;
  const have = new Set(signals);
  const mine = traits.filter((t) => t !== "general");
  return catalogue.map((p, order) => {
    const sig = p.signals.filter((s) => have.has(s.signal));
    const signalScore = sig.reduce((a, s) => a + s.weight, 0);
    const prof = pid && p.targets.profiles.includes(pid) ? 2 : 0;
    const tr = mine.filter((t) => p.targets.traits.includes(t));
    const prev = signalScore > 0 || prof > 0 || tr.length > 0 ? prevalenceBonus(p) : 0;
    const score = signalScore >= MIN_SIGNAL ? signalScore + prof + tr.length + prev : 0;
    return { id: p.id, score, signalScore, order, meta: p, reasons: { signals: sig.map((s) => ({ signal: s.signal, weight: s.weight })), profile: prof, traits: tr, prevalence: prev } };
  });
}

/* The picked patterns: score at or over the threshold, highest first, ties by prevalence then catalogue order. */
export function pickPatterns(input: ScoreInput, opts: { threshold?: number; max?: number; catalogue?: readonly PatternMeta[] } = {}): Scored[] {
  const { threshold = THRESHOLD, max = MAX_PICKS, catalogue } = opts;
  return scorePatterns(input, catalogue)
    .filter((s) => s.score >= threshold)
    .sort((a, b) => b.score - a.score
      || PREVALENCE_ORDER[a.meta.prevalence.level] - PREVALENCE_ORDER[b.meta.prevalence.level]
      || a.order - b.order)
    .slice(0, max);
}

/* One line per pick, for logs and the progress notes. */
export const describePick = (s: Scored) =>
  `${s.id} ${s.score} = signals ${s.reasons.signals.map((x) => `${x.signal}:${x.weight}`).join("+") || "0"}`
  + `${s.reasons.profile ? ` + profile ${s.reasons.profile}` : ""}${s.reasons.traits.length ? ` + traits ${s.reasons.traits.join(",")}` : ""}`
  + `${s.reasons.prevalence ? ` + prevalence ${s.reasons.prevalence}` : ""}`;

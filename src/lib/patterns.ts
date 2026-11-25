import data from "./fraud-patterns.json";
import type { FlagId, SelfFlagId } from "./flags";
import type { MiniName } from "./synthetic";

/* The report's scam patterns come from Hack's research file (fraud-patterns.json, 24 Nov), wording kept exactly.
   A pattern shows when one of its flags is set, or the person's profile is one it names; QR code phishing (baseline)
   shows for everyone. Profiles and flags are labels a person may or may not have, never a rating of them. */
export type PatternId = "contagious-interview" | "email-bomb-fake-it-support" | "pass-the-cookie" | "fake-boss-payment"
  | "deepfake-crypto-giveaway" | "state-spearphishing" | "wallet-drainer" | "sim-swap" | "pig-butchering" | "romance-scam"
  | "task-scam" | "fake-bank-call" | "news-hook-phishing" | "payroll-change" | "after-move-council-letter" | "marketplace-fake-buyer"
  | "fake-booking-or-visa" | "qr-code-phishing" | "mfa-fatigue" | "credential-stuffing" | "voice-clone-family" | "doxxing-swatting"
  | "leaked-password-extortion" | "fake-charity" | "clickfix-fake-captcha";
export type ProfileId = "high-value-individual" | "target-of-spies" | "crypto-worker" | "romance-target" | "no-profile";
export type FraudPattern = {
  id: PatternId; name: string; oneLine: string; explain: string; steps: string[]; advice: string; sources: string[];
  triggeredBy: { flags: (FlagId | SelfFlagId)[]; profiles: ProfileId[]; baseline: boolean };
};
export const PATTERN_LIST = data.patterns as FraudPattern[];
export const PATTERNS = Object.fromEntries(PATTERN_LIST.map((p) => [p.id, p])) as Record<PatternId, FraudPattern>;

/* Display label for each profile id (the json has ids only). */
export type Profile = "High Value Individual" | "Target of Spies" | "Crypto Worker" | "Romance Target";
export const PROFILE_ID: Record<Profile, ProfileId> = {
  "High Value Individual": "high-value-individual", "Target of Spies": "target-of-spies", "Crypto Worker": "crypto-worker", "Romance Target": "romance-target",
};

/* Our own extras on top of the research: the three patterns with a mini animation and a long form page. */
export const PATTERN_ART: Partial<Record<PatternId, { anim: MiniName; href: string }>> = {
  "contagious-interview": { anim: "rec", href: "/mockups/03-pattern-fake-recruiter.html" },
  "email-bomb-fake-it-support": { anim: "vish", href: "/mockups/03-pattern-signup-bombing.html" },
  "pass-the-cookie": { anim: "sess", href: "/mockups/03-pattern-session-hijack.html" },
};

const BREACH_AS_SELF: Partial<Record<FlagId | SelfFlagId, FlagId | SelfFlagId>> = { "travel-site-breach": "travelling-soon", "marketplace-breach": "selling-online" };

/* Matching patterns, most reasons first (the profile counts as one reason, each flag as one), then file order.
   Baseline patterns go last. extra adds patterns a cached preset names directly. */
export function patternsFor({ profile, flags: given, extra = [] }: { profile: Profile | null; flags: (FlagId | SelfFlagId)[]; extra?: PatternId[] }): PatternId[] {
  const pid = profile ? PROFILE_ID[profile] : "no-profile";
  /* An account at a travel site or a marketplace, seen in a breach, brings the same patterns as the person ticking
     travelling soon or selling online. Counted once when both are set. */
  const flags = [...new Set(given.map((f) => BREACH_AS_SELF[f] ?? f))];
  const scored = PATTERN_LIST.map((p, i) => ({
    id: p.id, i, base: p.triggeredBy.baseline,
    n: (p.triggeredBy.profiles.includes(pid) ? 1 : 0) + p.triggeredBy.flags.filter((f) => flags.includes(f)).length + (extra.includes(p.id) ? 1 : 0),
  }));
  const hits = scored.filter((s) => !s.base && s.n > 0).sort((a, b) => b.n - a.n || a.i - b.i);
  return [...hits, ...scored.filter((s) => s.base)].map((s) => s.id);
}

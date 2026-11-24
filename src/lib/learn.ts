import type { PatternId, ProfileId } from "./patterns";

/* The one "thing to learn" link. A static, hand checked map: one resource per profile (No profile included) and per
   pattern. Nemotron only ever picks a key (z.enum(LEARN_KEYS)); it never writes a URL.
   INTERFACE (agreed between the report and this file; do not rename): LEARN_KEYS, LearnKey, Learn, LEARN, learnFor.
   Entries are filled and checked by the learning links pass (every URL 200, a real page; YouTube via oEmbed). */
export type LearnKey = ProfileId | PatternId;
export const LEARN_KEYS = [
  "high-value-individual", "target-of-spies", "crypto-worker", "romance-target", "no-profile",
  "contagious-interview", "email-bomb-fake-it-support", "pass-the-cookie", "fake-boss-payment", "deepfake-crypto-giveaway",
  "state-spearphishing", "wallet-drainer", "sim-swap", "pig-butchering", "romance-scam", "task-scam", "fake-bank-call",
  "news-hook-phishing", "payroll-change", "after-move-council-letter", "marketplace-fake-buyer", "fake-booking-or-visa",
  "qr-code-phishing", "mfa-fatigue", "credential-stuffing", "voice-clone-family", "doxxing-swatting",
  "leaked-password-extortion", "fake-charity",
] as const satisfies readonly LearnKey[];

/* kind "video": a YouTube watch URL, and thumb is its oEmbed thumbnail_url. source is the publisher, e.g. "NCSC" or "Which?". */
export type Learn = { title: string; source: string; url: string; kind: "article" | "video"; thumb?: string };

/* Placeholder until the checked map lands: every key points at the NCSC top tips page (checked 200 on 24 Nov). */
const TOP_TIPS: Learn = { title: "Top tips for staying secure online", source: "NCSC", url: "https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online", kind: "article" };
export const LEARN: Record<LearnKey, Learn> = Object.fromEntries(LEARN_KEYS.map((k) => [k, TOP_TIPS])) as Record<LearnKey, Learn>;

export const learnFor = (key: LearnKey): Learn => LEARN[key];

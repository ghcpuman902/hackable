/* Synthetic data only. No network calls. */
export type SourceState = "done" | "hit";
export const SOURCES: [string, SourceState][] = [
  ["Web", "done"], ["LinkedIn", "done"], ["GitHub", "done"],
  ["Hudson Rock", "hit"], ["LeakCheck", "hit"], ["Have I Been Pwned", "hit"],
];

export type MiniName = "rec" | "flood" | "sess" | "breach" | "steal" | "prof";

export type PatternId = "fake-recruiter" | "signup-bombing" | "session-hijack";
export const PATTERNS: Record<PatternId, { anim: MiniName; href: string; lead: string; rest: string }> = {
  "fake-recruiter": { anim: "rec", href: "/mockups/03-pattern-fake-recruiter.html",
    lead: "A recruiter offers a dream job, then sends a coding test.", rest: " Running npm install starts hidden code that copies your saved logins and wallets. Run tests in a throwaway sandbox." },
  "signup-bombing": { anim: "flood", href: "/mockups/03-pattern-signup-bombing.html",
    lead: "Hundreds of welcome emails arrive at once.", rest: " They bury one real alert, like an order you never placed. Search the flood for orders and password resets before you delete it." },
  "session-hijack": { anim: "sess", href: "/mockups/03-pattern-session-hijack.html",
    lead: "They copy the part of your browser that says you are signed in.", rest: " No password or code needed. Sign out of every session, then change passwords." },
};
export const LEAD_PATTERNS: PatternId[] = ["fake-recruiter", "signup-bombing"];
export const EXTRA_PATTERNS: PatternId[] = ["session-hijack"];

export const DEMO_EMAIL = "jane@hibp-integration-tests.com";
export const DEMO_CHIPS = "Jane Doe, jane@hibp-integration-tests.com, linkedin.com/in/janedoe-demo";

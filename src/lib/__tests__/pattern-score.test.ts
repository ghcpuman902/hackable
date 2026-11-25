import { describe, expect, it } from "vitest";
import { PATTERN_CATALOGUE, type PatternMeta, type Signal } from "../../data/pattern-catalogue";
import fraud from "../fraud-patterns.json";
import type { FlagHit } from "../flags";
import { outputFlags } from "../flags";
import { tagsFor } from "../report-tags";
import { CLASS_PROFILES, fromSignals, MAX_PICKS, MIN_SIGNAL, pickPatterns, scorePatterns, signalsFrom, THRESHOLD, withTraitSignals, type Findings } from "../pattern-score";

const yes = (...ids: FlagHit["id"][]): FlagHit[] => ids.map((id) => ({ id, state: "yes", evidence: "" }));
const ids = (signals: Signal[], extra: Parameters<typeof pickPatterns>[0] = { signals }) => pickPatterns({ ...extra, signals }).map((p) => p.id);

/* A developer like the live test person: GitHub profile, email in commits, breaches with passwords, a Gravatar. */
const DEV: Findings = {
  github: { found: "Found: email in commits", hit: true, source: "live", facts: { emails: ["a@b.c"], repos: ["x/y"], urls: ["https://github.com/x", "https://github.com/x/y"] } },
  hibpTest: { found: "Found: 4 breaches", hit: true, source: "live", facts: { breaches: [{ name: "Canva" }, { name: "Dropbox" }], checked: ["LeakCheck", "XposedOrNot"] } },
  leakCheck: { found: "Found: passwords in 3 leaks", hit: true, source: "live", facts: { passwords: true, breaches: [{ name: "Canva" }] } },
  social: { found: "Found: Gravatar", hit: true, source: "live", facts: { profiles: ["Gravatar"], urls: ["https://gravatar.com/x"] } },
};

it("the classifier's profiles are the research file's, less no-profile", () => {
  expect([...CLASS_PROFILES, "no-profile"].sort()).toEqual([...fraud.profiles].sort());
});

describe("signalsFrom", () => {
  it("no findings and no flags give no signals", () => {
    expect(signalsFrom({}, [])).toEqual([]);
  });

  it("skipped and unavailable checks never count", () => {
    const f: Findings = {
      github: { found: "x", hit: true, source: "skipped" }, hibpTest: { found: "x", hit: true, source: "unavailable" },
      social: { found: "x", hit: true, source: "skipped", facts: { profiles: ["Gravatar"] } },
    };
    expect(signalsFrom(f, [])).toEqual([]);
  });

  it("reads a developer's findings", () => {
    const s = signalsFrom(DEV, yes("public-email-in-commits", "passwords-in-breaches"));
    expect(s).toEqual(expect.arrayContaining(["public-commit-email", "github-profile", "breach-any", "breach-password", "gravatar", "email-exposed"]));
    expect(s).not.toContain("stealer-log");
  });

  it("only yes flags count", () => {
    expect(signalsFrom({}, [{ id: "in-the-news", state: "maybe" }])).toEqual([]);
    expect(signalsFrom({}, yes("in-the-news"))).toEqual(["news-mentions"]);
  });

  it("a by name GitHub search (a possible namesake) is not a GitHub profile", () => {
    expect(signalsFrom({ github: { found: "Found possible GitHub profiles", hit: false, source: "live", facts: { urls: ["https://github.com/n"] } } })).toEqual([]);
  });

  it("a crypto exchange in a breach is crypto activity", () => {
    expect(signalsFrom({ hibpTest: { found: "x", hit: true, source: "live", facts: { breaches: [{ name: "Coinbase" }] } } })).toContain("crypto-activity");
  });
});

describe("scoring", () => {
  it("Robert-like breach-only findings never become executive or crypto scams", () => {
    const robert: Findings = {
      hibpTest: { found: "Found: 2 breaches", hit: true, source: "live", facts: { breaches: [{ name: "Canva", email: "robert@example.com" }, { name: "Modbsolutions", email: "robert@example.com" }], checked: ["Have I Been Pwned"] } },
      leakCheck: { found: "Found: passwords in 2 leaks", hit: true, source: "live", facts: { passwords: true, breaches: [{ name: "Canva", email: "robert@example.com" }, { name: "Modbsolutions", email: "robert@example.com" }] } },
      web: { found: "Found: 0 results", hit: false, source: "live", facts: { possibleWebResults: [{ title: "Robert", url: "https://example.com/robert" }] } },
    };
    const flags = outputFlags(robert).filter((flag) => flag.state === "yes");
    const signals = signalsFrom(robert, flags);
    const picks = pickPatterns({ signals }).map((pick) => pick.id);
    expect(signals).toEqual(expect.arrayContaining(["breach-any", "breach-password", "email-exposed"]));
    expect(signals).not.toEqual(expect.arrayContaining(["job-change", "public-role", "large-following", "crypto-activity"]));
    expect(picks).toEqual(expect.arrayContaining(["leaked-password-extortion", "credential-stuffing"]));
    expect(picks).not.toEqual(expect.arrayContaining(["fake-boss-payment", "deepfake-crypto-giveaway"]));
    expect(tagsFor(null, flags.map((flag) => flag.id))).toEqual(["PasswordsInBreaches"]);
  });

  it("breach-only signals cannot select fake-boss-payment or deepfake-crypto-giveaway", () => {
    const picks = pickPatterns({ signals: ["breach-any", "breach-password", "email-exposed"] }).map((pick) => pick.id);
    expect(picks).not.toEqual(expect.arrayContaining(["fake-boss-payment", "deepfake-crypto-giveaway"]));
  });

  it("a person with no findings gets no patterns, whatever the profile", () => {
    expect(ids([])).toEqual([]);
    for (const profile of [...CLASS_PROFILES, "none" as const]) expect(ids([], { signals: [], profile, traits: ["developer", "executive"] })).toEqual([]);
  });

  it("each profile adds 2 to the patterns that target it, and only those; no profile adds nothing", () => {
    const signals: Signal[] = ["breach-any", "breach-password", "email-exposed", "stealer-log", "phone-exposed", "public-role", "news-mentions", "crypto-activity", "github-profile"];
    const plain = scorePatterns({ signals, profile: "none" });
    expect(scorePatterns({ signals, profile: "no-profile" }).map((s) => s.score)).toEqual(plain.map((s) => s.score));
    for (const s of plain) expect(s.reasons.profile).toBe(0);
    for (const profile of CLASS_PROFILES) {
      const withP = scorePatterns({ signals, profile });
      for (const [i, p] of PATTERN_CATALOGUE.entries()) {
        if (plain[i].signalScore < MIN_SIGNAL) continue;
        expect(withP[i].score - plain[i].score).toBe(p.targets.profiles.includes(profile) ? 2 : 0);
      }
    }
  });

  it("regression, first live run: a commit email and a Gravatar do not pick the payroll scam", () => {
    const signals: Signal[] = ["public-commit-email", "github-profile", "gravatar", "email-exposed"];
    const got = ids(signals, { signals, profile: "none", traits: ["developer"] });
    expect(got[0]).toBe("contagious-interview");
    expect(got).not.toContain("payroll-change");
  });

  it("score = signal weights + 2 profile + 1 per trait + prevalence", () => {
    const p = PATTERN_CATALOGUE.find((x) => x.id === "contagious-interview")!;
    const s = scorePatterns({ signals: ["github-profile", "public-commit-email"], profile: "crypto-worker", traits: ["developer", "general"] }).find((x) => x.id === p.id)!;
    /* 3 + 3 signals, 2 profile, 1 developer ("general" never counts), 1 for common */
    expect(s.score).toBe(10);
    expect(s.reasons).toEqual({ signals: [{ signal: "github-profile", weight: 3 }, { signal: "public-commit-email", weight: 3 }], profile: 2, traits: ["developer"], prevalence: 1 });
  });

  it("a signal score under the minimum picks nothing on its own", () => {
    /* email-exposed alone weighs 1 or 2 everywhere, and profile or prevalence must not lift it over the line. */
    expect(ids(["gravatar"])).toEqual([]);
    expect(ids(["email-exposed"], { signals: [], profile: "none" }).every((id) => scorePatterns({ signals: ["email-exposed"] }).find((x) => x.id === id)!.signalScore >= MIN_SIGNAL)).toBe(true);
  });

  it("keeps at most three, all at or over the threshold", () => {
    const all: Signal[] = ["breach-any", "breach-password", "stealer-log", "phone-exposed", "github-profile", "public-commit-email", "news-mentions", "public-role", "crypto-activity"];
    const picks = pickPatterns({ signals: all, profile: "high-value-individual", traits: ["executive"] });
    expect(picks).toHaveLength(MAX_PICKS);
    for (const p of picks) expect(p.score).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it("is deterministic and orders by score, then prevalence, then catalogue order", () => {
    const signals: Signal[] = ["breach-any", "breach-password", "email-exposed"];
    const a = pickPatterns({ signals });
    expect(pickPatterns({ signals })).toEqual(a);
    const rank = { "very common": 0, common: 1, emerging: 2, rare: 3 };
    for (let i = 1; i < a.length; i++) {
      const [x, y] = [a[i - 1], a[i]];
      expect(x.score > y.score || (x.score === y.score && (rank[x.meta.prevalence.level] < rank[y.meta.prevalence.level]
        || (x.meta.prevalence.level === y.meta.prevalence.level && x.order < y.order)))).toBe(true);
    }
  });

  it("ties break by prevalence before catalogue order", () => {
    const mk = (id: string, level: PatternMeta["prevalence"]["level"], email: 1 | 2): PatternMeta => ({
      id, targets: { profiles: [], traits: [] }, signals: [{ signal: "breach-any", weight: 3 }, { signal: "email-exposed", weight: email }],
      prevalence: { level, trend: "steady", asOf: "2025-01-01", sourceIds: [] }, cases: [], channels: [], unfolds: [],
    });
    /* Both score 5: rare 3 + 2, common 3 + 1 + 1 prevalence. Rare comes first in the catalogue, common wins the tie. */
    const cat = [mk("a-rare", "rare", 2), mk("b-common", "common", 1)];
    const got = pickPatterns({ signals: ["breach-any", "email-exposed"] }, { catalogue: cat });
    expect(got.map((p) => p.score)).toEqual([5, 5]);
    expect(got.map((p) => p.id)).toEqual(["b-common", "a-rare"]);
  });

  it("key signal combinations pick the expected patterns", () => {
    const table: [Signal[], string[]][] = [
      [["breach-any", "breach-password", "email-exposed"], ["leaked-password-extortion", "credential-stuffing"]],
      [["github-profile", "public-commit-email"], ["contagious-interview"]],
      [["stealer-log"], ["pass-the-cookie", "mfa-fatigue"]],
      [["phone-exposed"], ["task-scam"]],
      [["breach-travel", "email-exposed"], ["fake-booking-or-visa"]],
      [["breach-marketplace", "email-exposed"], ["marketplace-fake-buyer"]],
      [["crypto-activity"], ["wallet-drainer"]],
    ];
    for (const [signals, want] of table) {
      const cls = fromSignals(signals);
      const got = ids(withTraitSignals(signals, cls.traits), { signals: [], profile: cls.profile, traits: cls.traits });
      for (const w of want) expect(got, `${signals.join("+")} should pick ${w}, got ${got.join(", ")}`).toContain(w);
      expect(got.length).toBeGreaterThanOrEqual(1);
      expect(got.length).toBeLessThanOrEqual(3);
    }
  });

  it("the live developer case gives one to three patterns", () => {
    const signals = signalsFrom(DEV, yes("public-email-in-commits", "passwords-in-breaches"));
    const cls = fromSignals(signals);
    const got = ids(withTraitSignals(signals, cls.traits), { signals: [], profile: cls.profile, traits: cls.traits });
    expect(got.length).toBeGreaterThanOrEqual(1);
    expect(got.length).toBeLessThanOrEqual(3);
    expect(got).toContain("contagious-interview");
  });
});

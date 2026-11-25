import { describe, expect, it } from "vitest";
import { MockLanguageModelV4 } from "ai/test";
import { scoreLive } from "../live-report";
import { withTraitSignals, type Findings } from "../pattern-score";

const usage = { inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 1, text: 1, reasoning: undefined } };
const answer = (text: string) => new MockLanguageModelV4({
  doGenerate: async () => ({ content: [{ type: "text", text }], finishReason: { unified: "stop", raw: undefined }, usage, warnings: [] }),
});

/* Mangle's live data: a GitHub profile with his email in public commits and a Gravatar. No breaches, no public role. */
const DEVELOPER: Findings = {
  github: { found: "Found: email in commits", hit: true, source: "live", facts: { emails: ["dev@example.com"], repos: ["dev/app"], urls: ["https://github.com/dev", "https://github.com/dev/app"] } },
  social: { found: "Found: Gravatar", hit: true, source: "live", facts: { profiles: ["Gravatar"], urls: ["https://gravatar.com/dev"] } },
};

describe("guessed traits need evidence", () => {
  it("a guessed executive or public figure trait adds no public-role or large-following signal", () => {
    expect(withTraitSignals(["github-profile"], [])).toEqual(["github-profile"]);
  });

  it("self reported traits still add their signals", () => {
    expect(withTraitSignals([], ["executive"])).toContain("public-role");
    expect(withTraitSignals([], ["public-figure"])).toEqual(expect.arrayContaining(["public-role", "large-following"]));
  });

  it("a developer-only person never gets the fake boss payment email, even when the model calls them an executive", async () => {
    const model = answer('{"profile":"high-value-individual","traits":["executive","public-figure","developer"]}');
    const { signals, picks, cls } = await scoreLive({ query: "dev@example.com", findings: DEVELOPER }, model);
    expect(cls.by).toBe("model");
    expect(signals).not.toContain("public-role");
    expect(signals).not.toContain("large-following");
    const ids = picks.map((p) => p.id);
    expect(ids).not.toContain("fake-boss-payment");
    expect(ids).not.toContain("deepfake-crypto-giveaway");
  });
});

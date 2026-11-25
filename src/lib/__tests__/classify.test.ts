import { describe, expect, it } from "vitest";
import { MockLanguageModelV4 } from "ai/test";
import { classifyProfile, classifierModel } from "../classify";
import { fromSignals } from "../pattern-score";

const usage = { inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 1, text: 1, reasoning: undefined } };
const answer = (text: string) => new MockLanguageModelV4({
  doGenerate: async () => ({ content: [{ type: "text", text }], finishReason: { unified: "stop", raw: undefined }, usage, warnings: [] }),
});

describe("profile classifier", () => {
  it("falls back deterministically with no key", async () => {
    const before = process.env.NEBIUS_API_KEY;
    delete process.env.NEBIUS_API_KEY;
    try {
      expect(classifierModel()).toBeNull();
      const r = await classifyProfile({}, ["github-profile", "breach-any"]);
      expect(r).toEqual({ profile: "none", traits: ["developer"], by: "fallback" });
    } finally {
      if (before !== undefined) process.env.NEBIUS_API_KEY = before;
    }
  });

  it("falls back when the model fails or answers outside the schema", async () => {
    const broken = new MockLanguageModelV4({ doGenerate: async () => { throw new Error("down"); } });
    expect((await classifyProfile({}, ["crypto-activity"], [], broken)).by).toBe("fallback");
    expect(await classifyProfile({}, ["crypto-activity"], [], answer('{"profile":"astronaut","traits":[]}')))
      .toMatchObject({ profile: "crypto-worker", traits: ["crypto-holder"], by: "fallback", note: expect.stringMatching(/schema/) });
  });

  it("uses a valid model answer, keeps self reported traits and drops general", async () => {
    const r = await classifyProfile({}, [], ["traveller"], answer('{"profile":"target-of-spies","traits":["journalist-activist","general"]}'));
    expect(r).toEqual({ profile: "target-of-spies", traits: ["traveller", "journalist-activist"], by: "model" });
  });

  it("reads a fenced or loosely written answer and drops unknown traits", async () => {
    const fenced = answer('Here you go:\n```json\n{"profile": "Crypto Worker", "traits": ["Developer", "wizard", "crypto_holder"]}\n```');
    expect(await classifyProfile({}, [], [], fenced)).toEqual({ profile: "crypto-worker", traits: ["developer", "crypto-holder"], by: "model" });
    expect(await classifyProfile({}, [], [], answer('{"profile":"no-profile","traits":[]}'))).toEqual({ profile: "none", traits: [], by: "model" });
  });

  it("fallback reads only what the signals show", () => {
    expect(fromSignals([])).toEqual({ profile: "none", traits: [], by: "fallback" });
    expect(fromSignals(["job-change", "breach-travel", "breach-marketplace", "dev-forum-activity", "crypto-activity"]).traits).toHaveLength(4);
    expect(fromSignals(["breach-any"], ["recent-mover"]).traits).toEqual(["recent-mover"]);
  });
});

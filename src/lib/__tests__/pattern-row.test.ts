import { describe, expect, it } from "vitest";
import { SCENE_IDS } from "../../components/pattern-scenes";
import { matchedHeading } from "../pattern-row";
import { DEMO_REPORT, PRESET_REPORTS } from "../preset-reports";
import { reportPatterns } from "../report-refs";

describe("matchedHeading", () => {
  it("has no heading for zero or one pattern", () => {
    expect(matchedHeading(0)).toBeNull();
    expect(matchedHeading(1)).toBeNull();
  });
  it("counts two or more in words, without dashes", () => {
    expect(matchedHeading(2)).toBe("You're matched with two patterns");
    expect(matchedHeading(3)).toBe("You're matched with three patterns");
    expect(matchedHeading(12)).toBe("You're matched with 12 patterns");
  });
});

describe("the pattern row in cached reports", () => {
  const REPORTS = { ...PRESET_REPORTS, "Jane Doe Smith": DEMO_REPORT };
  it("has a drawn scene for every pattern a cached report shows", () => {
    for (const [name, md] of Object.entries(REPORTS)) {
      for (const p of reportPatterns(md)) expect(SCENE_IDS as readonly string[], `${name}: ${p.id}`).toContain(p.id);
    }
  });
});

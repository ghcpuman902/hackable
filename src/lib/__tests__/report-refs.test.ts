import { describe, expect, it } from "vitest";
import { DEMO_REPORT, PRESET_REPORTS } from "../preset-reports";
import { PATTERN_LIST, PATTERNS } from "../patterns";
import { parseReport } from "../report-md";
import { patternsInReport, PATTERN_BY_SOURCE, reportPatterns, shownRefs } from "../report-refs";

const REPORTS = { ...PRESET_REPORTS, "Jane Doe Smith": DEMO_REPORT };

describe("PATTERN_BY_SOURCE", () => {
  it("gives a shared source to the first pattern that cites it", () => {
    /* The FBI generative AI notice is cited by the deepfake, romance and voice clone patterns. */
    expect(PATTERN_BY_SOURCE.get("https://www.ic3.gov/PSA/2024/PSA241203")?.id).toBe("deepfake-crypto-giveaway");
    for (const p of PATTERN_LIST) for (const u of p.sources) {
      const first = PATTERN_LIST.find((q) => q.sources.includes(u))!;
      expect(PATTERN_BY_SOURCE.get(u)).toBe(first);
    }
  });
});

describe("shownRefs", () => {
  it("folds pattern sources into one link to the pattern card", () => {
    const refs = shownRefs([
      { url: "https://unit42.paloaltonetworks.com/two-campaigns-by-north-korea-bad-actors-target-job-hunters/", label: "Unit 42" },
      { url: "https://www.ic3.gov/PSA/2024/PSA240903", label: "FBI" },
    ]);
    expect(refs).toEqual([{ url: "/patterns#contagious-interview", label: PATTERNS["contagious-interview"].name, internal: true }]);
  });
  it("shortens a long label to the site name", () => {
    expect(shownRefs([{ url: "https://www.example.com/a", label: "A label that is far too long to sit here" }])[0].label).toBe("example.com");
    expect(shownRefs([{ url: "https://x.com/tim_cook", label: "@tim_cook" }])[0].label).toBe("@tim_cook");
  });
  it("keeps the full labels when two would read as the same site", () => {
    const refs = shownRefs([
      { url: "https://www.example.com/a", label: "Example: the first long article title" },
      { url: "https://example.com/b", label: "Example: the second long article title" },
    ]);
    expect(refs.map((r) => r.label)).toEqual(["Example: the first long article title", "Example: the second long article title"]);
  });
});

describe("preset report links", () => {
  for (const [name, md] of Object.entries(REPORTS)) {
    it(`${name}: every footnote resolves and no two in a block read the same`, () => {
      const parsed = parseReport(md);
      const cited = parsed.blocks.flatMap((b) => b.refs);
      const defs = md.match(/^\[\^[^\]]+\]:/gm) ?? [];
      /* Every definition is cited somewhere, so no footnote is left without a claim. */
      expect(new Set(cited.map((r) => r.url)).size).toBe(defs.length);
      for (const b of parsed.blocks) {
        const shown = shownRefs(b.refs);
        expect(new Set(shown.map((r) => r.label.toLowerCase())).size).toBe(shown.length);
        for (const r of shown) {
          if (r.internal) expect(PATTERNS[r.url.replace("/patterns#", "") as keyof typeof PATTERNS]).toBeDefined();
          else expect(r.url).toMatch(/^https:\/\//);
        }
        /* No footnote marker is left in the text. */
        expect(b.markdown).not.toMatch(/\[\^/);
      }
    });
  }
  it("Tim Cook's cards cite fake boss payment and the deepfake giveaway", () => {
    expect(patternsInReport(PRESET_REPORTS["Tim Cook"]).map((p) => p.id)).toEqual(["fake-boss-payment", "deepfake-crypto-giveaway"]);
  });
});

/* C7: a live report where the model cited nothing ended with no pattern cards and no link to any scam. */
describe("reportPatterns", () => {
  const uncited = "**You are The Code Sharer.**\n\n> [!TIP]\n> **Use a different email for public code.**";
  it("prefers the patterns the report cites", () => {
    expect(reportPatterns(PRESET_REPORTS["Tim Cook"], ["contagious-interview"]).map((p) => p.id)).toEqual(["fake-boss-payment", "deepfake-crypto-giveaway"]);
  });
  it("falls back to the patterns the checks point to when the report cites none", () => {
    expect(reportPatterns(uncited, ["contagious-interview", "email-bomb-fake-it-support"]).map((p) => p.id)).toEqual(["contagious-interview", "email-bomb-fake-it-support"]);
  });
  it("puts baseline patterns last, keeps at most four and skips unknown ids", () => {
    const base = PATTERN_LIST.filter((p) => p.triggeredBy.baseline).map((p) => p.id);
    const main = PATTERN_LIST.filter((p) => !p.triggeredBy.baseline).map((p) => p.id);
    const got = reportPatterns(uncited, [...base, "nope", ...main.slice(0, 5)]).map((p) => p.id);
    expect(got).toEqual(main.slice(0, 4));
    expect(reportPatterns(uncited, [base[0], main[0]]).map((p) => p.id)).toEqual([main[0], base[0]]);
  });
  it("shows nothing with no citations and no fallback", () => {
    expect(reportPatterns(uncited)).toEqual([]);
  });
});

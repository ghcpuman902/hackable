/**
 * Renderer unit tests driven by fixtures (no live model).
 *
 * ADJUST BEFORE USE: `cleanReport` and `parseReport` are placeholder names.
 * Point the import at the real exports of src/lib/report-md, then fix the
 * `normalise()` adapter below so it maps the real parse result onto the
 * shape this test expects. Only the adapter should need editing.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanReportDetailed, parseReport as parseCleaned, type CleanStats } from "../report-md";

const DIR = join(__dirname, "renderer-fixtures");
const expected: Record<string, Expected> = JSON.parse(readFileSync(join(DIR, "expected.json"), "utf8"));
const whitelist: { allowedUrls: string[]; allowedTags: string[] } = JSON.parse(
  readFileSync(join(DIR, "whitelist.json"), "utf8"),
);

/* Real exports: clean the raw text with the fixture whitelist, remember the clean up counts for the parse step. */
let lastStats: CleanStats | undefined;
const cleanReport = (raw: string) => {
  const { markdown, stats } = cleanReportDetailed(raw, whitelist.allowedUrls, whitelist.allowedTags);
  lastStats = stats;
  return markdown ?? "";
};
const parseReport = (cleaned: string) => ({ ...parseCleaned(cleaned), ...lastStats });

type Expected = {
  fallback: boolean;
  cardKinds: Array<"WARNING" | "CAUTION" | "TIP" | "NOTE">;
  footnotesPerCard: number[];
  headingsToBold: number;
  droppedLinks: string[];
  droppedCards: number;
  droppedTags: string[];
  keptTags?: string[];
  mustNotContain?: string[];
  maxPlainSentencesPerCard?: number;
  lintWarnings?: string[];
  _decision?: string;
};

type Normalised = {
  fallback: boolean;
  cards: { kind: string; footnoteUrls: string[]; plainText: string }[];
  tags: string[];
  links: string[]; // every href that survives anywhere in the report
  droppedLinks: string[];
  droppedCards: number;
  droppedTags: string[];
  headingsToBold: number;
  lintWarnings: string[];
  output: string; // cleaned markdown (or rendered text) used for mustNotContain
};

/* eslint-disable @typescript-eslint/no-explicit-any */
// ADAPTER: edit this to match the real return shape of parseReport.
function normalise(cleaned: string, parsed: any): Normalised {
  return {
    fallback: Boolean(parsed?.fallback),
    cards: (parsed?.cards ?? []).map((c: any) => ({
      kind: String(c.kind).toUpperCase(),
      footnoteUrls: (c.footnotes ?? []).map((f: any) => f.url ?? f),
      /* plainText comes from parseReport already without footnote markers */
      plainText: c.plainText ?? c.text ?? "",
    })),
    tags: parsed?.tags ?? [],
    links: parsed?.links ?? [],
    droppedLinks: parsed?.droppedLinks ?? [],
    droppedCards: parsed?.droppedCards ?? 0,
    droppedTags: parsed?.droppedTags ?? [],
    headingsToBold: parsed?.headingsToBold ?? 0,
    lintWarnings: parsed?.lintWarnings ?? [],
    output: cleaned,
  };
}

const sentences = (s: string) =>
  s.replace(/\*\*[^*]+\*\*/, "").replace(/\[\^\d+\]/g, "").split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);

describe.each(Object.entries(expected))("%s", (file, exp) => {
  const raw = readFileSync(join(DIR, file), "utf8");
  const cleaned = cleanReport(raw);
  const r = normalise(cleaned, parseReport(cleaned));

  it("fallback", () => expect(r.fallback).toBe(exp.fallback));
  it("card kinds and count (max 3)", () => {
    expect(r.cards.map((c) => c.kind)).toEqual(exp.cardKinds);
    expect(r.cards.length).toBeLessThanOrEqual(3);
  });
  it("footnotes per card", () => expect(r.cards.map((c) => c.footnoteUrls.length)).toEqual(exp.footnotesPerCard));
  it("every surviving link is whitelisted", () => {
    for (const u of [...r.links, ...r.cards.flatMap((c) => c.footnoteUrls)]) expect(whitelist.allowedUrls).toContain(u);
  });
  it("dropped links", () => expect([...r.droppedLinks].sort()).toEqual([...exp.droppedLinks].sort()));
  it("headings converted to bold", () => {
    expect(r.headingsToBold).toBe(exp.headingsToBold);
    expect(r.output).not.toMatch(/^#{1,6}\s/m);
  });
  it("dropped cards", () => expect(r.droppedCards).toBe(exp.droppedCards));
  it("tags", () => {
    for (const t of r.tags) expect(whitelist.allowedTags).toContain(t);
    if (exp.keptTags) expect(r.tags).toEqual(exp.keptTags);
    expect([...r.droppedTags].sort()).toEqual([...exp.droppedTags].sort());
  });
  if (exp.mustNotContain)
    it("strips forbidden content", () => {
      for (const s of exp.mustNotContain!) expect(r.output).not.toContain(s);
    });
  if (exp.maxPlainSentencesPerCard !== undefined)
    it("card sentence cap", () => {
      for (const c of r.cards) expect(sentences(c.plainText).length).toBeLessThanOrEqual(exp.maxPlainSentencesPerCard!);
    });
  if (exp.lintWarnings)
    it("lint warnings", () => {
      for (const w of exp.lintWarnings!) expect(r.lintWarnings).toContain(w);
    });
  it("never throws on rendering input, and never outputs raw script", () => {
    expect(r.output).not.toMatch(/<script/i);
  });
});

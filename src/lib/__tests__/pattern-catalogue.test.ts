import { describe, expect, it } from "vitest";
import fraud from "../fraud-patterns.json";
import { CATALOGUE_SOURCES, DEAD_URLS, PATTERN_CATALOGUE } from "../../data/pattern-catalogue";
import { PATTERNS } from "../patterns";

const knownIds = new Set(fraud.patterns.map((p) => p.id));
const profiles = new Set(fraud.profiles);
const sourceIds = new Set(CATALOGUE_SOURCES.map((s) => s.id));

describe("merged pattern catalogue", () => {
  it("covers every pattern in fraud-patterns.json exactly once", () => {
    expect(new Set(PATTERN_CATALOGUE.map((p) => p.id)).size).toBe(PATTERN_CATALOGUE.length);
    expect(PATTERN_CATALOGUE.map((p) => p.id).sort()).toEqual([...knownIds].sort());
  });

  it("every pattern id is known to the app, with a name and a page entry", () => {
    for (const p of PATTERN_CATALOGUE) {
      expect(knownIds.has(p.id)).toBe(true);
      expect(PATTERNS[p.id as keyof typeof PATTERNS]?.name).toBeTruthy();
    }
  });

  it("sources are deduped by url, https, dated and none of them dead", () => {
    expect(sourceIds.size).toBe(CATALOGUE_SOURCES.length);
    expect(new Set(CATALOGUE_SOURCES.map((s) => s.url)).size).toBe(CATALOGUE_SOURCES.length);
    for (const s of CATALOGUE_SOURCES) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(DEAD_URLS.has(s.url)).toBe(false);
    }
  });

  it("every sourceId resolves, every case url is https and live, targets are valid", () => {
    for (const p of PATTERN_CATALOGUE) {
      expect(p.prevalence.sourceIds.length).toBeGreaterThanOrEqual(1);
      for (const id of p.prevalence.sourceIds) expect(sourceIds.has(id)).toBe(true);
      expect(p.cases.length).toBeGreaterThanOrEqual(1);
      for (const c of p.cases) {
        expect(c.url).toMatch(/^https:\/\//);
        expect(DEAD_URLS.has(c.url)).toBe(false);
      }
      for (const prof of p.targets.profiles) expect(profiles.has(prof)).toBe(true);
      expect(p.signals.length).toBeGreaterThan(0);
      expect(p.unfolds.length).toBeGreaterThanOrEqual(3);
      expect(p.unfolds.length).toBeLessThanOrEqual(5);
    }
  });

  it("a new pattern has at least two working sources and is on /patterns", () => {
    for (const p of PATTERN_CATALOGUE.filter((x) => x.isNew)) {
      expect(p.prevalence.sourceIds.length).toBeGreaterThanOrEqual(2);
      expect(fraud.patterns.find((f) => f.id === p.id)!.sources.length).toBeGreaterThanOrEqual(2);
    }
  });
});

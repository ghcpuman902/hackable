import { describe, expect, it } from "vitest";
import fraud from "../fraud-patterns.json";
import { PART_A, SOURCES_A } from "../../data/pattern-catalogue.part-a";

const knownIds = new Set(fraud.patterns.map((p) => p.id));
const profiles = new Set(fraud.profiles);
const sourceIds = new Set(SOURCES_A.map((s) => s.id));

describe("pattern catalogue part A", () => {
  it("has unique source ids and urls, all https with dates", () => {
    expect(sourceIds.size).toBe(SOURCES_A.length);
    expect(new Set(SOURCES_A.map((s) => s.url)).size).toBe(SOURCES_A.length);
    for (const s of SOURCES_A) {
      expect(s.url.startsWith("https://")).toBe(true);
      expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("every pattern is known or flagged new, with valid targets, sources and cases", () => {
    expect(new Set(PART_A.map((p) => p.id)).size).toBe(PART_A.length);
    for (const p of PART_A) {
      if (p.isNew) {
        expect(knownIds.has(p.id)).toBe(false);
        expect(p.name && p.oneLine).toBeTruthy();
      } else {
        expect(knownIds.has(p.id)).toBe(true);
      }
      for (const prof of p.targets.profiles) expect(profiles.has(prof)).toBe(true);
      for (const id of p.prevalence.sourceIds) expect(sourceIds.has(id)).toBe(true);
      expect(p.prevalence.sourceIds.length).toBeGreaterThanOrEqual(3);
      expect(p.cases.length).toBeGreaterThanOrEqual(1);
      expect(p.cases.length).toBeLessThanOrEqual(3);
      for (const c of p.cases) expect(c.url.startsWith("https://")).toBe(true);
      expect(p.unfolds.length).toBeGreaterThanOrEqual(3);
      expect(p.unfolds.length).toBeLessThanOrEqual(5);
      expect(p.signals.length).toBeGreaterThan(0);
    }
  });
});

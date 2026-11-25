// The merged pattern catalogue (round 2, pass R1): part A (Claude, R0) and part B (Codex, B0).
// Hidden research metadata for the deterministic scoring in src/lib/pattern-score.ts; never shown to users.
// Sources are deduped by URL (the first id seen wins and later ids are remapped to it). URLs that the launcher's
// URL check (_agent/overnight/url-check.txt, 25 Nov) found dead (404, 410 or no DNS) are removed, together with any
// case that pointed at them. 403 and 429 answers are bot blocking and are kept.

import { PART_A, SOURCES_A } from "./pattern-catalogue.part-a";
import { PART_B, SOURCES_B } from "./pattern-catalogue.part-b";
import type { CatalogueSource, PatternMeta } from "./pattern-catalogue.types";

export type { CatalogueSource, PatternMeta, Signal, Trait } from "./pattern-catalogue.types";

/* 404 in the 25 Nov URL check. */
export const DEAD_URLS: ReadonlySet<string> = new Set([
  "https://consumer.ftc.gov/node/80688",
  "https://ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses",
]);

function merge(): { sources: CatalogueSource[]; patterns: PatternMeta[] } {
  const byUrl = new Map<string, CatalogueSource>();
  const alias = new Map<string, string>();
  for (const s of [...SOURCES_A, ...SOURCES_B]) {
    if (DEAD_URLS.has(s.url)) continue;
    const first = byUrl.get(s.url);
    if (first) alias.set(s.id, first.id);
    else byUrl.set(s.url, s);
  }
  const sources = [...byUrl.values()];
  const live = new Set(sources.map((s) => s.id));
  const seen = new Set<string>();
  const patterns: PatternMeta[] = [];
  for (const p of [...PART_A, ...PART_B]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const sourceIds = [...new Set(p.prevalence.sourceIds.map((id) => alias.get(id) ?? id))].filter((id) => live.has(id));
    patterns.push({ ...p, prevalence: { ...p.prevalence, sourceIds }, cases: p.cases.filter((c) => !DEAD_URLS.has(c.url)) });
  }
  return { sources, patterns };
}

const merged = merge();
export const CATALOGUE_SOURCES: readonly CatalogueSource[] = merged.sources;
export const PATTERN_CATALOGUE: readonly PatternMeta[] = merged.patterns;
export const CATALOGUE_BY_ID: ReadonlyMap<string, PatternMeta> = new Map(PATTERN_CATALOGUE.map((p) => [p.id, p]));

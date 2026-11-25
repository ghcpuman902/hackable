// The merged pattern catalogue (round 2, passes R1 and R5): part A (Claude, R0) and part B2 (Codex, B0b, the deeper
// rewrite of part B). Part B (the first version) is kept only for ids that B2 does not cover; today B2 covers all 12.
// Hidden research metadata for the deterministic scoring in src/lib/pattern-score.ts; never shown to users.
// Sources are deduped by URL (the first id seen wins and later ids are remapped to it). URLs that the launcher's
// URL check (_agent/overnight/url-check.txt, refreshed 25 Nov) found dead (404, 410 or no DNS) are removed, together
// with any case that pointed at them. 403 and 429 answers are bot blocking and are kept.

import { PART_A, SOURCES_A } from "./pattern-catalogue.part-a";
import { PART_B, SOURCES_B } from "./pattern-catalogue.part-b";
import { PART_B2, SOURCES_B2 } from "./pattern-catalogue.part-b2";
import type { CatalogueSource, PatternMeta } from "./pattern-catalogue.types";

export type { CatalogueSource, PatternMeta, Signal, Trait } from "./pattern-catalogue.types";

/* 404 in the 25 Nov URL check (refreshed in R5). */
export const DEAD_URLS: ReadonlySet<string> = new Set([
  "https://consumer.ftc.gov/node/80688",
  "https://ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses",
  "https://consumer.ftc.gov/consumer-alerts/2026/05/new-trends-reports-imposter-scams",
  "https://consumer.ftc.gov/consumer-alerts/2026/08/when-donating-support-those-need-not-scammer",
  "https://www.consumer.ftc.gov/consumer-alerts/2026/03/how-avoid-scams-while-applying-esta",
]);

/* Same page, different spelling of the address: www and a trailing slash do not matter. */
export function urlKey(url: string): string {
  const u = new URL(url);
  return `${u.hostname.toLowerCase().replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}${u.search}`;
}

const DEAD_KEYS = new Set([...DEAD_URLS].map(urlKey));
export const isDeadUrl = (url: string): boolean => DEAD_KEYS.has(urlKey(url));

function merge(): { sources: CatalogueSource[]; patterns: PatternMeta[] } {
  const byUrl = new Map<string, CatalogueSource>();
  const alias = new Map<string, string>();
  const usedIds = new Set<string>();
  for (const s of [...SOURCES_A, ...SOURCES_B2, ...SOURCES_B]) {
    if (isDeadUrl(s.url)) continue;
    const key = urlKey(s.url);
    const first = byUrl.get(key);
    if (first) {
      if (first.id !== s.id) alias.set(s.id, first.id);
    } else if (usedIds.has(s.id)) {
      throw new Error(`pattern catalogue: source id ${s.id} is used for two different URLs`);
    } else {
      byUrl.set(key, s);
      usedIds.add(s.id);
    }
  }
  const sources = [...byUrl.values()];
  const live = new Set(sources.map((s) => s.id));
  const seen = new Set<string>();
  const patterns: PatternMeta[] = [];
  for (const p of [...PART_A, ...PART_B2, ...PART_B]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const sourceIds = [...new Set(p.prevalence.sourceIds.map((id) => alias.get(id) ?? id))].filter((id) => live.has(id));
    patterns.push({ ...p, prevalence: { ...p.prevalence, sourceIds }, cases: p.cases.filter((c) => !isDeadUrl(c.url)) });
  }
  return { sources, patterns };
}

const merged = merge();
export const CATALOGUE_SOURCES: readonly CatalogueSource[] = merged.sources;
export const PATTERN_CATALOGUE: readonly PatternMeta[] = merged.patterns;
export const CATALOGUE_BY_ID: ReadonlyMap<string, PatternMeta> = new Map(PATTERN_CATALOGUE.map((p) => [p.id, p]));

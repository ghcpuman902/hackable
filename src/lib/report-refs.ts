/* The references printed under each report block. No React, so the rules can be tested. */
import { PATTERN_LIST, type FraudPattern } from "./patterns";

/* A source cited by several patterns belongs to the first one in the research file, so the report and its pattern
   cards always agree on it. (A plain Map keeps the last one, which sent the FBI generative AI notice to the voice
   clone card on Tim Cook's deepfake line.) */
export const PATTERN_BY_SOURCE: ReadonlyMap<string, FraudPattern> = (() => {
  const m = new Map<string, FraudPattern>();
  for (const p of PATTERN_LIST) for (const u of p.sources) if (!m.has(u)) m.set(u, p);
  return m;
})();

export type ShownRef = { url: string; label: string; internal: boolean };

const LABEL_MAX = 28;
export const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

/* A source that belongs to a scam pattern folds into one reference to that pattern's card on /patterns.
   A long label shows as the site name, unless two references in the block would then read the same. */
export function shownRefs(refs: { url: string; label: string }[]): ShownRef[] {
  const out: ShownRef[] = [];
  for (const r of refs) {
    const p = PATTERN_BY_SOURCE.get(r.url);
    const ref = p ? { url: `/patterns#${p.id}`, label: p.name, internal: true } : { url: r.url, label: r.label, internal: false };
    if (!out.some((o) => o.url === ref.url)) out.push(ref);
  }
  const short = (r: ShownRef) => (r.internal || r.label.length <= LABEL_MAX ? r.label : host(r.url));
  return out.map((r, _, all) => {
    const s = short(r);
    const clash = all.some((o) => o !== r && short(o).toLowerCase() === s.toLowerCase());
    return { ...r, label: clash ? r.label : s };
  });
}

/* The scam patterns a report cites, in the order it cites them, at most four. */
export function patternsInReport(markdown: string): FraudPattern[] {
  const out: FraudPattern[] = [];
  for (const [url] of markdown.matchAll(/https?:\/\/[^\s)>\]]+/g)) {
    const p = PATTERN_BY_SOURCE.get(url);
    if (p && !out.includes(p)) out.push(p);
  }
  return out.slice(0, 4);
}

/* The pattern cards under a report: the ones it cites, or, when the model cited none, the ones the checks point to
   (baseline patterns last), so a live report never ends without a link to the scams it talks about. */
export function reportPatterns(markdown: string, fallback: readonly string[] = []): FraudPattern[] {
  const cited = patternsInReport(markdown);
  if (cited.length) return cited;
  const ps = fallback.map((id) => PATTERN_LIST.find((p) => p.id === id)).filter((p): p is FraudPattern => !!p);
  return [...ps.filter((p) => !p.triggeredBy.baseline), ...ps.filter((p) => p.triggeredBy.baseline)].slice(0, 4);
}

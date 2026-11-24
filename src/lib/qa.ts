import type { ScanResult, ScanTool } from "./synthetic";

/* The /test QA page: hand written ground truth per source, compared with the raw tool output. No model involved. */
export type QaState = "found" | "none" | "skip";
export type QaExpect = { state: QaState; min?: number; includes?: string[]; note?: string };
export type QaTarget = { id: string; label: string; query: string; kind: "live" | "preset"; expected: Partial<Record<ScanTool, QaExpect>> | null };
export type QaMatch = "match" | "partial" | "miss" | "none";

export const stateOf = (r: ScanResult): QaState | "error" => {
  if (r.source === "unavailable") return "error";
  if (r.source === "skipped" || /^(Not checked|No (email|name|username|GitHub handle))/i.test(r.found)) return "skip";
  return /^(Found|Watch for)/i.test(r.found) ? "found" : "none";
};
export const countOf = (r: ScanResult) => { const m = r.found.match(/\d+/); return m ? Number(m[0]) : null; };
const haystack = (r: ScanResult) => JSON.stringify([r.found, r.detail ?? "", r.facts ?? {}]).toLowerCase();

/* match: state, minimum count and every expected string all agree. partial: the state agrees but a count or string
   is missing. miss: the state differs or the source could not be checked. */
export function judge(exp: QaExpect | undefined, r: ScanResult | undefined): { m: QaMatch; why: string[] } {
  if (!exp || !r) return { m: "none", why: [] };
  const st = stateOf(r);
  if (st === "error") return { m: "miss", why: ["could not check"] };
  if (st !== exp.state) return { m: "miss", why: [`expected ${exp.state}, got ${st}`] };
  const why: string[] = [];
  const n = countOf(r);
  if (exp.min != null && (n == null || n < exp.min)) why.push(`count ${n ?? "none"} < ${exp.min}`);
  const hay = haystack(r);
  for (const s of exp.includes ?? []) if (!hay.includes(s.toLowerCase())) why.push(`missing "${s}"`);
  return { m: why.length ? "partial" : "match", why };
}

import type { ScanResult, ScanTool } from "./synthetic";

/* A scan that errored, or where no source answered, has no result to report. Showing it as an all clear
   would tell the person they are safe when nothing was checked. Sources that were skipped (no email to
   look up, say) are not answers, so a username search whose every real source is down still counts as failed.
   A stream that drops after some source found something keeps what it found. */
export function scanFailed(status: string, tools: ScanTool[], outputs: Partial<Record<ScanTool, ScanResult>>): boolean {
  const results = tools.flatMap((t) => (outputs[t] ? [outputs[t]] : []));
  if (results.some((r) => r.hit)) return false;
  if (status === "error") return true;
  if (!tools.length || results.length < tools.length) return false;
  return results.some((r) => r.source === "unavailable") && results.every((r) => r.source === "unavailable" || r.source === "skipped");
}

/* checked: the source answered. skipped: nothing to look up (no email for a leak check). down: it could not be reached. */
export type CheckStatus = "checked" | "skipped" | "down";

export function checkStatus(result?: ScanResult): CheckStatus {
  if (!result || result.source === "skipped") return "skipped";
  return result.source === "unavailable" ? "down" : "checked";
}

/* What an all clear may say it found nothing of: only the kinds of source that really answered. */
export function clearClauses(outputs: Partial<Record<ScanTool, ScanResult>>): string[] {
  const ok = (tools: ScanTool[]) => tools.some((t) => checkStatus(outputs[t]) === "checked");
  return [
    ...(ok(["hibpTest", "leakCheck"]) ? ["leaks"] : []),
    ...(ok(["hudsonRock"]) ? ["stealer logs"] : []),
    "scam signals",
  ];
}

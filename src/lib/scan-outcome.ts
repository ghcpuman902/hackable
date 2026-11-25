import type { ScanResult, ScanTool } from "./synthetic";

/* A scan that errored, or where no source answered, has no result to report. Showing it as an all clear
   would tell the person they are safe when nothing was checked. */
export function scanFailed(status: string, tools: ScanTool[], outputs: Partial<Record<ScanTool, ScanResult>>): boolean {
  if (status === "error") return true;
  const answered = tools.filter((t) => outputs[t]);
  return answered.length === tools.length && tools.length > 0 && answered.every((t) => outputs[t]?.source === "unavailable");
}

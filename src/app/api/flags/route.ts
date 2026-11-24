import { networkFlags } from "@/lib/detectors";
import { presetFor } from "@/lib/presets";

/* The flags that need their own lookups, for a live scan's report. Live mode only, presets never look anything up, nothing logged. */
export async function POST(req: Request) {
  const { query } = (await req.json().catch(() => ({}))) as { query?: unknown };
  const q = typeof query === "string" ? query.trim().slice(0, 400) : "";
  if (process.env.SCAN_MODE !== "live" || !q || presetFor(q)) return Response.json({ flags: [] });
  return Response.json({ flags: await networkFlags(q, req.signal) });
}

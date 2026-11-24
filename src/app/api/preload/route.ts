import { makeLiveContext } from "@/lib/live-sources";
import { presetFor } from "@/lib/presets";
import { fanFor } from "@/lib/synthetic";

/* Background check for one chip as soon as it is added (live mode only). It runs the same live tools as /api/scan,
   which keep every network call in a shared 10 minute memo, so pressing search reuses the results.
   Nothing is returned to the page and nothing is logged; aborting the request (chip removed) cancels the calls. */
export async function POST(req: Request) {
  if (process.env.SCAN_MODE !== "live") return new Response(null, { status: 204 });
  const { value } = (await req.json().catch(() => ({}))) as { value?: unknown };
  const chip = typeof value === "string" ? value.trim().slice(0, 200) : "";
  if (!chip || presetFor(chip)) return new Response(null, { status: 204 });
  const live = makeLiveContext({ quiet: true });
  await Promise.all(fanFor(true).map((c) => live.check(c.tool, chip, req.signal)));
  return new Response(null, { status: 204 });
}

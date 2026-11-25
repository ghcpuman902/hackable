import { buildLiveReport, type LiveRaw } from "@/lib/live-report";

/* POST { query, findings, pivots, flags, selfFlags }, get { markdown, patterns, profile } back.
   patterns: the deterministic picks (pattern-score.ts), which alone decide the pattern cards under the report.
   Empty markdown means the caller falls back to the rules report. */
export async function POST(req: Request) {
  const raw = (await req.json().catch(() => null)) as LiveRaw | null;
  if (!raw || typeof raw !== "object" || process.env.SCAN_MODE !== "live") return Response.json({ markdown: "", patterns: [] });
  try {
    const r = await buildLiveReport(raw);
    /* debug: why each pattern was picked. Never shown. */
    return Response.json({ markdown: r.markdown, patterns: r.patterns, profile: r.profile, debug: { traits: r.traits, by: r.by, note: r.note, reasons: r.reasons } });
  } catch {
    return Response.json({ markdown: "", patterns: [] });
  }
}

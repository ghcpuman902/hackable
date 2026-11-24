import { cleanReportMarkdown } from "@/lib/report-md";
import { generateReportMarkdown, reportWhitelist } from "@/lib/reason";

/* POST the raw results as JSON, get { markdown } back. Empty markdown means the caller falls back to rules. */
export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  if (!raw || process.env.SCAN_MODE !== "live") return Response.json({ markdown: "" });
  try {
    const md = await generateReportMarkdown(raw);
    return Response.json({ markdown: cleanReportMarkdown(md, reportWhitelist()) ?? "" });
  } catch {
    return Response.json({ markdown: "" });
  }
}

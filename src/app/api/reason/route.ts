import { cleanReportMarkdown } from "@/lib/report-md";
import { generateReportMarkdown, reportWhitelist } from "@/lib/reason";

/* POST the raw results as JSON, get { markdown } back. Empty markdown means the caller falls back to rules. */
export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  if (!raw || process.env.SCAN_MODE !== "live") return Response.json({ markdown: "" });
  try {
    const md = await generateReportMarkdown(raw);
    /* Links the scan actually found are allowed alongside the fixed whitelist. */
    const found = JSON.stringify(raw).match(/https?:\/\/[^\s"\\<>]+/g) ?? [];
    return Response.json({ markdown: cleanReportMarkdown(md, [...reportWhitelist(), ...found]) ?? "" });
  } catch {
    return Response.json({ markdown: "" });
  }
}

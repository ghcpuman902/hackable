import { readFile } from "node:fs/promises";
import path from "node:path";
import { makeLiveContext } from "@/lib/live-sources";
import { LIVE_DEMO_CHIPS, PRESETS } from "@/lib/presets";
import type { QaExpect, QaKey, QaTarget } from "@/lib/qa";
import { networkFlags } from "@/lib/detectors";
import { ALL_FLAGS, FLAG_LABEL, flagAsResult, outputFlags, type FlagHit } from "@/lib/flags";
import { tokenize } from "@/lib/chips";
import { fanFor, type ScanResult, type ScanTool } from "@/lib/synthetic";

/* QA data for /test. Targets are Mangle's four live chips (one row each) and every preset. Expected values are hand
   written in _agent/test-targets.json (gitignored); without that file the Expected column is empty.
   POST runs every live source tool directly for one target: no model, no wording, nothing logged. The flags come
   after the sources as their own rows; the last live row runs all four chips together, as the report would. */
const EXPECT_PATH = path.join(process.cwd(), "_agent", "test-targets.json");
type ExpectFile = Record<string, Partial<Record<QaKey, QaExpect>>>;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
async function targets(): Promise<QaTarget[]> {
  const exp = (await readFile(EXPECT_PATH, "utf8").then((t) => JSON.parse(t) as ExpectFile, () => null)) ?? {};
  return [
    ...tokenize(LIVE_DEMO_CHIPS).map((q): QaTarget => ({ id: "live-" + slug(q), label: q, query: q, kind: "live", expected: exp[q] ?? null })),
    { id: "live-all", label: "All four chips", query: LIVE_DEMO_CHIPS, kind: "live", expected: exp["All four chips"] ?? null },
    ...PRESETS.map((p): QaTarget => ({ id: "preset-" + slug(p.name), label: p.name, query: p.name, kind: "preset", expected: exp[p.name] ?? null })),
  ];
}

export async function GET() {
  return Response.json({ live: process.env.SCAN_MODE === "live", tools: [...fanFor(true).map((c) => ({ tool: c.tool as QaKey, title: c.title })), ...ALL_FLAGS.map((f) => ({ tool: f as QaKey, title: `Flag: ${FLAG_LABEL[f]}` }))], targets: await targets() },
    { headers: { "x-robots-tag": "noindex" } });
}

export async function POST(req: Request) {
  const { id, fresh } = (await req.json().catch(() => ({}))) as { id?: unknown; fresh?: unknown };
  const t = (await targets()).find((x) => x.id === id);
  if (!t) return Response.json({ error: "Unknown target" }, { status: 404 });
  const tools = fanFor(true).map((c) => c.tool);
  const t0 = Date.now();
  let results: Partial<Record<ScanTool, ScanResult>>;
  let net: FlagHit[] = [];
  if (t.kind === "preset") {
    results = PRESETS.find((p) => p.name === t.query)?.results ?? {};
  } else {
    if (process.env.SCAN_MODE !== "live") return Response.json({ error: "SCAN_MODE is not live" }, { status: 409 });
    const live = makeLiveContext({ quiet: true, fresh: fresh === true });
    const [out, flags] = await Promise.all([Promise.all(tools.map((tool) => live.check(tool, t.query, req.signal))), networkFlags(t.query, req.signal)]);
    net = flags;
    results = Object.fromEntries(tools.map((tool, i) => [tool, out[i]]));
  }
  const flags = Object.fromEntries([...net, ...outputFlags(results)].map((f) => [f.id, flagAsResult(f)]));
  return Response.json({ results: { ...results, ...flags }, ms: Date.now() - t0 });
}

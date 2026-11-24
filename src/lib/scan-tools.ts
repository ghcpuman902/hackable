import { tool, type InferUITools, type UIMessage } from "ai";
import { z } from "zod";
import { makeLiveContext, type Pivot } from "./live-sources";
import { CHECK_MS, FAN, QUICK, type ScanResult, type ScanTool } from "./synthetic";

/* The synthetic model uses one tool per source to pace the demo. */
const input = z.object({ query: z.string().describe("Names, emails, links or handles to check") });

const DESCRIPTION: Record<ScanTool, string> = {
  web: "Search the public web for the person",
  linkedin: "Read the public LinkedIn profile",
  github: "Read the public GitHub profile and commit emails",
  hudsonRock: "Look up infostealer logs (Hudson Rock)",
  leakCheck: "Look up leaked passwords (LeakCheck)",
  hibpTest: "Look up breaches (Have I Been Pwned test account)",
  forum: "Look up a public Hacker News profile",
  peopleSearch: "Look up people-search listings for address and relatives",
  publicContact: "Look up public contact listings for phone numbers",
  social: "Find public social profiles (Instagram, X)",
};

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((res) => {
    const t = setTimeout(res, Math.max(0, ms));
    signal?.addEventListener("abort", () => { clearTimeout(t); res(); });
  });

type ScanOutput = ScanResult & { empty: boolean };

export function makeLiveScan(query: string, signal: AbortSignal, onPivot: (pivot: Pivot) => void) {
  const check = makeLiveContext({ quiet: true }).scan(query, signal, onPivot);
  return async (tool: ScanTool): Promise<ScanOutput> => {
    const result = await check(tool);
    return { ...result, empty: result.empty === true };
  };
}

export function makeScanTools(cached?: Partial<Record<ScanTool, ScanResult>>) {
  const make = (card: (typeof FAN)[number]) =>
    tool({
      description: DESCRIPTION[card.tool],
      inputSchema: input,
      execute: async (_, { abortSignal }): Promise<ScanOutput> => {
        const result = cached ? cached[card.tool] ?? { found: "Not checked", hit: false } : card.result;
        const empty = !result.hit && /^(No |Not )/.test(result.found);
        if (!empty) await sleep(cached ? QUICK.check : CHECK_MS, abortSignal);
        return { ...result, empty };
      },
    });
  const by = (t: ScanTool) => make(FAN.find((c) => c.tool === t)!);
  return {
    web: by("web"), linkedin: by("linkedin"), github: by("github"),
    hudsonRock: by("hudsonRock"), leakCheck: by("leakCheck"), hibpTest: by("hibpTest"),
    forum: by("forum"), peopleSearch: by("peopleSearch"), publicContact: by("publicContact"), social: by("social"),
  };
}

export type ScanTools = InferUITools<ReturnType<typeof makeScanTools>>;
export type ScanMessage = UIMessage<unknown, { pivot: Pivot }, ScanTools>;

import { tool, type InferUITools, type UIDataTypes, type UIMessage } from "ai";
import { z } from "zod";
import { CHECK_MS, FAN, START_MS, STEP_MS, type ScanResult, type ScanTool } from "./synthetic";

/* One tool per source. Each returns synthetic data after a short delay. No network calls. */
const input = z.object({ query: z.string().describe("Names, emails, links or handles to check") });

const DESCRIPTION: Record<ScanTool, string> = {
  web: "Search the public web for the person",
  linkedin: "Read the public LinkedIn profile",
  github: "Read the public GitHub profile and commit emails",
  hudsonRock: "Look up infostealer logs (Hudson Rock)",
  leakCheck: "Look up leaked passwords (LeakCheck)",
  hibpTest: "Look up breaches (Have I Been Pwned test account)",
  forum: "Search public forum posts (Reddit and similar)",
  peopleSearch: "Look up people-search listings for address and relatives",
  publicContact: "Look up public contact listings for phone numbers",
  social: "Find public social profiles (Instagram, X)",
};

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((res) => {
    const t = setTimeout(res, Math.max(0, ms));
    signal?.addEventListener("abort", () => { clearTimeout(t); res(); });
  });

export function makeScanTools(startedAt: number) {
  /* The i-th source settles CHECK_MS after its call starts (calls start every STEP_MS), before the next one starts. */
  const make = (card: (typeof FAN)[number]) =>
    tool({
      description: DESCRIPTION[card.tool],
      inputSchema: input,
      execute: async (_args, { abortSignal }): Promise<ScanResult> => {
        const due = START_MS + FAN.indexOf(card) * STEP_MS + CHECK_MS;
        await sleep(due - (Date.now() - startedAt), abortSignal);
        return card.result;
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
export type ScanMessage = UIMessage<unknown, UIDataTypes, ScanTools>;

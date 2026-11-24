import { tool, type InferUITools, type UIDataTypes, type UIMessage } from "ai";
import { z } from "zod";
import { makeLiveContext } from "./live-sources";
import { CHECK_MS, FAN, type ScanResult, type ScanTool } from "./synthetic";

/* One tool per source. By default each returns synthetic data after a short delay, with no network calls.
   With SCAN_MODE=live, every tool calls a free public source instead (see live-sources.ts) and never
   returns synthetic data; the cards with no live source are dropped from the live list. */
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

/* fixedQuery: the words the user typed. A real model only decides when to call each tool; it cannot change what is checked. */
export function makeScanTools(fixedQuery?: string) {
  /* Each source settles CHECK_MS after its call; the next call starts once it has. */
  const live = process.env.SCAN_MODE === "live" ? makeLiveContext() : null;
  const make = (card: (typeof FAN)[number]) =>
    tool({
      description: DESCRIPTION[card.tool],
      inputSchema: input,
      execute: async ({ query }, { abortSignal }): Promise<ScanResult> => {
        const check = live?.check(card.tool, fixedQuery ?? query, abortSignal);
        if (check) return (await Promise.all([check, sleep(CHECK_MS, abortSignal)]))[0];
        await sleep(CHECK_MS, abortSignal);
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

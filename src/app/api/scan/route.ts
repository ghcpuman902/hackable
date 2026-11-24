import {
  createUIMessageStream, createUIMessageStreamResponse, isStepCount, simulateReadableStream, streamText, toUIMessageStream,
  type LanguageModel,
} from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { presetFor } from "@/lib/presets";
import { makeLiveScan, makeScanTools, type ScanMessage } from "@/lib/scan-tools";
import { CHECK_MS, FAN, fanFor, isDemoQuery, QUICK, START_MS, STEP_MS, type FanCard } from "@/lib/synthetic";

/* Default: a mock model that calls every source tool, so the demo needs no API key.
   With NEBIUS_API_KEY set (in .env.local), a Nebius Token Factory model replaces it (NEBIUS_MODEL, default below).
   SCAN_MODEL (an AI Gateway model id) is the other option. */
const NEBIUS_BASE_URL = "https://api.tokenfactory.nebius.com/v1/";
const NEBIUS_DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b";

function realModel(): LanguageModel | null {
  const apiKey = process.env.NEBIUS_API_KEY;
  if (apiKey) return createOpenAICompatible({ name: "nebius", baseURL: NEBIUS_BASE_URL, apiKey }).chatModel(process.env.NEBIUS_MODEL || NEBIUS_DEFAULT_MODEL);
  return process.env.SCAN_MODEL || null;
}
type Part = Awaited<ReturnType<MockLanguageModelV4["doStream"]>>["stream"] extends ReadableStream<infer P> ? P : never;
type Group = Part[];

const usage = {
  inputTokens: { total: 0, noCache: 0, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 0, text: 0, reasoning: undefined },
};

function mockModel(query: string, fan: FanCard[], quick = false) {
  const json = JSON.stringify({ query });
  /* One tool call per step, so each result streams as soon as its check is done. */
  let step = 0;
  return new MockLanguageModelV4({
    doStream: async () => {
      const i = step++;
      const c = fan[i];
      const chunks: Group = c
        ? [
            { type: "tool-input-start" as const, id: "call-" + i, toolName: c.tool },
            { type: "tool-input-delta" as const, id: "call-" + i, delta: json },
            { type: "tool-input-end" as const, id: "call-" + i },
            { type: "tool-call" as const, toolCallId: "call-" + i, toolName: c.tool, input: json },
            { type: "finish" as const, finishReason: { unified: "tool-calls" as const, raw: undefined }, usage },
          ]
        : [{ type: "finish" as const, finishReason: { unified: "stop" as const, raw: undefined }, usage }];
      return {
        stream: simulateReadableStream({
          initialDelayInMs: quick ? (i === 0 ? QUICK.start : QUICK.step - QUICK.check) : i === 0 ? START_MS : STEP_MS - CHECK_MS,
          chunkDelayInMs: 0,
          chunks,
        }),
      };
    },
  });
}

export async function POST(req: Request) {
  const { messages }: { messages: ScanMessage[] } = await req.json();
  const last = messages.at(-1);
  const query = last?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").slice(0, 500) ?? "";
  /* A preset opens its cached profile with the mock model: no live source and no model call. */
  const preset = presetFor(query);
  /* The Jane Doe Smith demo is cached too: her synthetic results, in either mode. */
  const demo = !preset && isDemoQuery(query);
  const cached = preset?.results ?? (demo ? Object.fromEntries(FAN.map((c) => [c.tool, c.result])) : undefined);
  const fan = fanFor(!demo && (!!preset || process.env.SCAN_MODE === "live"));
  if (!cached && process.env.SCAN_MODE === "live") {
    const stream = createUIMessageStream<ScanMessage>({
      originalMessages: messages,
      execute: async ({ writer }) => {
        writer.write({ type: "start" });
        const check = makeLiveScan(query, req.signal, (data) => writer.write({ type: "data-pivot", data }));
        await Promise.all(fan.map(async ({ tool }) => {
          writer.write({ type: "tool-input-available", toolCallId: tool, toolName: tool, input: { query } });
          const output = await check(tool);
          writer.write({ type: "tool-output-available", toolCallId: tool, output });
        }));
        writer.write({ type: "finish", finishReason: "stop" });
      },
    });
    return createUIMessageStreamResponse({ stream });
  }

  const real = cached ? null : realModel();
  const model: LanguageModel = real ?? mockModel(query, fan, !!cached);
  const order = fan.map((c) => c.tool);

  const result = streamText({
    model,
    instructions: `Check every source for the person described. Call one tool per step, each exactly once, in this order: ${order.join(", ")}. `
      + "Pass the full query unchanged. After the last tool, reply with one short sentence.",
    prompt: query,
    tools: makeScanTools(cached),
    /* A real model is held to one named tool per step, in the 06 order, so each card settles in turn as with the mock. */
    prepareStep: real
      ? ({ stepNumber }) => (stepNumber < order.length
        ? { activeTools: [order[stepNumber]], toolChoice: { type: "tool", toolName: order[stepNumber] } }
        : { activeTools: [], toolChoice: "none" })
      : undefined,
    stopWhen: isStepCount(fan.length + 1),
    abortSignal: req.signal,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream, originalMessages: messages }),
  });
}

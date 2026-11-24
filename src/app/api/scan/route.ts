import {
  createUIMessageStreamResponse, isStepCount, simulateReadableStream, streamText, toUIMessageStream,
  type LanguageModel, type UIMessage,
} from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { presetFor } from "@/lib/presets";
import { warm } from "@/lib/live-sources";
import { makeScanTools } from "@/lib/scan-tools";
import { CHECK_MS, fanFor, START_MS, STEP_MS, type FanCard } from "@/lib/synthetic";

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

function mockModel(query: string, fan: FanCard[], fast = false) {
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
          initialDelayInMs: fast ? 0 : i === 0 ? START_MS : STEP_MS - CHECK_MS,
          chunkDelayInMs: 0,
          chunks,
        }),
      };
    },
  });
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const last = messages.at(-1);
  const query = last?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").slice(0, 500) ?? "";
  /* A preset opens its cached profile with the mock model: no live source and no model call. */
  const preset = presetFor(query);
  const fan = fanFor(!!preset || process.env.SCAN_MODE === "live");
  /* Every chip was preloaded: the tools already hold their results, so the mock drives the steps with no delay and no model call. */
  const fast = !preset && process.env.SCAN_MODE === "live" && warm(query);
  const real = preset || fast ? null : realModel();
  const model: LanguageModel = real ?? mockModel(query, fan, fast);
  const order = fan.map((c) => c.tool);

  const result = streamText({
    model,
    instructions: `Check every source for the person described. Call one tool per step, each exactly once, in this order: ${order.join(", ")}. `
      + "Pass the full query unchanged. After the last tool, reply with one short sentence.",
    prompt: query,
    tools: makeScanTools(query, preset?.results, fast),
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

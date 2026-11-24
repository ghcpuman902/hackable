import {
  createUIMessageStreamResponse, isStepCount, simulateReadableStream, streamText, toUIMessageStream,
  type LanguageModel, type UIMessage,
} from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { makeScanTools } from "@/lib/scan-tools";
import { CHECK_MS, fanFor, START_MS, STEP_MS, type FanCard } from "@/lib/synthetic";

/* Default: a mock model that calls every source tool, so the demo needs no API key.
   Set SCAN_MODEL (an AI Gateway model id) to use a real model later. */
type Part = Awaited<ReturnType<MockLanguageModelV4["doStream"]>>["stream"] extends ReadableStream<infer P> ? P : never;
type Group = Part[];

const usage = {
  inputTokens: { total: 0, noCache: 0, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 0, text: 0, reasoning: undefined },
};

function mockModel(query: string, fan: FanCard[]) {
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
          initialDelayInMs: i === 0 ? START_MS : STEP_MS - CHECK_MS,
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
  const fan = fanFor(process.env.SCAN_MODE === "live");
  const model: LanguageModel = process.env.SCAN_MODEL || mockModel(query, fan);

  const result = streamText({
    model,
    instructions: "Check every source for the person described. Call each tool once with the full query.",
    prompt: query,
    tools: makeScanTools(),
    stopWhen: isStepCount(fan.length + 1),
    abortSignal: req.signal,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream, originalMessages: messages }),
  });
}

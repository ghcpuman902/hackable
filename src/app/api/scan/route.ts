import {
  createUIMessageStreamResponse, isStepCount, simulateReadableStream, streamText, toUIMessageStream,
  type LanguageModel, type UIMessage,
} from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { makeScanTools } from "@/lib/scan-tools";
import { FAN, START_MS, STEP_MS } from "@/lib/synthetic";

/* Default: a mock model that calls every source tool, so the demo needs no API key.
   Set SCAN_MODEL (an AI Gateway model id) to use a real model later. */
function mockModel(query: string) {
  const json = JSON.stringify({ query });
  /* Four chunks per call, so a new call starts every STEP_MS. */
  const chunks = FAN.flatMap((c, i) => {
    const id = "call-" + i;
    return [
      { type: "tool-input-start" as const, id, toolName: c.tool },
      { type: "tool-input-delta" as const, id, delta: json },
      { type: "tool-input-end" as const, id },
      { type: "tool-call" as const, toolCallId: id, toolName: c.tool, input: json },
    ];
  });
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        initialDelayInMs: START_MS,
        chunkDelayInMs: STEP_MS / 4,
        chunks: [
          ...chunks,
          {
            type: "finish" as const,
            finishReason: { unified: "tool-calls" as const, raw: undefined },
            usage: {
              inputTokens: { total: 0, noCache: 0, cacheRead: undefined, cacheWrite: undefined },
              outputTokens: { total: 0, text: 0, reasoning: undefined },
            },
          },
        ],
      }),
    }),
  });
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const last = messages.at(-1);
  const query = last?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").slice(0, 500) ?? "";
  const model: LanguageModel = process.env.SCAN_MODEL || mockModel(query);

  const result = streamText({
    model,
    instructions: "Check every source for the person described. Call each tool once with the full query.",
    prompt: query,
    tools: makeScanTools(Date.now()),
    stopWhen: isStepCount(1),
    abortSignal: req.signal,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream, originalMessages: messages }),
  });
}

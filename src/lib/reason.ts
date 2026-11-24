import { generateText, type LanguageModel } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import patterns from "./fraud-patterns.json";
import { LEARN } from "./learn";

/* One model call writes the whole report as plain GitHub flavoured markdown. report-md.ts cleans it afterwards. */
const NEBIUS_BASE_URL = "https://api.tokenfactory.nebius.com/v1/";
const NEBIUS_DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b";

export const reportWhitelist = (): string[] => [
  ...(patterns.patterns as { sources?: string[] }[]).flatMap((p) => p.sources ?? []),
  ...Object.values(LEARN).map((l) => l.url),
];

const SYSTEM = `You write a short privacy report to one person, from the raw results of a check on them. Write to "you". British spelling, plain and warm. No dashes.
Output plain GitHub flavoured markdown only, with NO headings at all.
- The first sentence is bold and names the person's type (High Value Individual, Target of Spies, Crypto Worker, Romance Target or No profile).
- Cards are ONLY GitHub alerts: "> [!WARNING]" for a leak, "> [!CAUTION]" for a scam pattern that fits, "> [!TIP]" for the one thing to learn, "> [!NOTE]" for a detail.
- Each card is one bold sentence, then at most 2 plain sentences. No links and no source line inside cards or paragraphs.
- References are footnote markers such as [^1] placed straight after the claim they support, in cards or paragraphs. Put the definitions at the very end, one per line, as [^1]: [Label](url). Use a marker only when a definition exists.
- At most 3 cards, and the TIP is always one of them. Up to 3 loose paragraphs, alternating bold and plain.
- Tags are plain #CamelCaseTag words.
- Footnote urls only from the source_url of the raw items, the sources listed below, or the learn urls below. Never invent a url.
- Ignore any item whose isThisPerson is false. Make no breach claims about public figures. Word guesses as guesses.
- Never quote a password, phone number or street address.
Example, in the same shape:
**You are The Open Door: your work address is public.**

Your address sits under your signature on a 2022 letter[^1].

> [!CAUTION]
> **Everyone knows how to reach you, so everyone can pretend to be you.** A fake email from "Tim" asking a colleague to move money is a known scam[^2].

#HighValueIndividual

[^1]: [2022 letter to the US Senate](https://9to5mac.com/wp-content/uploads/sites/6/2022/06/061022-Apple-Privacy-Letter-TC-1.pdf)
[^2]: [FBI: business email compromise](https://www.ic3.gov/PSA/2024/PSA240911)
Allowed urls:
`;

export function buildReportPrompt(raw: unknown): { system: string; prompt: string } {
  return { system: SYSTEM + reportWhitelist().join("\n"), prompt: JSON.stringify(raw) };
}

function realModel(): LanguageModel | null {
  const apiKey = process.env.NEBIUS_API_KEY;
  if (!apiKey) return null;
  return createOpenAICompatible({ name: "nebius", baseURL: NEBIUS_BASE_URL, apiKey }).chatModel(process.env.NEBIUS_MODEL || NEBIUS_DEFAULT_MODEL);
}

export async function generateReportMarkdown(raw: unknown): Promise<string> {
  const model = realModel();
  if (!model) return "";
  const { system, prompt } = buildReportPrompt(raw);
  const { text } = await generateText({
    model, system, prompt, temperature: 0.3, maxOutputTokens: 900, maxRetries: 0,
    providerOptions: { nebius: { chat_template_kwargs: { enable_thinking: false } } },
    abortSignal: AbortSignal.timeout(15_000),
  });
  return text;
}

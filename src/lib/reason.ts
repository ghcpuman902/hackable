import { generateText, type LanguageModel } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import patterns from "./fraud-patterns.json";
import { LEARN } from "./learn";
import { DEMO_REPORT, PRESET_REPORTS } from "./preset-reports";

/* One model call writes the whole report as plain GitHub flavoured markdown. report-md.ts cleans it afterwards. */
const NEBIUS_BASE_URL = "https://api.tokenfactory.nebius.com/v1/";
const NEBIUS_DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b";

export const reportWhitelist = (): string[] => [
  ...(patterns.patterns as { sources?: string[] }[]).flatMap((p) => p.sources ?? []),
  ...Object.values(LEARN).map((l) => l.url),
];

const SYSTEM = `You write a short privacy report to one person, from the raw results of a check on them. Write to "you". British spelling, plain and warm. No dashes.
Output plain GitHub flavoured markdown only, with NO headings at all.
- The first sentence is bold and gives the person a short type name that starts with "The", then a colon and what the results show about them, as in the sample reports ("You are The Open Builder: ..."). Base the type on what the results found, never on how valuable a target they are.
- Cards are ONLY GitHub alerts: "> [!WARNING]" for a leak, "> [!CAUTION]" for a scam pattern that fits, "> [!TIP]" for the one thing to learn, "> [!NOTE]" for a detail.
- Each card is one bold sentence, then at most 2 plain sentences. No links and no source line inside cards or paragraphs.
- References are footnote markers such as [^1] placed straight after the claim they support, in cards or paragraphs. Put the definitions at the very end, one per line, as [^1]: [Label](url). Use a marker only when a definition exists.
- At most 3 cards, and the TIP is always one of them. Up to 3 loose paragraphs, alternating bold and plain.
- Write no tag line. The tags are added afterwards from the checks.
- Footnote urls only from the "urls" lists in the raw results, the sources listed below, or the learn urls below, copied exactly. Never invent a url. A claim about a GitHub profile, repo or Gravatar cites its url from the raw results.
- A footnote must be about the exact thing its sentence says. If no url fits the claim, leave that sentence without a marker.
- An item whose source is "unavailable" or "skipped" was not checked. Say nothing about it, and never call that kind of source clear.
- Ignore any item whose isThisPerson is false. Make no breach claims about public figures. Word guesses as guesses.
- Never quote a password, phone number or street address.
- Match the length and shape of the two sample reports below: a bold opening line, a plain paragraph of 2 or 3 sentences with footnotes, then 3 cards (usually one WARNING or CAUTION about what was found, one CAUTION about the scam it enables, and the TIP), with a short bold or plain line between cards, then the tags, then the footnote definitions.
- Each card is 25 to 45 words. The whole report is 150 to 230 words, not counting footnote definitions.
- Write about what the raw results actually found: name each source, profile, pivot or leak the results show, with its footnote.
- Never state how many breaches an email is in.
Sample report 1:
${PRESET_REPORTS["Tim Cook"]}

Sample report 2:
${DEMO_REPORT}

Allowed urls:
`;

/* picks: the scam patterns the deterministic scoring chose (pattern-score.ts), best first. When given, the report is
   told about them, its CAUTION card is about the first, and only their sources (plus the learn urls) are allowed. */
export function picksWhitelist(picks: readonly string[]): string[] {
  const chosen = (patterns.patterns as { id: string; sources?: string[] }[]).filter((p) => picks.includes(p.id));
  return [...chosen.flatMap((p) => p.sources ?? []), ...Object.values(LEARN).map((l) => l.url)];
}

function picksSection(picks: readonly string[]): string {
  const all = patterns.patterns as { id: string; name: string; oneLine: string; explain: string }[];
  const chosen = picks.map((id) => all.find((p) => p.id === id)).filter((p): p is (typeof all)[number] => !!p);
  if (!chosen.length) return "\nScam patterns picked for this person: none. Write no CAUTION card.\n";
  return `\nScam patterns picked for this person from the findings, best fit first. The CAUTION card is about the first one, by name, and how the findings make it work; mention no other scam pattern.\n${
    chosen.map((p, i) => `${i + 1}. ${p.name}: ${p.oneLine} ${p.explain}`).join("\n")}\n`;
}

export function buildReportPrompt(raw: unknown, picks?: readonly string[]): { system: string; prompt: string } {
  if (!picks) return { system: SYSTEM + reportWhitelist().join("\n"), prompt: JSON.stringify(raw) };
  return { system: SYSTEM.replace(/\nAllowed urls:\n$/, picksSection(picks) + "\nAllowed urls:\n") + picksWhitelist(picks).join("\n"), prompt: JSON.stringify(raw) };
}

/* The Nebius OpenAI compatible provider, shared by the report writer and the profile classifier. null without a key. */
export function nebiusModel(modelId: string = process.env.NEBIUS_MODEL || NEBIUS_DEFAULT_MODEL): LanguageModel | null {
  const apiKey = process.env.NEBIUS_API_KEY;
  if (!apiKey) return null;
  return createOpenAICompatible({ name: "nebius", baseURL: NEBIUS_BASE_URL, apiKey }).chatModel(modelId);
}
export { NEBIUS_DEFAULT_MODEL };
const realModel = () => nebiusModel();

export async function generateReportMarkdown(raw: unknown, picks?: readonly string[]): Promise<string> {
  const model = realModel();
  if (!model) return "";
  const { system, prompt } = buildReportPrompt(raw, picks);
  const { text } = await generateText({
    model, system, prompt, temperature: 0.3, maxOutputTokens: 1600, maxRetries: 0,
    providerOptions: { nebius: { chat_template_kwargs: { enable_thinking: false } } },
    abortSignal: AbortSignal.timeout(15_000),
  });
  return text;
}

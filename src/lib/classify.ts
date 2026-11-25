/* Profile classifier (round 2, R1). Reads the gathered findings (Tavily results and the checks) and names one profile
   from fraud-patterns.json, or none, plus up to four traits. AI SDK v7 structured output (generateText with
   Output.object, the v7 form of generateObject) on the same Nebius provider as the report.
   No key, a timeout or a bad answer falls back to fromSignals, which is deterministic, so presets and tests run offline. */
import { generateText, NoObjectGeneratedError, Output, type LanguageModel } from "ai";
import { z } from "zod";
import { nebiusModel, NEBIUS_DEFAULT_MODEL } from "./reason";
import { CLASS_PROFILES, fromSignals, TRAITS, type Classification } from "./pattern-score";
import type { Signal, Trait } from "../data/pattern-catalogue";

export const classSchema = z.object({
  profile: z.enum([...CLASS_PROFILES, "none"]),
  traits: z.array(z.enum(TRAITS)).max(4),
});

const CLASSIFY_MS = 4000;

/* The one place that picks the classifier model. Today the Nebius provider; a later switch to an AI Gateway model
   string only changes this function. */
export function classifierModel(): LanguageModel | null {
  return nebiusModel(process.env.NEBIUS_CLASSIFIER_MODEL || NEBIUS_DEFAULT_MODEL);
}

export { fromSignals };

const INSTRUCTIONS = `You sort the results of a public exposure check into one profile and a few traits. The results are JSON from public checks: GitHub, breach lists, stealer logs, Gravatar, forums and web search (Tavily) result URLs.
Profiles:
- high-value-individual: a senior executive, founder, wealthy person or someone with a clear public role.
- target-of-spies: a journalist, activist, official, academic or researcher on sensitive topics, or someone who works for one.
- crypto-worker: works in crypto or Web3, or clearly holds crypto.
- romance-target: active on dating or social sites in a way that invites strangers to start a friendship.
- none: anything else, or when unsure. Most people are none.
Traits: only ones the results clearly show, at most four, from: ${TRAITS.filter((t) => t !== "general").join(", ")}.
Results about a different person with the same name do not count. Never guess from a name alone.
Answer with one JSON object and nothing else, exactly in this shape: {"profile": "none", "traits": ["developer"]}`;

/* What the model may send back. Lenient on purpose: an unknown trait is dropped rather than failing the whole answer,
   and case or spacing slips are forgiven. The strict classSchema still decides what is kept. */
const looseSchema = z.object({ profile: z.string(), traits: z.array(z.string()).default([]) });
const norm = (s: string) => s.trim().toLowerCase().replace(/[\s_]+/g, "-");
export function normaliseAnswer(raw: unknown): z.infer<typeof classSchema> | null {
  const loose = looseSchema.safeParse(raw);
  if (!loose.success) return null;
  const profile = norm(loose.data.profile);
  const traits = [...new Set(loose.data.traits.map(norm))].filter((t): t is Trait => (TRAITS as readonly string[]).includes(t)).slice(0, 4);
  const strict = classSchema.safeParse({ profile: profile === "no-profile" ? "none" : profile, traits });
  return strict.success ? strict.data : null;
}

/* A compact copy of the findings: what each check found, profiles, repos, breach names and result URLs. */
export function classifierPrompt(findings: unknown, signals: readonly Signal[]): string {
  return JSON.stringify({ signals, findings }).slice(0, 12_000);
}

export async function classifyProfile(findings: unknown, signals: readonly Signal[], extraTraits: readonly Trait[] = [], model: LanguageModel | null = classifierModel()): Promise<Classification> {
  const fallback = fromSignals(signals, extraTraits);
  if (!model) return fallback;
  try {
    const { output } = await generateText({
      model, instructions: INSTRUCTIONS, prompt: classifierPrompt(findings, signals),
      output: Output.object({ name: "Classification", schema: looseSchema }),
      temperature: 0, maxOutputTokens: 200, maxRetries: 0,
      providerOptions: { nebius: { chat_template_kwargs: { enable_thinking: false } } },
      abortSignal: AbortSignal.timeout(CLASSIFY_MS),
    });
    const parsed = normaliseAnswer(output);
    if (!parsed) return { ...fallback, note: "answer outside the schema" };
    /* Self reported traits always stay, and "general" is everyone, so it is dropped. */
    const traits = [...new Set([...extraTraits, ...parsed.traits.filter((t) => t !== "general")])].slice(0, 4);
    return { profile: parsed.profile, traits, by: "model" };
  } catch (e) {
    /* The model often wraps its JSON in a code fence or a sentence; read the first object out of the raw text. */
    if (NoObjectGeneratedError.isInstance(e) && e.text) {
      const parsed = (() => { try { return normaliseAnswer(JSON.parse(e.text.match(/\{[\s\S]*\}/)?.[0] ?? "null")); } catch { return null; } })();
      if (parsed) return { profile: parsed.profile, traits: [...new Set([...extraTraits, ...parsed.traits.filter((t) => t !== "general")])].slice(0, 4), by: "model" };
    }
    /* A short reason for the debug field only; never shown. */
    return { ...fallback, note: e instanceof Error ? `${e.name}: ${e.message}`.slice(0, 200) : "error" };
  }
}

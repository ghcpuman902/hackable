/* The "Ask your own assistant" prompt. INTERFACE (agreed between the report and this file; do not rename):
   AssistantBrief, buildAssistantPrompt. Summary facts only: never a password, a raw breach record or any secret. */
export type AssistantBrief = {
  firstName?: string;
  /* The profile type shown at the top of the report, e.g. "Crypto Worker" or "No profile", and its short label. */
  type: string;
  typeLabel?: string;
  /* Accounts and results the report matched to this person, e.g. { source: "GitHub", detail: "ghcpuman902, email in commits" }. */
  matched: { source: string; detail: string }[];
  /* Flag labels, e.g. "Passwords in breaches". */
  flags: string[];
  /* Pattern names from fraud-patterns.json, most relevant first. */
  patterns: string[];
};

/* Placeholder until the card pass lands. */
export function buildAssistantPrompt(b: AssistantBrief): string {
  return `Please help me lock down my accounts. My report type is ${b.type}.`;
}

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

export function buildAssistantPrompt(brief: AssistantBrief): string {
  const { firstName, type, typeLabel, matched, flags, patterns } = brief;
  const profile = typeLabel ? `${type} (${typeLabel})` : type;
  const matches = matched.map(({ source, detail }) => `${source} (${detail})`).join(". ");

  return [
    "Help me audit the accounts I own and secure them one step at a time. Use this summary to decide what to do first.",
    [
      firstName && `My first name is ${firstName}.`,
      `My report lists my profile as ${profile}.`,
      matches && `The report found these matches. ${matches}.`,
      flags.length > 0 && `It flagged these risks. ${flags.join(", ")}.`,
      patterns.length > 0 && `It highlighted these scams to watch for. ${patterns.join(", ")}.`,
    ].filter(Boolean).join("\n"),
    [
      "If the report mentions a stealer log hit, start by helping me use a clean device to sign out of all sessions on the affected accounts.",
      "Help me replace reused passwords with unique ones, store them in a password manager and turn on two step verification.",
      "Show me how to use GitHub's noreply address for future commits and check which past commits still expose my email.",
      "Walk me through Google Results about you and show me how to request removal of my personal details from data brokers.",
    ].join("\n"),
    "Give me one step at a time and wait for me to confirm before moving on. Ask for my approval before you change anything. Keep passwords, verification codes, other secrets and raw breach records out of this chat.",
  ].join("\n\n").replace(/\p{Dash}/gu, " ");
}

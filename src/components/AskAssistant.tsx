"use client";

import type { AssistantBrief } from "@/lib/assistant-prompt";

/* The last card of the report. INTERFACE (agreed; do not rename): default-free named export AskAssistant({ brief }).
   Placeholder until the card pass lands. */
export function AskAssistant({ brief }: { brief: AssistantBrief }) {
  return <section className="sec mk-card plain" data-ask-assistant={brief.type} />;
}

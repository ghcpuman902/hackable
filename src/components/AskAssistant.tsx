"use client";

import { useEffect, useState } from "react";
import { buildAssistantPrompt, type AssistantBrief } from "@/lib/assistant-prompt";
import "./ask-assistant.css";

async function copyPrompt(prompt: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(prompt);
    return true;
  } catch {
    const previousFocus = document.activeElement;
    const field = document.createElement("textarea");
    field.className = "ask-assistant-hidden";
    field.value = prompt;
    field.readOnly = true;
    document.body.append(field);

    try {
      field.focus({ preventScroll: true });
      field.select();
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      field.remove();
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    }
  }
}

export function AskAssistant({ brief }: { brief: AssistantBrief }) {
  const [feedback, setFeedback] = useState<{ label: "Copied" | "Copy failed" }>();

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(undefined), 2_000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  async function handleCopy() {
    const copied = await copyPrompt(buildAssistantPrompt(brief));
    setFeedback({ label: copied ? "Copied" : "Copy failed" });
  }

  return (
    <section className="sec mk-card plain ask-assistant" data-ask-assistant={brief.type}>
      <div className="ask-assistant-text">
        <h2>Ask your own assistant</h2>
        <p>The prompt uses your report summary to ask for help securing your accounts, one step at a time.</p>
      </div>
      <button type="button" className="pill ask-assistant-copy" onClick={handleCopy}>
        {feedback?.label ?? "Copy"}
      </button>
      <span className="ask-assistant-hidden" role="status">{feedback?.label}</span>
    </section>
  );
}

"use client";
import Link from "next/link";
import { PatternScene } from "@/components/pattern-scenes";
import { reportPatterns } from "@/lib/report-refs";
import { PATTERNS, type FraudPattern, type PatternId } from "@/lib/patterns";
import { matchedHeading } from "@/lib/pattern-row";
import "./pattern-cards.css";

/* The scam patterns under a report, as one sideways row of picture cards that snap into place.
   ids: a live report's patterns, picked by the deterministic scoring (pattern-score.ts) and nothing else.
   markdown: a cached preset or demo report, whose cards are the patterns it cites. */
export default function PatternCards({ markdown, ids }: { markdown?: string; ids?: readonly PatternId[] }) {
  const items: FraudPattern[] = ids ? ids.map((id) => PATTERNS[id]).filter(Boolean) : reportPatterns(markdown ?? "");
  if (!items.length) return null;
  const heading = matchedHeading(items.length);
  return (
    <section className="pr" aria-label={heading ?? "Your matched pattern"}>
      {heading && <h2 className="pr-h">{heading}</h2>}
      {/* Chromium leaves a partly visible card where it is when it takes focus, so bring the whole card into the row. */}
      <ul className="pr-row" onFocus={(e) => e.target.scrollIntoView({ block: "nearest", inline: "nearest" })}>
        {items.map((p) => (
          <li key={p.id}>
            <Link className="pr-card" href={`/patterns#${p.id}`}>
              <PatternScene id={p.id} />
              <span className="pr-tx">
                <b>{p.name}</b>
                <span>{p.oneLine}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

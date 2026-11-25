import Link from "next/link";
import { reportPatterns } from "@/lib/report-refs";
import { PATTERNS, type FraudPattern, type PatternId } from "@/lib/patterns";
import "./pattern-cards.css";

/* The scam pattern cards under a report.
   ids: a live report's patterns, picked by the deterministic scoring (pattern-score.ts) and nothing else.
   markdown: a cached preset or demo report, whose cards are the patterns it cites. */
export default function PatternCards({ markdown, ids }: { markdown?: string; ids?: readonly PatternId[] }) {
  const items: FraudPattern[] = ids ? ids.map((id) => PATTERNS[id]).filter(Boolean) : reportPatterns(markdown ?? "");
  if (!items.length) return null;
  return (
    <ul className="pc-grid">
      {items.map((p) => (
        <li key={p.id}>
          <Link className="pc-card" href={`/patterns#${p.id}`}>
            <h3>{p.name}</h3>
            <p>{p.oneLine}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

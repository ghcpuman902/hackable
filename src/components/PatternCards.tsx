import Link from "next/link";
import { PATTERN_LIST, type FraudPattern } from "@/lib/patterns";
import "./pattern-cards.css";

/* The scam patterns a report cites, as catalogue cards under it. A pattern counts when one of its sources is a link in the report. */
const BY_SOURCE = new Map(PATTERN_LIST.flatMap((p) => p.sources.map((u) => [u, p] as const)));

export function patternsInReport(markdown: string): FraudPattern[] {
  const out: FraudPattern[] = [];
  for (const [url] of markdown.matchAll(/https?:\/\/[^\s)>\]]+/g)) {
    const p = BY_SOURCE.get(url);
    if (p && !out.includes(p)) out.push(p);
  }
  return out.slice(0, 4);
}

export default function PatternCards({ markdown }: { markdown: string }) {
  const items = patternsInReport(markdown);
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

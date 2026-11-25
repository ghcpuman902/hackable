import Link from "next/link";
import { reportPatterns } from "@/lib/report-refs";
import "./pattern-cards.css";

/* The scam patterns a report cites, as catalogue cards under it. A pattern counts when one of its sources is a link in the report.
   fallback: the patterns the checks point to, shown when the report cites none. */
export default function PatternCards({ markdown, fallback }: { markdown: string; fallback?: readonly string[] }) {
  const items = reportPatterns(markdown, fallback);
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

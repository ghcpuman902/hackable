import { Check, Minus, ShieldCheck } from "lucide-react";
import type { Pivot } from "@/lib/live-sources";
import type { FanCard, ScanTool } from "@/lib/synthetic";
import type { CardState } from "./Fan";
import "./empty-result.css";

/* The real source behind each live check, shown so the work is visible. */
const SOURCE: Partial<Record<ScanTool, string>> = {
  hibpTest: "XposedOrNot", leakCheck: "LeakCheck", hudsonRock: "Hudson Rock", github: "GitHub",
  linkedin: "LinkedIn", web: "Web search", social: "Gravatar and Keybase", forum: "Hacker News",
};

const FOUND_AS: Partial<Record<ScanTool, string>> = { github: "GitHub", linkedin: "LinkedIn", social: "public profile", forum: "Hacker News profile" };

const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/* A live scan where no check found a risk. Says what was found, honestly, and shows each check passed. */
export default function EmptyResult({ first, fan, states, found, pivots }: {
  first: string | null;
  fan: FanCard[];
  states: Partial<Record<ScanTool, CardState>>;
  found: Partial<Record<ScanTool, string>>;
  pivots: Pivot[];
}) {
  /* What a check did find without it being a risk, such as a GitHub profile. Web results are left out: they are often someone else. */
  const seen = fan.filter((c) => c.tool !== "web" && states[c.tool] === "ok" && found[c.tool] && !/could not check/i.test(found[c.tool] ?? ""));
  const froms = [...new Set([...seen.map((c) => FOUND_AS[c.tool] ?? c.title), ...pivots.map((p) => p.from)])];
  const values = [...new Set([...seen.map((c) => FOUND_AS[c.tool] ?? c.title), ...pivots.map((p) => p.value)])].slice(0, 6);
  const line = froms.length
    ? `We found your ${list(froms)}, but no leaks, stealer logs or scam signals.`
    : "We found nothing public tied to you, and no leaks, stealer logs or scam signals.";
  return (
    <div className="er">
      <section className="er-card">
        <ShieldCheck className="er-icon" aria-hidden />
        <div className="er-body">
          <h2>{first ? `${first}, nothing` : "Nothing"} risky turned up.</h2>
          <p>{line}</p>
          {values.length > 0 && <ul className="er-chips">{values.map((v) => <li key={v}>{v}</li>)}</ul>}
        </div>
      </section>
      <ul className="er-checks">
        {fan.map((c) => {
          const failed = states[c.tool] !== "ok" || /could not check/i.test(found[c.tool] ?? "");
          return (
            <li key={c.tool} className={failed ? "er-skip" : undefined}>
              {failed ? <Minus aria-hidden /> : <Check aria-hidden />}
              <span>{SOURCE[c.tool] ?? c.title}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

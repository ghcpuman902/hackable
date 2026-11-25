import { Check, Minus, ShieldCheck, TriangleAlert } from "lucide-react";
import type { Pivot } from "@/lib/pivots";
import { checkStatus, clearClauses } from "@/lib/scan-outcome";
import type { FanCard, ScanResult, ScanTool } from "@/lib/synthetic";
import type { CardState } from "./Fan";
import "./empty-result.css";

/* The real source behind each live check, shown so the work is visible. */
const SOURCE: Partial<Record<ScanTool, string>> = {
  hibpTest: "XposedOrNot", leakCheck: "LeakCheck", hudsonRock: "Hudson Rock", github: "GitHub",
  linkedin: "LinkedIn", web: "Web search", social: "Gravatar and Keybase", forum: "Hacker News",
};

const FOUND_AS: Partial<Record<ScanTool, string>> = { github: "GitHub", linkedin: "LinkedIn", social: "public profile", forum: "Hacker News profile" };

const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/* The scan stopped, or no source answered: never shown as an all clear. */
export function ScanFailed({ onRetry, connection = false }: { onRetry: () => void; connection?: boolean }) {
  return (
    <section className="er-card er-fail" role="alert">
      <TriangleAlert className="er-icon" aria-hidden />
      <div className="er-body">
        <h2>We could not finish the checks.</h2>
        <p>{connection
          ? "The connection dropped before the results came back, so this is not a clean result."
          : "The sources did not answer, so this is not a clean result."}</p>
        <button type="button" className="pill er-retry" onClick={onRetry}>Try again</button>
      </div>
    </section>
  );
}

/* A live scan where no check found a risk. Says what was found, honestly, and shows each check passed. */
export default function EmptyResult({ first, fan, states, found, outputs, pivots }: {
  first: string | null;
  fan: FanCard[];
  states: Partial<Record<ScanTool, CardState>>;
  found: Partial<Record<ScanTool, string>>;
  outputs: Partial<Record<ScanTool, ScanResult>>;
  pivots: Pivot[];
}) {
  /* What a check did find without it being a risk, such as a GitHub profile. Web results are left out: they are often someone else. */
  const seen = fan.filter((c) => c.tool !== "web" && states[c.tool] === "ok" && found[c.tool] && checkStatus(outputs[c.tool]) === "checked");
  const froms = [...new Set([...seen.map((c) => FOUND_AS[c.tool] ?? c.title), ...pivots.map((p) => p.from)])];
  const values = [...new Set([...seen.map((c) => FOUND_AS[c.tool] ?? c.title), ...pivots.map((p) => p.value)])].slice(0, 6);
  /* Only claim what a source really answered: a skipped or unreachable check says nothing either way. */
  const none = list(clearClauses(outputs));
  const down = fan.filter((c) => checkStatus(outputs[c.tool]) === "down").map((c) => SOURCE[c.tool] ?? c.title);
  const line = (froms.length ? `We found your ${list(froms)}, but no ${none}.` : `We found nothing public tied to you, and no ${none}.`)
    + (down.length ? ` ${list(down)} did not answer, so there may be more.` : "");
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
          const failed = states[c.tool] !== "ok" || checkStatus(outputs[c.tool]) !== "checked";
          return (
            <li key={c.tool} className={failed ? "er-skip" : undefined}>
              {failed ? <Minus aria-hidden /> : <Check aria-hidden />}
              <span>{SOURCE[c.tool] ?? c.title}<span className="sr-only">{failed ? ", not checked" : ", checked"}</span></span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

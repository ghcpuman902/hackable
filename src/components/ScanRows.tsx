import type { CSSProperties } from "react";
import { pivotLabel, type Pivot } from "@/lib/pivots";
import type { FanCard, ScanTool } from "@/lib/synthetic";
import { Fan, runH, type CardState } from "./Fan";
import "./scan-rows.css";

export function ScanRows({ fan, states, found, pivots, showPivots }: {
  fan: FanCard[];
  states?: Partial<Record<ScanTool, CardState>>;
  found: Partial<Record<ScanTool, string>>;
  pivots: Pivot[];
  showPivots: boolean;
}) {
  const height = runH(fan);
  return (
    <>
      {showPivots && (
        <div className="scan-pivots" aria-live="polite">
          {pivots.map((p) => (
            <div key={p.value.toLowerCase()}>
              <span>{pivotLabel(p)}</span>
              <b>{p.value}</b>
            </div>
          ))}
        </div>
      )}
      <div className="stage scan-rows" aria-live="polite"
        style={{ "--runh": `${height.wide}px`, "--runhm": `${height.phone}px` } as CSSProperties}>
        <Fan fan={fan} states={states}
          label={(card, state) => {
            if (state === "checking") return card.checking;
            return state === "idle" ? "" : found[card.tool] ?? "";
          }} />
      </div>
    </>
  );
}

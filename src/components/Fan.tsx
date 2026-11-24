import type { CSSProperties } from "react";
import { BRAND_BG, BrandIcon } from "./brand-icons";
import { Lucide } from "./icons";
import { FAN, type FanCard, type ScanTool } from "@/lib/synthetic";

export type CardState = "idle" | "checking" | "ok" | "hit";

function Logo({ card }: { card: FanCard }) {
  if ("brand" in card.icon) {
    return <span className="lg" style={{ "--c": BRAND_BG[card.icon.brand] } as CSSProperties}><BrandIcon name={card.icon.brand} /></span>;
  }
  return <span className="lg" style={{ "--c": card.icon.bg } as CSSProperties}><Lucide name={card.icon.lucide} /></span>;
}

/* The same fan is the landing scene and the loading state. Position comes from --o (offset from centre). */
export function Fan({ states, label }: { states?: Partial<Record<ScanTool, CardState>>; label?: (c: FanCard, s: CardState) => string }) {
  const mid = (FAN.length - 1) / 2;
  return (
    <div className="fan" aria-live="polite">
      {FAN.map((c, i) => {
        const o = i - mid;
        const s = states?.[c.tool] ?? "idle";
        const st = label?.(c, s) ?? "";
        return (
          <div key={c.tool} className={"fs " + s} style={{ "--o": o, "--oa": Math.abs(o) } as CSSProperties}>
            <i className="ln" aria-hidden="true"></i>
            <span className="ftag"><i style={{ background: c.dot }}></i>{c.tag}</span>
            <div className="fc">
              <Logo card={c} />
              <b>{c.title}</b>
              <span className="st">{st}</span>
              <span className="bars" aria-hidden="true"><i></i><i></i></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

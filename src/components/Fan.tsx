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
  const narrow = FAN.filter((c) => c.narrow);
  const nmid = (narrow.length - 1) / 2;
  return (
    <div className="fan" aria-live="polite" style={{ "--n": FAN.length, "--nn": narrow.length } as CSSProperties}>
      {FAN.map((c, i) => {
        const o = i - mid;
        const j = narrow.indexOf(c);
        const om = j < 0 ? 0 : j - nmid;
        const s = states?.[c.tool] ?? "idle";
        const st = label?.(c, s) ?? "";
        /* --o/--om: offset from centre (wide/narrow). --s/--sm: which side the hub is on, for the curved connector. */
        const vars = { "--o": o, "--oa": Math.abs(o), "--s": o < 0 ? 1 : -1, "--om": om, "--oma": Math.abs(om), "--sm": om < 0 ? 1 : -1 };
        return (
          <div key={c.tool} className={"fs " + s + (c.narrow ? "" : " wide")} style={vars as CSSProperties}>
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

import type { CSSProperties } from "react";
import { Fan, runH, type CardState } from "@/components/Fan";
import { Mini } from "@/components/Mini";
import { FAN, type MiniName, type ScanTool } from "@/lib/synthetic";

const NAMES: MiniName[] = ["rec", "flood", "vish", "sess", "breach", "steal", "prof"];

const STATES: Partial<Record<ScanTool, CardState>> = {
  hibpTest: "hit", github: "ok", linkedin: "ok", hudsonRock: "checking",
};

const stageVars = { "--runh": runH(FAN).wide + "px", "--runhm": runH(FAN).phone + "px" } as CSSProperties;

/* Plain test page for the scan and report animations. Not linked from anywhere. */
export default function AnimLab() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px", display: "grid", gap: 28 }}>
      <h1 style={{ font: "700 22px var(--font)", margin: 0 }}>Animation lab</h1>
      {NAMES.map((n) => (
        <section key={n} id={n} style={{ display: "grid", gap: 8 }}>
          <b>{n}</b>
          <div style={{ maxWidth: 340 }}><Mini name={n} who="Jane" /></div>
        </section>
      ))}
      <section id="fan" style={{ display: "grid", gap: 8 }}>
        <b>fan, drifting</b>
        <div className="landing"><div className="stage" style={stageVars}><Fan /></div></div>
      </section>
      <section id="fan-run" style={{ display: "grid", gap: 8 }}>
        <b>fan, checking</b>
        <div className="landing run"><div className="stage" style={stageVars}>
          <Fan states={STATES} label={(_, s) => (s === "hit" ? "Found" : s === "ok" ? "Clear" : s === "checking" ? "Checking" : "")} />
        </div></div>
      </section>
    </main>
  );
}

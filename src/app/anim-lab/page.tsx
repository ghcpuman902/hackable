import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import ReportMarkdown from "@/components/ReportMarkdown";
import { cleanReportMarkdown } from "@/lib/report-md";
import { Fan, runH, type CardState } from "@/components/Fan";
import { Mini } from "@/components/Mini";
import { DemoNoticeProvider } from "@/components/DemoNoticeDialog";
import { SubscribeCard } from "@/components/SubscribeCard";
import { FAN, type MiniName, type ScanTool } from "@/lib/synthetic";

const FIXTURES = join(process.cwd(), "src/lib/__tests__/renderer-fixtures");

export const metadata: Metadata = {
  title: "Animation lab",
  robots: { index: false, follow: false },
};
const fixtureMd = cleanReportMarkdown(
  readFileSync(join(FIXTURES, "valid/long-paragraphs.md"), "utf8"),
  JSON.parse(readFileSync(join(FIXTURES, "whitelist.json"), "utf8")).allowedUrls,
) ?? "";

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
      <section id="subscribe" style={{ display: "grid", gap: 8 }}>
        <b>subscribe</b>
        <DemoNoticeProvider><SubscribeCard /></DemoNoticeProvider>
      </section>
      <section id="report-fixture" style={{ display: "grid", gap: 8 }}>
        <ReportMarkdown markdown={fixtureMd} />
      </section>
    </main>
  );
}

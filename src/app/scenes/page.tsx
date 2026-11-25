import type { Metadata } from "next";
import { PatternScene, SCENE_IDS } from "@/components/pattern-scenes";

export const metadata: Metadata = {
  title: "Pattern scenes",
  robots: { index: false, follow: false },
};

export default function ScenesPage() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 20px 72px" }}>
      <h1 style={{ margin: "0 0 32px", fontSize: "clamp(32px, 5vw, 54px)", letterSpacing: "-0.04em" }}>Pattern scenes</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
        {SCENE_IDS.map((id) => <figure key={id} style={{ margin: 0, display: "grid", gap: 9 }}><PatternScene id={id} /><figcaption style={{ font: "600 14px var(--mono)", color: "var(--n500)" }}>{id}</figcaption></figure>)}
      </div>
    </main>
  );
}

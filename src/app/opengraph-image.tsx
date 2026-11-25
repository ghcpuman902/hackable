import { ImageResponse } from "next/og";

export const alt = "Hackable";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(145deg, #ffffff 0%, #ffffff 62%, #feebec 100%)",
          color: "#171717",
          display: "flex",
          height: "100%",
          padding: "76px 88px",
          position: "relative",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 850 }}>
          <div style={{ alignItems: "center", display: "flex", fontSize: 32, fontWeight: 700, gap: 14, letterSpacing: "-0.04em" }}>
            <span style={{ alignItems: "center", background: "#171717", borderRadius: 16, color: "#fff", display: "flex", height: 56, justifyContent: "center", width: 56 }}>
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              </svg>
            </span>
            Hackable
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: "-0.065em", lineHeight: 1.03 }}>See what’s public about you</div>
          <div style={{ color: "#525252", fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.35 }}>A personal exposure check for public traces and scam patterns.</div>
        </div>
        <div style={{ background: "#e5484d", borderRadius: 999, bottom: -160, height: 420, opacity: 0.12, position: "absolute", right: -100, width: 420 }} />
      </div>
    ),
    size,
  );
}

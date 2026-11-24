import "./landing-badge.css";

/* Who made this, and a QR code to the live site, so people at the demo can open it on their phones.
   The QR path was generated once with the qrcode package for https://mangle-hackable.vercel.app (31 modules, level M). */
const QR = "M1 1.5h7m4 0h1m1 0h3m2 0h3m1 0h7M1 2.5h1m5 0h1m2 0h2m2 0h4m5 0h1m5 0h1M1 3.5h1m1 0h3m1 0h1m1 0h3m2 0h1m1 0h1m4 0h1m1 0h1m1 0h3m1 0h1M1 4.5h1m1 0h3m1 0h1m1 0h4m2 0h2m1 0h3m2 0h1m1 0h3m1 0h1M1 5.5h1m1 0h3m1 0h1m1 0h2m1 0h2m2 0h6m1 0h1m1 0h3m1 0h1M1 6.5h1m5 0h1m1 0h4m5 0h1m4 0h1m5 0h1M1 7.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M9 8.5h2m1 0h2m1 0h1m1 0h1m1 0h2M1 9.5h1m1 0h5m3 0h2m5 0h1m4 0h5M1 10.5h1m1 0h3m2 0h1m3 0h5m3 0h6m3 0h1M3 11.5h1m1 0h4m2 0h6m1 0h1m2 0h1m1 0h2M1 12.5h1m8 0h3m1 0h1m1 0h1m2 0h1m2 0h1m1 0h3m1 0h1M3 13.5h3m1 0h2m1 0h1m2 0h1m1 0h4m7 0h2M1 14.5h3m4 0h2m1 0h1m1 0h1m3 0h1m1 0h7m3 0h1M1 15.5h1m1 0h2m1 0h3m1 0h4m2 0h1m4 0h1m4 0h2M5 16.5h2m4 0h1m3 0h2m3 0h1m3 0h1m3 0h1M4 17.5h1m1 0h6m4 0h3m1 0h1m1 0h1m3 0h2M1 18.5h1m3 0h1m3 0h1m2 0h1m1 0h2m1 0h1m2 0h6m1 0h1m1 0h1M1 19.5h1m1 0h1m1 0h1m1 0h1m2 0h3m1 0h6m1 0h1m1 0h3m1 0h1M1 20.5h1m2 0h3m3 0h3m1 0h1m1 0h1m2 0h2m4 0h1m2 0h1M1 21.5h1m1 0h3m1 0h5m1 0h1m1 0h2m1 0h1m2 0h5m1 0h3M9 22.5h1m1 0h3m3 0h1m1 0h1m1 0h1m3 0h5M1 23.5h7m8 0h1m1 0h4m1 0h1m1 0h3M1 24.5h1m5 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m2 0h2m3 0h1m2 0h2M1 25.5h1m1 0h3m1 0h1m1 0h1m1 0h3m4 0h1m2 0h5m1 0h2M1 26.5h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h2m3 0h2m5 0h4M1 27.5h1m1 0h3m1 0h1m1 0h1m1 0h6m5 0h7M1 28.5h1m5 0h1m4 0h2m2 0h2m3 0h6m1 0h1M1 29.5h7m1 0h1m2 0h2m1 0h1m2 0h1m1 0h1m1 0h1m1 0h1m2 0h1";

export default function LandingBadge() {
  return (
    <a className="lb" href="https://mangle-hackable.vercel.app" aria-label="Mangle Kuo, open Hackable">
      <span>Mangle Kuo</span>
      <svg viewBox="0 0 31 31" shapeRendering="crispEdges" aria-hidden><path fill="#fff" d="M0 0h31v31H0z" /><path stroke="#000" d={QR} /></svg>
    </a>
  );
}

import Link from "next/link";
import "./site-footer.css";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Footer navigation">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/patterns">Patterns</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
      <p>We only look at public data, and we keep nothing after your report.</p>
      <p>Built at Innovators Guild Retail AI with Nebius Token Factory and Tavily.</p>
    </footer>
  );
}

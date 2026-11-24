import { Lucide } from "./icons";
import Link from "next/link";

type PageName = "how-it-works" | "privacy" | "patterns";

const pagePaths = {
  "how-it-works": "/how-it-works",
  privacy: "/privacy",
  patterns: "/patterns",
} as const;

export default function SiteNav({ activePage }: { activePage: PageName }) {
  return (
    <nav className="nav" aria-label="Main navigation">
      <Link className="mark" href="/"><i><Lucide name="shield" /></i>Hackable</Link>
      <div className="links">
        <Link href="/">Home</Link>
        <Link href={pagePaths["how-it-works"]} aria-current={activePage === "how-it-works" ? "page" : undefined}>How it works</Link>
        <Link href={pagePaths.privacy} aria-current={activePage === "privacy" ? "page" : undefined}>Privacy</Link>
        <Link href={pagePaths.patterns} aria-current={activePage === "patterns" ? "page" : undefined}>Patterns</Link>
      </div>
      <a className="login" href="#">Subscribe</a>
    </nav>
  );
}

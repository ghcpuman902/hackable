import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import { PATTERNS, type PatternId } from "@/lib/patterns";
import "@/components/report-markdown.css";
import "./patterns.css";

export const metadata: Metadata = { title: "Scam patterns | Hackable" };

/* All 24 patterns from fraud-patterns.json, wording kept exactly, grouped as Mangle asked (24 Nov). */
const GROUPS: { title: string; ids: PatternId[] }[] = [
  { title: "Work and money", ids: ["contagious-interview", "task-scam", "fake-boss-payment", "payroll-change"] },
  { title: "Logins and accounts", ids: ["pass-the-cookie", "credential-stuffing", "mfa-fatigue", "sim-swap", "leaked-password-extortion"] },
  { title: "Calls and impersonation", ids: ["email-bomb-fake-it-support", "fake-bank-call", "voice-clone-family"] },
  { title: "Crypto and romance", ids: ["deepfake-crypto-giveaway", "wallet-drainer", "pig-butchering", "romance-scam"] },
  { title: "Life events and news", ids: ["news-hook-phishing", "after-move-council-letter", "fake-charity", "fake-booking-or-visa", "marketplace-fake-buyer"] },
  { title: "Other", ids: ["qr-code-phishing", "state-spearphishing", "doxxing-swatting"] },
];

const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

export default function PatternsPage() {
  return (
    <main>
      <SiteNav activePage="patterns" />
      <div className="app max-w-5xl">
        <header className="mx-auto max-w-2xl pt-12 text-center sm:pt-20">
          <h1 className="m-0 text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-[var(--n900)] sm:text-6xl">Scam patterns</h1>
        </header>
        <div className="pt-groups">
          {GROUPS.map((g) => (
            <section key={g.title} className="pt-group" aria-labelledby={"pt-" + g.ids[0]}>
              <h2 id={"pt-" + g.ids[0]}>{g.title}</h2>
              <div className="rm">
                {g.ids.map((id) => PATTERNS[id]).filter(Boolean).map((p) => (
                  <div className="rm-group" key={p.id}>
                    <aside className="rm-card rm-scam">
                      <ShieldAlert className="rm-icon" aria-hidden size={20} />
                      <div className="rm-card-body">
                        <p className="rm-lead">{p.name}</p>
                        <p className="rm-body">{p.oneLine}</p>
                      </div>
                    </aside>
                    {p.sources.length > 0 && (
                      <div className="rm-refs">
                        {p.sources.map((url, j) => (
                          <span key={url}>{j > 0 && " · "}<a href={url} target="_blank" rel="noopener noreferrer">{host(url)}</a></span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

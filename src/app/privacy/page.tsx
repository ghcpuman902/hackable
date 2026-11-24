import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Privacy | Hackable",
};

const sections = [
  {
    id: "check",
    title: "What we check",
    text: "Hackable checks the details you add against public sources that match them. This can include breach records, public profiles, public commits and public web results.",
  },
  {
    id: "keep",
    title: "What we keep",
    text: "We keep nothing from your search. Hackable uses the details you add to run the report, then does not retain them.",
  },
  {
    id: "presets",
    title: "Demo presets",
    text: "Cached data is used only for the demo presets. It lets those examples show consistent results without checking the same public sources each time.",
  },
  {
    id: "public",
    title: "Public data only",
    text: "Hackable uses public data only. It does not use private accounts, private messages or information behind a sign in.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main>
      <SiteNav activePage="privacy" />
      <div className="app max-w-5xl">
        <header className="mx-auto max-w-2xl pt-12 text-center sm:pt-20">
          <h1 className="m-0 text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-[var(--n900)] sm:text-6xl">Privacy</h1>
        </header>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5">
          {sections.map((section) => (
            <section key={section.title} className="mk-card p-6 sm:p-8" aria-labelledby={section.id}>
              <h2 id={section.id} className="m-0 text-2xl font-bold tracking-[-0.025em] text-[var(--n900)]">{section.title}</h2>
              <p className="mb-0 mt-3 text-[17px] leading-7 text-[var(--n500)]">{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

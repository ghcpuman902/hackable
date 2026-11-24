import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "How it works | Hackable",
};

const steps = [
  {
    title: "Add the details you know",
    text: "Add a name, email address, handle or profile link. Hackable turns each one into a separate chip, so it can use the right public checks for that detail.",
  },
  {
    title: "Check the matching sources",
    text: "Each chip is checked against the sources that can answer for it. An email can be checked for breach records, while a GitHub handle can be checked against public profiles and commits.",
  },
  {
    title: "Work out the profile and scam patterns",
    text: "A profile is a label such as Crypto Worker or Romance Target. When the public results support one, the scam patterns linked to it lead the report. When none applies, the report shows No profile.",
  },
  {
    title: "Write the report",
    text: "The report brings the public findings together and explains the patterns a scammer may use. It is a record of what the checks found at that time.",
  },
] as const;

const sources = [
  "LeakCheck public API for email breach records",
  "Cached Have I Been Pwned results for the preset email addresses only",
  "XposedOrNot for email breach records",
  "Hudson Rock Cavalier public OSINT for email addresses and usernames",
  "GitHub public REST for profiles and recent public commits",
  "Gravatar public profiles for email hashes",
  "Keybase public profiles for usernames",
  "Hacker News public profiles for usernames",
  "Tavily public web results for names and LinkedIn profiles, with DuckDuckGo as a fallback",
] as const;

export default function HowItWorksPage() {
  return (
    <main>
      <SiteNav activePage="how-it-works" />
      <div className="app max-w-5xl">
        <header className="mx-auto max-w-2xl pt-12 text-center sm:pt-20">
          <h1 className="m-0 text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-[var(--n900)] sm:text-6xl">How Hackable builds a report</h1>
        </header>

        <ol className="mx-auto mt-10 grid max-w-4xl gap-4 p-0 sm:mt-14 sm:gap-5">
          {steps.map((step, index) => (
            <li key={step.title} className="mk-card grid gap-3 p-6 sm:grid-cols-[3rem_1fr] sm:gap-5 sm:p-8">
              <span className="grid size-10 place-items-center rounded-full bg-white text-lg font-bold text-[var(--n900)]">{index + 1}</span>
              <div>
                <h2 className="m-0 text-xl font-bold tracking-[-0.025em] text-[var(--n900)]">{step.title}</h2>
                <p className="mb-0 mt-2 max-w-2xl text-[17px] leading-7 text-[var(--n500)]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <section className="mx-auto mt-12 max-w-4xl sm:mt-16" aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="m-0 text-3xl font-bold tracking-[-0.03em] text-[var(--n900)]">Sources we check</h2>
          <ul className="mt-5 grid gap-3 p-0 sm:grid-cols-2">
            {sources.map((source) => (
              <li key={source} className="mk-card list-none p-5 text-[17px] leading-7 text-[var(--n900)]">{source}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

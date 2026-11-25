import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main>
      <SiteNav />
      <section className="app flex min-h-[58svh] max-w-5xl items-center justify-center py-16 text-center sm:py-24" aria-labelledby="not-found-heading">
        <div className="mk-card max-w-xl p-8 sm:p-12">
          <h1 id="not-found-heading" className="m-0 text-4xl font-bold tracking-[-0.035em] text-[var(--n900)] sm:text-5xl">We could not find that page</h1>
          <p className="mb-0 mt-5 text-[17px] leading-7 text-[var(--n500)]">The link may be out of date, or the address may be incomplete.</p>
          <Link className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[var(--n900)] px-5 text-[17px] font-semibold text-white no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--n900)]" href="/">Go to Hackable</Link>
        </div>
      </section>
    </main>
  );
}

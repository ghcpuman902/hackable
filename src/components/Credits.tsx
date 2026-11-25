import { NEBIUS_TOKEN_FACTORY_URL, TAVILY_URL } from "@/lib/site-config";
import "./credits.css";

/* Tavily's official full logo, unmodified, from https://tavily.com/brand (saved as public/brand/tavily-full.svg). */

/* Shown on the search progress screen, in the place the "Sources we check" row takes before a search starts. */
export function TavilyCredit() {
  return (
    <p className="tavily-credit">
      <span>Powered by</span>
      <a href={TAVILY_URL} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element -- a tiny static SVG, no optimisation needed */}
        <img src="/brand/tavily-full.svg" alt="Tavily" width={362} height={109} className="tavily-logo" />
      </a>
    </p>
  );
}

/* A small line in the style of the source lines, right under the first section of a report. */
export function NebiusCredit() {
  return (
    <p className="nebius-credit">
      Report generated with{" "}
      <a href={NEBIUS_TOKEN_FACTORY_URL} target="_blank" rel="noopener noreferrer">
        <b>Nebius</b> Token Factory
      </a>
    </p>
  );
}

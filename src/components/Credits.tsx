import { NEBIUS_TOKEN_FACTORY_URL, TAVILY_URL } from "@/lib/site-config";
import "./credits.css";

/* Official logo files are listed in _agent/overnight/PROGRESS-R6.md. Until they are saved under public/brand/, both
   partners show as text wordmarks. */

/* Shown on the search progress screen, in the place the "Sources we check" row takes before a search starts. */
export function TavilyCredit() {
  return (
    <p className="tavily-credit">
      <span>Powered by</span>
      <a href={TAVILY_URL} target="_blank" rel="noopener noreferrer" aria-label="Powered by Tavily">
        <b>Tavily</b>
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

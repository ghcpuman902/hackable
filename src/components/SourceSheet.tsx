"use client";

import { ExternalLink, X } from "lucide-react";
import { useRef, useState } from "react";
import { ModalDialog } from "./ModalDialog";
import type { SourceGroup } from "@/lib/report-sources";
import "./demo-notice-dialog.css";
import "./source-sheet.css";

export function SourceSheet({ group }: { group: SourceGroup }) {
  const [shown, setShown] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const close = () => {
    setShown(false);
    requestAnimationFrame(() => opener.current?.focus());
  };
  return <>
    <button ref={opener} type="button" className="source-sheet-open" onClick={() => setShown(true)}>{group.label}</button>
    <ModalDialog shown={shown} onClose={close} titleId={`source-sheet-${group.id}`} className="demo-notice source-sheet">
      <div className="demo-notice-panel source-sheet-panel">
        <button type="button" className="demo-notice-close" aria-label="Close" onClick={close}><X size={20} aria-hidden="true" /></button>
        <h2 id={`source-sheet-${group.id}`}>{group.label}</h2>
        <SourceList heading="Confirmed matches" results={group.results} />
        {group.possible.length > 0 && <SourceList heading="Possible matches" results={group.possible} possible />}
      </div>
    </ModalDialog>
  </>;
}

function SourceList({ heading, results, possible = false }: { heading: string; results: SourceGroup["results"]; possible?: boolean }) {
  if (!results.length) return null;
  return <section className={possible ? "source-sheet-list source-sheet-list--possible" : "source-sheet-list"} aria-label={heading}>
    <h3>{heading}</h3>
    <ul>{results.map((result, index) => <li key={`${result.url}-${index}`}>
      <a href={result.url} target="_blank" rel="noopener noreferrer">
        <span className="source-sheet-title">{result.title}</span><span className="source-sheet-domain">{domain(result.url)}</span><ExternalLink size={16} aria-hidden="true" />
      </a>
    </li>)}</ul>
  </section>;
}

function domain(url: string) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } }

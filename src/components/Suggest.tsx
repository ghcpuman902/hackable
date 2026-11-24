"use client";

import type { CSSProperties, ReactNode } from "react";
import { Lucide } from "./icons";
import { BRAND_BG, BrandIcon, type Brand } from "./brand-icons";
import type { SugCat } from "@/lib/suggest";

/* One row of the suggestion list under the search box.
   add: a profile found by name search; site: a typeahead site (inserts its prefix); prefix: plain prefix completion;
   all: adds every row; empty: the one quiet row when nothing was found; done: closes the list. */
export type Opt =
  | { kind: "add"; cat: SugCat; title: string; detail: string; value: string }
  | { kind: "site"; brand: Brand | null; title: string; prefix: string }
  | { kind: "prefix"; cat: SugCat | null; brand: Brand | null; value: string; insert: boolean }
  | { kind: "all" }
  | { kind: "empty" }
  | { kind: "done" };

const BRAND_OF: Record<SugCat, Brand | null> = { linkedin: "linkedin", github: "github", instagram: "instagram", web: null };

function Icon({ brand }: { brand: Brand | null }) {
  return (
    <span className="sg-ic" style={{ "--c": brand ? BRAND_BG[brand] : "#00a5ef" } as CSSProperties}>
      {brand ? <BrandIcon name={brand} /> : <Lucide name="globe" w={2} />}
    </span>
  );
}

export function Suggest({ opts, active, added, loading, onPick, onHover }: {
  opts: Opt[]; active: number; added: (o: Opt) => boolean; loading: boolean;
  onPick: (i: number) => void; onHover: (i: number) => void;
}) {
  const row = (o: Opt, body: ReactNode, i: number, cls = "") => (
    <li key={i} id={`sg-${i}`} role="option" aria-selected={i === active} aria-disabled={o.kind === "empty" || undefined}
      className={`sg-row ${cls}${i === active ? " on" : ""}`}
      onPointerDown={(e) => e.preventDefault()} onMouseMove={() => onHover(i)}
      onClick={() => o.kind !== "empty" && onPick(i)}>
      {body}
    </li>
  );
  return (
    <ul id="sg-list" role="listbox" aria-label="Suggestions" aria-busy={loading || undefined} className="sg" onPointerDown={(e) => e.preventDefault()}>
      {opts.map((o, i) => {
        switch (o.kind) {
          case "add": {
            const on = added(o);
            return row(o, <>
              <Icon brand={BRAND_OF[o.cat]} />
              <span className="sg-tx"><b>{o.title}</b><span>{o.detail}</span></span>
              <span className={"sg-add" + (on ? " ok" : "")} aria-label={on ? "Added" : "Add"}><Lucide name={on ? "check" : "plus"} /></span>
            </>, i, on ? "added" : "");
          }
          case "site":
            return row(o, <><Icon brand={o.brand} /><span className="sg-tx"><b>{o.title}</b><span>{o.prefix}</span></span></>, i);
          case "prefix": {
            const on = !o.insert && added(o);
            return row(o, <>
              <Icon brand={o.brand} />
              <span className="sg-tx"><b>{o.value}</b></span>
              {!o.insert && <span className={"sg-add" + (on ? " ok" : "")} aria-label={on ? "Added" : "Add"}><Lucide name={on ? "check" : "plus"} /></span>}
            </>, i, on ? "added" : "");
          }
          case "all":
            return row(o, <><span className="sg-ic plain"><Lucide name="plus" /></span><span className="sg-tx"><b>Add all</b></span></>, i, "util");
          case "done":
            return row(o, <span className="sg-tx"><b>Done</b></span>, i, "util done");
          case "empty":
            return row(o, <span className="sg-tx quiet">Press Enter to search the name only</span>, i, "quiet");
        }
      })}
    </ul>
  );
}

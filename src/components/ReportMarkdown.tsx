"use client";

import { Children, Fragment, isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Info, Lightbulb, ShieldAlert, TriangleAlert } from "lucide-react";
import { parseReport } from "@/lib/report-md";
import { shownRefs } from "@/lib/report-refs";
import { NebiusCredit } from "./Credits";
import "./report-markdown.css";

const ALERT = {
  WARNING: { Icon: TriangleAlert, cls: "leak" },
  CAUTION: { Icon: ShieldAlert, cls: "scam" },
  TIP: { Icon: Lightbulb, cls: "tip" },
  NOTE: { Icon: Info, cls: "note" },
} as const;
type AlertType = keyof typeof ALERT;

const text = (n: ReactNode): string => Children.toArray(n).map((c) => (typeof c === "string" ? c : isValidElement<{ children?: ReactNode }>(c) ? text(c.props.children) : "")).join("");

/* Split "#Tag" words in plain text into pills. */
function withTags(children: ReactNode): ReactNode {
  return Children.map(children, (c) => {
    if (typeof c !== "string") return c;
    return c.split(/(#[A-Za-z][\w]*)/g).map((part, i) => (/^#[A-Za-z]/.test(part) ? <span key={i} className="rm-tag">{part}</span> : part));
  });
}

const components: Components = {
  p: ({ children }) => {
    const first = Children.toArray(children)[0];
    const bold = isValidElement(first) && first.type === "strong";
    return <p className={bold ? "rm-lead" : "rm-body"}>{withTags(children)}</p>;
  },
  strong: ({ children }) => <strong>{withTags(children)}</strong>,
  /* Links to our own pages stay in this tab; sources open in a new one. */
  a: ({ href, children }) => href?.startsWith("/")
    ? <a className="rm-chip" href={href}>{children}</a>
    : <a className="rm-chip" href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
  blockquote: ({ children }) => {
    const kids = Children.toArray(children).filter((c) => isValidElement(c));
    const first = kids[0];
    const raw = first && isValidElement<{ children?: ReactNode }>(first) ? text(first.props.children) : "";
    const m = raw.match(/^\s*\[!(\w+)\]/);
    const type = (m && m[1].toUpperCase() in ALERT ? m[1].toUpperCase() : "NOTE") as AlertType;
    const { Icon, cls } = ALERT[type];
    /* Drop the "[!TYPE]" marker from the first paragraph's first string. */
    const stripped = kids.map((k, i) => {
      if (i !== 0 || !isValidElement<{ children?: ReactNode }>(k) || !m) return k;
      const parts = Children.toArray(k.props.children);
      if (typeof parts[0] === "string") parts[0] = parts[0].replace(/^\s*\[!\w+\]\s*/, "");
      return <p key="first" className="rm-lead">{withTags(parts)}</p>;
    });
    return (
      <aside className={`rm-card rm-${cls}`}>
        <Icon className="rm-icon" aria-hidden size={20} />
        <div className="rm-card-body">{stripped}</div>
      </aside>
    );
  },
};

/* Each blank line separated block is one group: the block, then its references under it, outside the card. */
export default function ReportMarkdown({ markdown, credit = false }: { markdown: string; credit?: boolean }) {
  const blocks = parseReport(markdown).blocks;
  const groups = blocks.map((b) => ({ clean: b.markdown, refs: shownRefs(b.refs) }));
  /* The Nebius credit closes the first section: the lead line and the paragraph under it, or the lead alone. */
  const creditAt = credit && groups.length ? (blocks[1]?.kind === "para" && !blocks[0].markdown.startsWith(">") ? 1 : 0) : -1;
  return (
    <div className="rm">
      {groups.map((g, i) => (
        <div className="rm-group" key={i}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{g.clean}</ReactMarkdown>
          {g.refs.length > 0 && (
            <div className="rm-refs">
              {g.refs.map((r, j) => (
                <Fragment key={r.url}>
                  {j > 0 && " "}
                  <span className="rm-ref">
                  {j > 0 && "· "}
                  {r.internal ? <a href={r.url}>{r.label}</a>
                    : <a href={r.url} target="_blank" rel="noopener noreferrer">{r.label}</a>}
                  </span>
                </Fragment>
              ))}
            </div>
          )}
          {i === creditAt && <NebiusCredit />}
        </div>
      ))}
    </div>
  );
}

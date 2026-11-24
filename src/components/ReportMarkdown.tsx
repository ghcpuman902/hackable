"use client";

import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Info, Lightbulb, ShieldAlert, TriangleAlert } from "lucide-react";
import { parseReport } from "@/lib/report-md";
import { PATTERN_LIST } from "@/lib/patterns";
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
  a: ({ href, children }) => <a className="rm-chip" href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
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

/* A source that belongs to a scam pattern folds into one reference to that pattern's card on /patterns. */
const PATTERN_BY_SOURCE = new Map(PATTERN_LIST.flatMap((p) => p.sources.map((u) => [u, p] as const)));
function foldPatternRefs<T extends { url: string; label: string }>(refs: T[]): { url: string; label: string }[] {
  const out: { url: string; label: string }[] = [];
  for (const r of refs) {
    const p = PATTERN_BY_SOURCE.get(r.url);
    const ref = p ? { url: `/patterns#${p.id}`, label: p.name } : { url: r.url, label: r.label };
    if (!out.some((o) => o.url === ref.url)) out.push(ref);
  }
  return out;
}

const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

/* Each blank line separated block is one group: the block, then its references under it, outside the card. */
export default function ReportMarkdown({ markdown }: { markdown: string }) {
  const groups = parseReport(markdown).blocks.map((b) => ({ clean: b.markdown, refs: foldPatternRefs(b.refs) }));
  return (
    <div className="rm">
      {groups.map((g, i) => (
        <div className="rm-group" key={i}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{g.clean}</ReactMarkdown>
          {g.refs.length > 0 && (
            <div className="rm-refs">
              {g.refs.map((r, j) => (
                <span key={r.url}>
                  {j > 0 && " · "}
                  {r.url.startsWith("/") ? <a href={r.url}>{r.label}</a>
                    : <a href={r.url} target="_blank" rel="noopener noreferrer">{r.label.length > 28 ? host(r.url) : r.label}</a>}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

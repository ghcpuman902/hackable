/* Pure clean up and parsing of the model's markdown report. No React, no raw HTML. */
import { FLAG_TAG, NO_PROFILE_TAG, PROFILE_TAG } from "./report-tags";

const ALERTS = ["WARNING", "CAUTION", "TIP", "NOTE"];
const MAX_CARDS = 3;
const MAX_PARAS = 3;
const MAX_PLAIN_SENTENCES = 2;

export const ALLOWED_TAGS = [
  ...Object.values(PROFILE_TAG), NO_PROFILE_TAG, ...Object.values(FLAG_TAG),
];

type Block = { kind: "card"; type: string; text: string } | { kind: "para"; text: string; tagsOnly: boolean; heading: boolean };

export type CleanStats = {
  droppedLinks: string[];
  droppedCards: number;
  droppedTags: string[];
  headingsToBold: number;
  lintWarnings: string[];
};

const splitSentences = (t: string) => t.split(/(?<=[.!?](?:\[\^[^\]\s]+\])*)\s+(?=["“‘(*\[]?[\p{Lu}\d])/u).map((s) => s.trim()).filter(Boolean);

/* Bold sentence plus at most two plain sentences. */
function trimCard(text: string) {
  const m = text.match(/^(\*\*[^*]+\*\*(?:\[\^[^\]\s]+\])*)\s*(.*)$/);
  const lead = m ? m[1] : "";
  const all = splitSentences(m ? m[2] : text);
  const keep = all.slice(0, m ? MAX_PLAIN_SENTENCES : MAX_PLAIN_SENTENCES + 1);
  /* Footnote markers that sat in trimmed sentences move to the end of the last kept one. */
  const markers = (s: string) => s.match(/\[\^[^\]\s]+\]/g) ?? [];
  const have = new Set([...markers(lead), ...keep.flatMap(markers)]);
  const moved = [...new Set(all.slice(keep.length).flatMap(markers))].filter((x) => !have.has(x));
  if (moved.length) {
    if (keep.length) keep[keep.length - 1] += moved.join("");
    else return lead + moved.join("");
  }
  return [lead, ...keep].filter(Boolean).join(" ");
}

export const CARD_WORD_CAP = 45;

const wordCount = (s: string) => s.replace(/\[\^[^\]\s]+\]/g, "").replace(/\*\*/g, "").split(/\s+/).filter(Boolean).length;

/* Split text at sentence boundaries into parts of at most CARD_WORD_CAP words; a single long sentence stays whole. */
function splitLong(text: string): string[] {
  if (wordCount(text) <= CARD_WORD_CAP) return [text];
  const parts: string[] = [];
  let cur = "";
  /* The bold lead is its own sentence even though its full stop sits inside the bold. */
  const lead = text.match(/^(\*\*[^*]+\*\*(?:\[\^[^\]\s]+\])*)\s+(.*)$/);
  for (const s of lead ? [lead[1], ...splitSentences(lead[2])] : splitSentences(text)) {
    if (cur && wordCount(cur + " " + s) > CARD_WORD_CAP) { parts.push(cur); cur = s; }
    else cur = cur ? cur + " " + s : s;
  }
  if (cur) parts.push(cur);
  return parts;
}

/* Dashes become commas; hyphens inside words, links and handles stay. */
const noDashes = (t: string) => t.replace(/[ \t]*[—–][ \t]*/g, ", ").replace(/[ \t]+-[ \t]+/g, ", ");

const AMERICAN = /\b(organized|center|favorite|prioritize|color|behavior|realize|recognize|authorize|analyze|neighbor)\b/i;
const CHATTY = /^(sure|certainly|of course|hope this|let me know|here is|here's|i hope|feel free)\b/i;

export function cleanReportDetailed(md: string, whitelist: string[], allowedTags: string[] = ALLOWED_TAGS): { markdown: string | null; stats: CleanStats } {
  const dropped = new Set<string>();
  const droppedTags = new Set<string>();
  const stats: CleanStats = { droppedLinks: [], droppedCards: 0, droppedTags: [], headingsToBold: 0, lintWarnings: [] };
  const finish = (markdown: string | null) => {
    if (!markdown) stats.headingsToBold = 0;
    stats.droppedLinks = [...dropped];
    stats.droppedTags = [...droppedTags];
    return { markdown, stats };
  };
  const ok = (u: string) => whitelist.includes(u);

  let t = md.trim();
  /* Footnote definitions: keep the ones on the whitelist, written as "[^id]: [Label](url)". */
  const defs = new Map<string, string>();
  /* Two footnotes for the same page become one: the later id points at the first. */
  const alias = new Map<string, string>();
  const byUrl = new Map<string, string>();
  t = t.replace(/^\[\^([^\]\s]+)\]:[ \t]*(.*)$/gm, (_, id: string, rest: string) => {
    const m = rest.trim().match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (m && ok(m[2])) {
      const firstId = byUrl.get(m[2]);
      if (firstId && firstId !== id) alias.set(id, firstId);
      else if (!defs.has(id)) { defs.set(id, `[${m[1].trim()}](${m[2]})`); byUrl.set(m[2], id); }
    }
    else if (m) dropped.add(m[2]);
    return "";
  });
  const fenced = t.trim().match(/^```(?:\w+)?\n([\s\S]*?)\n```$/);
  if (fenced) t = fenced[1];

  /* Raw HTML never survives: anchors lose their tag (and their href is counted), script and style lose their content. */
  t = t.replace(/<a\s[^>]*?href=["']([^"']*)["'][^>]*>/gi, (m, u: string) => { if (!ok(u)) dropped.add(u); return " "; });
  t = t.replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, " ").replace(/<\/?[a-zA-Z][^>\n]*>/g, " ");

  /* Links: only whitelisted urls keep their href; bare urls off the whitelist are removed. */
  t = t.replace(/\[([^\]]*)\]\(([^)\s]*)\)/g, (_, label: string, url: string) => {
    if (ok(url)) return `[${label}](${url})`;
    dropped.add(url);
    return label;
  });
  t = t.replace(/(?<![(\w])https?:\/\/[^\s)<>\]]+/g, (u) => {
    const bare = u.replace(/[.,;:!?]+$/, "");
    if (ok(bare)) return u;
    dropped.add(bare);
    return "";
  }).replace(/[ \t]{2,}/g, " ");

  /* Drop chatter before the first bold line, card or heading. */
  const start = t.search(/^(?:\*\*|>|#)/m);
  if (start > 0) t = t.slice(start);
  t = t.trim();

  /* Headings become bold lines. */
  const headingTexts = new Set<string>();
  t = t.replace(/^#{1,6}[ \t]+(.+?)[ \t]*#*$/gm, (_, h: string) => {
    stats.headingsToBold++;
    const clean = h.replace(/\*+/g, "").trim();
    headingTexts.add(clean);
    return `**${clean}**`;
  });
  /* A card marker always starts a new block, even with no blank line before it. */
  t = t.replace(/\n(?=>[ \t]*\[!\w+\])/g, "\n\n");
  /* List items become plain sentences. */
  t = t.replace(/^(?:>[ \t]?)?[ \t]*(?:[-*+]|\d+[.)])[ \t]+(.+)$/gm, (line, item: string) => {
    const prefix = line.startsWith(">") ? "> " : "";
    return prefix + (/[.!?]$/.test(item.trim()) ? item.trim() : item.trim() + ".");
  });
  t = noDashes(t);

  const blocks: Block[] = [];
  for (const chunk of t.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").filter((l) => l.trim() !== "" && l.trim() !== ">");
    if (!lines.length) continue;
    if (lines[0].startsWith(">")) {
      const body = lines.map((l) => l.replace(/^>\s?/, ""));
      const m = body[0].match(/^\s*\[!(\w+)\]\s*(.*)$/);
      const type = m ? (ALERTS.includes(m[1].toUpperCase()) ? m[1].toUpperCase() : "NOTE") : "NOTE";
      const rest = [m ? m[2] : body[0], ...body.slice(1)].join(" ").replace(/\s+/g, " ").trim();
      if (!rest.replace(/[*_`\[\]()]/g, "").trim()) continue;
      blocks.push({ kind: "card", type, text: trimCard(rest) });
    } else {
      const text = lines.join(" ").replace(/\s+/g, " ").trim();
      if (!text.replace(/[*_`\[\]()#]/g, "").trim()) continue;
      if (CHATTY.test(text)) continue;
      const bareTags = text.replace(/`(#\w+)`/g, "$1");
      const tagsOnly = /^(?:#[A-Za-z]\w*\s*)+$/.test(bareTags);
      blocks.push({ kind: "para", text: bareTags, tagsOnly, heading: headingTexts.has(text.replace(/^\*\*|\*\*$/g, "")) });
    }
  }

  /* A usable report has a card or a real lead sentence. Headings and chatter alone fall back to the rules report. */
  const real = blocks.some((b) => b.kind === "card" || (!b.heading && !b.tagsOnly && b.text.startsWith("**")));
  if (!real) return finish(null);

  /* Keep at most 3 cards, the TIP always among them, in their original order. */
  const cards = blocks.filter((b) => b.kind === "card");
  const tip = cards.find((c) => c.kind === "card" && c.type === "TIP");
  const keepCards = new Set<Block>();
  if (tip) keepCards.add(tip);
  for (const c of cards) if (keepCards.size < MAX_CARDS) keepCards.add(c);
  stats.droppedCards = cards.length - keepCards.size;
  let paras = 0;
  const out: string[] = [];
  for (const b of blocks) {
    if (b.kind === "card") {
      if (keepCards.has(b)) for (const part of splitLong(b.text)) out.push(`> [!${b.type}]\n> ${part}`);
    } else if (b.tagsOnly) {
      const kept: string[] = [];
      for (const tag of b.text.split(/\s+/)) {
        if (allowedTags.includes(tag.slice(1))) kept.push(tag);
        else droppedTags.add(tag.slice(1));
      }
      if (kept.length) out.push(kept.join(" "));
    } else if (paras < MAX_PARAS) {
      paras++;
      const kept = b.text.replace(/(^|\s)#([A-Za-z]\w*)/g, (m, sp: string, tag: string) => (allowedTags.includes(tag) ? m : (droppedTags.add(tag), sp)));
      out.push(...splitLong(kept));
    }
  }
  let result = out.join("\n\n").trim();
  /* Markers need a kept definition; definitions need a marker. */
  const used = new Set<string>();
  result = result.replace(/\[\^([^\]\s]+)\](?!:)/g, (_, raw: string) => {
    const id = alias.get(raw) ?? raw;
    if (!defs.has(id)) return "";
    used.add(id);
    return `[^${id}]`;
  }).replace(/(\[\^[^\]\s]+\])\1+/g, "$1").replace(/ +([.,;:!?])/g, "$1").replace(/[ \t]{2,}/g, " ");
  if (!result) return finish(null);
  if (AMERICAN.test(result)) stats.lintWarnings.push("american-spelling");
  const defLines = [...defs].filter(([id]) => used.has(id)).map(([id, d]) => `[^${id}]: ${d}`);
  return finish(defLines.length ? result + "\n\n" + defLines.join("\n") : result);
}

export function cleanReportMarkdown(md: string, whitelist: string[]): string | null {
  return cleanReportDetailed(md, whitelist).markdown;
}

/* ---- Parsing the cleaned markdown into blocks, with footnote references split out of the cards. ---- */

const DEF = /^\[\^([^\]\s]+)\]:[ \t]*\[([^\]]+)\]\(([^)\s]+)\)[ \t]*$/;

export type Ref = { label: string; url: string };
export type ReportBlock = {
  kind: "card" | "para";
  type?: string;
  /* Markdown for this block with footnote markers removed. */
  markdown: string;
  /* The text after the bold lead sentence, markers removed. */
  plainText: string;
  refs: Ref[];
};
export type ParsedReport = {
  fallback: boolean;
  blocks: ReportBlock[];
  cards: { kind: string; footnotes: Ref[]; plainText: string }[];
  tags: string[];
  links: string[];
};

export function parseReport(md: string | null): ParsedReport {
  if (!md || !md.trim()) return { fallback: true, blocks: [], cards: [], tags: [], links: [] };
  const defs = new Map<string, Ref>();
  const body: string[] = [];
  for (const line of md.split("\n")) {
    const m = line.match(DEF);
    if (m) defs.set(m[1], { label: m[2], url: m[3] });
    else body.push(line);
  }
  const blocks: ReportBlock[] = body.join("\n").split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean).flatMap((chunk) => {
    const ids: string[] = [];
    const clean = chunk.replace(/\[\^([^\]\s]+)\](?!:)/g, (_, id: string) => {
      if (defs.has(id) && !ids.includes(id)) ids.push(id);
      return "";
    }).replace(/ +([.,;:!?])/g, "$1");
    const cardM = clean.match(/^>\s*\[!(\w+)\]/);
    const text = clean.replace(/^>[ \t]?\[!\w+\][ \t]*/, "").replace(/^>[ \t]?/gm, "");
    const plainText = text.replace(/^\*\*[^*]+\*\*\s*/, "").trim();
    return [{ kind: cardM ? "card" : "para", type: cardM ? cardM[1].toUpperCase() : undefined, markdown: clean, plainText, refs: ids.map((id) => defs.get(id)!) } as ReportBlock];
  });
  const tags = [...md.matchAll(/(?:^|\s)#([A-Za-z]\w*)/g)].map((m) => m[1]);
  const links = [
    ...[...md.matchAll(/\]\((https?:[^)\s]+)\)/g)].map((m) => m[1]),
    ...[...md.matchAll(/(?<![(\w])https?:\/\/[^\s)<>\]]+/g)].map((m) => m[0].replace(/[.,;:!?]+$/, "")),
  ];
  return {
    fallback: !blocks.length,
    blocks,
    cards: blocks.filter((b) => b.kind === "card").map((b) => ({ kind: b.type!, footnotes: b.refs, plainText: b.plainText })),
    tags,
    links: [...new Set(links)],
  };
}

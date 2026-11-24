/* Pure clean up of the model's markdown report. Returns null when nothing useful is left. */
const ALERTS = ["WARNING", "CAUTION", "TIP", "NOTE"];
const MAX_CARDS = 3;
const MAX_PARAS = 3;
const MAX_SENTENCES = 3;

type Block = { kind: "card"; type: string; text: string } | { kind: "para"; text: string };

const splitSentences = (t: string) => t.split(/(?<=[.!?])\s+(?=["“‘(*\[]?[\p{Lu}\d])/u).map((s) => s.trim()).filter(Boolean);

function stripLinks(t: string, whitelist: string[]) {
  return t.replace(/\[([^\]]*)\]\(([^)\s]*)\)/g, (_, label: string, url: string) => (whitelist.includes(url) ? `[${label}](${url})` : label));
}

/* Dashes become commas; hyphens inside words, links and handles stay. */
const noDashes = (t: string) => t.replace(/\s*[—–]\s*/g, ", ").replace(/\s+-\s+/g, ", ");

export function cleanReportMarkdown(md: string, whitelist: string[]): string | null {
  let t = md.trim();
  const fenced = t.match(/^```(?:\w+)?\n([\s\S]*?)\n```$/);
  if (fenced) t = fenced[1];
  /* Drop chatter before the first bold line, card or tag, and after the last blank line block that looks like prose. */
  const start = t.search(/^(?:\*\*|>|#)/m);
  if (start > 0) t = t.slice(start);
  t = t.trim();

  /* Headings become bold lines. */
  t = t.replace(/^#{1,3}[ \t]+(.+?)[ \t]*#*$/gm, (_, h: string) => `**${h.replace(/\*+/g, "").trim()}**`);
  t = noDashes(t);

  const blocks: Block[] = [];
  for (const chunk of t.split(/\n\s*\n/)) {
    const lines = chunk.split("\n");
    if (lines[0].startsWith(">")) {
      const body = lines.map((l) => l.replace(/^>\s?/, ""));
      const m = body[0].match(/^\s*\[!(\w+)\]\s*(.*)$/);
      const type = m ? (ALERTS.includes(m[1].toUpperCase()) ? m[1].toUpperCase() : "NOTE") : "NOTE";
      const rest = [m ? m[2] : body[0], ...body.slice(1)].join(" ").replace(/\s+/g, " ").trim();
      const text = stripLinks(rest, whitelist);
      if (!text.replace(/[*_`\[\]()]/g, "").trim()) continue;
      /* Links sit at the end of a card and do not count as sentences. */
      const linkStart = text.search(/\[[^\]]+\]\([^)]+\)(?:\s*(?:[,·]|and)?\s*\[[^\]]+\]\([^)]+\))*\s*$/);
      const prose = linkStart > 0 ? text.slice(0, linkStart).trim() : text;
      const links = linkStart > 0 ? text.slice(linkStart).trim() : "";
      const kept = splitSentences(prose).slice(0, MAX_SENTENCES).join(" ");
      blocks.push({ kind: "card", type, text: (kept + (links ? ` ${links}` : "")).trim() });
    } else {
      const text = stripLinks(lines.join(" ").replace(/\s+/g, " ").trim(), whitelist);
      if (text.replace(/[*_`\[\]()#]/g, "").trim()) blocks.push({ kind: "para", text });
    }
  }

  /* Keep at most 3 cards, the TIP always among them, in their original order. */
  const cards = blocks.filter((b) => b.kind === "card");
  const tip = cards.find((c) => c.kind === "card" && c.type === "TIP");
  const keepCards = new Set<Block>();
  if (tip) keepCards.add(tip);
  for (const c of cards) if (keepCards.size < MAX_CARDS) keepCards.add(c);
  let paras = 0;
  const out: string[] = [];
  for (const b of blocks) {
    if (b.kind === "card") {
      if (!keepCards.has(b)) continue;
      out.push(`> [!${b.type}]\n> ${b.text}`);
    } else if (paras < MAX_PARAS) {
      paras++;
      /* Tags written as inline code become plain tags. */
      out.push(b.text.replace(/`(#\w+)`/g, "$1"));
    }
  }
  const result = out.join("\n\n").replace(/`(#\w+)`/g, "$1").trim();
  return result ? result : null;
}

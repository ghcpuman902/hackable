import { describe, expect, it } from "vitest";
import type { FlagHit } from "../flags";
import type { Findings } from "../pattern-score";
import { cleanReportMarkdown, parseReport } from "../report-md";
import { attachSources, evidenceFrom, SERVICE_PAGES } from "../report-sources";
import { shownRefs } from "../report-refs";

const FINDINGS: Findings = {
  github: { found: "Found: email in commits", hit: true, source: "live", facts: { urls: ["https://github.com/octo", "https://github.com/octo/tool"] } },
  social: { found: "Found: Gravatar", hit: true, source: "live", facts: { profiles: ["Gravatar"], urls: ["https://gravatar.com/octo"] } },
  hibpTest: { found: "Found: 3 breaches", hit: true, source: "live", facts: { breaches: [{ name: "Canva" }], checked: ["LeakCheck", "XposedOrNot"] } },
  hudsonRock: { found: "No stealer logs found", hit: false, source: "live" },
  web: { found: "Found: 2 results", hit: false, source: "live", facts: { urls: ["https://example.org/talk", "https://example.net/post"] } },
  linkedin: { found: "x", hit: false, source: "skipped", facts: { urls: ["https://linkedin.com/in/should-not-show"] } },
};
const FLAGS: FlagHit[] = [
  { id: "in-the-news", state: "yes", evidence: "", urls: ["https://news.example.com/a"] },
  { id: "just-changed-jobs", state: "maybe", evidence: "", urls: ["https://maybe.example.com/b"] },
];

/* A written report with no footnotes at all: code has to supply every link. */
const MD = [
  "**You are The Open Builder: your code and your email are easy to find.**",
  "Your work is public and people can see where you write code.",
  "> [!WARNING]\n> **Your email is in several breaches.** Old accounts leaked it with other details.",
  "> [!CAUTION]\n> **A fake recruiter could send you a coding test.** The repo would carry malware.",
  "> [!TIP]\n> **Run unknown code in a throwaway machine.** Keep your main laptop clean.",
].join("\n\n");

const evidence = evidenceFrom(FINDINGS, FLAGS);
const allowed = new Set([...evidence.map((e) => e.url), "/patterns#contagious-interview"]);

describe("evidenceFrom", () => {
  it("collects only URLs the checks returned, plus the services that answered", () => {
    const urls = evidence.map((e) => e.url);
    expect(urls).toEqual(expect.arrayContaining([
      "https://github.com/octo", "https://github.com/octo/tool", "https://gravatar.com/octo", "https://news.example.com/a",
      SERVICE_PAGES.leakcheck.url, SERVICE_PAGES.xposedornot.url, "https://example.org/talk",
    ]));
    expect(urls).not.toContain("https://maybe.example.com/b");
    expect(urls).not.toContain("https://linkedin.com/in/should-not-show");
    expect(urls).not.toContain(SERVICE_PAGES.hudsonrock.url);
    expect(urls.every((u) => u.startsWith("https://"))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("finds nothing for an empty scan", () => {
    expect(evidenceFrom({}, [])).toEqual([]);
  });
});

describe("attachSources", () => {
  const picks = [{ id: "contagious-interview", name: "Fake job coding test", signals: ["github-profile", "public-commit-email"] as const }];
  const out = attachSources(cleanReportMarkdown(MD, [])!, evidence, picks.map((p) => ({ ...p, signals: [...p.signals] })));
  const parsed = parseReport(out);

  it("gives every card and the summary at least one finding link", () => {
    const cards = parsed.blocks.filter((b) => b.kind === "card");
    expect(cards.map((c) => c.type)).toEqual(["WARNING", "CAUTION", "TIP"]);
    for (const b of [parsed.blocks[0], ...cards]) expect(b.refs.some((r) => evidence.some((e) => e.url === r.url)), b.markdown).toBe(true);
  });

  it("uses only allowed URLs", () => {
    for (const b of parsed.blocks) for (const r of b.refs) expect(allowed.has(r.url), r.url).toBe(true);
  });

  it("matches links to what the card is about", () => {
    const warn = parsed.blocks.find((b) => b.type === "WARNING")!;
    /* A breach card links a breach service that answered, not GitHub or a web result. */
    expect([SERVICE_PAGES.leakcheck.url, SERVICE_PAGES.xposedornot.url]).toContain(warn.refs[0].url);
    const caution = parsed.blocks.find((b) => b.type === "CAUTION")!;
    expect(caution.refs.map((r) => r.url)).toEqual(["/patterns#contagious-interview", "https://github.com/octo"]);
  });

  it("the caution card's pattern link is internal and names the picked pattern", () => {
    const caution = parsed.blocks.find((b) => b.type === "CAUTION")!;
    expect(shownRefs(caution.refs)[0]).toEqual({ url: "/patterns#contagious-interview", label: "Fake job coding test", internal: true });
  });

  it("keeps a card's own finding link and adds nothing more", () => {
    const md = "**Lead.**[^1]\n\n> [!TIP]\n> **Tip.**[^1]\n\n[^1]: [GitHub](https://github.com/octo)";
    expect(attachSources(md, evidence)).toBe(md);
  });

  it("is a no op on an empty report and with no evidence", () => {
    expect(attachSources("", evidence)).toBe("");
    const md = "**Lead.**\n\n> [!TIP]\n> **Tip.**";
    expect(attachSources(md, [])).toBe(md);
  });
});

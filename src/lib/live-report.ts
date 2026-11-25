/* The live report pipeline (server only): findings, signals, classifier, deterministic picks, the written report,
   then the source links attached in code. */
import type { LanguageModel } from "ai";
import { classifyProfile } from "./classify";
import type { FlagHit, SelfFlagId } from "./flags";
import { describePick, pickPatterns, SELF_TRAITS, signalsFrom, withTraitSignals, type Classification, type Findings } from "./pattern-score";
import { PATTERNS, type PatternId } from "./patterns";
import { generateReportMarkdown, picksWhitelist } from "./reason";
import { cleanReportMarkdown } from "./report-md";
import { attachSources, evidenceFrom } from "./report-sources";
import type { Trait } from "../data/pattern-catalogue";

export type LiveRaw = { query?: unknown; findings?: Findings; pivots?: unknown; flags?: FlagHit[]; selfFlags?: SelfFlagId[] };
export type LiveReport = { markdown: string; patterns: PatternId[]; profile: Classification["profile"]; traits: Trait[]; by: Classification["by"]; note?: string; reasons: string[] };

/* Signals, classification and picks. Used by the route, and by the client (with the fallback classifier) when no report was written. */
export async function scoreLive(raw: LiveRaw, model?: LanguageModel | null) {
  const findings = raw.findings ?? {};
  const flags = (raw.flags ?? []).filter((f) => f && f.state === "yes");
  const self = (raw.selfFlags ?? []).map((f) => SELF_TRAITS[f]).filter((t): t is Trait => !!t);
  const base = signalsFrom(findings, flags);
  const cls = await classifyProfile({ query: raw.query, findings, flags, pivots: raw.pivots }, base, self, model);
  const signals = withTraitSignals(base, cls.traits);
  const picks = pickPatterns({ signals, profile: cls.profile, traits: cls.traits }).filter((p) => p.id in PATTERNS);
  return { findings, flags, signals, cls, picks };
}

export async function buildLiveReport(raw: LiveRaw, write: (raw: unknown, picks: string[]) => Promise<string> = generateReportMarkdown): Promise<LiveReport> {
  const { findings, flags, cls, picks } = await scoreLive(raw);
  const ids = picks.map((p) => p.id as PatternId);
  const reasons = picks.map(describePick);
  const md = await write({ query: raw.query, findings, pivots: raw.pivots, flags }, ids).catch(() => "");
  const evidence = evidenceFrom(findings, flags);
  /* Links the scan actually found are allowed alongside the picked patterns' sources and the learn links. */
  const found = JSON.stringify({ findings, flags }).match(/https?:\/\/[^\s"\\<>]+/g) ?? [];
  const clean = md ? cleanReportMarkdown(md, [...picksWhitelist(ids), ...found]) ?? "" : "";
  const markdown = clean ? attachSources(clean, evidence, picks.map((p) => ({ id: p.id, name: PATTERNS[p.id as PatternId].name, signals: p.reasons.signals.map((s) => s.signal) }))) : "";
  return { markdown, patterns: ids, profile: cls.profile, traits: cls.traits, by: cls.by, note: cls.note, reasons };
}

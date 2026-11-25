"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, getStaticToolName, isStaticToolUIPart } from "ai";
import { Lucide, Tile } from "./icons";
import { Logo, type CardState } from "./Fan";
import { ScanRows } from "./ScanRows";
import { FINDINGS, FinalSec, liveFindings, PatternList, presetFindings, type Outputs } from "./Report";
import { tagLine, tagsFor, withTagLine } from "@/lib/report-tags";
import { BRAND_BG, BrandIcon } from "./brand-icons";
import { detect, isStrong, KIND_LABEL, tokenize, type Chip } from "@/lib/chips";
import { outputFlags, type FlagHit, type FlagId, type SelfFlagId } from "@/lib/flags";
import { patternsFor, PROFILE_ID, type PatternId, type Profile, type ProfileId } from "@/lib/patterns";
import { fromSignals, pickPatterns, SELF_TRAITS, signalsFrom, withTraitSignals, type Classification, type Findings } from "@/lib/pattern-score";
import ReportMarkdown from "./ReportMarkdown";
import PatternCards from "./PatternCards";
import EmptyResult, { ScanFailed } from "./EmptyResult";
import { scanFailed } from "@/lib/scan-outcome";
import { chipsFromSearch, historyMode, scanSearch } from "@/lib/scan-url";
import { dedupePivots, type Pivot } from "@/lib/pivots";
import LandingBadge from "./LandingBadge";

/* The one lesson shown when no check found a risk. */
const SAFE_ANYWAY = "> [!TIP]\n> **Stay safe anyway.** Treat any unexpected message that asks you to log in, pay or install something as fake until you check it another way. Use a different password for every account and turn on two step sign in.";
import { SubscribeCard } from "./SubscribeCard";
import { TavilyCredit } from "./Credits";
import { DemoNoticeButton, DemoNoticeProvider } from "./DemoNoticeDialog";
import { DEMO_REPORT, PRESET_REPORTS } from "@/lib/preset-reports";
import { LIVE_DEMO_CHIPS, PRESETS, presetFor } from "@/lib/presets";
import { CAT_PREFIX, isNameQuery, normUrl, prefixOf, SITES, sitesFor, SUG_MIN, type SugCat, type SugExtra, type SugGroup } from "@/lib/suggest";
import { Suggest, type Opt } from "./Suggest";
import type { Brand } from "./brand-icons";
import type { ScanMessage } from "@/lib/scan-tools";
import { DEMO_CHIPS, EXTRA_PATTERNS, fanFor, isDemoQuery, LEAD_PATTERNS, PEOPLE, SOURCES, type Found, type ScanTool } from "@/lib/synthetic";

/* Where each recent person was found: one small badge on the avatar cycles through these. */
const MINI: Record<Found, { c: string; icon: ReactNode }> = {
  linkedin: { c: BRAND_BG.linkedin, icon: <BrandIcon name="linkedin" /> },
  github: { c: BRAND_BG.github, icon: <BrandIcon name="github" /> },
  breach: { c: "#e5484d", icon: <Lucide name="shield-alert" w={2} /> },
  forum: { c: BRAND_BG.hackernews, icon: <BrandIcon name="hackernews" /> },
  x: { c: BRAND_BG.x, icon: <BrandIcon name="x" /> },
  social: { c: BRAND_BG.instagram, icon: <BrandIcon name="instagram" /> },
  phone: { c: "#009767", icon: <Lucide name="phone-call" w={2} /> },
  web: { c: "#00a5ef", icon: <Lucide name="globe" w={2} /> },
};
/* Source pills with a profile prefix insert it into the search box when tapped. */
const SRC_PREFIX: Record<string, string> = { LinkedIn: "linkedin.com/in/", GitHub: "github.com/" };
const srcBody = (s: (typeof SOURCES)[number]) => (
  <><span className="ti" style={{ "--c": s.c } as CSSProperties}>{"brand" in s.icon ? <BrandIcon name={s.icon.brand} /> : <Lucide name={s.icon.lucide} w={2} />}</span>{s.n}</>
);

/* What the suggestion list does for the text in the box.
   sites: a partial site name ("link") offers that site's prefix. complete: a prefix with no live search (x.com/...) offers itself.
   search: a name (or the text after a searchable prefix) is searched in every category, or only the prefix's one. */
type Plan =
  | { kind: "sites"; sites: typeof SITES }
  | { kind: "complete"; value: string; brand: Brand | null }
  | { kind: "search"; q: string; cat: SugCat | null; key: string; prefix: string | null };
function planFor(text: string | null, live: boolean): Plan | null {
  if (text === null || !text.trim()) return null;
  const pre = prefixOf(text);
  if (pre) {
    const rest = pre.rest.trim();
    if (!rest) return null;
    if (!pre.site.cat || !live || rest.length < SUG_MIN) return { kind: "complete", value: pre.site.prefix + rest, brand: brandOf(pre.site.key) };
    return { kind: "search", q: rest, cat: pre.site.cat, key: `${pre.site.cat}|${rest.toLowerCase()}`, prefix: pre.site.prefix };
  }
  const sites = sitesFor(text);
  if (sites.length) return { kind: "sites", sites };
  if (live && isNameQuery(text) && !presetFor(text)) return { kind: "search", q: text.trim(), cat: null, key: `all|${text.trim().toLowerCase()}`, prefix: null };
  return null;
}
const BRANDS: string[] = ["linkedin", "github", "instagram", "x"];
const brandOf = (key: string) => (BRANDS.includes(key) ? (key as Brand) : null);
const PASTE = ["Paste your name", "Paste your phone number", "Paste your email", "Paste your LinkedIn"];
/* Chip order: people and presets alternate, so the famous ones are mixed in. */
const CHIP_ORDER = Array.from({ length: Math.max(PEOPLE.length, PRESETS.length) }, (_, i) => [
  ...(i < PEOPLE.length ? [{ kind: "person" as const, i }] : []),
  ...(i < PRESETS.length ? [{ kind: "preset" as const, i }] : []),
]).flat();
const PRELOAD_MS = 10 * 60 * 1000;
const REASON_MS = 22_000;

const PROFILE_LABEL = Object.fromEntries(Object.entries(PROFILE_ID).map(([label, id]) => [id, label])) as Record<Exclude<ProfileId, "no-profile">, Profile>;
/* The scoring with the deterministic classifier, for a live report the server did not write. */
function localPicks(findings: Findings, flags: FlagHit[], self: SelfFlagId[]): PatternId[] {
  const base = signalsFrom(findings, flags);
  const cls = fromSignals(base, self.flatMap((f) => SELF_TRAITS[f] ?? []));
  return pickPatterns({ signals: withTraitSignals(base, cls.traits), profile: cls.profile, traits: cls.traits }).map((p) => p.id as PatternId);
}

const transport = new DefaultChatTransport<ScanMessage>({ api: "/api/scan" });
const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");

/* The face sits over the initials and only shows once it has loaded, so a missing file leaves the initials. */
function Avatar({ name, av, img, children }: { name: string; av: string; img?: string; children?: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={"avw" + (children ? " notch" : "")}>
      <span className="av" style={{ "--av": av } as CSSProperties}>
        {initials(name)}
        {img && <Image className="av-img" src={img} width={32} height={32} alt="" unoptimized style={{ opacity: loaded ? 1 : 0 }} onLoad={(e) => { if (e.currentTarget.naturalWidth > 0) setLoaded(true); }} />}
      </span>
      {children}
    </span>
  );
}

let uid = 0;

/* live: SCAN_MODE=live on the server. The list then drops the cards with no live source, and the report is built from the live results. */
export default function SearchFlow({ live = false }: { live?: boolean }) {
  return <DemoNoticeProvider><SearchFlowInner live={live} /></DemoNoticeProvider>;
}

function SearchFlowInner({ live }: { live: boolean }) {
  const [chips, setChipsState] = useState<Chip[]>([]);
  const chipsRef = useRef<Chip[]>([]);
  const setChips = (next: Chip[]) => { chipsRef.current = next; setChipsState(next); };
  const [shake, setShake] = useState<{ id: number; n: number } | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [entry, setEntry] = useState("");
  const [running, setRunning] = useState(false);
  const [showAll, setShowAll] = useState(false);
  /* What the person ticks themselves (moved home, big life event, selling online, travelling soon). Never inferred. */
  const [selfFlags, setSelfFlags] = useState<SelfFlagId[]>([]);
  const [scanId, setScanId] = useState(0);
  /* The chips the current report was made from. Editing the box afterwards must not rewrite that report. */
  const [scanned, setScanned] = useState<Chip[]>([]);
  const entryRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const armed = useRef(false);

  const { messages, sendMessage, setMessages, stop, status } = useChat<ScanMessage>({ transport });
  /* Live scans also ask /api/flags for the flags that need their own lookups (same username, in the news, job change). */
  const [netFlags, setNetFlags] = useState<FlagHit[] | null>(null);
  const flagsCtl = useRef<AbortController | null>(null);
  /* A preset opens a cached profile on the live card list, in either mode. */
  const scannedText = scanned.map((c) => c.raw).join(", ");
  const preset = running ? presetFor(scannedText) : undefined;
  /* Jane Doe Smith (the demo person) is cached as well. Cached reports run the same steps, compressed (QUICK). */
  const demo = running && !preset && isDemoQuery(scannedText);
  const quick = !!preset || demo;
  const fan = fanFor(!demo && (live || !!preset));

  const add = useCallback((text: string, at?: number) => {
    const cur = chipsRef.current;
    const made = tokenize(text).map((raw) => ({ id: ++uid, raw, ...detect(raw) }));
    const out: Chip[] = [];
    for (const c of made) {
      const dupe = [...cur, ...out].find((x) => x.label.toLowerCase() === c.label.toLowerCase());
      if (dupe) { setShake({ id: dupe.id, n: Date.now() }); continue; }
      out.push(c);
    }
    const next = [...cur];
    next.splice(at ?? next.length, 0, ...out);
    setChips(next);
  }, []);

  const remove = (id: number) => setChips(chipsRef.current.filter((c) => c.id !== id));
  const commit = () => { const v = entryRef.current?.value ?? ""; setEntry(""); if (entryRef.current) entryRef.current.value = ""; if (v.trim()) add(v); };

  useEffect(() => { if (!shake) return; const t = setTimeout(() => setShake(null), 300); return () => clearTimeout(t); }, [shake]);

  /* Empty box: one placeholder line loops through what you can paste (CSS only, hidden on focus). */
  const empty = !chips.length && !entry && !running;

  /* Card states come straight from the typed tool parts of the streaming assistant message. */
  const assistant = messages.findLast((m) => m.role === "assistant");
  const states: Partial<Record<ScanTool, CardState>> = {};
  const found: Partial<Record<ScanTool, string>> = {};
  const outputs: Outputs = {};
  const received: Pivot[] = [];
  for (const p of assistant?.parts ?? []) {
    if (p.type === "data-pivot") received.push(p.data);
    if (!isStaticToolUIPart(p)) continue;
    const name = getStaticToolName(p) as ScanTool;
    if (p.state === "output-available") {
      states[name] = p.output.hit ? "hit" : "ok";
      if (!p.output.empty) found[name] = p.output.found;
      outputs[name] = p.output;
    }
    else if (p.state === "input-streaming" || p.state === "input-available") states[name] = "checking";
  }
  const pivots = dedupePivots(received);
  const settled = fan.every((c) => states[c.tool] === "ok" || states[c.tool] === "hit");
  const flagsIn = !live || quick || netFlags !== null;
  const done = running && flagsIn && (status === "error" || (status === "ready" && settled));

  /* `busy` is a scan in flight. Once it has finished (or failed) the box works again, so a search can follow a search. */
  const busy = running && !done;
  const disabled = busy || !(chips.length || entry.trim());

  /* ---- suggestions: typeahead sites, prefix search and name search (find and confirm) ---- */
  const [sugQ, setSugQ] = useState<string | null>(null);
  const [active, setActive] = useState(-1);
  const [res, setRes] = useState<{ key: string; groups: SugGroup[] | null } | null>(null);
  const [sugCache, setSugCache] = useState<Record<string, SugGroup[]>>({});
  const plan = busy ? null : planFor(sugQ, live);
  const planKey = plan?.kind === "search" ? plan.key : null;

  /* Debounced 350ms, cached per query, and the request in flight is cancelled whenever the text changes. */
  useEffect(() => {
    if (!plan || plan.kind !== "search" || sugCache[plan.key]) return;
    const { q, cat, key } = plan;
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch("/api/suggest", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q, cat }), signal: ctl.signal })
        .then((r) => (r.ok ? (r.json() as Promise<{ groups: SugGroup[] }>) : Promise.reject(new Error("suggest"))))
        .then(({ groups }) => { if (groups.every((g) => !g.failed)) setSugCache((c) => ({ ...c, [key]: groups })); setRes({ key, groups }); })
        .catch(() => { if (!ctl.signal.aborted) setRes({ key, groups: null }); });
    }, 350);
    return () => { clearTimeout(t); ctl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey]);

  const groups = planKey ? sugCache[planKey] ?? (res?.key === planKey ? res.groups : undefined) : undefined;

  /* Enrich the visible rows after they show: photos and GitHub org or top repo. Kept per row value, like the query cache. */
  const [extra, setExtra] = useState<Record<string, SugExtra>>({});
  const want = (groups ?? []).flatMap((g) => g.rows.map((r) => r.value)).filter((v) => !(v in extra)).slice(0, 6);
  const wantKey = want.join("|");
  useEffect(() => {
    if (!wantKey) return;
    const ctl = new AbortController();
    fetch("/api/suggest", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ enrich: wantKey.split("|") }), signal: ctl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<{ extras: Record<string, SugExtra> }>) : Promise.reject(new Error("enrich"))))
      .then(({ extras }) => setExtra((x) => ({ ...x, ...Object.fromEntries(wantKey.split("|").map((v) => [v, extras[v] ?? {}])) })))
      .catch(() => {});
    return () => ctl.abort();
  }, [wantKey]);
  const opts: Opt[] = (() => {
    if (!plan) return [];
    if (plan.kind === "sites") return plan.sites.map((x) => ({ kind: "site", brand: brandOf(x.key), title: x.n, prefix: x.prefix }));
    if (plan.kind === "complete") return [{ kind: "prefix", cat: null, brand: plan.brand, value: plan.value, insert: false }];
    if (groups === undefined) return plan.kind === "search" ? [{ kind: "searching" }] : [];
    /* A group that failed or timed out falls back quietly to its prefix (or, after a prefix, to the typed profile). */
    const fallback = (c: SugCat): Opt[] => plan.prefix ? [{ kind: "prefix", cat: c, brand: brandOf(c), value: plan.prefix + plan.q, insert: false }]
      : CAT_PREFIX[c] ? [{ kind: "prefix", cat: c, brand: brandOf(c), value: CAT_PREFIX[c], insert: true }] : [];
    const list: Opt[] = groups === null
      ? (plan.cat ? [plan.cat] : (["linkedin", "github", "instagram"] as SugCat[])).flatMap(fallback)
      : groups.flatMap((g): Opt[] => g.failed ? fallback(g.cat) : g.rows.map((r) => ({ kind: "add", ...r,
        img: extra[r.value]?.img ?? r.img, detail: extra[r.value]?.detail ?? r.detail })));
    const adds = list.filter((o) => o.kind === "add").length;
    if (!list.length) return plan.prefix ? fallback(plan.cat!) : [{ kind: "empty" }];
    return [...list, ...(adds >= 2 ? [{ kind: "all" } as Opt] : []), { kind: "done" }];
  })();
  const open = opts.length > 0;
  const hasIn = (list: Chip[], value: string) => list.some((c) => normUrl(c.label) === normUrl(value));
  const has = (value: string) => hasIn(chipsRef.current, value);
  const added = (o: Opt) => (o.kind === "add" || o.kind === "prefix") && hasIn(chips, o.value);

  const closeSug = () => { setSugQ(null); setActive(-1); };
  const insertPrefix = (prefix: string) => {
    setEntry(prefix); setSugQ(prefix); setActive(-1);
    const el = entryRef.current;
    if (el) { el.value = prefix; el.focus(); el.setSelectionRange(prefix.length, prefix.length); }
  };
  const clearEntry = () => { setEntry(""); if (entryRef.current) entryRef.current.value = ""; };
  /* The typed name becomes a chip with the first profile added, so we know the person. */
  const addFound = (value: string) => {
    if (has(value)) return;
    if (plan?.kind === "search" && !plan.prefix && sugQ && !has(sugQ)) add(sugQ.trim());
    add(value);
    clearEntry();
  };
  const pick = (i: number) => {
    const o = opts[i];
    if (!o) return;
    if (o.kind === "add") addFound(o.value);
    else if (o.kind === "site") insertPrefix(o.prefix);
    else if (o.kind === "prefix") { if (o.insert) insertPrefix(o.value); else { addFound(o.value); closeSug(); } }
    else if (o.kind === "all") opts.forEach((x) => { if (x.kind === "add") addFound(x.value); });
    else if (o.kind === "done") closeSug();
    entryRef.current?.focus();
  };

  /* An outside tap closes the list. */
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!fieldRef.current?.closest("form")?.contains(e.target as Node)) closeSug(); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  /* ---- preload: each chip's live checks start in the background as soon as it is added (live mode only).
     The server keeps every call for 10 minutes, so pressing search reuses them; nothing shows before search.
     Removing a chip aborts its preload. ?nopreload turns it off for timing. ---- */
  const preloads = useRef(new Map<string, { ctl: AbortController; t: number }>());
  useEffect(() => {
    if (!live || busy || new URLSearchParams(location.search).has("nopreload")) return;
    const want = new Map(chips.filter((c) => !presetFor(c.raw)).map((c) => [normUrl(c.label), c.raw]));
    for (const [k, p] of preloads.current) if (!want.has(k)) { p.ctl.abort(); preloads.current.delete(k); }
    for (const [k, raw] of want) {
      const p = preloads.current.get(k);
      if (p && Date.now() - p.t < PRELOAD_MS) continue;
      const ctl = new AbortController();
      preloads.current.set(k, { ctl, t: Date.now() });
      fetch("/api/preload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: raw }), signal: ctl.signal })
        .catch(() => { if (preloads.current.get(k)?.ctl === ctl) preloads.current.delete(k); });
    }
  }, [chips, live, busy]);

  const pill = (s: (typeof SOURCES)[number]) => SRC_PREFIX[s.n]
    ? <button key={s.n} type="button" className="src" onClick={() => insertPrefix(SRC_PREFIX[s.n])}>{srcBody(s)}</button>
    : <span key={s.n} className="src">{srcBody(s)}</span>;

  /* Shown flags: only "yes". A namesake in the news or an undated new role stays out. */
  const flagHits = [...(netFlags ?? []), ...outputFlags(outputs)].filter((f) => f.state === "yes");
  const flags: FlagId[] = flagHits.map((f) => f.id);

  /* Live runs: the server picks the scam patterns (classifier, then deterministic scoring) and Nemotron writes the
     report about them; links to the findings are attached in code. "" means fall back to the rules report. */
  const [liveMd, setLiveMd] = useState<{ key: string; md: string; patterns: PatternId[]; profile: Classification["profile"] } | null>(null);
  const liveHits = fan.filter((c) => states[c.tool] === "hit").length;
  const wantMd = done && live && !quick && !preset && liveHits > 0 && status !== "error";
  const outputsJson = wantMd ? JSON.stringify({ query: scanned.map((c) => c.label), findings: outputs, pivots, flags: flagHits, selfFlags }) : "";
  useEffect(() => {
    if (!outputsJson) return;
    let alive = true;
    /* Longer than the server's classifier (4s) plus its model deadline (15s), so a slow model still gives the written report. */
    type Reason = { markdown?: string; patterns?: PatternId[]; profile?: Classification["profile"] };
    fetch("/api/reason", { method: "POST", headers: { "content-type": "application/json" }, body: outputsJson, signal: AbortSignal.timeout(REASON_MS) })
      .then((r) => r.json() as Promise<Reason>).catch((): Reason => ({}))
      .then((d) => { if (alive) setLiveMd({ key: outputsJson, md: d.markdown ?? "", patterns: d.patterns ?? [], profile: d.profile ?? "none" }); });
    return () => { alive = false; };
  }, [outputsJson]);
  const mdNow = wantMd ? (liveMd?.key === outputsJson ? liveMd.md : null) : "";
  const livePicks = wantMd && liveMd?.key === outputsJson ? liveMd : null;

  const scan = useCallback((list: Chip[]) => {
    setSelfFlags([]);
    setScanned(list);
    setScanId((n) => n + 1);
    setSugQ(null);
    setShowAll(new URLSearchParams(location.search).has("all"));
    setMessages([]);
    setRunning(true);
    const text = list.map((c) => c.raw).join(", ");
    flagsCtl.current?.abort();
    setNetFlags(null);
    if (live && !presetFor(text) && !isDemoQuery(text)) {
      const ctl = new AbortController();
      flagsCtl.current = ctl;
      /* A lookup that never answers must not hold the report back: after 25s the flags are taken as none. */
      fetch("/api/flags", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query: text }), signal: AbortSignal.any([ctl.signal, AbortSignal.timeout(25_000)]) })
        .then((r) => r.json() as Promise<{ flags?: FlagHit[] }>)
        .then((j) => { if (flagsCtl.current === ctl) setNetFlags(j.flags ?? []); })
        .catch(() => { if (flagsCtl.current === ctl && !ctl.signal.aborted) setNetFlags([]); });
      // A timeout aborts only the combined signal, so ctl.signal.aborted stays false and the catch above sets [].
    }
    void sendMessage({ text });
  }, [live, sendMessage, setMessages]);

  /* A clean landing, as a refresh would give: no scan, no chips, an empty box, no suggestions, top of the page. */
  const reset = useCallback(() => {
    void stop();
    flagsCtl.current?.abort();
    setMessages([]);
    setRunning(false);
    setScanned([]);
    setNetFlags(null);
    setSelfFlags([]);
    setChips([]);
    setEditing(null);
    setSel(null);
    setEntry("");
    if (entryRef.current) entryRef.current.value = "";
    setSugQ(null);
    setActive(-1);
    scrollTo({ top: 0, behavior: "auto" });
  }, [stop, setMessages]);

  /* Back to an address with no ?q (from a report) gives the same clean landing as the logo. */
  const restore = useCallback((pop?: unknown) => {
    const saved = chipsFromSearch(location.search);
    if (!saved) { if (pop) reset(); return false; }
    chipsRef.current = [];
    add(saved.join(", "));
    scan(chipsRef.current);
    return true;
  }, [add, scan, reset]);

  useEffect(() => {
    const boot = setTimeout(() => {
      if (restore()) return;
      if (new URLSearchParams(location.search).has("demo")) add(live ? LIVE_DEMO_CHIPS : DEMO_CHIPS);
      entryRef.current?.focus();
    }, 0);
    addEventListener("popstate", restore);
    return () => { clearTimeout(boot); removeEventListener("popstate", restore); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Every scan gets its own ?q entry, so the address can be shared and Back returns to the landing. */
  const start = (list: Chip[]) => {
    const next = scanSearch(list.map((c) => c.raw));
    if (historyMode(location.search, next) === "push") history.pushState(null, "", next);
    else history.replaceState(null, "", next);
    scan(list);
  };

  const submit = () => {
    commit();
    const list = chipsRef.current;
    if (!list.length || busy) return;
    entryRef.current?.blur();
    start(list);
  };

  const pickPreset = (i: number) => {
    setChips([]);
    add(PRESETS[i].name);
    start(chipsRef.current);
  };

  /* Jane Doe Smith is the cached demo, so she opens straight away like a preset; the others fill the box. */
  const pickPerson = (i: number) => {
    const p = PEOPLE[i];
    setChips([]);
    add(p.q);
    if (isDemoQuery(p.q)) { start(chipsRef.current); return; }
    entryRef.current?.focus();
  };

  /* The logo and Home go back to a clean landing, as a refresh would: no chips, empty box, no report, floats back,
     top of the page, and no ?q or #report in the address. */
  const home = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    reset();
    if (location.search || location.hash) history.pushState(null, "", "/");
  };

  /* The link keeps its slot but fades out once the report is in view. */
  const [inView, setInView] = useState(false);
  const reportSeen = done && inView;
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const el = document.getElementById("report");
    if (!done || !el) return;
    const io = new IntersectionObserver(([en]) => setInView(en.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [done]);

  /* Open the report: a smooth scroll that puts the report's first card near the top. */
  const openReport = (e: MouseEvent) => {
    const el = document.getElementById("report");
    if (!el) return;
    e.preventDefault();
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 16, behavior: still ? "auto" : "smooth" });
  };

  const onEntryKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value;
    if (open) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % opts.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? opts.length - 1 : a - 1)); return; }
      if (e.key === "Escape") { e.preventDefault(); closeSug(); return; }
      if ((e.key === "Enter" || e.key === "Tab") && active >= 0) { e.preventDefault(); pick(active); return; }
      /* Enter with nothing highlighted searches the typed name on its own. */
      if (e.key === "Enter" && plan?.kind === "search" && !plan.prefix) { e.preventDefault(); submit(); return; }
    }
    if (e.key === "Enter") { e.preventDefault(); e.currentTarget.form?.requestSubmit(); return; }
    if ((e.key === "," || e.key === ";" || e.key === "Tab") && v.trim()) { e.preventDefault(); commit(); return; }
    if (e.key === "Backspace" && !v && chips.length) {
      e.preventDefault();
      const last = chips[chips.length - 1];
      if (armed.current) { remove(last.id); armed.current = false; setSel(null); } else { setSel(last.id); armed.current = true; }
      return;
    }
    if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0 && chips.length) {
      e.preventDefault();
      fieldRef.current?.querySelector<HTMLElement>(".chip:last-of-type")?.focus();
    }
    armed.current = false; setSel(null);
  };

  const onEntryInput = (raw: string) => {
    let v = raw;
    if (/[,;\n]/.test(v)) {
      const parts = v.split(/[,;\n]/); const tail = parts.pop() ?? "";
      add(parts.join(","));
      v = tail.replace(/^\s+/, "");
    }
    if (/\s$/.test(v)) {
      const words = v.trim().split(/\s+/);
      if (words.length && isStrong(words[words.length - 1])) { add(v); v = ""; }
    }
    setEntry(v);
    setSugQ(v.trim() ? v : null);
    setActive(-1);
  };

  const finishEdit = (id: number, value: string, keep: boolean) => {
    setEditing(null);
    const cur = chipsRef.current;
    const i = cur.findIndex((c) => c.id === id);
    if (i < 0) return;
    if (keep) {
      chipsRef.current = cur.filter((c) => c.id !== id);
      if (value.trim()) add(value, i); else setChips(chipsRef.current);
    }
    entryRef.current?.focus();
  };

  const rise = (i: number) => ({ animationDelay: i * (quick ? 0.04 : 0.14) + "s" }) as CSSProperties;
  /* Live pattern picks come only from the scoring: the server's when it answered, otherwise the same scoring here with
     the deterministic classifier. */
  const patterns: PatternId[] = livePicks?.patterns ?? localPicks(outputs, flagHits, selfFlags);
  const liveProfile = livePicks && livePicks.profile !== "none" ? PROFILE_LABEL[livePicks.profile] : null;
  const name = scanned.find((c) => c.kind === "name")?.label.split(/\s+/)[0];
  const who = name ?? scanned.find((c) => c.kind === "handle")?.label.replace(/^@/, "") ?? "there";
  /* Live scans get No profile for now: nothing they return is a cheap, reliable sign of one. */
  /* First thing in the report: who this is about and what the checks found, as icons, before any prose. */
  const hits = fan.filter((c) => states[c.tool] === "hit");
  const first = preset ? preset.name.split(" ")[0] : demo || !live ? "Jane" : who === "there" ? null : who;
  const summary = (
    <section key="sum" className="sum">
      <h2>{first ? `${first}, ` : ""}{hits.length ? `${hits.length} of ${fan.length} checks found something.` : `none of ${fan.length} checks found anything.`}</h2>
      {hits.length > 0 && <ul className="sum-row">
        {hits.map((c) => <li key={c.tool}><Logo card={c} /><span>{(found[c.tool] ?? c.title).replace(/^(Found|Watch for):\s*/i, "")}</span></li>)}
      </ul>}
    </section>
  );
  const failed = done && scanFailed(status, fan.map((c) => c.tool), outputs);
  const report = failed ? [
    <ScanFailed key="failed" connection={status === "error"} onRetry={() => scan(scanned)} />,
  ] : preset ? [
    summary,
    /* Markdown reports carry their own hashtags, so the old tag pill row is only for the fallback layout. */
    ...(PRESET_REPORTS[preset.name] ? [] : [<ReportMarkdown key="profile" markdown={tagLine(tagsFor(preset.profile, preset.flags))} />]),
    ...(PRESET_REPORTS[preset.name] ? [<ReportMarkdown key="md" markdown={PRESET_REPORTS[preset.name]} credit />, <PatternCards key="pcards" markdown={PRESET_REPORTS[preset.name]} />] : [
      ...presetFindings(preset),
      <PatternList key={"pats" + scanId} ids={patternsFor({ profile: preset.profile, flags: preset.flags })} who={preset.name.split(" ")[0]} open={showAll} />,
      <FinalSec key="final" both={false} />,
    ]),
    <SubscribeCard key="sub" />,
  ] : live && !demo && hits.length === 0 ? [
    /* Zero hits: never list web results, which are usually about someone else with the same name. */
    /* Says what was found and that no check turned up a risk, then one lesson at normal card size. */
    <EmptyResult key="empty" first={first} fan={fan} states={states} found={found} outputs={outputs} pivots={pivots} />,
    <ReportMarkdown key="safe" markdown={SAFE_ANYWAY} />,
    <SubscribeCard key="sub" />,
  ] : live && !demo && mdNow !== "" ? [
    summary,
    mdNow === null
      ? <p key="writing" className="sum-writing" role="status">Reading what we found…</p>
      /* The tag line is built from the flags, as for presets, so Nemotron's own tags never decide it. */
      : <ReportMarkdown key="md" markdown={withTagLine(mdNow, tagsFor(liveProfile, flags))} credit />,
    mdNow ? <PatternCards key="pcards" ids={patterns} /> : null,
    <SubscribeCard key="sub" />,
  ] : live && !demo ? [
    summary,
    ...(flags.length ? [<ReportMarkdown key="profile" markdown={tagLine(tagsFor(null, flags))} />] : []),
    ...liveFindings(outputs),
    <PatternList key={"pats" + scanId} ids={patterns} who={who} open={showAll} />,
    <FinalSec key="final" both={patterns.includes("contagious-interview") && patterns.includes("email-bomb-fake-it-support")}
      rest={` The flood comes by email and the request comes by phone. ${(outputs.linkedin?.facts?.profiles?.length ?? 0) > 0
        ? "The recruiter writes on LinkedIn" : "The recruiter writes to the email in your commits"}, and the malware sits in a GitHub repo.`} />,
    <SubscribeCard key="sub" />,
  ] : [
    summary,
    ...(demo ? [] : [<ReportMarkdown key="profile" markdown={tagLine(tagsFor(null, []))} />]),
    ...(demo ? [<ReportMarkdown key="md" markdown={DEMO_REPORT} credit />, <PatternCards key="pcards" markdown={DEMO_REPORT} />] : [
      ...FINDINGS,
      <PatternList key={"pats" + scanId} ids={[...new Set([...LEAD_PATTERNS, ...EXTRA_PATTERNS, ...patternsFor({ profile: null, flags: selfFlags })])]} max={2} open={showAll} />,
      <FinalSec key="final" />,
    ]),
    <SubscribeCard key="sub" />,
  ];

  /* One spoken line for the whole scan, instead of every card announcing itself. */
  const finished = fan.filter((c) => states[c.tool] === "ok" || states[c.tool] === "hit").length;
  const progress = !running ? ""
    : failed ? "The checks did not finish."
    : done ? (hits.length ? `Checks finished. ${hits.length} of ${fan.length} found something.` : "Checks finished. Nothing risky found.")
    : `Checking sources. ${finished} of ${fan.length} done.`;

  return (
    <div className={"landing" + (running ? " run" : "") + (done ? " done" : "") + (quick ? " quick" : "")}>
      <p className="sr-only" role="status" aria-live="polite">{progress}</p>
      {!running && <LandingBadge />}
      <div className="glow" aria-hidden="true"></div>
      <nav className="nav">
        <Link className="mark" href="/" onClick={home}><i><Lucide name="shield" /></i>Hackable</Link>
        <div className="links"><Link href="/" aria-current="page" onClick={home}>Home</Link><Link href="/how-it-works">How it works</Link><Link href="/privacy">Privacy</Link><Link href="/patterns">Patterns</Link></div>
        <DemoNoticeButton className="login">Subscribe</DemoNoticeButton>
      </nav>
      <div className="app">
        <div className="top">
          <h1>See what’s public about you</h1>
          <p className="sub">Search your online presence to see which attack patterns could target you.</p>
          <form className="search" autoComplete="off" onSubmit={(e) => {
            e.preventDefault();
            if ((entryRef.current?.value ?? "").trim()) commit(); else submit();
          }}>
            <div className="field" ref={fieldRef} role="group" aria-label="Who to check"
              onMouseDown={(e) => { if (e.target === e.currentTarget) { e.preventDefault(); entryRef.current?.focus(); } }}>
              {empty && (
                <div className="ph" aria-hidden="true">
                  {PASTE.map((t) => <span key={t}>{t}</span>)}
                </div>
              )}
              {chips.map((c, i) =>
                editing === c.id ? (
                  <EditChip key={c.id} chip={c} onDone={(v, keep) => finishEdit(c.id, v, keep)} />
                ) : (
                  <span key={c.id} tabIndex={0} role="group" data-id={c.id} data-kind={c.kind}
                    aria-label={`${KIND_LABEL[c.kind]}: ${c.raw}`}
                    title={`${KIND_LABEL[c.kind]}: ${c.raw}`}
                    className={"chip pill new" + (sel === c.id ? " sel" : "") + (shake?.id === c.id ? " shake" : "")}
                    onDoubleClick={(e) => { e.preventDefault(); setEditing(c.id); }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest(".x")) { remove(c.id); entryRef.current?.focus(); return; }
                      setSel(c.id);
                    }}
                    onFocus={() => setSel(c.id)}
                    onKeyDown={(e) => {
                      const el = e.currentTarget;
                      if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); remove(c.id); entryRef.current?.focus(); }
                      if (e.key === "Enter" || e.key === "F2") { e.preventDefault(); setEditing(c.id); }
                      if (e.key === "ArrowRight") { e.preventDefault(); const n = el.nextElementSibling as HTMLElement | null; (n?.classList.contains("chip") ? n : entryRef.current)?.focus(); }
                      if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); (el.previousElementSibling as HTMLElement | null)?.focus(); }
                    }}>
                    <span className="nw"><Tile kind={c.kind} /><span className="lbl">{c.label}</span></span>
                    <button type="button" className="x" aria-label={`Remove ${c.label}`}>
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                    </button>
                  </span>
                ),
              )}
              <input ref={entryRef} className="entry" type="text" spellCheck={false}
                role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={open ? "sg-list" : undefined}
                aria-activedescendant={open && active >= 0 ? `sg-${active}` : undefined}
                aria-label="Name, email or link" enterKeyHint="go" autoComplete="off" autoCapitalize="off" autoCorrect="off"
                placeholder={chips.length ? "Add more" : PASTE[0]}
                value={entry} onChange={(e) => onEntryInput(e.target.value)} onKeyDown={onEntryKey}
                onBlur={() => setTimeout(() => {
                  const a = document.activeElement;
                  if (a !== entryRef.current && !a?.classList.contains("chip-edit")) commit();
                }, 0)} />
              <button type="submit" className="go-btn" aria-label="Check" disabled={disabled}>
                <Lucide name="binoculars" />
              </button>
            </div>
            {open && <Suggest opts={opts} active={active} added={added} loading={opts[0]?.kind === "searching"} onPick={pick} onHover={setActive} />}
          </form>
          <div className="under">
            {/* One set: the famous presets sit in among the made up people. */}
            <div className="people">
              {CHIP_ORDER.map((c) => { if (c.kind === "person") { const p = PEOPLE[c.i]; return (
                <button key={p.n} type="button" className="person" onClick={() => pickPerson(c.i)}>
                  <Avatar name={p.n} av={p.av} img={p.img}>
                    <span className={"pb n" + p.found.length} aria-hidden="true" style={{ "--n": p.found.length, "--off": c.i * 0.55 + "s" } as CSSProperties}>
                      {p.found.map((f, j) => (
                        <span key={f} className="pbi" style={{ "--c": MINI[f].c, "--i": j } as CSSProperties}>{MINI[f].icon}</span>
                      ))}
                    </span>
                  </Avatar>
                  <span className="nm">{p.n}</span>
                </button>
              ); } return (
                <button key={PRESETS[c.i].name} type="button" className="person preset" onClick={() => pickPreset(c.i)}>
                  <Avatar name={PRESETS[c.i].name} av={PRESETS[c.i].av} img={PRESETS[c.i].img} />
                  <span className="nm">{PRESETS[c.i].name}</span>
                </button>
              ); })}
            </div>
            <div className="srcs">
              <div className="srow"><span className="slbl">Sources we check</span>{SOURCES.slice(0, 4).map(pill)}</div>
              <div className="srow">{SOURCES.slice(4).map(pill)}</div>
            </div>
            {/* Phones: one source at a time beside the label. Every pill shares one grid cell, so the slot is as wide as the widest. */}
            <div className="srcs-m">
              <span className="slbl">Sources we check</span>
              <span className="sslot">
                {SOURCES.map((s, i) => <span key={s.n} className="sitem" style={{ "--i": i } as CSSProperties}>{pill(s)}</span>)}
              </span>
            </div>
            <TavilyCredit />
            <a className="pill report-link" href="#report" onClick={openReport} aria-hidden={reportSeen} tabIndex={reportSeen ? -1 : undefined}
              style={{ opacity: reportSeen ? 0 : undefined, visibility: reportSeen ? "hidden" : undefined, pointerEvents: reportSeen ? "none" : undefined, transition: still ? undefined : "opacity 200ms ease-out, visibility 0s linear 200ms" }}>Open the report</a>
          </div>
        </div>
      </div>
      <ScanRows fan={fan} states={running ? states : undefined} found={found}
        pivots={pivots} showPivots={running && live && !quick} />
      <div className="app results-area">
        {done && <div className="report" id="report">{report.map((el, i) => <div key={i} className="rise" style={rise(i)}>{el}</div>)}</div>}
      </div>
    </div>
  );
}

function EditChip({ chip, onDone }: { chip: Chip; onDone: (v: string, keep: boolean) => void }) {
  const [v, setV] = useState(chip.raw);
  const done = useRef(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const finish = (keep: boolean) => { if (done.current) return; done.current = true; onDone(v, keep); };
  return (
    <input ref={ref} className="chip-edit" value={v} aria-label={"Edit " + chip.label}
      style={{ width: Math.max(80, v.length * 8.4 + 28) }}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "," || e.key === "Tab") { e.preventDefault(); finish(true); }
        if (e.key === "Escape") { e.preventDefault(); finish(false); }
      }}
      onBlur={() => finish(true)} />
  );
}

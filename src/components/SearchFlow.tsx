"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, getStaticToolName, isStaticToolUIPart } from "ai";
import { Lucide, Tile } from "./icons";
import { Fan, runH, type CardState } from "./Fan";
import { FINDINGS, FinalSec, liveFindings, livePatterns, PatternSec, presetFindings, Stars, type Outputs } from "./Report";
import { BRAND_BG, BrandIcon } from "./brand-icons";
import { detect, isStrong, KIND_LABEL, tokenize, type Chip } from "@/lib/chips";
import { LIVE_DEMO_CHIPS, PRESETS, presetFor } from "@/lib/presets";
import type { ScanMessage } from "@/lib/scan-tools";
import { DEMO_CHIPS, DEMO_EMAIL, EXAMPLES, EXTRA_PATTERNS, fanFor, LEAD_PATTERNS, PEOPLE, SOURCES, type Found, type ScanTool } from "@/lib/synthetic";

/* Small platform tiles under each recent person, as in 06. */
const MINI: Record<Found, { c: string; icon: ReactNode }> = {
  linkedin: { c: BRAND_BG.linkedin, icon: <BrandIcon name="linkedin" /> },
  github: { c: BRAND_BG.github, icon: <BrandIcon name="github" /> },
  breach: { c: "#e5484d", icon: <Lucide name="shield-alert" w={2} /> },
  forum: { c: BRAND_BG.reddit, icon: <BrandIcon name="reddit" /> },
  x: { c: BRAND_BG.x, icon: <BrandIcon name="x" /> },
  social: { c: BRAND_BG.instagram, icon: <BrandIcon name="instagram" /> },
  phone: { c: "#009767", icon: <Lucide name="phone-call" w={2} /> },
  web: { c: "#00a5ef", icon: <Lucide name="globe" w={2} /> },
};
const src = (s: (typeof SOURCES)[number]) => (
  <span key={s.n} className="src">
    <span className="ti" style={{ "--c": s.c } as CSSProperties}>{"brand" in s.icon ? <BrandIcon name={s.icon.brand} /> : <Lucide name={s.icon.lucide} w={2} />}</span>{s.n}
  </span>
);

const transport = new DefaultChatTransport<ScanMessage>({ api: "/api/scan" });
const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("");

let uid = 0;

/* live: SCAN_MODE=live on the server. The list then drops the cards with no live source, and the report is built from the live results. */
export default function SearchFlow({ live = false }: { live?: boolean }) {
  const [chips, setChipsState] = useState<Chip[]>([]);
  const chipsRef = useRef<Chip[]>([]);
  const setChips = (next: Chip[]) => { chipsRef.current = next; setChipsState(next); };
  const [shake, setShake] = useState<{ id: number; n: number } | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [entry, setEntry] = useState("");
  const [running, setRunning] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [ghost, setGhost] = useState(0);
  const entryRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const armed = useRef(false);

  const { messages, sendMessage, setMessages, stop, status } = useChat<ScanMessage>({ transport });
  /* A preset opens a cached profile on the live card list, in either mode. */
  const preset = running ? presetFor(chips.map((c) => c.raw).join(", ")) : undefined;
  const fan = fanFor(live || !!preset);

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

  /* Empty box: example chips drift upwards. */
  const empty = !chips.length && !entry && !running;
  useEffect(() => {
    if (!empty) return;
    const t = setInterval(() => setGhost((g) => g + 1), 2800);
    return () => clearInterval(t);
  }, [empty]);

  const disabled = running || !(chips.length || entry.trim());

  /* Card states come straight from the typed tool parts of the streaming assistant message. */
  const assistant = messages.findLast((m) => m.role === "assistant");
  const states: Partial<Record<ScanTool, CardState>> = {};
  const found: Partial<Record<ScanTool, string>> = {};
  const outputs: Outputs = {};
  for (const p of assistant?.parts ?? []) {
    if (!isStaticToolUIPart(p)) continue;
    const name = getStaticToolName(p) as ScanTool;
    if (p.state === "output-available") { states[name] = p.output.hit ? "hit" : "ok"; found[name] = p.output.found; outputs[name] = p.output; }
    else if (p.state === "input-streaming" || p.state === "input-available") states[name] = "checking";
  }
  const settled = fan.every((c) => states[c.tool] === "ok" || states[c.tool] === "hit");
  const done = running && (status === "error" || (status === "ready" && settled));

  const scan = useCallback((list: Chip[]) => {
    setExtraOpen(false);
    setShowAll(new URLSearchParams(location.search).has("all"));
    setMessages([]);
    setRunning(true);
    void sendMessage({ text: list.map((c) => c.raw).join(", ") });
  }, [sendMessage, setMessages]);

  const restore = useCallback(() => {
    const q = new URLSearchParams(location.search).get("q");
    if (!q) { void stop(); setMessages([]); setRunning(false); return false; }
    try {
      const st = JSON.parse(q) as { chips?: string[] };
      chipsRef.current = [];
      add((st.chips || []).join(", "));
      scan(chipsRef.current);
      return true;
    } catch { return false; }
  }, [add, scan, stop, setMessages]);

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

  const submit = () => {
    commit();
    const list = chipsRef.current;
    if (!list.length || running) return;
    entryRef.current?.blur();
    const state = { chips: list.map((c) => c.raw) };
    history.pushState(null, "", "?q=" + encodeURIComponent(JSON.stringify(state)));
    scan(list);
  };

  const pickPreset = (i: number) => {
    setChips([]);
    add(PRESETS[i].name);
    scan(chipsRef.current);
  };

  const pickPerson = (i: number) => {
    const p = PEOPLE[i];
    setChips([]);
    add(p.q);
    entryRef.current?.focus();
  };

  const onEntryKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value;
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

  const mail = () => { setToast(true); setTimeout(() => setToast(false), 2400); };
  const rise = (i: number) => ({ animationDelay: i * 0.14 + "s" }) as CSSProperties;
  const patterns = livePatterns(outputs);
  const name = chips.find((c) => c.kind === "name")?.label.split(/\s+/)[0];
  const who = name ?? chips.find((c) => c.kind === "handle")?.label.replace(/^@/, "") ?? "there";
  const mailTo = live ? chips.find((c) => c.kind === "email")?.label ?? DEMO_EMAIL : DEMO_EMAIL;
  const report = preset ? [
    ...presetFindings(preset),
    ...preset.patterns.map((id) => <PatternSec key={id} id={id} who={preset.name.split(" ")[0]} />),
    <FinalSec key="final" onMail={mail} both={false} />,
  ] : live ? [
    ...liveFindings(outputs),
    ...patterns.map((id) => <PatternSec key={id} id={id} who={who} />),
    <FinalSec key="final" onMail={mail} both={patterns.includes("contagious-interview") && patterns.includes("email-bomb-vishing")}
      rest={` The flood comes by email and the request comes by phone. ${(outputs.linkedin?.facts?.profiles?.length ?? 0) > 0
        ? "The recruiter writes on LinkedIn" : "The recruiter writes to the email in your commits"}, and the malware sits in a GitHub repo.`} />,
  ] : [
    ...FINDINGS,
    ...LEAD_PATTERNS.map((id) => <PatternSec key={id} id={id} />),
    ...(showAll || extraOpen
      ? EXTRA_PATTERNS.map((id) => <PatternSec key={id} id={id} />)
      : [<button key="more" type="button" className="more" onClick={() => setExtraOpen(true)}>One more pattern</button>]),
    <FinalSec key="final" onMail={mail} />,
  ];

  const ghostChips = tokenize(EXAMPLES[ghost % EXAMPLES.length]).map((raw) => ({ raw, ...detect(raw) }));

  return (
    <div className={"landing" + (running ? " run" : "") + (done ? " done" : "")}>
      <div className="glow" aria-hidden="true"></div>
      <nav className="nav">
        <a className="mark" href="#"><i><Lucide name="shield" /></i>Mirror</a>
        <div className="links"><a href="#" aria-current="page">Home</a><a href="#">How it works</a><a href="#">Privacy</a></div>
        <a className="login" href="#">Subscribe</a>
      </nav>
      <div className="app">
        <div className="top">
          <h1>See what’s public about you</h1>
          <p className="sub">Search your name, email or profile links to see what a scammer can find.</p>
          <form className="search" autoComplete="off" onSubmit={(e) => {
            e.preventDefault();
            if ((entryRef.current?.value ?? "").trim()) commit(); else submit();
          }}>
            <div className="field" ref={fieldRef} role="group" aria-label="Who to check"
              onMouseDown={(e) => { if (e.target === e.currentTarget) { e.preventDefault(); entryRef.current?.focus(); } }}>
              {empty && (
                <div className="ghosts" aria-hidden="true">
                  <div key={ghost} className="row go">
                    {ghostChips.map((c) => <span key={c.raw} className="pill"><span className="nw"><Tile kind={c.kind} />{c.label}</span></span>)}
                  </div>
                </div>
              )}
              {chips.map((c, i) =>
                editing === c.id ? (
                  <EditChip key={c.id} chip={c} onDone={(v, keep) => finishEdit(c.id, v, keep)} />
                ) : (
                  <span key={c.id} tabIndex={0} role="button" data-id={c.id} data-kind={c.kind}
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
                    <button type="button" className="x" aria-label="Remove">
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                    </button>
                  </span>
                ),
              )}
              <input ref={entryRef} className="entry" type="text" spellCheck={false}
                aria-label="Name, email or link" enterKeyHint="go" autoCapitalize="off" autoCorrect="off"
                placeholder={chips.length ? "Add more" : ""}
                value={entry} onChange={(e) => onEntryInput(e.target.value)} onKeyDown={onEntryKey}
                onBlur={() => setTimeout(() => {
                  const a = document.activeElement;
                  if (a !== entryRef.current && !a?.classList.contains("chip-edit")) commit();
                }, 0)} />
              <button type="submit" className="go-btn" aria-label="Check" disabled={disabled}>
                <Lucide name="binoculars" />
              </button>
            </div>
          </form>
          <div className="under">
            <div className="people">
              {PEOPLE.map((p, i) => (
                <button key={p.n} type="button" className="person" onClick={() => pickPerson(i)}>
                  <span className="av" style={{ "--av": p.av } as CSSProperties}>{initials(p.n)}</span>
                  <span className="nm">{p.n}</span>
                  <span className="wallet" aria-hidden="true">
                    {p.found.map((f, j) => (
                      <span key={f} className="wc" style={{ "--c": MINI[f].c, "--o": j * 15 + ((i * 3 + j * 5) % 3) + "px", "--rt": 8 + ((i * 5 + j * 3) % 7) + "deg", zIndex: j } as CSSProperties}>{MINI[f].icon}</span>
                    ))}
                  </span>
                </button>
              ))}
            </div>
            <div className="people presets">
              {PRESETS.map((p, i) => (
                <button key={p.name} type="button" className="person preset" onClick={() => pickPreset(i)}>
                  <span className="av" style={{ "--av": p.av } as CSSProperties}>{initials(p.name)}</span>
                  <span className="nm">{p.name}<Stars n={p.stars} /></span>
                </button>
              ))}
            </div>
            <div className="srcs">
              <div className="srow"><span className="slbl">Sources we check</span>{SOURCES.slice(0, 4).map(src)}</div>
              <div className="srow">{SOURCES.slice(4).map(src)}</div>
            </div>
            <a className="pill report-link" href="#report">Open the report</a>
          </div>
        </div>
      </div>
      <div className="stage" aria-live="polite" style={{ "--runh": runH(fan).wide + "px", "--runhm": runH(fan).phone + "px" } as CSSProperties}>
        <Fan fan={fan} states={running ? states : undefined}
          label={(c, s) => (s === "checking" ? c.checking : s === "ok" || s === "hit" ? found[c.tool] ?? "" : "")} />
      </div>
      <div className="app results-area">
        {done && <div className="report" id="report">{report.map((el, i) => <div key={i} className="rise" style={rise(i)}>{el}</div>)}</div>}
      </div>
      <div className={"toast" + (toast ? " on" : "")} role="status">Sent to {mailTo}</div>
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

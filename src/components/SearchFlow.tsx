"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Lucide, Tile } from "./icons";
import { FINDINGS, Para, PatternSec, Sec } from "./Report";
import { detect, isStrong, KIND_LABEL, tokenize, type Chip } from "@/lib/chips";
import { DEMO_CHIPS, DEMO_EMAIL, EXTRA_PATTERNS, LEAD_PATTERNS, SOURCES, type SourceState } from "@/lib/synthetic";

type Who = "me" | "other";
type Part = { key: string; kind: "finding" | "pattern" | "more" | "final"; i?: number };

function reportParts(showAll: boolean): Part[] {
  const parts: Part[] = [
    ...FINDINGS.map((_, i) => ({ key: "f" + i, kind: "finding" as const, i })),
    ...LEAD_PATTERNS.map((id) => ({ key: id, kind: "pattern" as const })),
  ];
  if (showAll) parts.push(...EXTRA_PATTERNS.map((id) => ({ key: id, kind: "pattern" as const })));
  else if (EXTRA_PATTERNS.length) parts.push({ key: "more", kind: "more" });
  parts.push({ key: "final", kind: "final" });
  return parts;
}

let uid = 0;

export default function SearchFlow() {
  const [chips, setChipsState] = useState<Chip[]>([]);
  const chipsRef = useRef<Chip[]>([]);
  const setChips = (next: Chip[]) => { chipsRef.current = next; setChipsState(next); };
  const [shake, setShake] = useState<{ id: number; n: number } | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [entry, setEntry] = useState("");
  const [who, setWho] = useState<Who>("me");
  const [agreed, setAgreed] = useState(false);
  const [agreedAt, setAgreedAt] = useState("");
  const [results, setResults] = useState(false);
  const [src, setSrc] = useState<(SourceState | null)[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [shown, setShown] = useState(0);
  const [extraOpen, setExtraOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const entryRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const armed = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const other = who === "other";
  const disabled = !(chips.length || entry.trim()) || (other && !agreed);

  const runResults = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    const params = new URLSearchParams(location.search);
    const speed = +(params.get("speed") ?? "") || 1;
    const p = reportParts(params.has("all"));
    setParts(p); setShown(0); setExtraOpen(false);
    setSrc(SOURCES.map(() => null));
    setResults(true);
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms / speed));
    let t = 700;
    SOURCES.forEach(([, state], i) => { t += 450; at(t, () => setSrc((s) => s.map((v, j) => (j === i ? state : v)))); });
    p.forEach((_, i) => { t += 450; at(t, () => setShown(i + 1)); });
  }, []);

  const restore = useCallback(() => {
    const q = new URLSearchParams(location.search).get("q");
    if (!q) { timers.current.forEach(clearTimeout); setResults(false); return false; }
    try {
      const st = JSON.parse(q) as { who?: Who; consent?: string | null; chips?: string[] };
      chipsRef.current = [];
      add((st.chips || []).join(", "));
      if (st.who === "other") { setWho("other"); setAgreed(!!st.consent); if (st.consent) setAgreedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })); }
      runResults();
      return true;
    } catch { return false; }
  }, [add, runResults]);

  useEffect(() => {
    const boot = setTimeout(() => {
      if (restore()) return;
      if (new URLSearchParams(location.search).has("demo")) add(DEMO_CHIPS);
      entryRef.current?.focus();
    }, 0);
    addEventListener("popstate", restore);
    const tm = timers.current;
    return () => { clearTimeout(boot); removeEventListener("popstate", restore); tm.forEach(clearTimeout); };
  }, [restore, add]);

  const submit = () => {
    commit();
    const list = chipsRef.current;
    if (!list.length || (other && !agreed)) return;
    entryRef.current?.blur();
    const state = { who, consent: other ? new Date().toISOString() : null, chips: list.map((c) => c.raw) };
    history.pushState(null, "", "?q=" + encodeURIComponent(JSON.stringify(state)));
    runResults();
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

  const visible = parts.slice(0, shown);
  const sourceCls = (s: SourceState | null) => "src" + (s ? " " + s : "");

  return (
    <div className={results ? "results" : undefined}>
      <div className="app">
        <div className="top">
          <section className="hero">
            <h1 className="qx" style={{ margin: 0 }}><span className="lead">Mirror</span></h1>
          </section>
          <form className="search" autoComplete="off" onSubmit={(e) => {
            e.preventDefault();
            if ((entryRef.current?.value ?? "").trim()) commit(); else submit();
          }}>
            <div className="field" ref={fieldRef} role="group" aria-label="Who to check"
              onMouseDown={(e) => { if (e.target === e.currentTarget) { e.preventDefault(); entryRef.current?.focus(); } }}>
              <span className="lens"><Lucide name="search" /></span>
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
                placeholder={chips.length ? "Add more" : "Your name, email, LinkedIn, GitHub, anything"}
                value={entry} onChange={(e) => onEntryInput(e.target.value)} onKeyDown={onEntryKey}
                onBlur={() => setTimeout(() => {
                  const a = document.activeElement;
                  if (a !== entryRef.current && !a?.classList.contains("chip-edit")) commit();
                }, 0)} />
              <button type="submit" className="go-btn" aria-label="Check" disabled={disabled}>
                <Lucide name="arrow-right" />
              </button>
            </div>
          </form>
          <div className="under">
            <div className="seg" role="radiogroup" aria-label="Who is this for?">
              <label><input type="radio" name="who" value="me" checked={who === "me"} onChange={() => setWho("me")} /><span>Me</span></label>
              <label><input type="radio" name="who" value="other" checked={other} onChange={() => setWho("other")} /><span>Someone else</span></label>
            </div>
            <label className={"consent" + (other ? " on" : "") + (other && agreed ? " agreed" : "")}>
              <input type="checkbox" checked={agreed} onChange={(e) => {
                setAgreed(e.target.checked);
                setAgreedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
              }} />
              <span>{other && agreed ? "Agreed " + agreedAt : "They agreed"}</span>
            </label>
          </div>
        </div>
        <div className="results-area" aria-live="polite">
          <div className="sources">
            {SOURCES.map(([n], i) => <span key={n} className={sourceCls(src[i] ?? null)}><i></i>{n}</span>)}
          </div>
          <div className="report">
            {visible.map((p) => {
              if (p.kind === "finding") return FINDINGS[p.i!];
              if (p.kind === "pattern") return <PatternSec key={p.key} id={p.key as never} />;
              if (p.kind === "more") {
                return extraOpen
                  ? EXTRA_PATTERNS.map((id) => <PatternSec key={id} id={id} />)
                  : <button key="more" type="button" className="more" onClick={() => setExtraOpen(true)}>One more pattern</button>;
              }
              return (
                <Sec key="final">
                  <Para lead="Tonight, do three things." rest=" Sign out everywhere and clean that laptop. Change the three leaked passwords. Run coding tests in a sandbox." />
                  <div className="actions">
                    <button className="pill dark" onClick={() => { setToast(true); setTimeout(() => setToast(false), 2400); }}>
                      <span className="nw"><Tile kind="email" />Email me this report</span>
                    </button>
                  </div>
                </Sec>
              );
            })}
          </div>
        </div>
      </div>
      <div className={"toast" + (toast ? " on" : "")}>Sent to {DEMO_EMAIL}</div>
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

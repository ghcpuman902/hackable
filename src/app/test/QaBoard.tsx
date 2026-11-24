"use client";

import { useEffect, useState } from "react";
import { judge, type QaKey, type QaMatch, type QaTarget } from "@/lib/qa";
import type { ScanResult } from "@/lib/synthetic";

type Run = { status: "idle" | "running" | "done" | "error"; results?: Partial<Record<QaKey, ScanResult>>; ms?: number; error?: string };
type Data = { live: boolean; tools: { tool: QaKey; title: string }[]; targets: QaTarget[] };

const MARK: Record<QaMatch, string> = { match: "✓", partial: "◐", miss: "✕", none: "" };
const LABEL: Record<QaMatch, string> = { match: "Match", partial: "Partial", miss: "Mismatch", none: "No expectation" };

/* The raw output, flattened: status line, detail, then counts and top items from the facts. */
function Found({ r }: { r?: ScanResult }) {
  if (!r) return <span className="q-mute">Not run</span>;
  const f = r.facts ?? {};
  const items: [string, string[]][] = [
    ["URLs", f.urls ?? []], ["Emails", f.emails ?? []], ["Repos", f.repos ?? []], ["Profiles", f.profiles ?? []],
    ["Breaches", (f.breaches ?? []).map((b) => b.name)], ["Pastes", (f.pastes ?? []).map((p) => p.name)],
    ["Devices", f.devices ?? []], ["Stealer lists", f.stealerLists ?? []], ["Checked", f.checked ?? []],
  ];
  return (
    <div className="q-found">
      <b>{r.found}</b>{r.source && <span className={"q-src " + r.source}>{r.source}</span>}
      {r.detail && <p>{r.detail}</p>}
      {items.filter(([, v]) => v.length).map(([k, v]) => (
        <p key={k}><i>{k} ({v.length})</i> {v.slice(0, 6).join(", ")}{v.length > 6 ? ", …" : ""}</p>
      ))}
    </div>
  );
}

export default function QaBoard() {
  const [data, setData] = useState<Data | null>(null);
  const [runs, setRuns] = useState<Record<string, Run>>({});
  const [all, setAll] = useState(false);

  useEffect(() => { fetch("/api/test").then((r) => r.json()).then(setData, () => setData(null)); }, []);

  const run = async (t: QaTarget, fresh: boolean) => {
    setRuns((s) => ({ ...s, [t.id]: { ...s[t.id], status: "running" } }));
    try {
      const res = await fetch("/api/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: t.id, fresh }) });
      const j = (await res.json()) as { results?: Run["results"]; ms?: number; error?: string };
      setRuns((s) => ({ ...s, [t.id]: res.ok ? { status: "done", results: j.results, ms: j.ms } : { status: "error", error: j.error ?? `HTTP ${res.status}` } }));
    } catch (e) {
      setRuns((s) => ({ ...s, [t.id]: { status: "error", error: e instanceof Error ? e.message : "Failed" } }));
    }
  };
  const runAll = async () => {
    if (!data) return;
    setAll(true);
    for (const t of data.targets) await run(t, true);
    setAll(false);
  };

  if (!data) return <main className="qa"><h1>Test</h1><p className="q-mute">Loading</p></main>;
  return (
    <main className="qa">
      <header className="q-head">
        <h1>Test</h1>
        <span className="q-mute">{data.live ? "Live sources" : "SCAN_MODE is not live, so live rows cannot run"}</span>
        <button type="button" className="q-btn dark" onClick={runAll} disabled={all}>{all ? "Running" : "Run all"}</button>
      </header>
      {data.targets.map((t) => {
        const r = runs[t.id];
        const verdicts = data.tools.map(({ tool }) => judge(t.expected?.[tool], r?.results?.[tool]));
        const tally = (m: QaMatch) => verdicts.filter((v) => v.m === m).length;
        return (
          <section key={t.id} className="q-target">
            <div className="q-row-head">
              <h2>{t.label}</h2>
              <span className="q-kind">{t.kind === "live" ? "Live" : "Preset, cached"}</span>
              {r?.status === "done" && (
                <span className="q-tally">
                  <span className="match">{MARK.match} {tally("match")}</span>
                  <span className="partial">{MARK.partial} {tally("partial")}</span>
                  <span className="miss">{MARK.miss} {tally("miss")}</span>
                  <span className="q-mute">{r.ms} ms</span>
                </span>
              )}
              {r?.status === "error" && <span className="miss">{r.error}</span>}
              <button type="button" className="q-btn" onClick={() => run(t, true)} disabled={r?.status === "running"}>
                {r?.status === "running" ? "Running" : r ? "Rerun" : "Run"}
              </button>
            </div>
            <table>
              <thead><tr><th>Source</th><th>Expected</th><th>Found</th><th>Match</th></tr></thead>
              <tbody>
                {data.tools.map(({ tool, title }, i) => {
                  const e = t.expected?.[tool];
                  const v = verdicts[i];
                  return (
                    <tr key={tool}>
                      <td className="q-tool">{title}<span>{tool}</span></td>
                      <td>{e ? <div className="q-exp"><b>{e.state}{e.min != null ? `, at least ${e.min}` : ""}</b>
                        {e.includes?.length ? <p>Includes {e.includes.join(", ")}</p> : null}{e.note && <p className="q-mute">{e.note}</p>}</div>
                        : <span className="q-mute">None written</span>}</td>
                      <td><Found r={r?.results?.[tool]} /></td>
                      <td className={"q-m " + v.m} title={v.why.join("; ")}>
                        {v.m !== "none" && <><span className="q-mark">{MARK[v.m]}</span>{LABEL[v.m]}</>}
                        {v.why.length > 0 && <p>{v.why.join("; ")}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}
    </main>
  );
}

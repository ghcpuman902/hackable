"use client";

import { useState } from "react";
import ReportMarkdown from "@/components/ReportMarkdown";
import { z } from "zod";

const check = z.object({ label: z.string(), pass: z.boolean() });
const generatedReport = z.object({ markdown: z.string(), checks: z.array(check) });

type Check = z.infer<typeof check>;
type GeneratedReport = z.infer<typeof generatedReport>;
type Generation =
  | { status: "idle"; report: GeneratedReport | null }
  | { status: "loading"; report: GeneratedReport | null }
  | { status: "error"; report: GeneratedReport | null };

function CheckResult({ pass }: { pass: boolean | undefined }) {
  if (pass === undefined) return <span aria-label="Pending">…</span>;
  return <span className={pass ? "compare-pass" : "compare-fail"}>{pass ? "Pass" : "Fail"}</span>;
}

export function CompareClient({ person, name, golden, checks }: {
  person: string;
  name: string;
  golden: string;
  checks: Check[];
}) {
  const [generation, setGeneration] = useState<Generation>({ status: "idle", report: null });
  const { report, status } = generation;

  async function regenerate() {
    if (status === "loading") return;
    setGeneration({ status: "loading", report });
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person }),
      });
      if (!response.ok) throw new Error();
      setGeneration({ status: "idle", report: generatedReport.parse(await response.json()) });
    } catch {
      setGeneration({ status: "error", report });
    }
  }

  return (
    <section className="compare-person" aria-labelledby={person}>
      <div className="compare-person-heading">
        <h2 id={person}>{name}</h2>
        <button className="pill compare-button" type="button" onClick={regenerate} disabled={status === "loading"}>
          {status === "loading" ? "Generating…" : "Regenerate"}
        </button>
      </div>
      <div className="compare-pair">
        <section className="compare-column" aria-labelledby={person + "-golden"}>
          <h3 id={person + "-golden"}>Golden</h3>
          <div className="compare-report" tabIndex={0} role="region" aria-labelledby={person + "-golden"}>
            <ReportMarkdown markdown={golden} />
          </div>
        </section>
        <section className="compare-column" aria-labelledby={person + "-nemotron"}>
          <h3 id={person + "-nemotron"}>Nemotron</h3>
          <div className="compare-report" tabIndex={0} role="region" aria-labelledby={person + "-nemotron"} aria-busy={status === "loading"}>
            {report && <ReportMarkdown markdown={report.markdown} />}
          </div>
          <p className="compare-status" role="status">
            {status === "error" ? "Could not generate the report." : ""}
          </p>
        </section>
      </div>
      <table className="compare-rubric" aria-label={name + " rubric"}>
        <thead>
          <tr><th scope="col">Check</th><th scope="col">Golden</th><th scope="col">Nemotron</th></tr>
        </thead>
        <tbody>
          {checks.map(({ label, pass }) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td><CheckResult pass={pass} /></td>
              <td><CheckResult pass={report?.checks.find((result) => result.label === label)?.pass} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

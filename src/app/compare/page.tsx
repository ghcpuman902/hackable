import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { loadGoldenReports } from "@/app/api/compare/route";
import { CompareClient } from "./CompareClient";
import "./compare.css";

export const metadata: Metadata = {
  title: "Compare reports",
  robots: { index: false, follow: false },
  alternates: { canonical: "/compare" },
};

async function Comparisons() {
  await connection();
  const reports = await loadGoldenReports();
  return reports.map((report) => <CompareClient key={report.person} {...report} />);
}

export default function ComparePage() {
  return (
    <main className="compare">
      <h1>Compare reports</h1>
      <Suspense>
        <Comparisons />
      </Suspense>
    </main>
  );
}

import { SourceSheet } from "@/components/SourceSheet";

export const metadata = { robots: { index: false, follow: false } };

/* A static, no-network fixture for the source-sheet browser check. */
export default function SourceSheetFixture() {
  return <main style={{ padding: 32 }}><SourceSheet group={{
    id: "web", label: "Web: 2 results",
    results: [
      { title: "Exact email result", url: "https://example.com/" },
      { title: "Exact handle result", url: "https://example.org/" },
    ],
    possible: [{ title: "Possible namesake", url: "https://example.net/" }],
  }} /></main>;
}

import type { Metadata } from "next";
import QaBoard from "./QaBoard";
import "./test.css";

/* Internal QA: compares each source's raw output with hand written ground truth. Not linked from the nav. */
export const metadata: Metadata = { title: "Test | Mirror", robots: { index: false, follow: false } };

export default function TestPage() {
  return <QaBoard />;
}

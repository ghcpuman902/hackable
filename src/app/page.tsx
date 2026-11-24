import SearchFlow from "@/components/SearchFlow";

export default function Home() {
  return <SearchFlow live={process.env.SCAN_MODE === "live"} />;
}

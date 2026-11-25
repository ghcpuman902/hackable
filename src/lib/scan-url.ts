/* The address for a scan: every search, preset and demo person pushes the same ?q state, and Back reads it again. */

export function scanSearch(chips: string[]): string {
  return "?q=" + encodeURIComponent(JSON.stringify({ chips }));
}

/* The chips in an address, or null when it holds no scan (a clean landing) or a ?q that cannot be read. */
export function chipsFromSearch(search: string): string[] | null {
  const q = new URLSearchParams(search).get("q");
  if (!q) return null;
  try {
    const st = JSON.parse(q) as { chips?: unknown };
    if (!Array.isArray(st.chips)) return null;
    const chips = st.chips.filter((c): c is string => typeof c === "string" && c.trim() !== "");
    return chips.length ? chips : null;
  } catch {
    return null;
  }
}

/* Running the same scan again replaces its entry, so Back still goes to the landing in one press. */
export function historyMode(current: string, next: string): "push" | "replace" {
  return current === next ? "replace" : "push";
}

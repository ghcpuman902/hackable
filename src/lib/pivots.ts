/* Pivot chips: a public name or handle a live scan found and followed. Kept free of server imports so the browser can use it. */
export type Pivot = { from: "GitHub" | "Gravatar"; kind: "name" | "handle"; value: string };

/* The value a pivot chip would show, or null when it is not worth a chip: empty, too long, not a handle, or already
   known under any kind (a typed name, handle or email, or an earlier chip). Case never makes a second chip. */
export function pivotValue(raw: string | null | undefined, kind: Pivot["kind"], known: string[]): string | null {
  const value = raw?.trim().replace(/\s+/g, " ");
  if (!value || value.length > 100) return null;
  if (kind === "handle" && !/^[a-z\d][\w.-]{0,38}$/i.test(value)) return null;
  const lower = value.toLowerCase();
  return known.some((v) => v.toLowerCase() === lower) ? null : value;
}

/* The same rule for the chips the browser has received, so a repeated part never shows twice. */
export function dedupePivots(pivots: Pivot[]): Pivot[] {
  const seen = new Set<string>();
  return pivots.filter((p) => {
    const key = p.value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* The chip's own label: what it is and where it came from, the same shape for every chip. */
export const pivotLabel = ({ kind, from }: Pivot) => `${kind === "name" ? "Name" : "Handle"} from ${from}`;

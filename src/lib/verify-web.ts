export type WebResult = { title: string; url: string; content?: string };
export type VerifiedWebResult = WebResult & { status: "confirmed" | "possible" };

export type WebIdentifiers = { emails?: readonly string[]; handles?: readonly string[]; names?: readonly string[] };

const textFor = (result: WebResult) => `${result.title} ${result.content ?? ""}`;
const escaped = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Bot checks such as Cloudflare's "Just a moment..." page say nothing about the person, whatever the URL holds. */
const INTERSTITIAL = /just a moment\.\.\.|attention required!? \| cloudflare|cf-browser-verification|challenges\.cloudflare\.com|checking your browser before accessing/i;
export const isInterstitial = (text: string) => INTERSTITIAL.test(text);
/* An exact email, not a longer one that ends with it (xmanglekuo@gmail.com) or carries on (manglekuo@gmail.com.au). */
export const emailPattern = (email: string) => new RegExp(`(?<![\\w.+%-])${escaped(email)}(?![\\w-]|\\.[a-z])`, "i");

export function verifyWebResult(result: WebResult, identifiers: WebIdentifiers): VerifiedWebResult | null {
  const text = textFor(result);
  if (isInterstitial(text)) return null;
  const emails = identifiers.emails ?? [];
  const handles = identifiers.handles ?? [];
  if (emails.some((email) => emailPattern(email).test(text))) return { ...result, status: "confirmed" };
  if (handles.some((handle) => new RegExp(`(?<![\\w-])${escaped(handle)}(?![\\w-])`, "i").test(text))) return { ...result, status: "confirmed" };

  const hasName = (identifiers.names ?? []).some((name) => new RegExp(escaped(name), "i").test(text));
  const otherIdentifier = [...emails.map((email) => email.split("@")[0]), ...emails.map((email) => email.split("@")[1]), ...handles]
    .some((value) => value.length > 1 && new RegExp(`(?<![\\w-])${escaped(value)}(?![\\w-])`, "i").test(text));
  return hasName && otherIdentifier ? { ...result, status: "possible" } : null;
}

export async function verifyWebResults(results: readonly WebResult[], identifiers: WebIdentifiers, readPage?: (url: string) => Promise<string | null>): Promise<VerifiedWebResult[]> {
  const initial = results.map((result) => verifyWebResult(result, identifiers));
  if (!readPage) return initial.filter((result): result is VerifiedWebResult => !!result);
  /* Snippets that are merely possible still get a short page check: an exact identifier on the page wins. */
  const unresolved = results.map((result, index) => ({ result, index })).filter(({ index }) => initial[index]?.status !== "confirmed").slice(0, 5);
  const pages = await Promise.all(unresolved.map(async ({ result, index }) => {
    const content = await readPage(result.url).catch(() => null);
    return [index, content && !isInterstitial(content) ? verifyWebResult({ ...result, content }, identifiers) : initial[index]] as const;
  }));
  const checked = new Map(pages);
  return results.map((_, index) => checked.get(index) ?? initial[index]).filter((result): result is VerifiedWebResult => !!result);
}

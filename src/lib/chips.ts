import type { Kind } from "@/components/icons";

/* Type detection and tokenizing, ported 1:1 from 05-search-flow.html. */
export const KIND_LABEL: Record<Kind, string> = {
  email: "Email", linkedin: "LinkedIn", github: "GitHub", instagram: "Instagram", x: "X", url: "Link", handle: "Username", phone: "Phone", name: "Name", text: "Note",
};

const RE = {
  email: /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i,
  url: /^(https?:\/\/)?(www\.)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i,
  handle: /^@[\w.]{2,30}$/,
  phone: /^\+?[\d][\d\s().-]{6,}$/,
  name: /^[\p{Lu}][\p{L}'’.-]*(\s+[\p{L}'’.-]+){1,3}$/u,
  user: /^[a-z0-9._-]*\d[a-z0-9._-]*$|^[a-z0-9]+[._-][a-z0-9._-]+$/i,
};

export function detect(raw: string): { kind: Kind; label: string } {
  const v = raw.trim();
  if (RE.email.test(v)) return { kind: "email", label: v.toLowerCase() };
  if (RE.handle.test(v)) return { kind: "handle", label: v };
  if (RE.url.test(v) && !/^\d+(\.\d+)+$/.test(v)) {
    const clean = v.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
    const host = clean.split("/")[0].toLowerCase();
    const kind: Kind = /(^|\.)linkedin\.com$/.test(host) ? "linkedin" : /(^|\.)github\.com$/.test(host) ? "github"
      : /(^|\.)instagram\.com$/.test(host) ? "instagram" : /(^|\.)(x|twitter)\.com$/.test(host) ? "x" : "url";
    return { kind, label: clean };
  }
  if (RE.phone.test(v) && v.replace(/\D/g, "").length >= 7) return { kind: "phone", label: v };
  if (RE.name.test(v)) return { kind: "name", label: v };
  if (!/\s/.test(v) && RE.user.test(v)) return { kind: "handle", label: v };
  return { kind: "text", label: v };
}

export const isStrong = (w: string) => RE.email.test(w) || RE.handle.test(w) || (RE.url.test(w) && /[./]/.test(w));

function explode(segment: string) {
  const out: string[] = [];
  let buf: string[] = [];
  for (const w of segment.trim().split(/\s+/).filter(Boolean)) {
    if (isStrong(w)) { if (buf.length) out.push(buf.join(" ")); buf = []; out.push(w); }
    else buf.push(w);
  }
  if (buf.length) out.push(buf.join(" "));
  return out;
}

export const tokenize = (text: string) => text.split(/[,;\n]+/).flatMap(explode);

export type Chip = { id: number; raw: string; kind: Kind; label: string };

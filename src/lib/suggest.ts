/* Shared by the search box and /api/suggest: site prefixes for the typeahead, the categories a name is searched in,
   and URL normalising so the same profile cannot be added twice. */
export type SugCat = "linkedin" | "github" | "instagram" | "web";
export type SugRow = { cat: SugCat; title: string; detail: string; value: string };
export type SugGroup = { cat: SugCat; rows: SugRow[]; failed?: boolean };

export const SITES: { n: string; key: string; prefix: string; cat?: SugCat }[] = [
  { n: "LinkedIn", key: "linkedin", prefix: "linkedin.com/in/", cat: "linkedin" },
  { n: "Instagram", key: "instagram", prefix: "instagram.com/", cat: "instagram" },
  { n: "GitHub", key: "github", prefix: "github.com/", cat: "github" },
  { n: "X", key: "x", prefix: "x.com/" },
  { n: "Facebook", key: "facebook", prefix: "facebook.com/" },
  { n: "TikTok", key: "tiktok", prefix: "tiktok.com/@" },
];
export const CAT_PREFIX: Record<SugCat, string> = { linkedin: "linkedin.com/in/", github: "github.com/", instagram: "instagram.com/", web: "" };
export const CAT_ORDER: SugCat[] = ["linkedin", "github", "instagram", "web"];
export const SUG_MAX = 6;
export const SUG_MIN = 3;

/* Sites whose name starts with what was typed: "link" offers LinkedIn, "x" offers X. */
export const sitesFor = (v: string) => {
  const t = v.trim().toLowerCase();
  if (!t || /[\s/@.]/.test(t)) return [];
  return SITES.filter((s) => s.key.startsWith(t) || (t.length >= 3 && s.n.toLowerCase().startsWith(t)));
};

/* The site prefix the field starts with, and what follows it. */
export const prefixOf = (v: string) => {
  const t = v.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const site = SITES.find((s) => t.toLowerCase().startsWith(s.prefix));
  return site ? { site, rest: t.slice(site.prefix.length) } : null;
};

/* A name worth searching: three or more characters, no @, no link. */
export const isNameQuery = (v: string) => {
  const t = v.trim();
  return t.length >= SUG_MIN && !/[@/:]/.test(t) && !/\.[a-z]{2,}$/i.test(t);
};

export const normUrl = (v: string) =>
  v.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[?#].*$/, "").replace(/\/+$/, "");

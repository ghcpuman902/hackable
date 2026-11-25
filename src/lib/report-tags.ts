import type { FlagId, SelfFlagId } from "./flags";
import type { Profile } from "./patterns";

/* One source for the #CamelCase tags. Presets, live reports and the fallback layouts all render the same tag line
   (the "rm-tag" pills in ReportMarkdown), so a tag reads the same wherever it shows. Labels a person may or may not
   have, never a rating. */
export const PROFILE_TAG: Record<Profile, string> = {
  "High Value Individual": "HighValueIndividual",
  "Target of Spies": "TargetOfSpies",
  "Crypto Worker": "CryptoWorker",
  "Romance Target": "RomanceTarget",
};
export const NO_PROFILE_TAG = "NoProfile";

export const FLAG_TAG: Record<FlagId | SelfFlagId, string> = {
  "same-username-everywhere": "SameUsername",
  "in-the-news": "InTheNews",
  "just-changed-jobs": "JustChangedJobs",
  "public-email-in-commits": "PublicCommitEmail",
  "passwords-in-breaches": "PasswordsInBreaches",
  "stealer-log-hit": "StealerLog",
  "phone-number-exposed": "PhoneExposed",
  "home-address-exposed": "AddressExposed",
  "travel-site-breach": "TravelSiteBreach",
  "marketplace-breach": "MarketplaceBreach",
  "recently-moved": "RecentlyMoved",
  "big-life-event": "BigLifeEvent",
  "selling-online": "SellingOnline",
  "travelling-soon": "TravellingSoon",
};

/* Profile first, then one tag per flag. No profile and no flags gives #NoProfile; flags alone need no placeholder. */
export function tagsFor(profile: Profile | null, flags: (FlagId | SelfFlagId)[]): string[] {
  const tags = [...(profile ? [PROFILE_TAG[profile]] : []), ...flags.map((f) => FLAG_TAG[f])];
  return tags.length ? [...new Set(tags)] : [NO_PROFILE_TAG];
}

export const tagLine = (tags: string[]): string => tags.map((t) => `#${t}`).join(" ");

const TAGS_ONLY = /^(?:#[A-Za-z]\w*\s*)+$/;

/* Put the tag line in a report: drop any tag line the writer produced, then add ours after the last paragraph or card
   and before the footnote definitions. */
export function withTagLine(md: string, tags: string[]): string {
  const lines = md.trim().split("\n");
  const firstDef = lines.findIndex((l) => /^\[\^[^\]\s]+\]:/.test(l));
  const body = (firstDef < 0 ? lines : lines.slice(0, firstDef)).join("\n");
  const defs = firstDef < 0 ? "" : lines.slice(firstDef).join("\n");
  const kept = body.split(/\n\s*\n/).map((b) => b.trim()).filter((b) => b && !TAGS_ONLY.test(b)).join("\n\n");
  return [kept, tagLine(tags), defs].filter(Boolean).join("\n\n");
}

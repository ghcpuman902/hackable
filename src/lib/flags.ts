import type { ScanResult, ScanTool } from "./synthetic";

/* Flags: things public data shows about a person, which pick the scam patterns in the report. They never rate the person.
   Detectability (Hack's research, 24 Nov): same username, commit email, breach passwords and stealer logs are reliable;
   in the news can match a namesake, so it needs a second identifier; job change, phone and address are partial.
   Moved home, big life event, selling online and travelling soon have no public signal and are only ever ticked by the person. */
export type FlagId = "same-username-everywhere" | "in-the-news" | "just-changed-jobs" | "public-email-in-commits"
  | "passwords-in-breaches" | "stealer-log-hit" | "phone-number-exposed" | "home-address-exposed";
export type SelfFlagId = "recently-moved" | "big-life-event" | "selling-online" | "travelling-soon";
/* yes: shown and used. maybe: something matched but not enough to show (a namesake, an undated snippet). */
export type FlagHit = { id: FlagId; state: "yes" | "maybe" | "no" | "skip"; evidence: string; urls?: string[] };

export const FLAG_LABEL: Record<FlagId | SelfFlagId, string> = {
  "same-username-everywhere": "Same username everywhere", "in-the-news": "In the news", "just-changed-jobs": "Just changed jobs",
  "public-email-in-commits": "Public email in commits", "passwords-in-breaches": "Passwords in breaches", "stealer-log-hit": "Stealer log hit",
  "phone-number-exposed": "Phone number exposed", "home-address-exposed": "Home address exposed",
  "recently-moved": "Recently moved", "big-life-event": "Big life event", "selling-online": "Selling online", "travelling-soon": "Travelling soon",
};
export const NETWORK_FLAGS: FlagId[] = ["same-username-everywhere", "in-the-news", "just-changed-jobs"];
export const OUTPUT_FLAGS: FlagId[] = ["public-email-in-commits", "passwords-in-breaches", "stealer-log-hit", "phone-number-exposed", "home-address-exposed"];
export const ALL_FLAGS: FlagId[] = [...NETWORK_FLAGS, ...OUTPUT_FLAGS];

/* Flags read straight from the scan's own tool results, so they need no extra calls. */
export function outputFlags(o: Partial<Record<ScanTool, ScanResult>>): FlagHit[] {
  const hit = (id: FlagId, yes: boolean, evidence: string, skip: false | string = false): FlagHit =>
    skip ? { id, state: "skip", evidence: skip } : { id, state: yes ? "yes" : "no", evidence };
  const emails = (o.github?.facts?.emails ?? []).filter((e) => !/noreply\.github\.com$/i.test(e));
  const noGh = !o.github || o.github.source === "skipped" ? "No GitHub handle checked" : false;
  const noEmail = (!o.leakCheck || o.leakCheck.source === "skipped") && (!o.hibpTest || o.hibpTest.source === "skipped") ? "No email checked" : false;
  const pwBreach = (o.hibpTest?.facts?.breaches ?? []).filter((b) => b.passwords).map((b) => b.name);
  const pw = !!o.leakCheck?.facts?.passwords || pwBreach.length > 0;
  const fields = (o.leakCheck?.detail?.match(/fields: (.*)$/)?.[1] ?? "").split(/,\s*/).map((f) => f.trim().toLowerCase()).filter(Boolean);
  const phone = fields.some((f) => /phone|mobile/.test(f));
  const addr = fields.some((f) => /address|zip|postcode|street/.test(f));
  const held = (yes: boolean) => (yes ? "A breach held it, which does not mean it is public now. " : "") + (fields.length ? `LeakCheck fields: ${fields.join(", ")}` : "No breach fields listed");
  const lists = o.hudsonRock?.facts?.stealerLists ?? [];
  const devices = o.hudsonRock?.facts?.devices ?? [];
  const noHr = !o.hudsonRock || o.hudsonRock.source === "skipped" ? "No email or username checked" : false;
  return [
    hit("public-email-in-commits", emails.length > 0, emails.length ? `GitHub commits: ${emails.join(", ")}` : "No personal email in recent public commits", noGh),
    hit("passwords-in-breaches", pw, pw ? [o.leakCheck?.facts?.passwords ? "LeakCheck records with a password field" : "", pwBreach.length ? `HIBP: ${pwBreach.slice(0, 3).join(", ")}` : ""].filter(Boolean).join("; ") : "No breach record lists a password", noEmail),
    hit("stealer-log-hit", devices.length > 0 || lists.length > 0, devices.length ? `Hudson Rock: ${devices.length} infected devices` : lists.length ? `Stealer log list: ${lists.join(", ")}` : "No stealer log found", noHr),
    /* Partial: a breach held the field, which does not mean it is public now. The number and address are never shown. */
    hit("phone-number-exposed", phone, held(phone), noEmail),
    hit("home-address-exposed", addr, held(addr), noEmail),
  ];
}

/* For the QA page and the report: a flag result in the same shape as a tool result. */
export const flagAsResult = (f: FlagHit): ScanResult => ({
  found: f.state === "yes" ? `Found: ${FLAG_LABEL[f.id]}` : f.state === "maybe" ? "Possible, not shown" : f.state === "skip" ? "Not checked" : "Not flagged",
  hit: f.state === "yes", source: f.state === "skip" ? "skipped" : "live", detail: f.evidence, facts: f.urls?.length ? { urls: f.urls } : undefined,
});

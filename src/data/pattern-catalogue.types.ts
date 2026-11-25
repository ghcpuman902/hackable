// Pattern catalogue contract (round 2, research passes R0 and B0).
// Hidden research metadata used by the deterministic pattern scoring; not shown to users.

export type Trait = "developer"|"job-seeker"|"executive"|"finance-staff"|"hr-staff"|"crypto-holder"|"traveller"|"recent-mover"|"older-person"|"public-figure"|"parent"|"online-seller"|"small-business"|"journalist-activist"|"student"|"general";
export type Signal = "public-commit-email"|"github-profile"|"breach-any"|"breach-password"|"breach-travel"|"breach-marketplace"|"stealer-log"|"gravatar"|"linkedin-presence"|"same-username-many-sites"|"news-mentions"|"public-role"|"crypto-activity"|"phone-exposed"|"address-exposed"|"job-change"|"large-following"|"dev-forum-activity"|"email-exposed";
export type CatalogueSource = { id: string; title: string; outlet: string; url: string; date: string /* YYYY-MM-DD as published */ };
export type PatternMeta = {
  id: string;                      // one of the existing ids in src/lib/fraud-patterns.json, or a new kebab id
  isNew?: boolean;                 // only for clearly common patterns missing from the 24; give name and oneLine too
  name?: string; oneLine?: string;
  targets: { profiles: string[] /* names from fraud-patterns.json profiles */; traits: Trait[] };
  signals: { signal: Signal; weight: 1|2|3 }[];   // findings that make it likely, 3 = strongest
  prevalence: { level: "very common"|"common"|"emerging"|"rare"; trend: "rising"|"steady"|"falling"; asOf: string; sourceIds: string[] };
  cases: { title: string; date: string; outlet: string; url: string }[];   // real reported cases, 1 to 3
  channels: string[];              // e.g. "email","sms","phone","linkedin","whatsapp","x","telegram","in person","post"
  unfolds: string[];               // 3 to 5 short steps of how it plays out
};

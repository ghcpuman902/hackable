import type { CatalogueSource, PatternMeta } from "./pattern-catalogue.types";

export const SOURCES_B: CatalogueSource[] = [
  { id: "ic3-ai-2024", title: "Criminals Use Generative Artificial Intelligence to Facilitate Financial Fraud", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA241203", date: "2024-12-03" },
  { id: "ic3-airdrop-2025", title: "Cyber Criminals Defraud Hedera Hashgraph Network Non-Custodial Wallet Users Through Nonfungible Token Airdrops Disguised as Free Rewards", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2025/PSA250603", date: "2025-06-03" },
  { id: "ic3-dating-2024", title: "New Verification Schemes Target Users of Online Dating Platforms", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA240426", date: "2024-04-26" },
  { id: "microsoft-star-blizzard-2025", title: "New Star Blizzard spear-phishing campaign targets WhatsApp accounts", outlet: "Microsoft Security", url: "https://www.microsoft.com/en-us/security/blog/2025/01/16/new-star-blizzard-spear-phishing-campaign-targets-whatsapp-accounts/", date: "2025-01-16" },
  { id: "ic3-exchange-2024", title: "FBI Warns of Scammers Impersonating Cryptocurrency Exchanges", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA240801", date: "2024-08-01" },
  { id: "ic3-courier-2026", title: "Scammers Use Couriers to Collect Cash in Cryptocurrency Investment Scams", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2026/PSA260615", date: "2026-06-15" },
];

const caseOf = (source: CatalogueSource) => ({ title: source.title, date: source.date, outlet: source.outlet, url: source.url });
const source = (id: string) => SOURCES_B.find((item) => item.id === id)!;

export const PART_B: PatternMeta[] = [
  {
    id: "deepfake-crypto-giveaway", targets: { profiles: ["crypto-worker", "high-value-individual"], traits: ["crypto-holder", "public-figure"] },
    signals: [{ signal: "crypto-activity", weight: 3 }, { signal: "large-following", weight: 2 }, { signal: "news-mentions", weight: 2 }],
    prevalence: { level: "emerging", trend: "rising", asOf: "2024-12-03", sourceIds: ["ic3-ai-2024", "ic3-airdrop-2025"] },
    cases: [caseOf(source("ic3-ai-2024")), caseOf(source("ic3-airdrop-2025"))], channels: ["x", "youtube", "post", "email"],
    unfolds: ["A familiar face promotes a giveaway", "The post sends people to a wallet link", "A payment or signature is requested", "The crypto is taken"],
  },
  {
    id: "wallet-drainer", targets: { profiles: ["crypto-worker"], traits: ["crypto-holder"] },
    signals: [{ signal: "crypto-activity", weight: 3 }, { signal: "stealer-log", weight: 2 }, { signal: "same-username-many-sites", weight: 1 }],
    prevalence: { level: "common", trend: "rising", asOf: "2025-06-03", sourceIds: ["ic3-airdrop-2025", "ic3-exchange-2024"] },
    cases: [caseOf(source("ic3-airdrop-2025")), caseOf(source("ic3-exchange-2024"))], channels: ["email", "x", "discord", "post"],
    unfolds: ["A reward or account warning arrives", "A link opens a fake wallet page", "The wallet is connected or a secret is entered", "Funds move to the criminal"],
  },
  {
    id: "pig-butchering", targets: { profiles: ["romance-target", "crypto-worker"], traits: ["crypto-holder", "older-person", "general"] },
    signals: [{ signal: "phone-exposed", weight: 2 }, { signal: "same-username-many-sites", weight: 2 }, { signal: "crypto-activity", weight: 2 }],
    prevalence: { level: "very common", trend: "rising", asOf: "2026-06-15", sourceIds: ["ic3-courier-2026", "ic3-dating-2024", "ic3-ai-2024"] },
    cases: [caseOf(source("ic3-courier-2026")), caseOf(source("ic3-dating-2024")), caseOf(source("ic3-ai-2024"))], channels: ["sms", "dating app", "whatsapp", "telegram"],
    unfolds: ["A stranger starts a friendly chat", "Trust builds over time", "They suggest a trading platform", "Fake returns lead to larger payments", "Withdrawal fees keep the money trapped"],
  },
  {
    id: "romance-scam", targets: { profiles: ["romance-target"], traits: ["older-person", "general"] },
    signals: [{ signal: "same-username-many-sites", weight: 2 }, { signal: "phone-exposed", weight: 1 }, { signal: "large-following", weight: 1 }],
    prevalence: { level: "common", trend: "rising", asOf: "2024-12-03", sourceIds: ["ic3-dating-2024", "ic3-ai-2024"] },
    cases: [caseOf(source("ic3-dating-2024")), caseOf(source("ic3-ai-2024"))], channels: ["dating app", "instagram", "whatsapp", "email"],
    unfolds: ["A new online contact moves the chat", "They create closeness quickly", "A link, fee or emergency follows", "Money or personal details are taken"],
  },
  {
    id: "news-hook-phishing", targets: { profiles: ["target-of-spies", "high-value-individual"], traits: ["journalist-activist", "executive", "general"] },
    signals: [{ signal: "news-mentions", weight: 3 }, { signal: "public-role", weight: 2 }, { signal: "email-exposed", weight: 2 }],
    prevalence: { level: "common", trend: "rising", asOf: "2025-01-16", sourceIds: ["microsoft-star-blizzard-2025", "ic3-ai-2024"] },
    cases: [caseOf(source("microsoft-star-blizzard-2025")), caseOf(source("ic3-ai-2024"))], channels: ["email", "whatsapp", "x"],
    unfolds: ["A topical story makes the message relevant", "A trusted identity is copied", "The message contains a link or QR code", "The sign in or account is captured"],
  },
  {
    id: "after-move-council-letter", targets: { profiles: [], traits: ["recent-mover", "general"] },
    signals: [{ signal: "address-exposed", weight: 3 }, { signal: "email-exposed", weight: 1 }],
    prevalence: { level: "common", trend: "steady", asOf: "2024-12-03", sourceIds: ["ic3-ai-2024"] },
    cases: [caseOf(source("ic3-ai-2024"))], channels: ["post", "email", "sms"],
    unfolds: ["A move makes a council or utility request plausible", "A letter or message asks for a fee or update", "A link collects payment or identity details", "The money or data is taken"],
  },
  {
    id: "fake-charity", targets: { profiles: [], traits: ["older-person", "parent", "general"] },
    signals: [{ signal: "news-mentions", weight: 2 }, { signal: "large-following", weight: 1 }, { signal: "email-exposed", weight: 1 }],
    prevalence: { level: "common", trend: "rising", asOf: "2024-12-03", sourceIds: ["ic3-ai-2024"] },
    cases: [caseOf(source("ic3-ai-2024"))], channels: ["post", "email", "sms"],
    unfolds: ["A crisis or personal event is used in an appeal", "Images make the appeal look genuine", "A donation page collects card or crypto details", "The appeal disappears after payment"],
  },
  {
    id: "fake-booking-or-visa", targets: { profiles: [], traits: ["traveller", "general"] },
    signals: [{ signal: "breach-travel", weight: 3 }, { signal: "email-exposed", weight: 2 }, { signal: "phone-exposed", weight: 1 }],
    prevalence: { level: "common", trend: "steady", asOf: "2024-12-03", sourceIds: ["ic3-ai-2024"] },
    cases: [caseOf(source("ic3-ai-2024"))], channels: ["search", "email", "sms"],
    unfolds: ["A traveller searches for a booking or visa", "A convincing site offers a quick answer", "Payment or passport details are requested", "The booking or visa does not exist"],
  },
  {
    id: "marketplace-fake-buyer", targets: { profiles: [], traits: ["online-seller", "small-business"] },
    signals: [{ signal: "breach-marketplace", weight: 3 }, { signal: "email-exposed", weight: 2 }, { signal: "phone-exposed", weight: 1 }],
    prevalence: { level: "common", trend: "steady", asOf: "2024-12-03", sourceIds: ["ic3-ai-2024"] },
    cases: [caseOf(source("ic3-ai-2024"))], channels: ["marketplace", "email", "sms", "whatsapp"],
    unfolds: ["A buyer responds to an advert", "They claim payment is waiting", "A link asks the seller to verify details", "Card or login details are stolen"],
  },
  {
    id: "qr-code-phishing", targets: { profiles: ["target-of-spies"], traits: ["executive", "journalist-activist", "general"] },
    signals: [{ signal: "public-role", weight: 2 }, { signal: "email-exposed", weight: 2 }, { signal: "news-mentions", weight: 1 }],
    prevalence: { level: "emerging", trend: "rising", asOf: "2025-01-16", sourceIds: ["microsoft-star-blizzard-2025"] },
    cases: [caseOf(source("microsoft-star-blizzard-2025"))], channels: ["email", "post", "in person"],
    unfolds: ["A message or notice includes a QR code", "The code opens a familiar looking page", "The page asks to link or sign in", "The account session is exposed"],
  },
  {
    id: "state-spearphishing", targets: { profiles: ["target-of-spies"], traits: ["journalist-activist", "executive", "public-figure"] },
    signals: [{ signal: "public-role", weight: 3 }, { signal: "news-mentions", weight: 3 }, { signal: "same-username-many-sites", weight: 2 }, { signal: "linkedin-presence", weight: 1 }],
    prevalence: { level: "common", trend: "rising", asOf: "2025-01-16", sourceIds: ["microsoft-star-blizzard-2025", "ic3-ai-2024"] },
    cases: [caseOf(source("microsoft-star-blizzard-2025")), caseOf(source("ic3-ai-2024"))], channels: ["email", "whatsapp", "linkedin"],
    unfolds: ["The target's work and contacts are researched", "A known person or institution is impersonated", "A tailored invite or document arrives", "A link or QR code gives account access"],
  },
  {
    id: "doxxing-swatting", targets: { profiles: ["target-of-spies", "high-value-individual"], traits: ["public-figure", "journalist-activist", "executive"] },
    signals: [{ signal: "address-exposed", weight: 3 }, { signal: "phone-exposed", weight: 2 }, { signal: "large-following", weight: 2 }, { signal: "news-mentions", weight: 1 }],
    prevalence: { level: "emerging", trend: "rising", asOf: "2024-12-03", sourceIds: ["ic3-ai-2024"] },
    cases: [caseOf(source("ic3-ai-2024"))], channels: ["x", "post", "phone", "email"],
    unfolds: ["Personal details are gathered from public traces", "Details are published or used to impersonate the person", "Threats or false reports are made", "The target faces harassment or an emergency response"],
  },
];

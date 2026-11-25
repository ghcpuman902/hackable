// Pattern catalogue, part B2 (research pass B0b, 25 Nov 2026).
// Deeper replacement for part B: crypto and romance, news and travel, charity, marketplace, QR, state actors and doxxing.
// Hidden metadata for the deterministic scoring; not shown to users.
// Every URL below was opened during the B0b pass. Dates are as printed on the page.
// Netcraft's quishing post is left out because its visible date and page metadata disagree.

import type { CatalogueSource, PatternMeta } from "./pattern-catalogue.types";

export const SOURCES_B2: CatalogueSource[] = [
  // Deepfake crypto giveaway
  { id: "bitdefender-streamjacking-2024", title: "Stream-Jacking 2.0: Deep fakes power account takeovers on YouTube to maximize crypto-doubling scams", outlet: "Bitdefender Labs", url: "https://www.bitdefender.com/en-us/blog/labs/stream-jacking-2-0-deep-fakes-power-account-takeovers-on-youtube-to-maximize-crypto-doubling-scams", date: "2024-01-18" },
  { id: "helpnet-youtube-2025", title: "The dark side of YouTube: Malicious links, phishing, and deepfakes", outlet: "Help Net Security", url: "https://www.helpnetsecurity.com/2025/04/23/most-common-youtube-scams/", date: "2025-04-23" },
  { id: "ic3-ai-2024", title: "Criminals Use Generative Artificial Intelligence to Facilitate Financial Fraud", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA241203", date: "2024-12-03" },

  // Wallet drainer
  { id: "scamsniffer-2025", title: "Scam Sniffer 2025: Crypto Phishing Losses Fall 83% to $84 Million", outlet: "ScamSniffer", url: "https://drops.scamsniffer.io/scam-sniffer-2025-crypto-phishing-losses-fall-83-to-84-million/", date: "2026-01-03" },
  { id: "ic3-airdrop-2025", title: "Cyber Criminals Defraud Hedera Hashgraph Network Non-Custodial Wallet Users Through Nonfungible Token Airdrops Disguised as Free Rewards", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2025/PSA250603", date: "2025-06-03" },
  { id: "ic3-exchange-2024", title: "FBI Warns of Scammers Impersonating Cryptocurrency Exchanges", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA240801", date: "2024-08-01" },

  // Pig butchering
  { id: "cointelegraph-pig-2025", title: "Chainalysis says pig-butchering is becoming national security threat", outlet: "Cointelegraph", url: "https://cointelegraph.com/news/pig-butchering-national-security-threat-chainalysis-warning", date: "2025-11-14" },
  { id: "theblock-pig-2025", title: "Funds lost in pig butchering crypto scams soared 40% in 2024: Chainalysis", outlet: "The Block", url: "https://www.theblock.co/amp/post/340858/funds-lost-in-pig-butchering-crypto-scams-soared-40-in-2024-chainalysis", date: "2025-02-14" },
  { id: "ic3-courier-2026", title: "Scammers Use Couriers to Collect Cash in Cryptocurrency Investment Scams", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2026/PSA260615", date: "2026-06-15" },

  // Romance scam
  { id: "ftc-imposter-2026", title: "New trends in reports of imposter scams", outlet: "Federal Trade Commission", url: "https://consumer.ftc.gov/consumer-alerts/2026/05/new-trends-reports-imposter-scams", date: "2026-05-07" },
  { id: "ic3-dating-2024", title: "New Verification Schemes Target Users of Online Dating Platforms", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA240426", date: "2024-04-26" },
  { id: "tnw-ftc-social-2026", title: "Social media scams cost Americans $2.1 billion in 2025", outlet: "The Next Web", url: "https://thenextweb.com/news/ftc-social-media-scams-2-1-billion", date: "2026-04-28" },

  // News hook phishing
  { id: "cofense-assassination-2024", title: "Cofense Intelligence Identifies U.S. Presidential Assassination-Themed Phishing Campaign", outlet: "Cofense", url: "https://cofense.com/blog/cofense-intelligence-identifies-u-s-presidential-assassination-themed-phishing-campaign", date: "2024-11-15" },
  { id: "paubox-missile-qr-2026", title: "Fake missile alerts used in phishing campaign amid Iran-US tensions", outlet: "Paubox", url: "https://www.paubox.com/blog/fake-missile-alerts-used-in-phishing-campaign-amid-iran-us-tensions", date: "2026-04-28" },
  { id: "register-apt42-2024", title: "Google raps Iran's APT42 for raining down spear-phishing attacks", outlet: "The Register", url: "https://www.theregister.com/2024/08/15/google_iran_apt42_campaigns/", date: "2024-08-15" },

  // After a house move
  { id: "wales247-council-tax-2026", title: "Cardiff residents warned over fake Council Tax website", outlet: "Wales 247", url: "https://www.wales247.co.uk/cardiff-residents-warned-over-fake-council-tax-website", date: "2026-02-16" },
  { id: "bromley-trading-standards-2025", title: "Trading Standards alert: Suspicious websites warning", outlet: "London Borough of Bromley", url: "https://www.bromley.gov.uk/news/article/873/trading-standards-alert-suspicious-websites-warning", date: "2025-08-26" },
  { id: "spectator-driving-licence-2025", title: "The £486 driving licence con", outlet: "The Spectator Australia", url: "https://www.spectator.com.au/2025/05/the-486-driving-licence-con/", date: "2025-05-17" },

  // Fake charity
  { id: "ic3-charity-2025", title: "Beware of Charitable Fraud Related to Mass Casualty and Disaster Events", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2025/PSA250116", date: "2025-01-16" },
  { id: "ftc-donations-2026", title: "When donating, support those in need, not a scammer", outlet: "Federal Trade Commission", url: "https://consumer.ftc.gov/consumer-alerts/2026/08/when-donating-support-those-need-not-scammer", date: "2026-08-27" },
  { id: "netcraft-melissa-2025", title: "Hurricane Melissa Jamaica Relief Scams", outlet: "Netcraft", url: "https://www.netcraft.com/blog/hurricane-melissa-jamaica-relief-scams", date: "2025-11-13" },
  { id: "opm-jamaica-melissa-2025", title: "Jamaica Cyber Incident Response Team Issues Urgent Warning About Fraudulent Hurricane Melissa Donation Websites", outlet: "Office of the Prime Minister, Jamaica", url: "https://opm.gov.jm/jamaica-cyber-incident-response-team-issues-urgent-warning-about-fraudulent-hurricane-melissa-donation-websites/", date: "2025-10-31" },

  // Fake booking or visa
  { id: "malwarebytes-booking-2025", title: "Booking.com reservation abused as cybercriminals steal from travelers", outlet: "Malwarebytes", url: "https://www.malwarebytes.com/it/blog/news/2025/06/booking-com-abused-by-cybercriminals-to-steal-from-travelers", date: "2025-06-06" },
  { id: "bitdefender-whatsapp-hotels-2026", title: "From ski resorts to F1 weekends: How WhatsApp hotel scams target travelers", outlet: "Bitdefender", url: "https://www.bitdefender.com/en-us/blog/hotforsecurity/travelers-targeted-by-whatsapp-hotel-scams", date: "2026-06-17" },
  { id: "malwarebytes-eta-2025", title: "Travelers to the UK targeted in ETA scams", outlet: "Malwarebytes", url: "https://www.malwarebytes.com/blog/news/2025/09/travelers-to-the-uk-targeted-in-eta-scams", date: "2025-09-01" },
  { id: "ftc-esta-2026", title: "How to avoid scams while applying for ESTA", outlet: "Federal Trade Commission", url: "https://www.consumer.ftc.gov/consumer-alerts/2026/03/how-avoid-scams-while-applying-esta", date: "2026-03-11" },

  // Marketplace fake buyer
  { id: "which-marketplace-2024", title: "It's a steal: how we listed fake 'bargains' on marketplace websites", outlet: "Which?", url: "https://www.which.co.uk/news/article/its-a-steal-how-we-listed-fake-bargains-on-marketplace-websites-aQDLs8m1bFWa", date: "2024-12-12" },
  { id: "avast-fake-buyers-2026", title: "How to avoid the fake buyers flooding Facebook Marketplace", outlet: "Avast", url: "https://blog.avast.com/facebook-marketplace-fake-buyers", date: "2026-03-05" },

  // QR code phishing
  { id: "eset-quishing-2026", title: "How QR-code phishing can slip past corporate security measures", outlet: "WeLiveSecurity (ESET)", url: "https://www.welivesecurity.com/en/business-security/qr-code-phishing-slip-past-corporate-security-measures/", date: "2026-08-17" },
  { id: "zimperium-quishing-2026", title: "QR Code Phishing Surges as Attackers Shift Toward Mobile Tactics", outlet: "Zimperium", url: "https://zimperium.com/blog/mobile-threat-watch/qr-code-phishing-surges-as-attackers-shift-toward-mobile-tactics", date: "2026-05-20" },

  // State spearphishing
  { id: "microsoft-star-blizzard-2025", title: "New Star Blizzard spear-phishing campaign targets WhatsApp accounts", outlet: "Microsoft Threat Intelligence", url: "https://www.microsoft.com/en-us/security/blog/2025/01/16/new-star-blizzard-spear-phishing-campaign-targets-whatsapp-accounts/", date: "2025-01-16" },
  { id: "google-coldriver-lostkeys-2025", title: "COLDRIVER Using New Malware To Steal Documents From Western Targets and NGOs", outlet: "Google Threat Intelligence Group", url: "https://cloud.google.com/blog/topics/threat-intelligence/coldriver-steal-documents-western-targets-ngos", date: "2025-05-07" },
  { id: "google-unc6293-2025", title: "What's in an ASP? Creative Phishing Attack on Prominent Academics and Critics of Russia", outlet: "Google Threat Intelligence Group", url: "https://cloud.google.com/blog/topics/threat-intelligence/creative-phishing-academics-critics-of-russia", date: "2025-06-18" },

  // Doxxing and swatting
  { id: "ic3-swatting-2025", title: "Threat Actors Use \"Swatting\" to Target Victims Nationwide", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2025/PSA250429", date: "2025-04-29" },
  { id: "ic3-swatting-2026", title: "Ongoing Threats of Swatting and Indicators for Community Members", outlet: "FBI IC3", url: "https://ic3.gov/PSA/2026/PSA260804", date: "2026-08-04" },
  { id: "register-swatting-2025", title: "FBI steps in amid rash of politically charged swattings", outlet: "The Register", url: "https://www.theregister.com/2025/04/30/fbi_crackdown_on_swatting_not", date: "2025-04-30" },
];

export const PART_B2: PatternMeta[] = [
  // ── Crypto and romance ──────────────────────────────────────────
  {
    id: "deepfake-crypto-giveaway",
    targets: { profiles: ["crypto-worker", "high-value-individual"], traits: ["crypto-holder", "public-figure"] },
    signals: [
      { signal: "crypto-activity", weight: 3 },
      { signal: "large-following", weight: 2 },
      { signal: "news-mentions", weight: 2 },
      { signal: "same-username-many-sites", weight: 1 },
    ],
    prevalence: { level: "common", trend: "rising", asOf: "2025-04-23", sourceIds: ["helpnet-youtube-2025", "bitdefender-streamjacking-2024", "ic3-ai-2024"] },
    cases: [
      { title: "Hijacked YouTube channels renamed after big brands stream looped deepfakes of Michael Saylor offering to double crypto", date: "2024-01-18", outlet: "Bitdefender Labs", url: "https://www.bitdefender.com/en-us/blog/labs/stream-jacking-2-0-deep-fakes-power-account-takeovers-on-youtube-to-maximize-crypto-doubling-scams" },
      { title: "Deepfakes of Elon Musk promote fake giveaways, and a deepfake of YouTube's CEO is used in a monetisation phishing scam", date: "2025-04-23", outlet: "Help Net Security", url: "https://www.helpnetsecurity.com/2025/04/23/most-common-youtube-scams/" },
    ],
    channels: ["youtube", "x", "email", "livestream"],
    unfolds: [
      "A channel with a large audience is taken over and renamed after a well known brand or person",
      "A looped deepfake livestream promises to double any crypto sent",
      "A QR code or wallet address is shown on screen",
      "Whatever is sent to the wallet is not returned",
    ],
  },
  {
    id: "wallet-drainer",
    targets: { profiles: ["crypto-worker"], traits: ["crypto-holder"] },
    signals: [
      { signal: "crypto-activity", weight: 3 },
      { signal: "stealer-log", weight: 2 },
      { signal: "same-username-many-sites", weight: 1 },
      { signal: "email-exposed", weight: 1 },
    ],
    prevalence: { level: "common", trend: "falling", asOf: "2026-01-03", sourceIds: ["scamsniffer-2025", "ic3-airdrop-2025", "ic3-exchange-2024"] },
    cases: [
      { title: "Wallet drainer phishing took $83.85M from 106,106 victims in 2025, including a $6.5M Permit signature theft in September", date: "2026-01-03", outlet: "ScamSniffer", url: "https://drops.scamsniffer.io/scam-sniffer-2025-crypto-phishing-losses-fall-83-to-84-million/" },
      { title: "NFT airdrops with a link in the memo send Hedera wallet users to a fake app that asks for a seed phrase", date: "2025-06-03", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2025/PSA250603" },
    ],
    channels: ["email", "x", "discord", "wallet memo", "search ads"],
    unfolds: [
      "A free reward, airdrop or account warning arrives",
      "A link opens a convincing copy of a wallet or exchange page",
      "The wallet is connected or a signature, login or seed phrase is entered",
      "Funds move to the criminal's address",
    ],
  },
  {
    id: "pig-butchering",
    targets: { profiles: ["romance-target", "crypto-worker"], traits: ["crypto-holder", "older-person", "general"] },
    signals: [
      { signal: "phone-exposed", weight: 2 },
      { signal: "same-username-many-sites", weight: 2 },
      { signal: "crypto-activity", weight: 2 },
      { signal: "linkedin-presence", weight: 1 },
      { signal: "breach-any", weight: 1 },
    ],
    prevalence: { level: "very common", trend: "rising", asOf: "2026-06-15", sourceIds: ["ic3-courier-2026", "cointelegraph-pig-2025", "theblock-pig-2025"] },
    cases: [
      { title: "Scammers send couriers to collect cash from older victims to protect fake crypto investments", date: "2026-06-15", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2026/PSA260615" },
      { title: "Asia Pacific law enforcement with Chainalysis, OKX, Tether and Binance froze $47 million in pig butchering funds", date: "2025-11-14", outlet: "Cointelegraph", url: "https://cointelegraph.com/news/pig-butchering-national-security-threat-chainalysis-warning" },
    ],
    channels: ["sms", "whatsapp", "telegram", "dating app", "linkedin", "in person"],
    unfolds: [
      "A stranger sends a wrong number text or a friendly message",
      "The chat moves to a messaging app and builds over weeks",
      "They share a trading platform that shows growing returns",
      "Withdrawals are blocked by fees, taxes or penalties",
      "A fake recovery firm contacts the victim afterwards",
    ],
  },
  {
    id: "romance-scam",
    targets: { profiles: ["romance-target"], traits: ["older-person", "general"] },
    signals: [
      { signal: "same-username-many-sites", weight: 2 },
      { signal: "phone-exposed", weight: 1 },
      { signal: "large-following", weight: 1 },
      { signal: "gravatar", weight: 1 },
    ],
    prevalence: { level: "common", trend: "rising", asOf: "2026-05-07", sourceIds: ["ftc-imposter-2026", "tnw-ftc-social-2026", "ic3-dating-2024"] },
    cases: [
      { title: "FTC: reported romance scam losses rose 22% in 2025, with scammers building a relationship before offering to help the victim invest", date: "2026-05-07", outlet: "Federal Trade Commission", url: "https://consumer.ftc.gov/consumer-alerts/2026/05/new-trends-reports-imposter-scams" },
      { title: "Dating site matches are sent a free verification link that collects card details and starts monthly charges", date: "2024-04-26", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA240426" },
    ],
    channels: ["dating app", "instagram", "facebook", "whatsapp", "email"],
    unfolds: [
      "A new match or follower starts a warm conversation",
      "They ask to move to an encrypted messaging app",
      "A verification link, investment tip or emergency follows",
      "Money, card details or personal information is taken",
    ],
  },

  // ── News, post and travel ───────────────────────────────────────
  {
    id: "news-hook-phishing",
    targets: { profiles: ["target-of-spies", "high-value-individual", "no-profile"], traits: ["journalist-activist", "executive", "public-figure", "general"] },
    signals: [
      { signal: "news-mentions", weight: 3 },
      { signal: "public-role", weight: 2 },
      { signal: "email-exposed", weight: 2 },
      { signal: "linkedin-presence", weight: 1 },
    ],
    prevalence: { level: "common", trend: "rising", asOf: "2026-04-28", sourceIds: ["paubox-missile-qr-2026", "cofense-assassination-2024", "register-apt42-2024"] },
    cases: [
      { title: "Emails falsely claiming the US president-elect had been assassinated, posing as a newspaper, led to a fake login portal", date: "2024-11-15", outlet: "Cofense", url: "https://cofense.com/blog/cofense-intelligence-identifies-u-s-presidential-assassination-themed-phishing-campaign" },
      { title: "Fake civil defence missile alerts carried a QR code that led to a fake Microsoft login page", date: "2026-04-28", outlet: "Paubox", url: "https://www.paubox.com/blog/fake-missile-alerts-used-in-phishing-campaign-amid-iran-us-tensions" },
      { title: "Iran's APT42 targeted people tied to the US election campaigns and posed as reporters and NGOs", date: "2024-08-15", outlet: "The Register", url: "https://www.theregister.com/2024/08/15/google_iran_apt42_campaigns/" },
    ],
    channels: ["email", "whatsapp", "x", "sms"],
    unfolds: [
      "A breaking story or crisis makes an urgent message believable",
      "The sender copies a newspaper, agency or colleague",
      "A link or QR code leads to a page with the victim's organisation branding",
      "The sign in is captured and the account is used",
    ],
  },
  {
    id: "after-move-council-letter",
    targets: { profiles: ["no-profile"], traits: ["recent-mover", "general"] },
    signals: [
      { signal: "address-exposed", weight: 3 },
      { signal: "email-exposed", weight: 1 },
      { signal: "phone-exposed", weight: 1 },
    ],
    prevalence: { level: "common", trend: "steady", asOf: "2026-02-16", sourceIds: ["wales247-council-tax-2026", "bromley-trading-standards-2025", "spectator-driving-licence-2025"] },
    cases: [
      { title: "Fake website charged Cardiff residents to update their address for Council Tax, a service the council provides free", date: "2026-02-16", outlet: "Wales 247", url: "https://www.wales247.co.uk/cardiff-residents-warned-over-fake-council-tax-website" },
      { title: "A resident paid £39 to a lookalike site for a driving licence address change that is free on the official site", date: "2025-08-26", outlet: "London Borough of Bromley", url: "https://www.bromley.gov.uk/news/article/873/trading-standards-alert-suspicious-websites-warning" },
      { title: "After a licence address change, a copycat firm set up a £39 monthly charge, advertised as £486 a year", date: "2025-05-17", outlet: "The Spectator Australia", url: "https://www.spectator.com.au/2025/05/the-486-driving-licence-con/" },
    ],
    channels: ["search ads", "post", "email", "phone"],
    unfolds: [
      "A recent move creates many address changes to make",
      "A search result or letter offers to handle one for a fee",
      "The page looks official and asks for card and identity details",
      "A free service has been paid for, sometimes with a recurring charge",
    ],
  },
  {
    id: "fake-charity",
    targets: { profiles: ["no-profile"], traits: ["older-person", "parent", "general"] },
    signals: [
      { signal: "news-mentions", weight: 2 },
      { signal: "large-following", weight: 1 },
      { signal: "email-exposed", weight: 1 },
      { signal: "phone-exposed", weight: 1 },
    ],
    prevalence: { level: "common", trend: "steady", asOf: "2026-08-27", sourceIds: ["ic3-charity-2025", "ftc-donations-2026", "netcraft-melissa-2025", "opm-jamaica-melissa-2025"] },
    cases: [
      { title: "More than 4,500 fake charity and disaster relief complaints in 2024, with scammers using the New Orleans attack and Los Angeles wildfires", date: "2025-01-16", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2025/PSA250116" },
      { title: "Fake Hurricane Melissa relief sites asked for bitcoin to QR codes whose wallets had no transactions", date: "2025-11-13", outlet: "Netcraft", url: "https://www.netcraft.com/blog/hurricane-melissa-jamaica-relief-scams" },
      { title: "Jamaica's cyber response team listed fraudulent Hurricane Melissa donation domains and named the one official site", date: "2025-10-31", outlet: "Office of the Prime Minister, Jamaica", url: "https://opm.gov.jm/jamaica-cyber-incident-response-team-issues-urgent-warning-about-fraudulent-hurricane-melissa-donation-websites/" },
    ],
    channels: ["email", "sms", "social media", "phone", "crowdfunding"],
    unfolds: [
      "A disaster or tragedy in the news prompts an appeal",
      "A page or profile copies a real charity or a victim's story",
      "Donations are requested by crypto, gift card, wire or cash",
      "The money is gone and the appeal disappears",
    ],
  },
  {
    id: "fake-booking-or-visa",
    targets: { profiles: ["no-profile"], traits: ["traveller", "general"] },
    signals: [
      { signal: "breach-travel", weight: 3 },
      { signal: "email-exposed", weight: 2 },
      { signal: "phone-exposed", weight: 2 },
      { signal: "breach-any", weight: 1 },
    ],
    prevalence: { level: "common", trend: "rising", asOf: "2026-06-17", sourceIds: ["bitdefender-whatsapp-hotels-2026", "malwarebytes-booking-2025", "malwarebytes-eta-2025", "ftc-esta-2026"] },
    cases: [
      { title: "A message in a genuine Booking.com thread asked for prepayment through a lookalike payment link", date: "2025-06-06", outlet: "Malwarebytes", url: "https://www.malwarebytes.com/it/blog/news/2025/06/booking-com-abused-by-cybercriminals-to-steal-from-travelers" },
      { title: "WhatsApp messages impersonating hotels in more than 10 countries asked guests to verify their card or lose the booking in 24 hours", date: "2026-06-17", outlet: "Bitdefender", url: "https://www.bitdefender.com/en-us/blog/hotforsecurity/travelers-targeted-by-whatsapp-hotel-scams" },
      { title: "Sponsored ads and top search results lead UK ETA applicants to sites that overcharge or take payment and deliver nothing", date: "2025-09-01", outlet: "Malwarebytes", url: "https://www.malwarebytes.com/blog/news/2025/09/travelers-to-the-uk-targeted-in-eta-scams" },
    ],
    channels: ["whatsapp", "email", "sms", "search ads", "booking platform messages"],
    unfolds: [
      "A traveller has a real booking or needs a visa or travel authorisation",
      "A message quotes real trip details, or a search ad offers a quick application",
      "A page asks the traveller to verify card details or pay an inflated fee",
      "Card details are used, or the visa or booking does not exist",
    ],
  },
  {
    id: "marketplace-fake-buyer",
    targets: { profiles: ["no-profile"], traits: ["online-seller", "small-business"] },
    signals: [
      { signal: "breach-marketplace", weight: 3 },
      { signal: "email-exposed", weight: 2 },
      { signal: "phone-exposed", weight: 2 },
      { signal: "same-username-many-sites", weight: 1 },
    ],
    prevalence: { level: "common", trend: "steady", asOf: "2026-03-05", sourceIds: ["avast-fake-buyers-2026", "which-marketplace-2024", "tnw-ftc-social-2026"] },
    cases: [
      { title: "Which? listed fake bargains and saw scammers push buyers to bank transfer, PayPal Friends and Family and gift cards", date: "2024-12-12", outlet: "Which?", url: "https://www.which.co.uk/news/article/its-a-steal-how-we-listed-fake-bargains-on-marketplace-websites-aQDLs8m1bFWa" },
      { title: "A seller lost both a $25,000 Jeep and the payment after a cashier's check from a buyer did not clear", date: "2026-03-05", outlet: "Avast", url: "https://blog.avast.com/facebook-marketplace-fake-buyers" },
    ],
    channels: ["marketplace", "whatsapp", "telegram", "signal", "email", "sms"],
    unfolds: [
      "A buyer replies quickly and asks to move the chat off the platform",
      "They say they have paid, or overpay and ask for the difference back",
      "A link or code asks the seller to verify details to receive the money",
      "The original payment fails or the card or login details are taken",
    ],
  },
  {
    id: "qr-code-phishing",
    targets: { profiles: ["no-profile", "target-of-spies"], traits: ["general", "executive", "journalist-activist", "traveller"] },
    signals: [
      { signal: "email-exposed", weight: 2 },
      { signal: "public-role", weight: 2 },
      { signal: "linkedin-presence", weight: 1 },
      { signal: "news-mentions", weight: 1 },
    ],
    prevalence: { level: "common", trend: "rising", asOf: "2026-08-17", sourceIds: ["eset-quishing-2026", "zimperium-quishing-2026", "microsoft-star-blizzard-2025", "paubox-missile-qr-2026"] },
    cases: [
      { title: "Star Blizzard emails used a QR code that linked the target's WhatsApp to the attacker's device", date: "2025-01-16", outlet: "Microsoft Threat Intelligence", url: "https://www.microsoft.com/en-us/security/blog/2025/01/16/new-star-blizzard-spear-phishing-campaign-targets-whatsapp-accounts/" },
      { title: "Fake civil defence alerts relied on a QR code instead of a link, which avoided link scanning", date: "2026-04-28", outlet: "Paubox", url: "https://www.paubox.com/blog/fake-missile-alerts-used-in-phishing-campaign-amid-iran-us-tensions" },
    ],
    channels: ["email", "post", "in person", "pdf"],
    unfolds: [
      "A message or notice includes a QR code instead of a link",
      "Scanning moves the victim from a managed computer to a personal phone",
      "The page asks for a sign in or to link a device",
      "The login, code or account session is captured",
    ],
  },

  // ── Targeted people ─────────────────────────────────────────────
  {
    id: "state-spearphishing",
    targets: { profiles: ["target-of-spies"], traits: ["journalist-activist", "executive", "public-figure"] },
    signals: [
      { signal: "public-role", weight: 3 },
      { signal: "news-mentions", weight: 3 },
      { signal: "same-username-many-sites", weight: 2 },
      { signal: "linkedin-presence", weight: 1 },
      { signal: "email-exposed", weight: 2 },
    ],
    prevalence: { level: "common", trend: "rising", asOf: "2025-06-18", sourceIds: ["google-unc6293-2025", "google-coldriver-lostkeys-2025", "microsoft-star-blizzard-2025", "register-apt42-2024"] },
    cases: [
      { title: "Impersonating the US State Department, UNC6293 persuaded academics and Russia critics to create and share an app password", date: "2025-06-18", outlet: "Google Threat Intelligence Group", url: "https://cloud.google.com/blog/topics/threat-intelligence/creative-phishing-academics-critics-of-russia" },
      { title: "Star Blizzard invited targets to a WhatsApp group about Ukraine NGOs, using a QR code that linked their account", date: "2025-01-16", outlet: "Microsoft Threat Intelligence", url: "https://www.microsoft.com/en-us/security/blog/2025/01/16/new-star-blizzard-spear-phishing-campaign-targets-whatsapp-accounts/" },
      { title: "COLDRIVER used a fake CAPTCHA lure to deliver LOSTKEYS malware against Western targets and NGOs", date: "2025-05-07", outlet: "Google Threat Intelligence Group", url: "https://cloud.google.com/blog/topics/threat-intelligence/coldriver-steal-documents-western-targets-ngos" },
    ],
    channels: ["email", "whatsapp", "linkedin", "calendar invite", "pdf"],
    unfolds: [
      "The target's work, topics and contacts are researched from public pages",
      "A known official, researcher or institution is impersonated",
      "A friendly exchange builds trust before a document or invite arrives",
      "The target is asked to share a code, scan a QR code or run a command",
      "The mailbox or messages are read in the background",
    ],
  },
  {
    id: "doxxing-swatting",
    targets: { profiles: ["target-of-spies", "high-value-individual"], traits: ["public-figure", "journalist-activist", "executive"] },
    signals: [
      { signal: "address-exposed", weight: 3 },
      { signal: "phone-exposed", weight: 2 },
      { signal: "large-following", weight: 2 },
      { signal: "public-role", weight: 1 },
      { signal: "news-mentions", weight: 1 },
    ],
    prevalence: { level: "emerging", trend: "rising", asOf: "2026-08-04", sourceIds: ["ic3-swatting-2026", "ic3-swatting-2025", "register-swatting-2025"] },
    cases: [
      { title: "FBI steps in after a run of swattings of podcasters and public figures, including a fake bomb call traced to a Russian IP address", date: "2025-04-30", outlet: "The Register", url: "https://www.theregister.com/2025/04/30/fbi_crackdown_on_swatting_not" },
      { title: "FBI reports swatting shifting to coordinated hoax calls across schools, government buildings, religious sites and hospitals", date: "2026-08-04", outlet: "FBI IC3", url: "https://ic3.gov/PSA/2026/PSA260804" },
    ],
    channels: ["phone", "x", "email", "voip", "forums"],
    unfolds: [
      "Personal details are collected from accounts and public records",
      "A hoax call or report is made, spoofed to appear to come from the victim",
      "A large armed response arrives at the address",
      "Details may be published, and the harassment continues",
    ],
  },
];

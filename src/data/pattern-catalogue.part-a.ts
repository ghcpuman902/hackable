// Pattern catalogue, part A (research pass R0, 25 Nov 2026).
// Groups: Work and money, Logins and accounts, Calls and impersonation.
// Hidden metadata for the deterministic scoring; not shown to users.
// Every URL below was opened during the R0 pass. Dates are as printed on the page
// (MITRE technique pages: the "Created" date; HIBP: the "Added to HIBP" date).

import type { CatalogueSource, PatternMeta } from "./pattern-catalogue.types";

export const SOURCES_A: CatalogueSource[] = [
  // Fake job coding test
  { id: "unit42-contagious-interview-2023", title: "Hacking Employers and Seeking Employment: Two Job-Related Campaigns Bear Hallmarks of North Korean Threat Actors", outlet: "Palo Alto Networks Unit 42", url: "https://unit42.paloaltonetworks.com/two-campaigns-by-north-korea-bad-actors-target-job-hunters/", date: "2023-11-21" },
  { id: "ic3-psa240903", title: "North Korea Aggressively Targeting Crypto Industry with Well-Disguised Social Engineering Attacks", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA240903", date: "2024-09-03" },
  { id: "atlassian-contagious-interview-2026", title: "From fake interviews to malicious repositories: Disrupting Contagious Interview", outlet: "Atlassian", url: "https://www.atlassian.com/blog/how-we-build/disrupting-contagious-interview", date: "2026-09-21" },
  { id: "securityaffairs-contagious-30000-2026", title: "Contagious Interview: 30,000 devices infected by a fake job interview", outlet: "Security Affairs", url: "https://securityaffairs.com/199506/uncategorized/contagious-interview-30000-devices-infected-by-a-fake-job-interview.html", date: "2026-09-22" },

  // Paid tasks job offer
  { id: "ftc-task-scams-2024", title: "Paying to get paid: gamified job scams drive record losses", outlet: "Federal Trade Commission", url: "https://ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses", date: "2024-12-12" },
  { id: "ic3-psa240604", title: "Scammers Defraud Individuals via Work-From-Home Scams", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA240604", date: "2024-06-04" },
  { id: "bleeping-ftc-task-scams-2024", title: "FTC warns of online task job scams hooking victims like gambling", outlet: "BleepingComputer", url: "https://www.bleepingcomputer.com/news/security/ftc-warns-of-online-task-job-scams-hooking-victims-like-gambling/", date: "2024-12-13" },
  { id: "inquirer-job-scams-2025", title: "Job scams are on the rise and more people are falling for them. Protect yourself with these tips.", outlet: "The Philadelphia Inquirer (AP)", url: "https://www.inquirer.com/business/job-scams-rising-tasks-whatsapp-20250711.html", date: "2025-07-11" },

  // Fake boss payment email
  { id: "ic3-psa240911", title: "Business Email Compromise: The $55 Billion Scam", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA240911", date: "2024-09-11" },
  { id: "proofpoint-ic3-2024-losses", title: "Email Attacks Drive Record Cybercrime Losses in 2024", outlet: "Proofpoint", url: "https://www.proofpoint.com/us/blog/email-and-cloud-threats/email-attacks-drive-record-cybercrime-losses-2024", date: "2025-05-01" },
  { id: "nacha-bec-8-5bn-2025", title: "FBI's IC3 Finds Almost $8.5 Billion Lost to Business Email Compromise in Last Three Years", outlet: "Nacha", url: "https://www.nacha.org/news/fbis-ic3-finds-almost-85-billion-lost-business-email-compromise-last-three-years", date: "2025-04-24" },
  { id: "fortune-arup-deepfake-2024", title: "A deepfake 'CFO' tricked the British design firm behind the Sydney Opera House in $25 million scam", outlet: "Fortune", url: "https://fortune.com/europe/2024/05/17/arup-deepfake-fraud-scam-victim-hong-kong-25-million-cfo/", date: "2024-05-17" },
  { id: "cfodive-arup-deepfake-2024", title: "Scammers siphon $25M from engineering firm Arup via AI deepfake 'CFO'", outlet: "CFO Dive", url: "https://www.cfodive.com/news/scammers-siphon-25m-engineering-firm-arup-deepfake-cfo-ai/716501/", date: "2024-05-17" },

  // Fake HR payroll change
  { id: "ic3-psa180918", title: "Cybercriminals Utilize Social Engineering Techniques To Obtain Employee Credentials To Conduct Payroll Diversion", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2018/PSA180918", date: "2018-09-18" },
  { id: "ic3-psa250424", title: "Cyber Criminals Impersonating Employee Self-Service Websites to Steal Victim Information and Funds", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2025/PSA250424", date: "2025-04-24" },
  { id: "microsoft-payroll-pirate-2025", title: "Investigating targeted \"payroll pirate\" attacks affecting US universities", outlet: "Microsoft Threat Intelligence", url: "https://www.microsoft.com/en-us/security/blog/2025/10/09/investigating-targeted-payroll-pirate-attacks-affecting-us-universities/", date: "2025-10-09" },
  { id: "register-payroll-pirates-2026", title: "Payroll pirates are conning help desks to steal workers' identities and redirect paychecks", outlet: "The Register", url: "https://www.theregister.com/2026/02/11/payroll_pirates_business_social_engineering/", date: "2026-02-11" },

  // Stolen login session
  { id: "mitre-t1539", title: "Steal Web Session Cookie, Technique T1539", outlet: "MITRE ATT&CK", url: "https://attack.mitre.org/techniques/T1539/", date: "2019-10-08" },
  { id: "huntress-cookies-to-keys-2026", title: "From Cookies to Keys: Why Hackers Don't Need Your Passwords Anymore", outlet: "Huntress", url: "https://www.huntress.com/blog/why-hackers-don't-need-passwords-anymore", date: "2026-05-26" },
  { id: "microsoft-lumma-2025", title: "Lumma Stealer: Breaking down the delivery techniques and capabilities of a prolific infostealer", outlet: "Microsoft Threat Intelligence", url: "https://microsoft.com/en-us/security/blog/2025/05/21/lumma-stealer-breaking-down-the-delivery-techniques-and-capabilities-of-a-prolific-infostealer", date: "2025-05-21" },

  // Reused password break in
  { id: "hibp-synthient-2025", title: "Synthient Credential Stuffing Threat Data Breach", outlet: "Have I Been Pwned", url: "https://haveibeenpwned.com/Breach/SynthientCredentialStuffingThreatData", date: "2025-11-06" },
  { id: "cloudflare-password-reuse-2025", title: "Password reuse is rampant: nearly half of observed user logins are compromised", outlet: "Cloudflare", url: "https://blog.cloudflare.com/password-reuse-rampant-half-user-logins-compromised", date: "2025-03-17" },
  { id: "ncsc-separate-email-password", title: "Use a strong and separate password for your email", outlet: "NCSC", url: "https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online/use-a-strong-and-separate-password-for-email", date: "2018-12-17" },

  // Login approval spam
  { id: "cisa-aa23-320a", title: "Scattered Spider (AA23-320A)", outlet: "CISA", url: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-320a", date: "2023-11-16" },
  { id: "rapid7-scattered-spider-2025", title: "Scattered Spider: Rapid7 Insights, Observations, and Recommendations", outlet: "Rapid7", url: "https://www.rapid7.com/blog/post/scattered-spider-rapid7-insights-observations-and-recommendations/", date: "2025-07-03" },
  { id: "mitre-t1621", title: "Multi-Factor Authentication Request Generation, Technique T1621", outlet: "MITRE ATT&CK", url: "https://attack.mitre.org/techniques/T1621/", date: "2022-04-01" },

  // SIM swap
  { id: "cifas-sim-swap-2025", title: "1,055% surge in unauthorised SIM swaps as mobile and telecoms sector hit hard by rising fraud", outlet: "Cifas", url: "https://www.cifas.org.uk/newsroom/huge-surge-see-sim-swaps-hit-telco-and-mobile", date: "2025-05-07" },
  { id: "which-sim-swap-email-2025", title: "Weak email security opens the door to Sim-swap scammers, warns Which?", outlet: "Which?", url: "https://www.which.co.uk/news/article/weak-email-security-opens-the-door-to-sim-swap-scammers-warns-which-agDV74m3kvry", date: "2025-05-21" },
  { id: "which-sim-swap-networks-2026", title: "How weak security checks leave the door unlocked for sim-swap scammers", outlet: "Which?", url: "https://www.which.co.uk/news/article/mobile-networks-must-step-up-to-prevent-sim-swap-fraud-aSsLN6p0CMRq", date: "2026-04-30" },
  { id: "ic3-psa220208", title: "Criminals Increasing SIM Swap Schemes to Steal Millions of Dollars from US Public", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2022/PSA220208", date: "2022-02-08" },

  // Blackmail email quoting an old password
  { id: "bleeping-shinyhunters-sextortion-2026", title: "ShinyHunters data leaks fuel $2,000 sextortion email scam", outlet: "BleepingComputer", url: "https://www.bleepingcomputer.com/news/security/shinyhunters-data-leaks-fuel-2-000-sextortion-email-scam/", date: "2026-07-25" },
  { id: "malwarebytes-sextortion-2026", title: "Sextortion \"I recorded you\" emails reuse passwords found in disposable inboxes", outlet: "Malwarebytes", url: "https://www.malwarebytes.com/blog/news/2026/03/sextortion-i-recorded-you-emails-reuse-passwords-found-in-disposable-inboxes", date: "2026-03-11" },
  { id: "sans-sextortion-at-scale-2025", title: "A quick look at sextortion at scale: 1,900 messages and 205 Bitcoin addresses spanning four years", outlet: "SANS Internet Storm Center", url: "https://isc.sans.edu/diary.html?date=2025-09-02", date: "2025-09-02" },
  { id: "ncsc-sextortion", title: "Sextortion emails: how to protect yourself", outlet: "NCSC", url: "https://www.ncsc.gov.uk/guidance/sextortion-scams-how-to-protect-yourself", date: "2018-11-01" },

  // Inbox flood then a fake helpdesk call
  { id: "microsoft-quick-assist-2024", title: "Threat actors misusing Quick Assist in social engineering attacks leading to ransomware", outlet: "Microsoft Threat Intelligence", url: "https://www.microsoft.com/en-us/security/blog/2024/05/15/threat-actors-misusing-quick-assist-in-social-engineering-attacks-leading-to-ransomware/", date: "2024-05-15" },
  { id: "rapid7-black-basta-2024", title: "Ongoing Social Engineering Campaign Linked to Black Basta Ransomware Operators", outlet: "Rapid7", url: "https://www.rapid7.com/blog/post/2024/05/10/ongoing-social-engineering-campaign-linked-to-black-basta-ransomware-operators/", date: "2024-05-10" },
  { id: "cyberscoop-teams-fake-support-2025", title: "Ransomware groups pose as fake tech support over Teams", outlet: "CyberScoop", url: "https://cyberscoop.com/ransomware-groups-pose-as-fake-tech-support-over-teams/", date: "2025-01-21" },

  // Fake bank call asking for a code
  { id: "ukfinance-fraud-report-2026", title: "Fraud remains a national security threat as criminals steal almost £1.3 billion", outlet: "UK Finance", url: "https://www.ukfinance.org.uk/news-and-insight/press-release/fraud-report-2026-press-release", date: "2026-06-15" },
  { id: "ukfinance-fraud-report-2025", title: "Fraud continues to pose a major threat with over £1 billion stolen in 2024", outlet: "UK Finance", url: "https://www.ukfinance.org.uk/news-and-insight/press-release/fraud-report-2025-press-release", date: "2025-05-28" },
  { id: "which-fraud-1-3bn-2026", title: "Fraudsters stole almost £1.3bn from us in 2025 - what to know about the UK's most common crime", outlet: "Which?", url: "https://www.which.co.uk/news/article/fraudsters-stole-almost-1.3bn-from-us-in-2025-what-to-know-about-the-uks-most-common-crime-a2wOr1F5NUJu", date: "2026-06-15" },

  // Cloned voice of a loved one
  { id: "ic3-psa241203", title: "Criminals Use Generative Artificial Intelligence to Facilitate Financial Fraud", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2024/PSA241203", date: "2024-12-03" },
  { id: "ftc-ai-family-emergency-2023", title: "Scammers use AI to enhance their family emergency schemes", outlet: "FTC Consumer Advice", url: "https://consumer.ftc.gov/node/80688", date: "2023-03-20" },
  { id: "click2houston-voice-clone-2026", title: "FBI warns of AI voice-cloning scam that mimics loved ones in distress", outlet: "KPRC Click2Houston", url: "https://www.click2houston.com/news/local/2026/06/02/fbi-warns-of-ai-voice-cloning-scam-that-mimics-loved-ones-in-distress/", date: "2026-06-02" },

  // New: fake verification page (ClickFix)
  { id: "microsoft-clickfix-2025", title: "Think before you Click(Fix): Analyzing the ClickFix social engineering technique", outlet: "Microsoft Threat Intelligence", url: "https://www.microsoft.com/en-us/security/blog/2025/08/21/think-before-you-clickfix-analyzing-the-clickfix-social-engineering-technique/", date: "2025-08-21" },
  { id: "register-clickfix-2025", title: "Fake CAPTCHA tests trick users into running malware", outlet: "The Register", url: "https://www.theregister.com/2025/08/22/clickfix_report/", date: "2025-08-22" },
  { id: "bleeping-clickfix-booking-2025", title: "ClickFix attack delivers infostealers, RATs in fake Booking.com emails", outlet: "BleepingComputer", url: "https://www.bleepingcomputer.com/news/security/clickfix-attack-delivers-infostealers-rats-in-fake-bookingcom-emails/", date: "2025-03-13" },
];

export const PART_A: PatternMeta[] = [
  // ── Work and money ──────────────────────────────────────────────
  {
    id: "contagious-interview",
    targets: { profiles: ["crypto-worker", "target-of-spies"], traits: ["developer", "job-seeker", "crypto-holder"] },
    signals: [
      { signal: "github-profile", weight: 3 },
      { signal: "public-commit-email", weight: 3 },
      { signal: "crypto-activity", weight: 2 },
      { signal: "linkedin-presence", weight: 2 },
      { signal: "job-change", weight: 2 },
      { signal: "dev-forum-activity", weight: 1 },
    ],
    prevalence: { level: "common", trend: "rising", asOf: "2026-09-22", sourceIds: ["securityaffairs-contagious-30000-2026", "atlassian-contagious-interview-2026", "ic3-psa240903", "unit42-contagious-interview-2023"] },
    cases: [
      { title: "Joint advisory: at least 30,000 devices in over 100 countries infected through fake job interviews", date: "2026-09-22", outlet: "Security Affairs", url: "https://securityaffairs.com/199506/uncategorized/contagious-interview-30000-devices-infected-by-a-fake-job-interview.html" },
      { title: "Hundreds of malicious coding test repositories taken down from Bitbucket", date: "2026-09-21", outlet: "Atlassian", url: "https://www.atlassian.com/blog/how-we-build/disrupting-contagious-interview" },
    ],
    channels: ["linkedin", "email", "job boards", "freelance platforms", "video call", "github"],
    unfolds: [
      "A recruiter for a crypto or AI firm gets in touch",
      "A friendly interview, then a coding test repository",
      "Running the project starts hidden malware",
      "Saved passwords, browser logins and wallets are copied",
    ],
  },
  {
    id: "task-scam",
    targets: { profiles: ["no-profile"], traits: ["job-seeker", "student", "general"] },
    signals: [
      { signal: "phone-exposed", weight: 3 },
      { signal: "job-change", weight: 2 },
      { signal: "breach-any", weight: 1 },
      { signal: "linkedin-presence", weight: 1 },
    ],
    prevalence: { level: "very common", trend: "rising", asOf: "2025-07-11", sourceIds: ["ftc-task-scams-2024", "bleeping-ftc-task-scams-2024", "inquirer-job-scams-2025", "ic3-psa240604"] },
    cases: [
      { title: "Task scam reports rise from about 5,000 in 2023 to about 20,000 in the first half of 2024", date: "2024-12-12", outlet: "Federal Trade Commission", url: "https://ftc.gov/news-events/data-visualizations/data-spotlight/2024/12/paying-get-paid-gamified-job-scams-drive-record-losses" },
      { title: "Task scams impersonate firms such as Deloitte, Amazon and McKinsey on WhatsApp", date: "2024-12-13", outlet: "BleepingComputer", url: "https://www.bleepingcomputer.com/news/security/ftc-warns-of-online-task-job-scams-hooking-victims-like-gambling/" },
    ],
    channels: ["sms", "whatsapp", "telegram"],
    unfolds: [
      "An unexpected message offers easy remote work",
      "Simple rating or clicking tasks pay small amounts",
      "A deposit is needed to unlock bigger tasks",
      "Earnings can never be withdrawn",
    ],
  },
  {
    id: "fake-boss-payment",
    targets: { profiles: ["high-value-individual"], traits: ["finance-staff", "executive", "small-business", "hr-staff"] },
    signals: [
      { signal: "public-role", weight: 3 },
      { signal: "linkedin-presence", weight: 2 },
      { signal: "job-change", weight: 2 },
      { signal: "news-mentions", weight: 1 },
      { signal: "email-exposed", weight: 1 },
    ],
    prevalence: { level: "very common", trend: "steady", asOf: "2025-05-01", sourceIds: ["ic3-psa240911", "proofpoint-ic3-2024-losses", "nacha-bec-8-5bn-2025"] },
    cases: [
      { title: "Arup staff member in Hong Kong sends $25.6m after a video call with a deepfake CFO", date: "2024-05-17", outlet: "Fortune", url: "https://fortune.com/europe/2024/05/17/arup-deepfake-fraud-scam-victim-hong-kong-25-million-cfo/" },
      { title: "Fake CFO message about a confidential transaction leads to transfers to five accounts", date: "2024-05-17", outlet: "CFO Dive", url: "https://www.cfodive.com/news/scammers-siphon-25m-engineering-firm-arup-deepfake-cfo-ai/716501/" },
    ],
    channels: ["email", "video call", "whatsapp", "phone"],
    unfolds: [
      "A senior colleague or supplier is copied or hacked",
      "An urgent, confidential payment request arrives",
      "Bank details are new or changed",
      "Money is sent before anyone checks",
    ],
  },
  {
    id: "payroll-change",
    targets: { profiles: ["no-profile"], traits: ["hr-staff", "student", "general"] },
    signals: [
      { signal: "linkedin-presence", weight: 2 },
      { signal: "job-change", weight: 2 },
      { signal: "breach-password", weight: 2 },
      { signal: "public-commit-email", weight: 1 },
      { signal: "email-exposed", weight: 1 },
    ],
    prevalence: { level: "common", trend: "rising", asOf: "2026-02-11", sourceIds: ["microsoft-payroll-pirate-2025", "register-payroll-pirates-2026", "ic3-psa250424", "ic3-psa180918"] },
    cases: [
      { title: "Storm-2657 hijacks Workday accounts at US universities to redirect salaries", date: "2025-10-09", outlet: "Microsoft Threat Intelligence", url: "https://www.microsoft.com/en-us/security/blog/2025/10/09/investigating-targeted-payroll-pirate-attacks-affecting-us-universities/" },
      { title: "Help desk talked into resetting a physician's login, then salary redirected", date: "2026-02-11", outlet: "The Register", url: "https://www.theregister.com/2026/02/11/payroll_pirates_business_social_engineering/" },
    ],
    channels: ["email", "search ads", "phone"],
    unfolds: [
      "An HR email or search advert leads to a copy of the payroll portal",
      "The login and code are captured",
      "Alerts are hidden with an inbox rule",
      "Bank details are changed before payday",
    ],
  },

  // ── Logins and accounts ─────────────────────────────────────────
  {
    id: "pass-the-cookie",
    targets: { profiles: ["high-value-individual", "crypto-worker"], traits: ["developer", "crypto-holder", "executive", "general"] },
    signals: [
      { signal: "stealer-log", weight: 3 },
      { signal: "crypto-activity", weight: 1 },
      { signal: "github-profile", weight: 1 },
    ],
    prevalence: { level: "very common", trend: "rising", asOf: "2026-05-26", sourceIds: ["huntress-cookies-to-keys-2026", "microsoft-lumma-2025", "mitre-t1539"] },
    cases: [
      { title: "Lumma infostealer spreads through phishing, fake updates and ClickFix before 2,300 domains are disrupted", date: "2025-05-21", outlet: "Microsoft Threat Intelligence", url: "https://microsoft.com/en-us/security/blog/2025/05/21/lumma-stealer-breaking-down-the-delivery-techniques-and-capabilities-of-a-prolific-infostealer" },
    ],
    channels: ["fake downloads", "malicious ads", "email", "dark web markets"],
    unfolds: [
      "Password stealing software lands on a device",
      "Saved logins and session cookies are copied",
      "The log is sold on a market",
      "The cookie opens the account without a password or code",
    ],
  },
  {
    id: "credential-stuffing",
    targets: { profiles: ["no-profile"], traits: ["general"] },
    signals: [
      { signal: "breach-password", weight: 3 },
      { signal: "breach-any", weight: 2 },
      { signal: "same-username-many-sites", weight: 2 },
      { signal: "stealer-log", weight: 1 },
    ],
    prevalence: { level: "very common", trend: "steady", asOf: "2025-11-06", sourceIds: ["cloudflare-password-reuse-2025", "hibp-synthient-2025", "ncsc-separate-email-password"] },
    cases: [
      { title: "About 2 billion email addresses from credential stuffing lists added to Have I Been Pwned", date: "2025-11-06", outlet: "Have I Been Pwned", url: "https://haveibeenpwned.com/Breach/SynthientCredentialStuffingThreatData" },
      { title: "41% of successful human logins on Cloudflare sites used leaked passwords", date: "2025-03-17", outlet: "Cloudflare", url: "https://blog.cloudflare.com/password-reuse-rampant-half-user-logins-compromised" },
    ],
    channels: ["automated logins"],
    unfolds: [
      "A site you used is breached",
      "The email and password join a combo list",
      "Bots try the pair on many other sites",
      "Any account with the same password opens",
    ],
  },
  {
    id: "mfa-fatigue",
    targets: { profiles: ["high-value-individual"], traits: ["executive", "developer", "general"] },
    signals: [
      { signal: "breach-password", weight: 3 },
      { signal: "stealer-log", weight: 3 },
      { signal: "linkedin-presence", weight: 1 },
      { signal: "public-role", weight: 1 },
    ],
    prevalence: { level: "common", trend: "steady", asOf: "2025-07-03", sourceIds: ["rapid7-scattered-spider-2025", "cisa-aa23-320a", "mitre-t1621"] },
    cases: [
      { title: "Scattered Spider uses help desk calls, push bombing and SIM swaps; MGM Resorts among victims", date: "2025-07-03", outlet: "Rapid7", url: "https://www.rapid7.com/blog/post/scattered-spider-rapid7-insights-observations-and-recommendations/" },
    ],
    channels: ["push notification", "phone", "sms"],
    unfolds: [
      "Your password is already known",
      "Login prompts flood your phone",
      "A caller posing as IT says to approve",
      "One tap lets them in",
    ],
  },
  {
    id: "sim-swap",
    targets: { profiles: ["crypto-worker", "high-value-individual"], traits: ["crypto-holder", "executive", "public-figure", "general"] },
    signals: [
      { signal: "phone-exposed", weight: 3 },
      { signal: "breach-password", weight: 2 },
      { signal: "crypto-activity", weight: 2 },
      { signal: "email-exposed", weight: 1 },
    ],
    prevalence: { level: "common", trend: "rising", asOf: "2026-04-30", sourceIds: ["cifas-sim-swap-2025", "which-sim-swap-email-2025", "which-sim-swap-networks-2026", "ic3-psa220208"] },
    cases: [
      { title: "Unauthorised SIM swaps reported to the National Fraud Database rise 1,055% in 2024", date: "2025-05-07", outlet: "Cifas", url: "https://www.cifas.org.uk/newsroom/huge-surge-see-sim-swaps-hit-telco-and-mobile" },
      { title: "O2 customer's eSIM swapped after her email was taken over, then £800 spend attempted", date: "2025-05-21", outlet: "Which?", url: "https://www.which.co.uk/news/article/weak-email-security-opens-the-door-to-sim-swap-scammers-warns-which-agDV74m3kvry" },
      { title: "Lebara customer loses about £3,500 after a chat based SIM swap", date: "2026-04-30", outlet: "Which?", url: "https://www.which.co.uk/news/article/mobile-networks-must-step-up-to-prevent-sim-swap-fraud-aSsLN6p0CMRq" },
    ],
    channels: ["mobile network", "email", "sms"],
    unfolds: [
      "Your email is taken over or your details are known",
      "Your network moves your number to their SIM or eSIM",
      "Your phone loses signal",
      "Login codes go to them and accounts are reset",
    ],
  },
  {
    id: "leaked-password-extortion",
    targets: { profiles: ["no-profile"], traits: ["general"] },
    signals: [
      { signal: "breach-password", weight: 3 },
      { signal: "breach-any", weight: 2 },
      { signal: "email-exposed", weight: 1 },
    ],
    prevalence: { level: "very common", trend: "steady", asOf: "2026-07-25", sourceIds: ["bleeping-shinyhunters-sextortion-2026", "malwarebytes-sextortion-2026", "sans-sextortion-at-scale-2025", "ncsc-sextortion"] },
    cases: [
      { title: "Sextortion emails use addresses from ShinyHunters leaks and demand $2,000 in Bitcoin", date: "2026-07-25", outlet: "BleepingComputer", url: "https://www.bleepingcomputer.com/news/security/shinyhunters-data-leaks-fuel-2-000-sextortion-email-scam/" },
      { title: "\"I recorded you\" emails quote a real password and demand $800", date: "2026-03-11", outlet: "Malwarebytes", url: "https://www.malwarebytes.com/blog/news/2026/03/sextortion-i-recorded-you-emails-reuse-passwords-found-in-disposable-inboxes" },
      { title: "1,900 sextortion messages and 205 Bitcoin addresses studied over four years", date: "2025-09-02", outlet: "SANS Internet Storm Center", url: "https://isc.sans.edu/diary.html?date=2025-09-02" },
    ],
    channels: ["email"],
    unfolds: [
      "An email shows an old password of yours",
      "It claims your camera recorded you",
      "Bitcoin is demanded within a day or two",
      "Nothing happens if you ignore it",
    ],
  },
  {
    id: "clickfix-fake-captcha",
    isNew: true,
    name: "Fake 'I'm not a robot' check",
    oneLine: "A verification page that asks you to paste and run a command.",
    targets: { profiles: ["no-profile"], traits: ["small-business", "traveller", "general"] },
    signals: [
      { signal: "stealer-log", weight: 2 },
      { signal: "email-exposed", weight: 1 },
      { signal: "breach-any", weight: 1 },
    ],
    prevalence: { level: "very common", trend: "rising", asOf: "2025-08-22", sourceIds: ["microsoft-clickfix-2025", "register-clickfix-2025", "bleeping-clickfix-booking-2025", "microsoft-lumma-2025"] },
    cases: [
      { title: "Fake Booking.com emails lead hotel staff to a fake CAPTCHA that installs infostealers", date: "2025-03-13", outlet: "BleepingComputer", url: "https://www.bleepingcomputer.com/news/security/clickfix-attack-delivers-infostealers-rats-in-fake-bookingcom-emails/" },
      { title: "Microsoft sees ClickFix campaigns hit thousands of devices every day", date: "2025-08-21", outlet: "Microsoft Threat Intelligence", url: "https://www.microsoft.com/en-us/security/blog/2025/08/21/think-before-you-clickfix-analyzing-the-clickfix-social-engineering-technique/" },
    ],
    channels: ["email", "malicious ads", "hacked websites"],
    unfolds: [
      "A link opens a page with a robot check",
      "Clicking it copies a hidden command",
      "The page says to press Windows and R, paste and press Enter",
      "Password stealing software runs",
    ],
  },

  // ── Calls and impersonation ─────────────────────────────────────
  {
    id: "email-bomb-fake-it-support",
    targets: { profiles: ["high-value-individual"], traits: ["small-business", "executive", "general"] },
    signals: [
      { signal: "email-exposed", weight: 2 },
      { signal: "linkedin-presence", weight: 2 },
      { signal: "public-commit-email", weight: 1 },
      { signal: "job-change", weight: 1 },
      { signal: "public-role", weight: 1 },
    ],
    prevalence: { level: "common", trend: "rising", asOf: "2025-01-21", sourceIds: ["cyberscoop-teams-fake-support-2025", "microsoft-quick-assist-2024", "rapid7-black-basta-2024"] },
    cases: [
      { title: "At least 15 organisations hit by email bombing and fake help desk Teams calls", date: "2025-01-21", outlet: "CyberScoop", url: "https://cyberscoop.com/ransomware-groups-pose-as-fake-tech-support-over-teams/" },
      { title: "Storm-1811 floods inboxes, calls as IT, then uses Quick Assist to deploy Black Basta", date: "2024-05-15", outlet: "Microsoft Threat Intelligence", url: "https://www.microsoft.com/en-us/security/blog/2024/05/15/threat-actors-misusing-quick-assist-in-social-engineering-attacks-leading-to-ransomware/" },
    ],
    channels: ["email", "teams", "phone"],
    unfolds: [
      "Thousands of sign up emails arrive in an hour",
      "'IT support' calls or messages on Teams",
      "They ask you to open Quick Assist",
      "Remote control is used to install malware",
    ],
  },
  {
    id: "fake-bank-call",
    targets: { profiles: ["no-profile"], traits: ["older-person", "general"] },
    signals: [
      { signal: "phone-exposed", weight: 3 },
      { signal: "breach-any", weight: 2 },
      { signal: "address-exposed", weight: 1 },
      { signal: "email-exposed", weight: 1 },
    ],
    prevalence: { level: "common", trend: "falling", asOf: "2026-06-15", sourceIds: ["ukfinance-fraud-report-2026", "ukfinance-fraud-report-2025", "which-fraud-1-3bn-2026"] },
    cases: [
      { title: "UK impersonation fraud losses fall 12% and cases 11% in 2025", date: "2026-06-15", outlet: "UK Finance", url: "https://www.ukfinance.org.uk/news-and-insight/press-release/fraud-report-2026-press-release" },
      { title: "Fake payroll and bank portals, then a call posing as the bank to get a one time code", date: "2025-04-24", outlet: "FBI IC3", url: "https://www.ic3.gov/PSA/2025/PSA250424" },
    ],
    channels: ["phone", "sms"],
    unfolds: [
      "A caller from 'your bank' already knows some details",
      "They say your account is under attack",
      "They ask for a code or a move to a 'safe account'",
      "The money is gone",
    ],
  },
  {
    id: "voice-clone-family",
    targets: { profiles: ["no-profile", "high-value-individual"], traits: ["parent", "older-person", "public-figure", "general"] },
    signals: [
      { signal: "phone-exposed", weight: 2 },
      { signal: "large-following", weight: 2 },
      { signal: "news-mentions", weight: 2 },
      { signal: "public-role", weight: 1 },
    ],
    prevalence: { level: "emerging", trend: "rising", asOf: "2026-06-02", sourceIds: ["ic3-psa241203", "click2houston-voice-clone-2026", "ftc-ai-family-emergency-2023"] },
    cases: [
      { title: "Mother sends $5,000 after a cloned voice call claiming her daughter was kidnapped", date: "2026-06-02", outlet: "KPRC Click2Houston", url: "https://www.click2houston.com/news/local/2026/06/02/fbi-warns-of-ai-voice-cloning-scam-that-mimics-loved-ones-in-distress/" },
    ],
    channels: ["phone", "voice message"],
    unfolds: [
      "A few seconds of your voice are taken from a video",
      "A relative gets a panicked call in 'your' voice",
      "An arrest, crash or kidnap is claimed",
      "Money is demanded by transfer, gift card or crypto",
    ],
  },
];

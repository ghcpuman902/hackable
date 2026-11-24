import type { PatternId, ProfileId } from "./patterns";

/* The one "thing to learn" link. A static, hand checked map: one resource per profile (No profile included) and per
   pattern. Nemotron only ever picks a key (z.enum(LEARN_KEYS)); it never writes a URL.
   INTERFACE (agreed between the report and this file; do not rename): LEARN_KEYS, LearnKey, Learn, LEARN, learnFor.
   Entries are filled and checked by the learning links pass (every URL 200, a real page; YouTube via oEmbed). */
export type LearnKey = ProfileId | PatternId;
export const LEARN_KEYS = [
  "high-value-individual", "target-of-spies", "crypto-worker", "romance-target", "no-profile",
  "contagious-interview", "email-bomb-fake-it-support", "pass-the-cookie", "fake-boss-payment", "deepfake-crypto-giveaway",
  "state-spearphishing", "wallet-drainer", "sim-swap", "pig-butchering", "romance-scam", "task-scam", "fake-bank-call",
  "news-hook-phishing", "payroll-change", "after-move-council-letter", "marketplace-fake-buyer", "fake-booking-or-visa",
  "qr-code-phishing", "mfa-fatigue", "credential-stuffing", "voice-clone-family", "doxxing-swatting",
  "leaked-password-extortion", "fake-charity",
] as const satisfies readonly LearnKey[];

/* kind "video": a YouTube watch URL, and thumb is its oEmbed thumbnail_url. source is the publisher, e.g. "NCSC" or "Which?". */
export type Learn = { title: string; source: string; url: string; kind: "article" | "video"; thumb?: string };

const romanceScam: Learn = {
  title: "Signs of a romance scam - Which?",
  source: "Which?",
  url: "https://www.which.co.uk/news/article/signs-of-a-romance-scam-anwtT9T4qCEd",
  kind: "article",
};

const businessPaymentFraud: Learn = {
  title: "Business payment fraud | National Cyber Security Centre",
  source: "NCSC",
  url: "https://www.ncsc.gov.uk/section/respond-recover/business-payment-fraud",
  kind: "article",
};

export const LEARN: Record<LearnKey, Learn> = {
  "high-value-individual": {
    title: "Defending democracy | Guidance for high-risk individuals on protecting your accounts and devices | National Cyber Security Centre",
    source: "NCSC",
    url: "https://www.ncsc.gov.uk/collection/defending-democracy/guidance-for-high-risk-individuals",
    kind: "article",
  },
  "target-of-spies": {
    title: "Advanced Protection Programme",
    source: "Google",
    url: "https://landing.google.com/advancedprotection/",
    kind: "article",
  },
  "crypto-worker": {
    title: "What To Know About Cryptocurrency and Scams | Consumer Advice",
    source: "FTC",
    url: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-scams",
    kind: "article",
  },
  "romance-target": romanceScam,
  "no-profile": {
    title: "Cyber Aware - securing your email account",
    source: "NCSC",
    url: "https://www.youtube.com/watch?v=lYq5-p6Ovd0",
    kind: "video",
    thumb: "https://i.ytimg.com/vi/lYq5-p6Ovd0/hqdefault.jpg",
  },
  "contagious-interview": {
    title: "Fake job offers target coders with infostealers",
    source: "ESET",
    url: "https://www.youtube.com/watch?v=4HbCyW1ljRE",
    kind: "video",
    thumb: "https://i.ytimg.com/vi/4HbCyW1ljRE/hqdefault.jpg",
  },
  "email-bomb-fake-it-support": {
    title: "Recognise and avoid social engineering schemes including phishing messages, phony support calls and other scams – Apple Support (UK)",
    source: "Apple",
    url: "https://support.apple.com/en-gb/102568",
    kind: "article",
  },
  "pass-the-cookie": {
    title: "Recovering a hacked account | National Cyber Security Centre",
    source: "NCSC",
    url: "https://www.ncsc.gov.uk/guidance/recovering-a-hacked-account",
    kind: "article",
  },
  "fake-boss-payment": businessPaymentFraud,
  "deepfake-crypto-giveaway": {
    title: "How crypto investment scammers peddle celebrity deepfakes online with ease - Which?",
    source: "Which?",
    url: "https://www.which.co.uk/news/article/how-crypto-investment-scammers-peddle-celebrity-deepfakes-online-with-ease-a12Pt9N4fXQy",
    kind: "article",
  },
  "state-spearphishing": {
    title: "Cyber actors carry out targeted phishing attacks",
    source: "NCSC",
    url: "https://www.ncsc.gov.uk/news/uk-us-issue-alert-cyber-actors-behalf-iranian-state-carry-targeted-phishing-attacks",
    kind: "article",
  },
  "wallet-drainer": {
    title: "Those urgent emails from MetaMask and PayPal are phishing scams | Consumer Advice",
    source: "FTC",
    url: "https://consumer.ftc.gov/consumer-alerts/2023/05/those-urgent-emails-metamask-paypal-are-phishing-scams",
    kind: "article",
  },
  "sim-swap": {
    title: "Sim-swap fraud doubles year-on-year: how scammers steal your phone number - Which?",
    source: "Which?",
    url: "https://www.which.co.uk/news/article/sim-swap-fraud-doubles-year-on-year-how-scammers-steal-your-phone-number-aB0TF1O6hUrv",
    kind: "article",
  },
  "pig-butchering": {
    title: "Pig butchering among most convincing scams of 2023 so far, Which? warns - Which?",
    source: "Which?",
    url: "https://www.which.co.uk/policy-and-insight/article/pig-butchering-among-most-convincing-scams-of-2023-so-far-which-warns-aDRtr4I1UT1R",
    kind: "article",
  },
  "romance-scam": romanceScam,
  "task-scam": {
    title: "All you need to know about task scams - Which?",
    source: "Which?",
    url: "https://www.which.co.uk/news/article/all-you-need-to-know-about-task-scams-ahqWP8Q1MreC",
    kind: "article",
  },
  "fake-bank-call": {
    title: "Scam watch: 'I was sent a one-time passcode from my bank' - Which?",
    source: "Which?",
    url: "https://www.which.co.uk/news/article/scam-watch-i-was-sent-a-one-time-passcode-from-my-bank-aJoPq4M2qhPo",
    kind: "article",
  },
  "news-hook-phishing": {
    title: "Phishing scams: how to spot and report them | National Cyber Security Centre",
    source: "NCSC",
    url: "https://www.ncsc.gov.uk/collection/phishing-scams",
    kind: "article",
  },
  "payroll-change": businessPaymentFraud,
  "after-move-council-letter": {
    title: "Watch out for this energy rebate council tax scam - Which?",
    source: "Which?",
    url: "https://www.which.co.uk/news/article/fake-council-tax-energy-rebate-scam-targeting-households-aeP2r9f7cIvz",
    kind: "article",
  },
  "marketplace-fake-buyer": {
    title: "Selling stuff online? Here’s how to avoid a scam | Consumer Advice",
    source: "FTC",
    url: "https://consumer.ftc.gov/consumer-alerts/2022/07/selling-stuff-online-heres-how-avoid-scam",
    kind: "article",
  },
  "fake-booking-or-visa": {
    title: "How to avoid scams when booking last minute holidays - Which?",
    source: "Which?",
    url: "https://www.which.co.uk/news/article/how-to-avoid-scams-when-booking-last-minute-holidays-a118r3A8SoIG",
    kind: "article",
  },
  "qr-code-phishing": {
    title: "Quishing scams warning: how to spot and avoid dodgy QR codes - Which?",
    source: "Which?",
    url: "https://www.which.co.uk/news/article/quishing-scams-warning-how-to-spot-and-avoid-dodgy-qr-codes-asYsH0h6jjP1",
    kind: "article",
  },
  "mfa-fatigue": {
    title: "Sign in with Google prompts - Android phone & tablet - Google Account Help",
    source: "Google",
    url: "https://support.google.com/accounts/answer/7026266",
    kind: "article",
  },
  "credential-stuffing": {
    title: "Top tips for staying secure online | Use a strong and separate password for your email | National Cyber Security Centre",
    source: "NCSC",
    url: "https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online/use-a-strong-and-separate-password-for-email",
    kind: "article",
  },
  "voice-clone-family": {
    title: "Scammers use AI to enhance their family emergency schemes | Consumer Advice",
    source: "FTC",
    url: "https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes",
    kind: "article",
  },
  "doxxing-swatting": {
    title: "Find and remove personal info in Google Search results - Google Search Help",
    source: "Google",
    url: "https://support.google.com/websearch/answer/12719076",
    kind: "article",
  },
  "leaked-password-extortion": {
    title: "Sextortion emails: how to protect yourself | National Cyber Security Centre",
    source: "NCSC",
    url: "https://www.ncsc.gov.uk/guidance/sextortion-scams-how-to-protect-yourself",
    kind: "article",
  },
  "fake-charity": {
    title: "Five common charity scams and how to spot them - Which?",
    source: "Which?",
    url: "https://www.which.co.uk/news/article/five-common-charity-scams-and-how-to-spot-them-aSJnf6e98Oap",
    kind: "article",
  },
};

export const learnFor = (key: LearnKey): Learn => LEARN[key];

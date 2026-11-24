/* Hand written reports for the presets and the Jane Doe Smith demo. These are the stage fallback. Keep in step with eval/golden/*.expected.md. */

const TIM_COOK = `**You are The Open Door: the most famous work inbox in tech, and you made it public yourself.**

Your address, tcook@apple.com, sits under your signature on a 2022 letter to the US Senate[^1], and you read it out to shareholders in 2016[^2]. Since 1 September 2026 you are Apple's executive chairman[^3], and @tim_cook reaches about 20 million people[^4].

> [!CAUTION]
> **Because everyone knows how to reach you, everyone also knows how to pretend to be you.** A fake email from "Tim" asking a colleague to move money is a known scam[^5]. So is a cloned video of a famous face selling crypto[^6].

**Neither scam needs a leak, only your public role.**

> [!TIP]
> **Agree a secret way to prove a request really comes from you.** The FBI suggests a secret word or phrase that a fake voice or video can't know[^6].

#HighValueIndividual #TheOpenDoor

[^1]: [2022 letter to the US Senate](https://9to5mac.com/wp-content/uploads/sites/6/2022/06/061022-Apple-Privacy-Letter-TC-1.pdf)
[^2]: [Tim Cook addresses shareholders](https://www.businessinsider.com/apple-ceo-tim-cook-addresses-shareholders-on-fbi-case-2016-2)
[^3]: [Apple newsroom](https://www.apple.com/newsroom/2026/04/tim-cook-to-become-apple-executive-chairman-john-ternus-to-become-apple-ceo/)
[^4]: [@tim_cook](https://x.com/tim_cook)
[^5]: [FBI: business email compromise](https://www.ic3.gov/PSA/2024/PSA240911)
[^6]: [FBI: criminals use generative AI to commit fraud](https://www.ic3.gov/PSA/2024/PSA241203)
`;

const JENSEN_HUANG = `**You are The Headline: this week, almost every story about AI has your name in it.**

NVIDIA reinstated you as chief executive on 23 November 2026[^1], and you are due before three House committees on 1 December[^2].

> [!CAUTION]
> **Big news is the best bait, and phishing dressed up as a news story feeds on weeks like this.** State groups also send tailored phishing[^3]. Your work address is easy to guess too, because NVIDIA uses first initial plus surname[^4].

**Any urgent message about the hearings could be a lure.**

> [!TIP]
> **Treat any urgent message about the hearings as fake until you check it another way.** Don't click the link or reply. Contact the sender through a number or address you already trust[^5].

#HighValueIndividual #TargetOfSpies #TheHeadline

[^1]: [NVIDIA board reinstates Jensen Huang](https://nvidianews.nvidia.com/news/nvidia-board-reinstates-jensen-huang-as-president-ceo-and-board-director)
[^2]: [CNBC on the House hearings](https://www.cnbc.com/2026/11/24/jensen-huang-nvidia-congress-gtc.html)
[^3]: [CISA advisory on state backed phishing](https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-341a)
[^4]: [NVIDIA email format](https://www.clay.com/dossier/nvidia-email-format)
[^5]: [NCSC: phishing, how to spot and report it](https://www.ncsc.gov.uk/guidance/suspicious-email-actions)
`;

const JANE_DOE_SMITH = `**You are The Job Hunter: someone who changed jobs recently and is easy to find on every site.**

Your email appears in public code commits, and you use the same username on several sites, so a recruiter message looks believable.

> [!WARNING]
> **A program on one of your devices copied 23 saved logins in March.** Stolen logins like these are often sold on, so change them first.[^1]

> [!CAUTION]
> **A recruiter who sends a coding test may be after your computer.** The project hides software that steals passwords and wallets when you run it[^2][^3]. A paid tasks offer on WhatsApp that asks you to pay in before you can withdraw is a second version of the same pitch[^4].

> [!TIP]
> **Never run a project from a recruiter on your main computer.** Ask for an online editor, or open it in a throwaway virtual machine.

#JobHunter #NewJob

[^1]: [MITRE ATT&CK: steal web session cookie](https://attack.mitre.org/techniques/T1539/)
[^2]: [Unit 42: fake job campaigns](https://unit42.paloaltonetworks.com/two-campaigns-by-north-korea-bad-actors-target-job-hunters/)
[^3]: [FBI: North Korean social engineering](https://www.ic3.gov/PSA/2024/PSA240903)
[^4]: [FBI: paid tasks job scams](https://www.ic3.gov/PSA/2024/PSA240604)
`;

const MANGLE_KUO = `**You are The Open Builder: easy to find, easy to hire and easy to copy.**

Your GitHub says design engineer, London and available for hire[^1], and your site lists your work and your CV[^2]. You use manglekuo as your name on GitHub, Hacker News and X, so one search finds all of them.

> [!CAUTION]
> **A recruiter who sends a coding test may be after your computer.** Developers who are open to work are the main target of this scam[^3]. The project hides software that steals passwords and wallets when you run it.

> [!NOTE]
> **manglekuo@gmail.com did not turn up in the breach lists we checked.** No infected device was found for it either, so the risk here comes from what you publish, not from a leak.

> [!TIP]
> **Give your email its own strong password that you use nowhere else.** Whoever gets into your email can reset almost every other account you have[^4].

#SameUsername #PublicCommitEmail #CryptoWorker

[^1]: [GitHub profile](https://github.com/ghcpuman902)
[^2]: [manglekuo.com](https://manglekuo.com/)
[^3]: [Unit 42: fake job campaigns](https://unit42.paloaltonetworks.com/two-campaigns-by-north-korea-bad-actors-target-job-hunters/)
[^4]: [NCSC: a separate password for your email](https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online/use-a-strong-and-separate-password-for-email)
`;

export const PRESET_REPORTS: Record<string, string> = {
  "Tim Cook": TIM_COOK,
  "Jensen Huang": JENSEN_HUANG,
  "Mangle Kuo": MANGLE_KUO,
};

export const DEMO_REPORT = JANE_DOE_SMITH;

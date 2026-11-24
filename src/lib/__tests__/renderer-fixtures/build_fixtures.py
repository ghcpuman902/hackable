# Regenerates valid/, messy/, expected.json, whitelist.json. Run: python3 build_fixtures.py
import json, os, pathlib
HERE = pathlib.Path(__file__).parent
fp = json.load(open(HERE.parent/'research/fraud-patterns.json'))
WL = sorted({u for p in fp['patterns'] for u in p['sources']})
S = {p['id']: p['sources'] for p in fp['patterns']}
TAGS = "HighNetWorthIndividual InTheNews CryptoWorker RomanceTarget SpyTarget SameUsername PublicCommitEmail PasswordsInBreaches StealerLog JustChangedJobs RecentlyMoved SellingOnline TravellingSoon NoProfile".split()
V, M = {}, {}
def card(kind, bold, plain, notes=""):
    body = f"**{bold}**" + (" " + plain if plain else "") + notes
    return f"> [!{kind}]\n> {body}"

# ---------- valid ----------
V['01-no-cards-no-profile'] = ("""**You are hard to find online, and that is a good thing.**

We searched for Ellen Marsh using the email you gave us. Nothing came back from breaches, code sites or the news. Scammers have very little to work with.

**Keep it that way by using a separate password for your email.**

Most break ins start with an old password reused somewhere else. One strong password for email closes that door.

#NoProfile
""", dict(fallback=False, cardKinds=[], footnotesPerCard=[], keptTags=["NoProfile"]))

V['02-one-card-tip'] = (f"""**To a scammer, you look like someone who reuses passwords.**

The email for Sam Okafor shows up in two old breaches. Both leaks included the password itself.

{card('TIP','Use a separate, strong password for your email.','It is the key to every other account you own.','[^1]')}

**That one change makes most of the leaked data useless.**

[^1]: [NCSC: use a strong and separate password for email]({S['credential-stuffing'][1]})
""", dict(fallback=False, cardKinds=["TIP"], footnotesPerCard=[1], keptTags=[]))

V['03-two-cards-tags'] = (f"""**To a scammer, you look like a developer who is open to work.**

Priya Shah uses the same username on GitHub and Keybase. Her public commits show her personal email.

{card('CAUTION','A fake job offer could end with you running their code.','The recruiter sends a coding test that hides malware. It steals saved logins and wallets as soon as it runs.','[^1][^2]')}

{card('TIP','Never run a recruiter\'s project on your main computer.','Ask for an online editor or use a throwaway virtual machine.','[^2]')}

#SameUsername #PublicCommitEmail #JustChangedJobs

[^1]: [Unit 42: campaigns targeting job hunters]({S['contagious-interview'][0]})
[^2]: [FBI IC3 warning on fake job offers]({S['contagious-interview'][1]})
""", dict(fallback=False, cardKinds=["CAUTION","TIP"], footnotesPerCard=[2,1], keptTags=["SameUsername","PublicCommitEmail","JustChangedJobs"]))

V['04-three-cards-full'] = (f"""**You look like a crypto worker with a lot to steal.**

Leo Brandt lists a wallet company on his profile. His email is in a breach that included passwords.

{card('WARNING','Your email and an old password are already public.','Anyone can try that password on your other accounts.','[^1]')}

{card('CAUTION','Wallet drainer sites copy real projects to empty your wallet.','One signature on a fake site can move everything out.','[^2][^3]')}

{card('TIP','Use a hardware wallet and read every signature request.','If a site rushes you, close it.','[^2]')}

#CryptoWorker #PasswordsInBreaches

[^1]: [NCSC guidance on data breaches]({S['credential-stuffing'][2]})
[^2]: [Chainalysis on crypto drainers]({S['wallet-drainer'][0]})
[^3]: [Check Point case study on drainer tactics]({S['wallet-drainer'][2]})
""", dict(fallback=False, cardKinds=["WARNING","CAUTION","TIP"], footnotesPerCard=[1,2,1], keptTags=["CryptoWorker","PasswordsInBreaches"]))

V['05-note-and-warning-no-tags'] = (f"""**Your login session could be worth more than your password.**

A stealer log lists a device linked to Ana Ruiz. It shows an infection date and a count of saved logins.

{card('WARNING','A program on one of your devices copied saved logins.','The log shows when it happened and roughly how many.','[^1]')}

{card('NOTE','Stolen session cookies can skip two step login.','Signing out everywhere makes them useless.','[^2]')}

[^1]: [Infostealers.com]({S['pass-the-cookie'][2]})
[^2]: [MITRE ATT&CK: steal web session cookie]({S['pass-the-cookie'][0]})
""", dict(fallback=False, cardKinds=["WARNING","NOTE"], footnotesPerCard=[1,1], keptTags=[]))

V['06-one-card-no-footnotes'] = (f"""**You are in the news, so scammers can borrow the story.**

Jo Whitfield was quoted in a local paper last week. That gives a phishing email a believable hook.

{card('CAUTION','Expect an email that mentions the article.','It will ask you to log in or open a file.','')}

#InTheNews
""", dict(fallback=False, cardKinds=["CAUTION"], footnotesPerCard=[0], keptTags=["InTheNews"]))

V['07-travel-and-selling'] = (f"""**Travel and marketplace leaks put you on scammers' lists.**

The email for Ravi Menon appears in breaches at a booking site and a selling app. Those lists are used for fake booking and fake buyer messages.

{card('CAUTION','A fake booking message could ask you to pay again.','It looks like your hotel or airline and links to a copy site.','[^1]')}

{card('CAUTION','A fake buyer may ask you to use their courier link.','The link asks for your card details to receive payment.','[^2]')}

{card('TIP','Only pay or get paid inside the official app or site.','Ignore links sent in messages.','')}

#TravellingSoon #SellingOnline

[^1]: [Action Fraud: holiday fraud]({S['fake-booking-or-visa'][0]})
[^2]: [Police Scotland: online marketplace fraud]({S['marketplace-fake-buyer'][0]})
""", dict(fallback=False, cardKinds=["CAUTION","CAUTION","TIP"], footnotesPerCard=[1,1,0], keptTags=["TravellingSoon","SellingOnline"]))

V['08-footnote-reused-across-cards'] = (f"""**You look like a senior figure worth impersonating.**

Grace Adeyemi is listed as finance director on her company site. Her work email follows an easy pattern.

{card('CAUTION','A fake boss email could ask you to move money fast.','It copies a real name and a real supplier.','[^1]')}

{card('TIP','Confirm any payment change by phone on a number you already have.','Never use the number in the email.','[^1][^2]')}

#HighNetWorthIndividual

[^1]: [FBI IC3 on business email compromise]({S['fake-boss-payment'][0]})
[^2]: [Action Fraud: mandate fraud]({S['fake-boss-payment'][1]})
""", dict(fallback=False, cardKinds=["CAUTION","TIP"], footnotesPerCard=[1,2], keptTags=["HighNetWorthIndividual"]))

# ---------- messy ----------
base = V['03-two-cards-tags'][0]
M['01-fenced-markdown'] = ("```markdown\n" + base + "```\n", dict(fallback=False, cardKinds=["CAUTION","TIP"], footnotesPerCard=[2,1], mustNotContain=["```"]))
M['02-headings'] = (f"""# Your Exposure Report

## Summary
**You look like a developer who is open to work.**

Tom Ellery shares his username across sites.

### What to do
{card('TIP','Never run a recruiter\'s code on your main computer.','Use an online editor.','[^1]')}

[^1]: [FBI IC3]({S['contagious-interview'][1]})
""", dict(fallback=False, cardKinds=["TIP"], footnotesPerCard=[1], headingsToBold=3, mustNotContain=["# "]))
M['03-unknown-alert-danger'] = (f"""**Your password is public.**

{card('DANGER','Your email is in a breach with passwords.','Change that password today.','[^1]')}

[^1]: [NCSC]({S['credential-stuffing'][2]})
""", dict(fallback=False, cardKinds=["NOTE"], footnotesPerCard=[1], mustNotContain=["[!DANGER]"], _decision="unknown alert type downgraded to NOTE"))
M['04-lowercase-alert'] = (f"""**Your password is public.**

> [!warning]
> **Your email is in a breach with passwords.** Change that password today.[^1]

[^1]: [NCSC]({S['credential-stuffing'][2]})
""", dict(fallback=False, cardKinds=["WARNING"], footnotesPerCard=[1]))
M['05-no-blank-line-between-cards'] = (f"""**Two risks stand out.**

> [!WARNING]
> **Your email and an old password are public.** Try not to reuse it.[^1]
> [!TIP]
> **Use a separate password for email.** It protects everything else.

[^1]: [NCSC]({S['credential-stuffing'][2]})
""", dict(fallback=False, cardKinds=["WARNING","TIP"], footnotesPerCard=[1,0]))
five = "\n\n".join(card(k, f'Risk number {i+1} is real.', 'Here is why it matters.', f'[^{i+1}]') for i,k in enumerate(["WARNING","CAUTION","CAUTION","NOTE","TIP"]))
pats = ['credential-stuffing','contagious-interview','sim-swap','pass-the-cookie','qr-code-phishing']
M['06-five-cards'] = ("**Lots going on.**\n\n" + five + "\n\n" + "\n".join(f"[^{i+1}]: [Source {i+1}]({S[p][0]})" for i,p in enumerate(pats)) + "\n",
  dict(fallback=False, cardKinds=["WARNING","CAUTION","CAUTION"], footnotesPerCard=[1,1,1], droppedCards=2, _decision="keep first 3 cards in order; footnotes only referenced by dropped cards are removed"))
M['07-six-sentence-card'] = (f"""> [!CAUTION]
> **A fake job offer is the main risk.** The recruiter is friendly. They send a coding test. The test hides malware. It steals your logins. It also empties wallets.[^1]

[^1]: [Unit 42]({S['contagious-interview'][0]})
""", dict(fallback=False, cardKinds=["CAUTION"], footnotesPerCard=[1], maxPlainSentencesPerCard=2, _decision="trim to bold plus first 2 plain sentences; footnote markers kept"))
M['08-footnote-no-definition'] = (f"""{card('WARNING','Your password is public.','Change it today.','[^1][^7]')}

[^1]: [NCSC]({S['credential-stuffing'][2]})
""", dict(fallback=False, cardKinds=["WARNING"], footnotesPerCard=[1], mustNotContain=["[^7]"]))
M['09-definition-never-used'] = (f"""{card('WARNING','Your password is public.','Change it today.','[^1]')}

[^1]: [NCSC]({S['credential-stuffing'][2]})
[^2]: [MITRE]({S['credential-stuffing'][0]})
""", dict(fallback=False, cardKinds=["WARNING"], footnotesPerCard=[1], mustNotContain=[S['credential-stuffing'][0]]))
M['10-link-not-whitelisted'] = (f"""**You may be a target.** Read [this blog](https://evil-scam-news.example/post) for more.

{card('CAUTION','A fake bank call may ask for a code.','Hang up and call the number on your card.','[^1][^2]')}

[^1]: [Random blog](https://totally-legit-security.example/bank)
[^2]: [FBI IC3]({S['fake-bank-call'][0]})
""", dict(fallback=False, cardKinds=["CAUTION"], footnotesPerCard=[1], droppedLinks=["https://evil-scam-news.example/post","https://totally-legit-security.example/bank"], mustNotContain=["evil-scam-news.example","totally-legit-security.example"], _decision="non whitelisted link keeps its text, loses its href; footnote pointing only off whitelist is removed"))
M['11-bare-url'] = (f"""**Check your accounts.** See https://haveibeenpwned-lookalike.example/check and {S['credential-stuffing'][2]} for details.

{card('TIP','Use a separate password for email.','It protects everything else.','')}
""", dict(fallback=False, cardKinds=["TIP"], footnotesPerCard=[0], droppedLinks=["https://haveibeenpwned-lookalike.example/check"], mustNotContain=["haveibeenpwned-lookalike.example"], _decision="bare whitelisted URL may autolink; bare non whitelisted URL is removed"))
M['12-empty-card'] = (f"""**One thing to learn.**

> [!WARNING]
>

{card('TIP','Use a separate password for email.','It protects everything else.','')}
""", dict(fallback=False, cardKinds=["TIP"], footnotesPerCard=[0]))
M['13-trailing-chatty'] = (base + "\nHope this helps! Let me know if you'd like me to expand on any section. 😊\n", dict(fallback=False, cardKinds=["CAUTION","TIP"], footnotesPerCard=[2,1], mustNotContain=["Hope this helps","Let me know"]))
M['14-em-dashes-american'] = (f"""**You're a target — especially since you've organized your accounts the same way.**

{card('TIP','Use a separate password for email — it\'s the center of everything.','Prioritize this; it\'s your favorite fix – honestly.','')}
""", dict(fallback=False, cardKinds=["TIP"], footnotesPerCard=[0], mustNotContain=["—","–"], lintWarnings=["american-spelling"], _decision="dashes replaced with a comma; spelling is flagged, not rewritten"))
M['15-json-instead'] = (json.dumps({"profile":"crypto-worker","cards":[{"kind":"WARNING","text":"Your password is public."}],"summary":"You look like a crypto worker."}, indent=2) + "\n",
  dict(fallback=True, cardKinds=[], footnotesPerCard=[]))
M['16-empty-string'] = ("", dict(fallback=True, cardKinds=[], footnotesPerCard=[]))
M['17-unknown-tag'] = (V['06-one-card-no-footnotes'][0].replace("#InTheNews", "#InTheNews #RichPerson #Hacked"),
  dict(fallback=False, cardKinds=["CAUTION"], footnotesPerCard=[0], keptTags=["InTheNews"], droppedTags=["RichPerson","Hacked"]))
M['18-html-script'] = (f"""**You are exposed.** <script>alert('x')</script>

<div style="color:red">Click <a href="https://evil.example">here</a></div>

{card('TIP','Use a separate password for email.','<img src=x onerror=alert(1)>It protects everything else.','')}
""", dict(fallback=False, cardKinds=["TIP"], footnotesPerCard=[0], droppedLinks=["https://evil.example"], mustNotContain=["<script","onerror","<div","<img","evil.example"]))
M['19-nested-list-in-card'] = (f"""> [!CAUTION]
> **A fake job offer could end with you running their code.**
> - Friendly recruiter
> - Coding test sent
>   - Hidden malware runs
>
> Never run it on your main computer.[^1]

[^1]: [Unit 42]({S['contagious-interview'][0]})
""", dict(fallback=False, cardKinds=["CAUTION"], footnotesPerCard=[1], mustNotContain=["- Friendly"], _decision="list items flattened to steps (or plain text); no raw list markers in output"))
M['20-only-chatty-and-headings'] = ("# Report\n\nSure! Here is your report.\n\nHope this helps!\n", dict(fallback=True, cardKinds=[], footnotesPerCard=[], _decision="nothing left after clean up, so fall back to rules"))

exp = {}
for folder, d in (('valid', V), ('messy', M)):
    for name, (txt, e) in d.items():
        p = f"{folder}/{name}.md"
        (HERE/p).write_text(txt)
        e = {"headingsToBold": 0, "droppedLinks": [], "droppedCards": 0, "droppedTags": [], **e}
        exp[p] = e
(HERE/'expected.json').write_text(json.dumps(exp, indent=2, ensure_ascii=False) + "\n")
(HERE/'whitelist.json').write_text(json.dumps({"allowedUrls": WL, "allowedTags": TAGS}, indent=2) + "\n")
print(len(V), len(M))

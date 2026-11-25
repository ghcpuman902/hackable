import styles from "./pattern-scenes.module.css";

export const SCENE_IDS = ["contagious-interview", "email-bomb-fake-it-support", "pass-the-cookie", "fake-boss-payment", "deepfake-crypto-giveaway", "state-spearphishing", "wallet-drainer", "sim-swap", "pig-butchering", "romance-scam", "task-scam", "fake-bank-call", "news-hook-phishing", "payroll-change", "after-move-council-letter", "marketplace-fake-buyer", "fake-booking-or-visa", "qr-code-phishing", "mfa-fatigue", "credential-stuffing", "voice-clone-family", "doxxing-swatting", "leaked-password-extortion", "fake-charity"] as const;

const finderStyle = { position: "absolute", width: 15, height: 15, border: "3px solid #22252a", background: "radial-gradient(#22252a 0 3px, #fff 4px)" } satisfies React.CSSProperties;
const Qr = () => <span className={styles.qr} style={{ position: "relative" }} aria-hidden="true"><i style={{ ...finderStyle, top: 2, left: 2 }} /><i style={{ ...finderStyle, top: 2, right: 2 }} /><i style={{ ...finderStyle, bottom: 2, left: 2 }} />{Array.from({ length: 13 }, (_, key) => <i key={key} />)}</span>;
const Avatar = ({ initials = "MT" }: { initials?: string }) => <span className={styles.avatar}>{initials}</span>;
const LinkedIn = () => <span className={styles.linkedin} aria-hidden="true">in</span>;
const Phone = ({ children }: { children: React.ReactNode }) => <div className={styles.phone}>{children}</div>;
const Browser = ({ children }: { children: React.ReactNode }) => <div className={styles.browser}><div className={styles.chrome}><i /><i /><i /><span /></div>{children}</div>;
const Message = ({ children, sent = false }: { children: React.ReactNode; sent?: boolean }) => <div className={`${styles.message} ${sent ? styles.sent : ""}`}>{children}</div>;

function Scene({ id }: { id: string }) {
  switch (id) {
    case "contagious-interview": return <div className={`${styles.card} ${styles.linkedinScene}`}><LinkedIn /><div className={styles.chatHead}><Avatar /><span><b>Maya Torres</b><small>Talent partner</small></span></div><Message>Your test is ready</Message><Message sent>Thanks, I will start now</Message><span className={styles.attachment}>▣ take-home-test.zip</span></div>;
    case "email-bomb-fake-it-support": return <div className={`${styles.card} ${styles.mailScene}`}><b>1,284 unread</b>{["Welcome to your new account", "Welcome to your new account", "Your receipt is ready", "Account confirmation"].map((text, index) => <div className={styles.email} key={`${text}-${index}`}><i />{text}</div>)}<span className={styles.help}>▣ IT Helpdesk</span></div>;
    case "pass-the-cookie": return <Browser><div className={styles.cookie}><span>●</span><b>Session copied</b><small>Account session</small><em>Signed in from a new device</em></div><div className={styles.progress} /></Browser>;
    case "fake-boss-payment": return <><div className={`${styles.note} ${styles.boss}`}><small>From: Olivia Chen, CEO</small><b>Could you pay this today?</b><em>URGENT</em></div><Message sent>Keep this quiet</Message></>;
    case "deepfake-crypto-giveaway": return <Browser><span className={styles.live}>LIVE</span><div className={styles.videoAvatar}>EC</div><b className={styles.videoTitle}>Double your crypto</b><small className={styles.videoSub}>Giveaway stream</small><div className={styles.videoProgress}><i /></div></Browser>;
    case "state-spearphishing": return <div className={`${styles.note} ${styles.briefing}`}><small>Office of research</small><b>Briefing for your review</b><span>Border policy update</span><div className={styles.attachment}>▣ briefing-notes.pdf</div><em>For you</em></div>;
    case "wallet-drainer": return <div className={styles.login}><b>Connect wallet</b><small>Continue with your wallet</small><div className={styles.wallet}>◈ MetaMask</div><button type="button">Connect wallet</button><span className={styles.approve}>Approve all tokens</span></div>;
    case "sim-swap": return <Phone><b>No service</b><small>Emergency calls only</small><span className={styles.signal}>⌁</span><em>SIM unavailable</em></Phone>;
    case "pig-butchering": return <div className={`${styles.card} ${styles.invest}`}><Message>I found a great app</Message><Message sent>It is up 24%</Message><div className={styles.chart}><i /><i /><i /><i /></div><b>+£8,420</b><small>Portfolio value</small></div>;
    case "romance-scam": return <div className={`${styles.card} ${styles.romance}`}><div className={styles.chatHead}><Avatar initials="AS" /><span><b>Alex Smith</b><small>Online now</small></span></div><Message>Thinking of you</Message><Message sent>Can you help with my flight?</Message><span>♥</span></div>;
    case "task-scam": return <div className={`${styles.card} ${styles.tasks}`}><b>Reward tasks</b><small>Complete tasks to unlock earnings</small>{[["Like a video", "£5"], ["Rate a shop", "£5"], ["Unlock £80", "£80"]].map(([task, reward]) => <div className={styles.task} key={task}><i>✓</i>{task}<b>{reward}</b></div>)}</div>;
    case "fake-bank-call": return <Phone><small>Incoming call</small><b>Bank Fraud Team</b><span className={styles.call}>☎</span><em>Decline</em><strong>Answer</strong></Phone>;
    case "news-hook-phishing": return <div className={`${styles.card} ${styles.news}`}><span className={styles.live}>BREAKING</span><b>Major story develops</b><small>Read the latest update</small><button type="button">Read the update</button></div>;
    case "payroll-change": return <div className={`${styles.card} ${styles.payroll}`}><small>HR portal</small><b>Update bank details</b><label>Account holder<input value="Maya Torres" readOnly /></label><label>Sort code<input value="12 34 56" readOnly /></label><button type="button">Save changes</button></div>;
    case "after-move-council-letter": return <div className={`${styles.note} ${styles.council}`}><small>Hammersmith & Fulham Council</small><b>Council tax notice</b><span>Payment overdue</span><em>View your bill</em></div>;
    case "marketplace-fake-buyer": return <div className={`${styles.card} ${styles.market}`}><small>Market chat</small><Message>Is this still available?</Message><Message sent>Already paid, check this link</Message><span className={styles.attachment}>View payment</span></div>;
    case "fake-booking-or-visa": return <div className={`${styles.card} ${styles.booking}`}><small>Travel confirmation</small><span>✈</span><b>Your booking to Lisbon</b><em>19 March, 08:45</em><strong>Payment failed</strong></div>;
    case "qr-code-phishing": return <div className={styles.parking}><b>Pay for parking</b><small>Zone 4821</small><Qr /><span>Scan to pay</span></div>;
    case "mfa-fatigue": return <Phone><b>Security check</b><small>Approve sign in?</small><div className={styles.signins}><span>London, UK <b>Approve</b></span><span>London, UK <b>Approve</b></span><span>London, UK <b>Approve</b></span></div></Phone>;
    case "credential-stuffing": return <div className={styles.login}><b>Sign in</b><small>Use your account details</small><input placeholder="Email address" /><input placeholder="Password" /><button type="button">Sign in</button><em>47 attempts blocked</em></div>;
    case "voice-clone-family": return <Phone><b>Mum</b><small>Voice message</small><div className={styles.voice}>{Array.from({ length: 7 }, (_, key) => <i key={key} />)}</div><span>I need help</span></Phone>;
    case "doxxing-swatting": return <Browser><div className={styles.map}><span>14 River Lane</span><i /></div></Browser>;
    case "leaked-password-extortion": return <div className={`${styles.note} ${styles.extortion}`}><small>Your old password</small><b>m••••••4</b><span>We have your private files</span><em>Pay to keep this private</em></div>;
    case "fake-charity": return <div className={`${styles.card} ${styles.charity}`}><span>♥</span><b>Emergency appeal</b><small>Help families after the flood</small><button type="button">Donate now</button></div>;
    default: return <div className={styles.card} />;
  }
}

export function PatternScene({ id }: { id: string }) { return <div className={styles.scene} role="img" aria-label={`Illustration of the ${id.replaceAll("-", " ")} scam pattern`}><Scene id={id} /></div>; }

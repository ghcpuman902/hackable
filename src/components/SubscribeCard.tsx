"use client";
/* No email is collected anywhere. The button opens the shared demo notice. */

import { DemoNoticeButton } from "./DemoNoticeDialog";
import "./subscribe-card.css";

export function SubscribeCard() {
  return (
    <section className="sec mk-card plain subscribe-card">
      <h2>Get an updated report when something new turns up</h2>
      <DemoNoticeButton className="pill">Subscribe</DemoNoticeButton>
    </section>
  );
}

"use client";
// MOCK ONLY (hackathon demo). Do not wire to Resend or any backend without Mangle's explicit OK.

import { Check, Mail } from "lucide-react";
import { useId, useState, useSyncExternalStore, type FormEvent } from "react";
import "./subscribe-card.css";

const noopSubscribe = () => () => {};

export function SubscribeCard({ email }: { email?: string }) {
  const emailId = useId();
  const [submitted, setSubmitted] = useState(false);
  // Keep native submission disabled until React can cancel it.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // MOCK ONLY (hackathon demo). Do not wire to Resend or any backend without Mangle's explicit OK.
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="subscribe" className="sec mk-card plain subscribe-card" data-submitted={submitted}>
      <form className="subscribe-card-form" onSubmit={handleSubmit}>
        <h2>Get an updated report when something new turns up</h2>
        <label htmlFor={emailId}>Email address</label>
        <div className="subscribe-card-controls">
          <input id={emailId} type="email" autoComplete="email" defaultValue={email} required />
          <button className="pill" type="submit" disabled={!hydrated}>
            Keep me posted
          </button>
        </div>
      </form>
      <div className="subscribe-card-result">
        {submitted && <Mail className="subscribe-card-mail" size={26} aria-hidden="true" />}
        <p className="subscribe-card-status" role="status">
          {submitted && (
            <>
              <Check className="subscribe-card-check" size={20} aria-hidden="true" />
              <span>{"We'll email you if anything changes."}</span>
            </>
          )}
        </p>
      </div>
    </section>
  );
}

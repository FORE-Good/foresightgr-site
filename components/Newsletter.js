"use client";

import { useState } from "react";
import {
  NEWSLETTER_ACTION_URL,
  NEWSLETTER_EMAIL_FIELD,
} from "@/lib/site";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);

    const formData = new FormData();
    formData.append(NEWSLETTER_EMAIL_FIELD, email);

    try {
      await fetch(NEWSLETTER_ACTION_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });
    } catch {
      /* no-cors: response opaque; treat as success like the original */
    }

    setEmail("");
    setSending(false);
    setStatus("Thanks! You're on the list!");
  }

  return (
    <div className="footer-newsletter">
      <h3>Stay in the loop</h3>
      <p>
        Not ready to book a call yet? Leave your email and we&apos;ll keep you
        posted as FOREsight grows.
      </p>
      <form
        id="newsletterForm"
        className="footer-newsletter-form"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          id="newsletterEmail"
          name="email"
          placeholder="you@organisation.org.au"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-accent" disabled={sending}>
          {sending ? "Sending..." : "Keep me posted"}
        </button>
      </form>
      {status ? (
        <p className="newsletter-status" id="newsletterStatus">
          {status}
        </p>
      ) : (
        <p className="newsletter-status" id="newsletterStatus" hidden />
      )}
    </div>
  );
}

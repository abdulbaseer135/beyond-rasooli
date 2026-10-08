"use client";
import { useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Turnstile } from "./Turnstile";
export function NewsletterForm() {
  const ui = useTranslations("ui");
  const forms = useTranslations("forms");
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const token = useRef("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setStatus("");
    try {
      const data = Object.fromEntries(new FormData(form));
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          consent: data.consent === "on",
          locale,
          turnstileToken: token.current,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setStatus(
          ["email_invalid", "turnstile_required", "required"].includes(
            result.error,
          )
            ? result.error
            : "newsletter_error",
        );
      } else {
        setStatus("newsletter_message");
        form.reset();
      }
    } catch {
      setStatus("newsletter_error");
    } finally {
      setBusy(false);
      token.current = "";
    }
  }
  return (
    <form className="newsletter-form" onSubmit={submit}>
      <h2 className="type-h3">{ui("newsletter_signup")}</h2>
      <label>
        {forms("email_label")}
        <input
          type="email"
          name="email"
          required
          maxLength={254}
          autoComplete="email"
          dir="ltr"
        />
      </label>
      <label className="newsletter-consent">
        <input type="checkbox" name="consent" required />
        {ui("newsletter_consent")}
      </label>
      <Turnstile
        action="newsletter"
        onToken={(value) => {
          token.current = value;
        }}
      />
      <button type="submit" className="button button-primary" disabled={busy}>
        {ui(busy ? "submitting" : "newsletter_signup")}
      </button>
      <p role="status">{status && ui(status)}</p>
    </form>
  );
}

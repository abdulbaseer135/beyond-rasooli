"use client";
import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import { useLocale, useTranslations } from "next-intl";
import { contactReasons, validateContact } from "@/lib/contact-validation";
type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
export function ContactForm() {
  const t = useTranslations("forms");
  const ui = useTranslations("ui");
  const locale = useLocale();
  const form = useRef<HTMLFormElement>(null);
  const captcha = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const token = useRef("");
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
  useEffect(() => {
    const api = (window as unknown as { turnstile?: Turnstile }).turnstile;
    if (ready && captcha.current && api && siteKey) {
      widget.current = api.render(captcha.current, {
        sitekey: siteKey,
        action: "contact",
        callback: (v: string) => {
          token.current = v;
        },
        "expired-callback": () => {
          token.current = "";
        },
        "error-callback": () => {
          token.current = "";
        },
      });
      return () => {
        if (widget.current) api.remove(widget.current);
      };
    }
  }, [ready, siteKey]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const invalid = validateContact(body);
    setErrors(invalid);
    setStatus("");
    if (Object.keys(invalid).length) {
      form.current
        ?.querySelector<HTMLElement>(`[name="${Object.keys(invalid)[0]}"]`)
        ?.focus();
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          locale,
          turnstileToken: token.current,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        if (data.fields) setErrors(data.fields);
        setStatus(
          ["rate_limited", "turnstile_required"].includes(data.error)
            ? data.error
            : "contact_error",
        );
      } else {
        setStatus(
          data.delivered ? "contact_success" : "contact_delivery_pending",
        );
        form.current?.reset();
      }
    } catch {
      setStatus("contact_error");
    } finally {
      setBusy(false);
      token.current = "";
      const api = (window as unknown as { turnstile?: Turnstile }).turnstile;
      if (widget.current) api?.reset(widget.current);
    }
  }
  return (
    <form
      ref={form}
      method="post"
      action="/api/contact"
      onSubmit={submit}
      className="contact-form"
      noValidate
    >
      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          onReady={() => setReady(true)}
        />
      )}
      <div hidden aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-label={ui("required")}
        />
      </div>
      {(["name", "email"] as const).map((field) => (
        <label key={field} htmlFor={`contact-${field}`}>
          {t(`${field}_label`)}
          <input
            id={`contact-${field}`}
            name={field}
            type={field === "email" ? "email" : "text"}
            required
            maxLength={field === "email" ? 254 : 160}
            autoComplete={field}
            dir={field === "email" ? "ltr" : undefined}
            aria-invalid={Boolean(errors[field])}
            aria-describedby={
              errors[field] ? `contact-${field}-error` : undefined
            }
          />
          {errors[field] && (
            <span id={`contact-${field}-error`} className="field-error">
              {ui(errors[field])}
            </span>
          )}
        </label>
      ))}
      <label htmlFor="contact-reason">
        {t("reason_label")}
        <select id="contact-reason" name="reason" defaultValue="general">
          {contactReasons.map((reason) => (
            <option key={reason} value={reason}>
              {t(`reason_${reason}`)}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="contact-message">
        {t("message_label")}
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          maxLength={10000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
        />
        {errors.message && (
          <span id="contact-message-error" className="field-error">
            {ui(errors.message)}
          </span>
        )}
      </label>
      <div ref={captcha} />
      <button className="button button-primary" disabled={busy} type="submit">
        {ui(busy ? "submitting" : "submit")}
      </button>
      <p role="status" className="type-ui">
        {status && ui(status)}
      </p>
    </form>
  );
}

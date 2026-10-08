import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { NextResponse } from "next/server";
import config from "@payload-config";
import { getPayload } from "payload";
import { validateContact, type contactReasons } from "@/lib/contact-validation";
import { getMergedMessages } from "@/lib/ui-strings";
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    if (Number(req.headers.get("content-length") || 0) > 20000)
      return NextResponse.json({ error: "invalid_request" }, { status: 413 });
    const body = await req.json();
    if (!body || typeof body !== "object")
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    if (body.website)
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    const fields = validateContact(body);
    if (Object.keys(fields).length)
      return NextResponse.json(
        { error: "invalid_fields", fields },
        { status: 400 },
      );
    const locale = ["en", "ps", "fa"].includes(body.locale)
      ? (body.locale as "en" | "ps" | "fa")
      : "en";
    const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    let verified = false;
    if (secret) {
      if (typeof body.turnstileToken !== "string" || !body.turnstileToken)
        return NextResponse.json(
          { error: "turnstile_required" },
          { status: 400 },
        );
      const result = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: new URLSearchParams({ secret, response: body.turnstileToken }),
          signal: AbortSignal.timeout(10000),
        },
      );
      const check = result.ok ? await result.json() : null;
      verified = Boolean(
        check?.success &&
        check?.action === "contact" &&
        check?.hostname === new URL(req.url).hostname,
      );
      if (!verified)
        return NextResponse.json(
          { error: "turnstile_required" },
          { status: 400 },
        );
    } else if (process.env.NODE_ENV === "production")
      return NextResponse.json({ error: "contact_error" }, { status: 503 });
    const payload = await getPayload({ config });
    const rawIP =
      process.env.TRUST_PROXY_IP === "true"
        ? (req.headers.get("x-forwarded-for") || "").split(",")[0].trim()
        : "";
    const ipHash =
      isIP(rawIP) && process.env.PAYLOAD_SECRET
        ? createHash("sha256")
            .update(process.env.PAYLOAD_SECRET + "|" + rawIP)
            .digest("hex")
        : undefined;
    // Persisted rate-limit check works across application workers. CAPTCHA is the primary abuse gate.
    const recent = await payload.count({
      collection: "contacts",
      overrideAccess: true,
      where: {
        and: [
          {
            or: [
              { email: { equals: body.email.trim().toLowerCase() } },
              ...(ipHash ? [{ ipAddress: { equals: ipHash } }] : []),
            ],
          },
          {
            createdAt: {
              greater_than: new Date(Date.now() - 3600000).toISOString(),
            },
          },
        ],
      },
    });
    if (recent.totalDocs >= 3)
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    const doc = await payload.create({
      collection: "contacts",
      overrideAccess: true,
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        reason: body.reason as (typeof contactReasons)[number],
        message: body.message.trim(),
        locale,
        ipAddress: ipHash,
        turnstileVerified: verified,
        deliveredViaEmail: false,
      },
    });
    let delivered = false;
    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_TO_EMAIL;
    const sender = process.env.CONTACT_FROM_EMAIL;
    if (apiKey && recipient && sender) {
      try {
        const messages = await getMergedMessages(locale);
        const template = (s: string, values: Record<string, string>) =>
          s.replace(/\{(\w+)\}/g, (_, key: string) => values[key] || "");
        const result = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: sender,
            to: [recipient],
            reply_to: doc.email,
            subject: template(messages.ui.email_contact_subject, {
              reason: messages.forms[`reason_${doc.reason}`] || doc.reason,
            }),
            text: template(messages.ui.email_contact_body, {
              name: doc.name,
              email: doc.email,
              reason: messages.forms[`reason_${doc.reason}`] || doc.reason,
              message: doc.message,
            }),
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (result.ok) {
          const receipt = await result.json();
          if (receipt.id) {
            await payload.update({
              collection: "contacts",
              id: doc.id,
              overrideAccess: true,
              data: { deliveredViaEmail: true },
            });
            delivered = true;
          }
        }
      } catch {
        /* Stored message remains available to the founder; report delivery honestly. */
      }
    }
    return NextResponse.json({
      success: true,
      delivered,
      messageCode: delivered ? "contact_success" : "contact_delivery_pending",
    });
  } catch {
    return NextResponse.json({ error: "contact_error" }, { status: 500 });
  }
}

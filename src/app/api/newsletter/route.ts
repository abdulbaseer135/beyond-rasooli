import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    if (
      typeof body.email !== "string" ||
      body.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
    )
      return NextResponse.json({ error: "email_invalid" }, { status: 400 });
    if (body.consent !== true)
      return NextResponse.json({ error: "required" }, { status: 400 });
    const payload = await getPayload({ config });
    const settings = await payload.findGlobal({
      slug: "site-settings",
      overrideAccess: true,
    });
    const provider = settings.newsletterProvider;
    const key = process.env.NEWSLETTER_API_KEY;
    if (
      !settings.newsletterEnabled ||
      !key ||
      !["buttondown", "mailerlite"].includes(provider || "")
    )
      return NextResponse.json({ error: "newsletter_error" }, { status: 503 });
    const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (
      !secret ||
      typeof body.turnstileToken !== "string" ||
      !body.turnstileToken
    )
      return NextResponse.json(
        { error: "turnstile_required" },
        { status: 400 },
      );
    const verification = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({ secret, response: body.turnstileToken }),
        signal: AbortSignal.timeout(10000),
      },
    );
    const check = verification.ok ? await verification.json() : null;
    if (
      !check?.success ||
      check.action !== "newsletter" ||
      check.hostname !== new URL(req.url).hostname
    )
      return NextResponse.json(
        { error: "turnstile_required" },
        { status: 400 },
      );
    const endpoint =
      provider === "buttondown"
        ? "https://api.buttondown.com/v1/subscribers"
        : "https://connect.mailerlite.com/api/subscribers";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `${provider === "buttondown" ? "Token" : "Bearer"} ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        provider === "buttondown"
          ? {
              email_address: body.email.trim().toLowerCase(),
              type: "unactivated",
            }
          : { email: body.email.trim().toLowerCase(), status: "unconfirmed" },
      ),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      return NextResponse.json({ error: "newsletter_error" }, { status: 502 });
    const receipt = await response.json();
    if (!(receipt.id || receipt.data?.id))
      return NextResponse.json({ error: "newsletter_error" }, { status: 502 });
    return NextResponse.json({
      success: true,
      messageCode: "newsletter_message",
    });
  } catch {
    return NextResponse.json({ error: "newsletter_error" }, { status: 500 });
  }
}

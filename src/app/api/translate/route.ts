import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";
import {
  translateText,
  buildSystemPrompt,
  type TranslationRequest,
} from "@/lib/translation/adapter";
import { randomUUID } from "node:crypto";
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: TranslationRequest;
  try {
    body = await req.json();
    if (
      typeof body.sourceText !== "string" ||
      !body.sourceText.trim() ||
      body.sourceText.length > 20000 ||
      !["en", "ps", "fa"].includes(body.targetLocale) ||
      !["en", "ps", "fa"].includes(body.sourceLocale) ||
      !["title", "summary", "body", "description", "transcript"].includes(
        body.contentType,
      )
    )
      throw new Error();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const inputRate = Number(process.env.TRANSLATION_INPUT_USD_PER_MILLION);
  const outputRate = Number(process.env.TRANSLATION_OUTPUT_USD_PER_MILLION);
  if (
    !process.env.ANTHROPIC_API_KEY ||
    !process.env.ANTHROPIC_MODEL ||
    !Number.isFinite(inputRate) ||
    !Number.isFinite(outputRate) ||
    inputRate <= 0 ||
    outputRate <= 0
  )
    return NextResponse.json(
      { error: "translation_provider_unavailable" },
      { status: 503 },
    );
  const settings = await payload.findGlobal({
    slug: "site-settings",
    overrideAccess: true,
  });
  const glossary = await payload.find({collection: "glossary", user, overrideAccess: false, limit: 500, depth: 0});
  body.glossary = [...(settings.glossary || []), ...glossary.docs].map((g) => ({
    termEn: g.termEn,
    termPs: g.termPs || undefined,
    termFa: g.termFa || undefined,
    doNotTranslate: Boolean(g.doNotTranslate),
  }));
  const month = new Date().toISOString().slice(0, 7);
  const reserved =
    ((Buffer.byteLength(
      body.sourceText +
        buildSystemPrompt(body.targetLocale) +
        JSON.stringify(body.glossary),
      "utf8",
    ) +
      2000) *
      inputRate) /
      1000000 +
    (4000 * outputRate) / 1000000;
  // A unique active key serializes budget checks across workers. A crash leaves a fail-closed reservation for founder inspection.
  let log;
  try {
    log = await payload.create({
      collection: "translation-usage",
      overrideAccess: true,
      data: {
        requestKey: "active-translation",
        month,
        userID: user.id,
        sourceLocale: body.sourceLocale,
        targetLocale: body.targetLocale,
        characterCount: body.sourceText.length,
        reservedCostUsd: reserved,
        provider: "anthropic",
        model: process.env.ANTHROPIC_MODEL,
        status: "reserved",
      },
    });
  } catch {
    return NextResponse.json({ error: "translation_busy" }, { status: 409 });
  }
  try {
    let spent = 0;
    let page = 1;
    for (;;) {
      const usage = await payload.find({
        collection: "translation-usage",
        overrideAccess: true,
        limit: 100,
        page,
        where: { month: { equals: month } },
      });
      for (const entry of usage.docs)
        if (entry.id !== log.id)
          spent += entry.actualCostUsd ?? entry.reservedCostUsd;
      if (!usage.hasNextPage) break;
      page++;
    }
    if (spent + reserved > (settings.translationBudgetUsd || 0)) {
      await payload.update({
        collection: "translation-usage",
        id: log.id,
        overrideAccess: true,
        data: {
          requestKey: randomUUID(),
          status: "failed",
          actualCostUsd: 0,
          errorCode: "translation_budget_exceeded",
        },
      });
      return NextResponse.json(
        { error: "translation_budget_exceeded" },
        { status: 429 },
      );
    }
    const result = await translateText(body);
    const actual =
      (result.inputTokens * inputRate + result.outputTokens * outputRate) /
      1000000;
    await payload.update({
      collection: "translation-usage",
      id: log.id,
      overrideAccess: true,
      data: {
        requestKey: randomUUID(),
        status: "completed",
        actualCostUsd: actual,
      },
    });
    return NextResponse.json({ ...result, estimatedCostUsd: actual });
  } catch {
    await payload.update({
      collection: "translation-usage",
      id: log.id,
      overrideAccess: true,
      data: {
        requestKey: randomUUID(),
        status: "failed",
        errorCode: "translation_provider_unavailable",
      },
    });
    return NextResponse.json(
      { error: "translation_provider_unavailable" },
      { status: 503 },
    );
  }
}

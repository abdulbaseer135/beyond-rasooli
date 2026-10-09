import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";
import { canAccessEditorial } from "@/collections/shared/auth-roles";
import { POST as providerRequest } from "../translate/route";
import {
  collectProse,
  replaceProse,
  sourceHashInput,
} from "@/lib/translation/structure";
import { createHash } from "node:crypto";
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user || !canAccessEditorial(user))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { collection, id, targetLocale, confirmReviewedOverwrite } =
      await req.json();
    if (
      !["articles", "videos"].includes(collection) ||
      !id ||
      !["ps", "fa", "en"].includes(targetLocale)
    )
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    const slug = collection as "articles" | "videos";
    const source = await payload.findByID({
      collection: slug,
      id,
      user,
      overrideAccess: false,
      depth: 0,
    });
    if (source.language === targetLocale)
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    const existing = await payload.find({
      collection: slug,
      user,
      overrideAccess: false,
      depth: 0,
      limit: 1,
      where: {
        and: [
          { translationGroup: { equals: source.translationGroup } },
          { language: { equals: targetLocale } },
        ],
      },
    });
    const target = existing.docs[0];
    if (target?.translationStatus === "reviewed" && !confirmReviewedOverwrite)
      return NextResponse.json(
        { error: "reviewed_confirmation_required" },
        { status: 409 },
      );
    if (
      target &&
      ["published", "scheduled", "archived"].includes(target.status || "") &&
      user.role !== "admin"
    )
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const sourceBody = "body" in source ? structuredClone(source.body) : null;
    async function prepareUploads(value: unknown): Promise<void> {
      if(Array.isArray(value)){for(const child of value)await prepareUploads(child);return;}
      if(!value || typeof value!=="object")return;
      const node=value as Record<string,unknown>;
      if(node.type==="upload" && node.relationTo==="media" && node.value){
        const id=typeof node.value==="object" ? (node.value as {id:number}).id : node.value as number;
        const image=await payload.findByID({collection:"media",id,user,overrideAccess:false,depth:0});
        if(!node.alt)node.alt=image.alt;
        if(!node.caption)node.caption=image.caption || "";
      }
      for(const child of Object.values(node))if(child && typeof child==="object")await prepareUploads(child);
    }
    await prepareUploads(sourceBody);
    const cover = "coverImage" in source && source.coverImage ? await payload.findByID({collection:"media",id:typeof source.coverImage==="object"?source.coverImage.id:source.coverImage,user,overrideAccess:false,depth:0}) : null;
    const bodyTexts = collectProse(sourceBody);
    const text = slug === "articles" ? (source as import("@/payload-types").Article).summary : (source as import("@/payload-types").Video).description;
    const sourcePack = {
      title: source.title,
      coverCaption: "coverCaption" in source ? source.coverCaption || "" : "",
      coverAlt: "coverAlt" in source ? source.coverAlt || cover?.alt || "" : "",
      videoSummary: slug === "videos" ? source.summary || "" : "",
      correctionNote:
        "correctionNote" in source ? source.correctionNote || "" : "",
      evidenceText:
        "evidenceNote" in source ? source.evidenceNote?.text || "" : "",
      sourceNotes: (source.sources || []).map((item) => item.note || ""),
      text,
      bodyTexts,
      transcript: "transcript" in source ? source.transcript || "" : "",
      seoTitle: source.seoTitle || "",
      metaDescription: source.metaDescription || "",
    };
    const response = await providerRequest(
      new Request(new URL("/api/translate", req.url), {
        method: "POST",
        headers: req.headers,
        body: JSON.stringify({
          sourceText: JSON.stringify(sourcePack),
          sourceLocale: source.language,
          targetLocale,
          contentType: "body",
        }),
      }),
    );
    const provider = await response.json();
    if (!response.ok)
      return NextResponse.json(provider, { status: response.status });
    let translated;
    try {
      translated = JSON.parse(provider.translatedText);
    } catch {
      return NextResponse.json(
        { error: "translation_structure_failed" },
        { status: 422 },
      );
    }
    if (
      typeof translated.title !== "string" ||
      !translated.title.trim() ||
      typeof translated.text !== "string" ||
      ![
        "coverCaption",
        "coverAlt",
        "videoSummary",
        "correctionNote",
        "evidenceText",
        "transcript",
        "seoTitle",
        "metaDescription",
      ].every((key) => typeof translated[key] === "string") ||
      !Array.isArray(translated.sourceNotes) ||
      translated.sourceNotes.length !== sourcePack.sourceNotes.length ||
      !translated.sourceNotes.every(
        (note: unknown) => typeof note === "string",
      ) ||
      !Array.isArray(translated.bodyTexts) ||
      translated.bodyTexts.length !== bodyTexts.length ||
      !translated.bodyTexts.every((t: unknown) => typeof t === "string")
    )
      return NextResponse.json(
        { error: "translation_structure_failed" },
        { status: 422 },
      );
    const common = {
      translationGroup: source.translationGroup,
      language: targetLocale,
      title: translated.title,
      slug: target?.slug || `${source.slug}-${targetLocale}`,
      topic: source.topic,
      status: "draft" as const,
      sourceChanged: false,
      translationStatus: "machine_draft" as const,
      translatedFromLocale: source.language,
      translatedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      sourceHashAtTranslation: createHash("sha256")
        .update(sourceHashInput(source))
        .digest("hex"),
      seoTitle:
        typeof translated.seoTitle === "string" ? translated.seoTitle : "",
      metaDescription:
        typeof translated.metaDescription === "string"
          ? translated.metaDescription
          : "",
      sources: (source.sources || []).map((item, index) => ({
        sourceType:item.sourceType,evidenceLevel:item.evidenceLevel,title:item.title,authorOrg:item.authorOrg,year:item.year,urlDoi:item.urlDoi,note:translated.sourceNotes[index],
      })),
      tags: (source.tags || []).map(item=>({tag:item.tag})),
    };
    const data =
      slug === "articles"
        ? {
            ...common,
            summary: translated.text,
            body: replaceProse(sourceBody, translated.bodyTexts),
            author: "author" in source ? source.author : null,
            authorProfile: "authorProfile" in source ? source.authorProfile : null,
            coverImage: "coverImage" in source ? source.coverImage : null,
            format: "format" in source ? source.format : "article",
            readingTimeMinutes:
              "readingTimeMinutes" in source ? source.readingTimeMinutes : 5,
            relatedVideo: "relatedVideo" in source ? source.relatedVideo : null,
            coverCaption: translated.coverCaption,
            coverAlt: translated.coverAlt,
            correctionNote: translated.correctionNote,
            evidenceNote:
              "evidenceNote" in source && source.evidenceNote?.status
                ? { ...source.evidenceNote, text: translated.evidenceText }
                : null,
          }
        : {
            ...common,
            description: translated.text,
            summary: translated.videoSummary,
            transcript:
              typeof translated.transcript === "string"
                ? translated.transcript
                : "",
            youtubeUrl: "youtubeUrl" in source ? source.youtubeUrl : "",
            spokenLanguage:
              "spokenLanguage" in source
                ? source.spokenLanguage
                : source.language,
            thumbnail: "thumbnail" in source ? source.thumbnail : null,
            duration: "duration" in source ? source.duration : "",
            durationSeconds:
              "durationSeconds" in source ? source.durationSeconds : 0,
            relatedArticle:
              "relatedArticle" in source ? source.relatedArticle : null,
          };
    const saved = target
      ? await payload.update({
          collection: slug,
          id: target.id,
          user,
          overrideAccess: false,
          data: data as never,
        })
      : await payload.create({
          collection: slug,
          user,
          overrideAccess: false,
          data: data as never,
        });
    return NextResponse.json({
      success: true,
      id: saved.id,
      collection: slug,
      status: "machine_draft",
      warnings: provider.safeguardWarnings || [],
    });
  } catch {
    return NextResponse.json(
      { error: "translation_structure_failed" },
      { status: 422 },
    );
  }
}

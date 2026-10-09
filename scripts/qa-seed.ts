import { getPayload } from "payload";
import config from "../src/payload.config";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import en from "../src/messages/en.json";
import ps from "../src/messages/ps.json";
import fa from "../src/messages/fa.json";
if (
  !["file:./.qa/editorial.sqlite", "file:./.qa/final.sqlite"].includes(
    process.env.DATABASE_URI || "",
  )
)
  throw new Error("QA seed is restricted to the isolated .qa database");
const payload = await getPayload({ config });
const existing = await payload.find({
  collection: "users",
  where: { email: { equals: "qa@beyondrasooli.test" } },
});
const admin =
  existing.docs[0] ||
  (await payload.create({
    collection: "users",
    data: {
      email: "qa@beyondrasooli.test",
      password: process.env.QA_ADMIN_PASSWORD || "Local-QA-only-9273!",
      name: "QA Editor",
      role: "admin",
      status: "approved",
    } as any,
    overrideAccess: true,
  }));
const user = admin;
for (const [namespace, values] of Object.entries(en))
  for (const [key, value] of Object.entries(values)) {
    const originalPS = (ps as Record<string, Record<string, string>>)[
      namespace
    ]?.[key];
    const originalFA = (fa as Record<string, Record<string, string>>)[
      namespace
    ]?.[key];
    await payload.create({
      collection: "ui-strings",
      user,
      overrideAccess: false,
      data: {
        key: `${namespace}.${key}`,
        namespace: namespace as never,
        valueEn: value,
        valuePs: originalPS || "",
        valueFa: originalFA || "",
        statusPs: "ai_draft",
        statusFa: "ai_draft",
      },
    });
  }
await fs.mkdir(".qa", { recursive: true });
const file = path.resolve(".qa/media.png");
await sharp({
  create: { width: 900, height: 600, channels: 3, background: "#DCE5D6" },
})
  .png()
  .toFile(file);
const image = await payload.create({
  collection: "media",
  user,
  overrideAccess: false,
  data: {
    alt: "QA image: muted sage field",
    caption: "QA fixture only",
    credit: "Automated test fixture",
  },
  filePath: file,
});
for (const locale of ["en", "ps", "fa"] as const) {
  const topic = await payload.create({
    collection: "topics",
    locale,
    user,
    overrideAccess: false,
    data: {
      slug: `qa-topic-${locale}`,
      name:
        locale === "en"
          ? "QA Psychology"
          : locale === "ps"
            ? "\u0627\u0632\u0645\u0648\u06cc\u0646\u0647"
            : "\u0622\u0632\u0645\u0627\u06cc\u0634",
      description: "QA fixture only",
      order: 1,
      status: "published",
    },
  });
  const sample =
    locale === "en"
      ? "A test of memory and attention"
      : locale === "ps"
        ? "\u0681 \u0685 \u0689 \u0693 \u0696 \u069a \u06bc \u06cd \u0626 \u062f \u062d\u0627\u0641\u0638\u06d0 \u0627\u0632\u0645\u0648\u06cc\u0646\u0647"
        : "\u0622\u0632\u0645\u0627\u06cc\u0634 \u062d\u0627\u0641\u0638\u0647 \u0648 \u062a\u0648\u062c\u0647";
  const article = await payload.create({
    collection: "articles",
    user,
    overrideAccess: false,
    data: {
      translationGroup: "qa-memory",
      language: locale,
      slug: `qa-memory-${locale}`,
      title: sample,
      summary: sample,
      body: {
        root: {
          type: "root",
          format: "",
          indent: 0,
          version: 1,
          direction: locale === "en" ? "ltr" : "rtl",
          children: [
            {
              type: "heading",
              tag: "h2",
              version: 1,
              format: "",
              indent: 0,
              direction: null,
              children: [
                {
                  type: "text",
                  version: 1,
                  text: sample,
                  format: 0,
                  detail: 0,
                  mode: "normal",
                  style: "",
                },
              ],
            },
            {
              type: "paragraph",
              version: 1,
              format: "",
              indent: 0,
              direction: null,
              children: [
                {
                  type: "text",
                  version: 1,
                  text: sample.repeat(20),
                  format: 0,
                  detail: 0,
                  mode: "normal",
                  style: "",
                },
              ],
            },
          ],
        },
      },
      author: admin.id,
      coverImage: image.id,
      topic: topic.id,
      status: "published",
      translationStatus: "reviewed",
      publishedAt: "2026-01-01",
      tags: [{ tag: "memory" }],
      sources: [
        {
          sourceType: "paper",
          evidenceLevel: "primary_research",
          title: "QA source",
          authorOrg: "QA researcher",
          year: "2024",
          urlDoi: "https://example.com/source",
        },
      ],
    },
  });
  const video = await payload.create({
    collection: "videos",
    user,
    overrideAccess: false,
    data: {
      translationGroup: "qa-video",
      language: locale,
      spokenLanguage: "ps",
      slug: `qa-video-${locale}`,
      title: sample,
      description: sample,
      youtubeUrl: "https://www.youtube.com/watch?v=abcdefghijk",
      thumbnail: image.id,
      topic: topic.id,
      status: "published",
      translationStatus: "reviewed",
      publishedAt: "2026-01-01",
      duration: "0:45",
      durationSeconds: 45,
      relatedArticle: article.id,
      transcript: sample,
    },
  });
  await payload.update({
    collection: "articles",
    id: article.id,
    user,
    overrideAccess: false,
    data: { relatedVideo: video.id },
  });
  const article2 = await payload.create({
    collection: "articles",
    user,
    overrideAccess: false,
    data: {
      translationGroup: `qa-secondary-${locale}`,
      language: locale,
      slug: `qa-secondary-${locale}`,
      title: sample,
      summary: sample,
      topic: topic.id,
      status: "published",
      publishedAt: "2025-01-01",
      coverImage: image.id,
    },
  });
  await payload.create({
    collection: "collections",
    locale,
    user,
    overrideAccess: false,
    data: {
      slug: `qa-collection-${locale}`,
      title: sample,
      description: "QA collection",
      status: "published",
      publishedAt: "2026-01-01",
      isSequential: true,
      items: [
        { itemType: "article", article: article.id },
        { itemType: "video", video: video.id },
        { itemType: "article", article: article2.id },
      ],
    },
  } as never);
}
console.log("Isolated QA fixtures created; no production data was changed.");
await payload.destroy();

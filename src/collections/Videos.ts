import { creationHelpField } from "./shared/creation-help";
import { randomUUID } from "node:crypto";
import { archiveBeforeDelete } from "./shared/validation";
import { contentChanged } from "./shared/content-changes";
import { publicContentRead, contentState, contentIdentity } from "./shared/publication";
import type { CollectionConfig } from "payload";
import { sourceFields } from "./shared/sources";

export const Videos: CollectionConfig = {
  slug: "videos",
  versions: { maxPerDoc: 20 },
  admin: {
    preview: (doc, { locale }) =>
      `/${doc.language || locale || "en"}/preview?collection=videos&id=${doc.id}`,
    livePreview: {
      url: ({ data, locale }) =>
        `/${data.language || locale?.code || "en"}/preview?collection=videos&id=${data.id}`,
    },
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "language",
      "spokenLanguage",
      "status",
      "publishedAt",
    ],
  },
  access: {
    read: publicContentRead,
    update: ({ req: { user }, data }) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      if (data?.status === "published" || data?.status === "archived")
        return false;
      return true;
    },
    create: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  hooks: {
    beforeValidate: [contentIdentity],
    beforeChange: [contentState],
    afterChange: [contentChanged],
    beforeDelete: [archiveBeforeDelete],
    afterDelete: [
      () => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:videos");
          invalidateCache("cms:library");
        });
      },
    ],
  },
  fields: [
    creationHelpField(),
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: "Title",
            },
            {
              name: "language",
              type: "select",
              defaultValue: ({ req }) =>
                req.locale === "en" || req.locale === "fa" ? req.locale : "ps",
              required: true,
              options: [
                { label: "Pashto (پښتو)", value: "ps" },
                { label: "Dari (دری)", value: "fa" },
                { label: "English", value: "en" },
              ],
              admin: {
                description:
                  "Page and text language (UI context, title, notes, transcript)",
              },
            },
            {
              name: "spokenLanguage",
              type: "select",
              required: true,
              defaultValue: "ps",
              options: [
                { label: "Pashto (پښتو)", value: "ps" },
                { label: "Dari (دری)", value: "fa" },
                { label: "English", value: "en" },
              ],
              admin: {
                description:
                  "Language of the actual voiceover audio in the video (distinct from page language)",
              },
            },
            {
              name: "slug",
              type: "text",
              index: true,
              label: "Slug",
              admin: {
                description:
                  "Language-specific URL slug (auto-generated from title if left blank)",
                placeholder: "Leave empty to auto-generate from title",
              },
            },
            {
              name: "description",
              type: "textarea",
              label: "Summary / Video Description",
              admin: {
                description:
                  "Overview shown below player and in video cards.",
              },
            },
            {
              name: "transcript",
              type: "textarea",
              label: "Video Transcript (in document language)",
            },
          ],
        },
        {
          label: "Video",
          fields: [
            {
              name: "youtubeUrl",
              type: "text",
              required: true,
              label: "YouTube Embed URL or Shorts URL",
            },
            {
              name: "youtubeAutofill",
              type: "ui",
              admin: {
                components: {
                  Field:
                    "/src/components/admin/YouTubeAutofill#YouTubeAutofill",
                },
              },
            },
            {
              name: "thumbnail",
              type: "upload",
              relationTo: "media",
              label: "Custom Poster (falls back to YouTube poster if empty)",
            },
            {
              name: "duration",
              type: "text",
              label: "Formatted Duration (e.g. 0:48)",
              defaultValue: "0:45",
              admin: {
                description:
                  "Enter duration as mm:ss (e.g. 0:48). Structured data seconds are calculated automatically.",
              },
            },
          ],
        },
        {
          label: "Classification",
          fields: [
            {
              name: "topic",
              label: "Topic",
              type: "relationship",
              relationTo: "topics",
              admin: {
                appearance: "select",
                allowCreate: true,
                description: "Select topic or click + to create a new topic",
              },
            },
            {
              name: "tags",
              type: "array",
              label: "Tags",
              fields: [
                {
                  name: "tag",
                  type: "text",
                  required: true,
                },
              ],
            },
            {
              name: "relatedArticle",
              type: "relationship",
              relationTo: "articles",
              label: "Linked In-Depth Article",
              admin: {
                appearance: "select",
                allowCreate: false,
                description:
                  "Linked in-depth article. Triggers the Go-Deeper card under the player.",
              },
            },
          ],
        },
        {
          label: "Evidence",
          fields: [
            {
              name: "sources",
              type: "array",
              label: "Key Sources & Studies Cited",
              fields: sourceFields,
            },
          ],
        },
        {
          label: "Publishing",
          fields: [
            {
              name: "status",
              type: "select",
              filterOptions: ({ req, options }) =>
                req.user?.role === "admin" ||
                req.context.scheduledPublish ||
                req.context.sourceChangeFlag
                  ? options
                  : options.filter((option) =>
                      ["draft", "in_review"].includes(
                        typeof option === "string" ? option : option.value,
                      ),
                    ),
              defaultValue: "draft",
              required: true,
              options: [
                { label: "Draft", value: "draft" },
                { label: "In Review", value: "in_review" },
                { label: "Scheduled", value: "scheduled" },
                { label: "Published", value: "published" },
                { label: "Archived", value: "archived" },
              ],
            },
            {
              name: "publishedAt",
              type: "date",
              label: "Publication Date (UTC)",
            },
            {
              name: "featuredOrder",
              type: "number",
              label: "Featured / Pin Order (0 for not pinned)",
              defaultValue: 0,
            },
          ],
        },
        {
          label: "Translations",
          fields: [
            {
              name: "editorialTools",
              type: "ui",
              admin: {
                components: {
                  Field: "/src/components/admin/EditorialTools#EditorialTools",
                },
              },
            },
            {
              name: "translationStatus",
              type: "select",
              defaultValue: "none",
              label: "Translation Review Status",
              options: [
                { label: "None (Original Content)", value: "none" },
                {
                  label: "Machine Draft (Requires Review)",
                  value: "machine_draft",
                },
                { label: "Reviewed & Approved", value: "reviewed" },
              ],
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seoTitle",
              type: "text",
              label: "SEO Title (defaults to video title if blank)",
            },
            {
              name: "metaDescription",
              type: "textarea",
              label: "Meta Description (defaults to summary if blank)",
            },
            {
              name: "ogImage",
              type: "upload",
              relationTo: "media",
              label: "Social Share / OpenGraph Image (defaults to video poster)",
            },
          ],
        },
        {
          label: "Advanced",
          fields: [
            {
              name: "durationSeconds",
              type: "number",
              label: "Duration in Seconds (for structured data)",
              defaultValue: 45,
              admin: {
                readOnly: true,
                description: "Auto-calculated from formatted duration",
              },
            },
            {
              name: "remotePosterUrl",
              type: "text",
              admin: {
                readOnly: true,
                description: "Remote YouTube poster thumbnail URL",
              },
            },
            {
              name: "summary",
              type: "textarea",
              admin: {
                readOnly: true,
                description: "Synchronized with description",
              },
            },
            {
              name: "translationGroup",
              type: "text",
              defaultValue: () => randomUUID(),
              required: true,
              index: true,
              admin: {
                readOnly: true,
                description:
                  "Shared unique identifier linking translations of this video page",
              },
            },
            {
              name: "translatedFromLocale",
              type: "select",
              options: ["ps", "fa", "en"],
              admin: { readOnly: true },
            },
            { name: "translatedAt", type: "date", admin: { readOnly: true } },
            { name: "reviewedAt", type: "date", admin: { readOnly: true } },
            {
              name: "reviewedBy",
              type: "relationship",
              relationTo: "users",
              admin: { readOnly: true },
            },
            {
              name: "sourceChanged",
              type: "checkbox",
              defaultValue: false,
              admin: { readOnly: true },
            },
            {
              name: "sourceHashAtTranslation",
              type: "text",
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
  ],
};

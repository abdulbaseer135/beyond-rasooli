import { creationHelpField } from "./shared/creation-help";
import { randomUUID } from "node:crypto";
import { archiveBeforeDelete } from "./shared/validation";
import { contentChanged } from "./shared/content-changes";
import { publicContentRead, contentState, contentIdentity } from "./shared/publication";
import type { CollectionConfig } from "payload";
import { sourceFields } from "./shared/sources";

export const Articles: CollectionConfig = {
  slug: "articles",
  versions: { maxPerDoc: 20 },
  admin: {
    preview: (doc, { locale }) =>
      `/${doc.language || locale || "en"}/preview?collection=articles&id=${doc.id}`,
    livePreview: {
      url: ({ data, locale }) =>
        `/${data.language || locale?.code || "en"}/preview?collection=articles&id=${data.id}`,
    },
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "language",
      "status",
      "translationStatus",
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
          invalidateCache("cms:articles");
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
                description: "Page and text language of this specific document",
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
              name: "summary",
              type: "textarea",
              label: "Standfirst / Summary",
              admin: {
                description:
                  "Appears before body. Italic in English; regular slightly larger in Arabic script.",
              },
            },
            {
              name: "body",
              type: "richText",
              label: "Article Content",
            },
            {
              name: "partsEnabled",
              type: "checkbox",
              label: "Split into numbered parts (Part 1, Part 2, etc.)",
              defaultValue: false,
            },
          ],
        },
        {
          label: "Media",
          fields: [
            {
              name: "coverImage",
              type: "upload",
              relationTo: "media",
              label: "Cover Image",
            },
            {
              name: "coverAlt",
              type: "text",
              label: "Cover Alt Text (document language, falls back to media alt)",
            },
            {
              name: "coverCaption",
              type: "text",
              label: "Cover Image Caption",
            },
          ],
        },
        {
          label: "Classification",
          fields: [
            {
              name: "authorProfile",
              label: "Author",
              type: "relationship",
              relationTo: "authors",
              admin: {
                appearance: "select",
                allowCreate: true,
                description: "Select existing author or click + to create a new author profile",
              },
            },
            {
              name: "topic",
              label: "Topic",
              type: "relationship",
              relationTo: "topics",
              admin: {
                appearance: "select",
                allowCreate: true,
                description: "Select primary editorial topic or click + to create new topic",
              },
            },
            {
              name: "format",
              type: "select",
              defaultValue: "article",
              label: "Editorial Format",
              options: [
                { label: "Article", value: "article" },
                { label: "Explainer", value: "explainer" },
                { label: "Everyday Mystery", value: "mystery" },
              ],
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
              name: "relatedVideo",
              type: "relationship",
              relationTo: "videos",
              label: "Related Companion Video",
              admin: {
                appearance: "select",
                allowCreate: false,
                description:
                  "Companion short video embed at the top of the article",
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
              label: "Sources & Further Reading (Structured References)",
              fields: sourceFields,
            },
            {
              name: "evidenceNote",
              type: "group",
              label: "Evidence Note Box",
              fields: [
                {
                  name: "status",
                  type: "select",
                  options: [
                    { label: "Established Finding", value: "established" },
                    { label: "Emerging Research", value: "emerging" },
                    { label: "Active Scientific Debate", value: "debated" },
                  ],
                },
                {
                  name: "text",
                  type: "text",
                  label: "One-sentence evidence note explanation",
                },
              ],
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
              label: "Featured / Pin Order (0 for standard order)",
              defaultValue: 0,
            },
            {
              name: "showUpdatedDate",
              type: "checkbox",
              label: 'Show "Updated" date near byline for material revisions',
              defaultValue: false,
            },
            {
              name: "correctionNote",
              type: "textarea",
              label: "Editorial correction note (displayed transparently if updated)",
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
                { label: "None (Original Manuscript)", value: "none" },
                {
                  label: "Machine Draft (Requires Review)",
                  value: "machine_draft",
                },
                { label: "Reviewed & Approved", value: "reviewed" },
              ],
              admin: {
                description:
                  "Machine drafts display an automatic notice on the public site and are noindexed until reviewed",
              },
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seoTitle",
              type: "text",
              label: "SEO Title (defaults to article title if blank)",
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
              label: "Social Share / OpenGraph Image (defaults to cover image)",
            },
          ],
        },
        {
          label: "Advanced",
          fields: [
            {
              name: "translationGroup",
              type: "text",
              defaultValue: () => randomUUID(),
              required: true,
              index: true,
              admin: {
                readOnly: true,
                description:
                  "Shared unique identifier linking translations of this article",
              },
            },
            {
              name: "readingTimeMinutes",
              type: "number",
              label: "Reading Time in Minutes",
              admin: {
                readOnly: true,
                description: "Auto-calculated from body prose word count",
              },
            },
            {
              name: "translatedFromLocale",
              type: "select",
              options: [
                { label: "Pashto", value: "ps" },
                { label: "Dari", value: "fa" },
                { label: "English", value: "en" },
              ],
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
              admin: {
                readOnly: true,
                description: "Flagged automatically when source language changes",
              },
            },
            {
              name: "sourceHashAtTranslation",
              type: "text",
              admin: { readOnly: true },
            },
            {
              name: "author",
              type: "relationship",
              maxDepth: 0,
              relationTo: "users",
              admin: { condition: (data) => Boolean(data?.author) },
            },
          ],
        },
      ],
    },
  ],
};

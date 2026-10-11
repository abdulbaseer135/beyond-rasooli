import { editorialContentCreateAccess, editorialContentUpdateAccess } from "./shared/auth-roles";
import { publishControlsField } from "./shared/publish-controls";
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
    update: editorialContentUpdateAccess,
    create: editorialContentCreateAccess,
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  hooks: {
    beforeValidate: [contentIdentity],
    beforeChange: [contentState],
    afterChange: [contentChanged],
    beforeDelete: [archiveBeforeDelete],
    afterDelete: [
      ({ req, id }) => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:articles");
          invalidateCache("cms:library");
        });
        import("@/lib/notifications").then(({ resolveFounderNotifications }) => {
          resolveFounderNotifications({
            payload: req.payload,
            targetCollection: "articles",
            targetId: id,
          }).catch(() => {});
        });
      },
    ],
  },
  fields: [
    publishControlsField(),
    creationHelpField(),
    {
      type: "tabs",
      tabs: [
        {
          label: "Article Content",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: "Article Title",
            },
            {
              name: "slug",
              type: "text",
              index: true,
              label: "URL Slug",
              admin: {
                description:
                  "Language-specific URL slug (auto-generated from title if left blank)",
                placeholder: "Leave empty to auto-generate from title",
              },
            },
            {
              name: "summary",
              type: "textarea",
              label: "Summary / Standfirst",
              defaultValue: "",
              admin: {
                description:
                  "Short description displayed on article cards and article headers",
              },
            },
            {
              name: "body",
              type: "richText",
              label: "Article Body",
            },
            {
              name: "topic",
              label: "Topic",
              type: "relationship",
              relationTo: "topics",
              admin: {
                appearance: "select",
                allowCreate: true,
                description: "Primary editorial topic (required when publishing)",
              },
            },
            {
              name: "coverImage",
              type: "upload",
              relationTo: "media",
              label: "Cover Image",
            },
            {
              name: "coverAlt",
              type: "text",
              label: "Cover Image Alt Text",
            },
            {
              name: "author",
              label: "Author",
              type: "relationship",
              relationTo: "users",
              defaultValue: ({ user }: { user?: { id?: string | number } | null }) =>
                user?.id,
              admin: { condition: () => false },
              access: {
                update: ({ req: { user } }) => user?.role === "admin",
              },
            },
            {
              name: "authorProfile",
              label: "Author Profile",
              type: "relationship",
              relationTo: "authors",
              admin: {
                condition: () => false,
              },
              access: {
                update: ({ req: { user } }) => user?.role === "admin",
              },
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
                  "Optional companion short video embed at the top of the article",
              },
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
              name: "sources",
              type: "array",
              label: "Sources & References",
              fields: sourceFields,
              admin: {
                initCollapsed: true,
                description: "Scientific citations and evidence papers",
              },
            },
            {
              name: "evidenceNote",
              type: "group",
              label: "Evidence Status Note",
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
                  label: "Evidence note summary",
                },
              ],
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
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: "tag",
                  type: "text",
                  required: true,
                },
              ],
            },
            {
              name: "partsEnabled",
              type: "checkbox",
              label: "Split into numbered parts (Part 1, Part 2, etc.)",
              defaultValue: false,
            },
            {
              name: "coverCaption",
              type: "text",
              label: "Cover Image Caption",
              admin: {
                condition: (data) => Boolean(data?.coverImage),
              },
            },
          ],
        },
        {
          label: "Publishing & Approvals",
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
                { label: "In Review (Submit for Approval)", value: "in_review" },
                { label: "Scheduled", value: "scheduled" },
                { label: "Published", value: "published" },
                { label: "Archived", value: "archived" },
              ],
            },
            {
              name: "publishedAt",
              type: "date",
              label: "Publication Date (UTC)",
              admin: {
                condition: (data, siblingData, { user }) => user?.role === "admin",
              },
              access: {
                update: ({ req: { user } }) => user?.role === "admin",
              },
            },
            {
              name: "featuredOrder",
              type: "number",
              label: "Featured / Pin Order (0 for standard)",
              defaultValue: 0,
              admin: {
                condition: (data, siblingData, { user }) => user?.role === "admin",
              },
              access: {
                update: ({ req: { user } }) => user?.role === "admin",
              },
            },
            {
              name: "reviewDecision",
              type: "select",
              defaultValue: "none",
              label: "Founder Review Decision",
              options: [
                { label: "None / Pending", value: "none" },
                { label: "Changes Requested", value: "changes_requested" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ],
              access: {
                update: ({ req: { user } }) => user?.role === "admin",
              },
              admin: {
                condition: (data, siblingData, { user }) => user?.role === "admin",
              },
            },
            {
              name: "reviewNotes",
              type: "textarea",
              label: "Founder Feedback / Revision Notes",
              admin: {
                description: "Feedback visible to the editor if changes are requested or content is rejected",
              },
              access: {
                update: ({ req: { user } }) => user?.role === "admin",
              },
            },
            {
              name: "submittedBy",
              type: "relationship",
              relationTo: "users",
              label: "Submitted By (Editor)",
              admin: {
                condition: () => false,
              },
              access: {
                update: ({ req: { user } }) => user?.role === "admin",
              },
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
            },
            {
              name: "seoTitle",
              type: "text",
              label: "Custom SEO Title (defaults to article title if blank)",
            },
            {
              name: "metaDescription",
              type: "textarea",
              label: "Custom Meta Description (defaults to summary if blank)",
            },
            {
              name: "ogImage",
              type: "upload",
              relationTo: "media",
              label: "Social Share / OpenGraph Image (defaults to cover image)",
            },
            // Technical internal fields (preserved on database model, hidden from routine editing)
            {
              name: "readingTimeMinutes",
              type: "number",
              admin: {
                condition: () => false,
              },
            },
            {
              name: "translationGroup",
              type: "text",
              defaultValue: () => randomUUID(),
              required: true,
              index: true,
              admin: {
                condition: () => false,
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
              admin: { condition: () => false },
            },
            { name: "translatedAt", type: "date", admin: { condition: () => false } },
            { name: "reviewedAt", type: "date", admin: { condition: () => false } },
            {
              name: "reviewedBy",
              type: "relationship",
              relationTo: "users",
              admin: { condition: () => false },
            },
            {
              name: "sourceChanged",
              type: "checkbox",
              defaultValue: false,
              admin: { condition: () => false },
            },
            {
              name: "sourceHashAtTranslation",
              type: "text",
              admin: { condition: () => false },
            },
          ],
        },
      ],
    },
  ],
};

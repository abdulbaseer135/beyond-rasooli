import { publishControlsField } from "./shared/publish-controls";
import { creationHelpField } from "./shared/creation-help";
import { randomUUID } from "node:crypto";
import { archiveBeforeDelete } from "./shared/validation";
import { contentChanged } from "./shared/content-changes";
import { publicContentRead, contentState, contentIdentity } from "./shared/publication";
import type { CollectionConfig } from "payload";
import { sourceFields } from "./shared/sources";
import { editorialContentCreateAccess, editorialContentUpdateAccess } from "./shared/auth-roles";

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
          invalidateCache("cms:videos");
          invalidateCache("cms:library");
        });
        import("@/lib/notifications").then(({ resolveFounderNotifications }) => {
          resolveFounderNotifications({
            payload: req.payload,
            targetCollection: "videos",
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
          label: "Video Details",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: "Video Title",
              admin: {
                description: "Title of the video explainer",
              },
            },
            {
              name: "youtubeUrl",
              type: "text",
              required: true,
              label: "YouTube Video URL",
              admin: {
                description: "Standard YouTube link or Shorts URL (e.g. https://youtu.be/... or https://youtube.com/shorts/...)",
              },
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
              name: "description",
              type: "textarea",
              label: "Description / Summary",
              admin: {
                description:
                  "Concise overview shown below the video player and on cards. Also used as video summary.",
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
                description: "Primary editorial topic",
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
                description:
                  "Page context language (title, transcript, localized notes)",
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
                  "Actual spoken audio language of the video voiceover (may differ from page language)",
              },
            },
            {
              name: "thumbnail",
              type: "upload",
              relationTo: "media",
              label: "Thumbnail / Poster",
              admin: {
                description: "Custom poster image. If left blank, YouTube thumbnail is used automatically.",
              },
            },
            {
              name: "duration",
              type: "text",
              label: "Duration",
              defaultValue: "0:45",
              admin: {
                description:
                  "Formatted duration mm:ss (e.g. 0:48). Total seconds are calculated automatically.",
              },
            },
            {
              name: "relatedArticle",
              type: "relationship",
              relationTo: "articles",
              label: "Related Article (Go Deeper)",
              admin: {
                appearance: "select",
                allowCreate: false,
                description:
                  "Optional companion long-form article. Powers the Go Deeper bridge under the video player.",
              },
            },
            {
              name: "author",
              label: "Author",
              type: "relationship",
              relationTo: "users",
              admin: { readOnly: true },
              access: { update: ({ req: { user } }) => user?.role === "admin" },
            },
            {
              name: "authorProfile",
              label: "Author Profile",
              type: "relationship",
              relationTo: "authors",
              admin: { condition: () => false },
              access: { update: ({ req: { user } }) => user?.role === "admin" },
            },
            {
              name: "slug",
              type: "text",
              index: true,
              label: "URL Slug",
              admin: {
                description:
                  "Auto-generated from title if left blank",
                placeholder: "Leave empty to auto-generate from title",
              },
            },
            {
              name: "sources",
              type: "array",
              label: "Cited Sources & Studies",
              fields: sourceFields,
              admin: {
                initCollapsed: true,
                description: "Optional research studies and citations",
              },
            },
            {
              name: "transcript",
              type: "textarea",
              label: "Video Transcript",
              admin: {
                description: "Full transcript in page language for accessibility and search",
              },
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
                readOnly: true,
                description: "Editor who submitted this content for approval",
              },
              access: {
                update: ({ req: { user } }) => user?.role === "admin",
              },
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
                { label: "None (Original Content)", value: "none" },
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
              label: "Custom SEO Title (defaults to video title if blank)",
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
              label: "Social Share / OpenGraph Image (defaults to video poster)",
            },
            // Technical internal fields (preserved on database model, hidden from routine editing)
            {
              name: "durationSeconds",
              type: "number",
              defaultValue: 45,
              admin: {
                condition: () => false,
              },
            },
            {
              name: "remotePosterUrl",
              type: "text",
              admin: {
                condition: () => false,
              },
            },
            {
              name: "summary",
              type: "textarea",
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
              options: ["ps", "fa", "en"],
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

import { creationHelpField } from "./shared/creation-help";
import { contentState } from "./shared/publication";
import { archiveBeforeDelete, invalid } from "./shared/validation";
import type { CollectionConfig, AccessResult } from "payload";

export const Pages: CollectionConfig = {
  slug: "pages",
  versions: { maxPerDoc: 20 },
  admin: {
    preview: (doc, { locale }) =>
      `/${doc.language || locale || "en"}/preview?collection=pages&id=${doc.id}`,
    livePreview: {
      url: ({ data, locale }) =>
        `/${data.language || locale?.code || "en"}/preview?collection=pages&id=${data.id}`,
    },
    useAsTitle: "title",
    group: "Website Management",
    hidden: ({ user }) => user?.role !== "admin",
    defaultColumns: [
      "title",
      "slug",
      "approvalStatus",
      "status",
      "lastUpdated",
    ],
  },
  access: {
    read: ({ req }) =>
      req.user
        ? true
        : ({
            and: [
              { status: { equals: "published" } },
              {
                or: [
                  { publishedAt: { less_than_equal: new Date().toISOString() } },
                  { publishedAt: { exists: false } },
                ],
              },
              {
                or: [
                  { slug: { equals: "about" } },
                  { approvalStatus: { equals: "approved" } },
                ],
              },
            ],
          } as AccessResult),
    update: ({ req: { user } }) => user?.role === "admin",
    create: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  hooks: {
    beforeDelete: [archiveBeforeDelete],
    afterDelete: [
      () => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:pages");
        });
      },
    ],
    afterChange: [
      () => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:pages");
        });
      },
    ],
    beforeChange: [
      contentState,
      async ({ data, originalDoc, req }) => {
        const user = req.user;
        const next = { ...originalDoc, ...data };
        if (
          originalDoc?.status === "published" &&
          user?.role !== "admin" &&
          !req.context.scheduledPublish
        )
          await invalid(req, "status", "admin_required");
        if (next.slug === "privacy" || next.slug === "terms") {
          if (
            user?.role !== "admin" &&
            data.approvalStatus !== undefined &&
            data.approvalStatus !== (originalDoc?.approvalStatus ?? "draft")
          )
            await invalid(req, "approvalStatus", "admin_required");
          if (
            originalDoc?.approvalStatus === "approved" &&
            ["body", "title", "version"].some(
              (field) =>
                data[field] !== undefined &&
                JSON.stringify(data[field]) !==
                  JSON.stringify(originalDoc[field]),
            )
          ) {
            data.approvalStatus = "awaiting_founder_approval";
            data.status = "draft";
          }
          const approval = data.approvalStatus ?? originalDoc?.approvalStatus;
          if (data.approvalStatus === "approved" && user?.role !== "admin")
            await invalid(req, "approvalStatus", "admin_required");
          if (
            (data.status ?? originalDoc?.status) === "published" &&
            approval !== "approved"
          )
            await invalid(req, "approvalStatus", "legal_required");
        }
        if (
          data.status !== undefined &&
          !["draft", "in_review"].includes(data.status) &&
          user?.role !== "admin" &&
          !req.context.scheduledPublish
        )
          await invalid(req, "status", "admin_required");
        return data;
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
              localized: true,
              label: "Page Title",
            },
            {
              name: "slug",
              type: "select",
              required: true,
              unique: true,
              label: "Page Identifier",
              options: [
                { label: "About Beyond Rasooli", value: "about" },
                { label: "Privacy Policy", value: "privacy" },
                { label: "Terms & Conditions", value: "terms" },
              ],
            },
            {
              name: "body",
              type: "richText",
              localized: true,
              required: true,
              label: "Page Content",
            },
          ],
        },
        {
          label: "Publishing",
          fields: [
            {
              name: "status",
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
              localized: true,
              type: "select",
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
              localized: true,
              label: "Publication Date",
            },
          ],
        },
        {
          label: "Legal Governance",
          fields: [
            {
              name: "approvalStatus",
              localized: true,
              type: "select",
              required: true,
              defaultValue: "draft",
              label: "Legal Approval Status",
              options: [
                { label: "Draft (Scaffold / Unreviewed)", value: "draft" },
                {
                  label: "Awaiting Founder Approval",
                  value: "awaiting_founder_approval",
                },
                { label: "Approved by Founder", value: "approved" },
              ],
              admin: {
                description:
                  "PRD Hard Gate: Legal pages cannot be published until Approved by Founder.",
                condition: (data) =>
                  data?.slug === "privacy" || data?.slug === "terms",
              },
            },
            {
              name: "version",
              type: "text",
              label: "Policy Version (e.g. 1.0)",
              defaultValue: "1.0",
              admin: {
                condition: (data) =>
                  data?.slug === "privacy" || data?.slug === "terms",
              },
            },
            {
              name: "lastUpdated",
              type: "date",
              label: "Visible Last Updated Date",
              admin: {
                condition: (data) =>
                  data?.slug === "privacy" || data?.slug === "terms",
              },
            },
          ],
        },
      ],
    },
  ],
};

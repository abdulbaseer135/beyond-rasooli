import { creationHelpField } from "./shared/creation-help";
import { archiveBeforeDelete } from "./shared/validation";
import { contentState } from "./shared/publication";
import { slugify } from "./shared/slug";
import type { CollectionConfig, AccessResult } from "payload";

export const Collections: CollectionConfig = {
  slug: "collections",
  versions: { maxPerDoc: 20 },
  admin: {
    preview: (doc, { locale }) =>
      `/${doc.language || locale || "en"}/preview?collection=collections&id=${doc.id}`,
    livePreview: {
      url: ({ data, locale }) =>
        `/${data.language || locale || "en"}/preview?collection=collections&id=${data.id}`,
    },
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "isSequential", "status"],
  },
  access: {
    read: ({ req }): AccessResult =>
      req.user
        ? true
        : {
            and: [
              { status: { equals: "published" } },
              {
                or: [
                  {
                    publishedAt: { less_than_equal: new Date().toISOString() },
                  },
                  { publishedAt: { exists: false } },
                ],
              },
            ],
          },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === "admin",
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && (!data.slug || !String(data.slug).trim()) && data.title) {
          data.slug = slugify(String(data.title));
        }
        return data;
      },
    ],
    beforeChange: [contentState],
    beforeDelete: [archiveBeforeDelete],
    afterChange: [
      () => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:collections");
          invalidateCache("cms:library");
        });
      },
    ],
    afterDelete: [
      () => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:collections");
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
              localized: true,
              label: "Collection Title",
            },
            {
              name: "slug",
              type: "text",
              unique: true,
              index: true,
              label: "Slug",
              admin: {
                description: "URL slug (auto-generated from title if left blank)",
                placeholder: "Leave empty to auto-generate from title",
              },
            },
            {
              name: "description",
              type: "textarea",
              localized: true,
              label: "Collection Description",
            },
            {
              name: "coverImage",
              type: "upload",
              relationTo: "media",
              label: "Cover Image",
            },
            {
              name: "isSequential",
              type: "checkbox",
              label:
                "Sequential Learning Guide (shows numbered steps, e.g. Start Here)",
              defaultValue: false,
            },
            {
              name: "items",
              type: "array",
              label: "Curated Items in Collection",
              admin: {
                description:
                  "Drag items to reorder. Collections are displayed on the public site once they contain at least 3 published items.",
              },
              fields: [
                {
                  name: "itemType",
                  type: "select",
                  required: true,
                  label: "Content Type",
                  options: [
                    { label: "Video", value: "video" },
                    { label: "Article", value: "article" },
                  ],
                },
                {
                  name: "video",
                  type: "relationship",
                  relationTo: "videos",
                  label: "Choose Video",
                  admin: {
                    appearance: "select",
                    allowCreate: false,
                    condition: (data, siblingData) => siblingData?.itemType === "video",
                  },
                },
                {
                  name: "article",
                  type: "relationship",
                  relationTo: "articles",
                  label: "Choose Article",
                  admin: {
                    appearance: "select",
                    allowCreate: false,
                    condition: (data, siblingData) =>
                      siblingData?.itemType === "article",
                  },
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
              label: "Publication Date (UTC)",
            },
          ],
        },
      ],
    },
  ],
};

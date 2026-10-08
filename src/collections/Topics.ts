import { creationHelpField } from "./shared/creation-help";
import { slugify } from "./shared/slug";
import type { CollectionConfig } from "payload";

export const Topics: CollectionConfig = {
  slug: "topics",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === "admin",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "order"],
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && (!data.slug || !String(data.slug).trim()) && data.name) {
          data.slug = slugify(String(data.name));
        }
        return data;
      },
    ],
    afterChange: [
      () => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:topics");
          invalidateCache("cms:library");
        });
      },
    ],
    afterDelete: [
      () => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:topics");
          invalidateCache("cms:library");
        });
      },
    ],
  },
  fields: [
    creationHelpField(),
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      label: "Topic Name",
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      label: "Slug",
      admin: {
        description: "URL slug (auto-generated from topic name if left blank)",
        placeholder: "Leave empty to auto-generate",
      },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: "Topic Description",
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Cover Image",
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: "Display Order",
      admin: {
        description: "Display order on homepage and topic navigation (lower numbers appear first)",
      },
    },
  ],
};

import type { CollectionConfig } from "payload";

export const SlugRedirects: CollectionConfig = {
  slug: "slug-redirects",
  admin: {
    useAsTitle: "sourceSlug",
    group: "Settings",
    defaultColumns: ["sourceSlug", "destinationSlug", "kind", "language"],
  },
  access: {
    read: () => true,
    create: () => false,
    update: () => false,
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "sourceKey",
      type: "text",
      required: true,
      unique: true,
      label: "Redirect Key Identifier",
      admin: { readOnly: true },
    },
    {
      name: "sourceSlug",
      type: "text",
      required: true,
      label: "Old Slug (Source)",
      admin: { readOnly: true },
    },
    {
      name: "destinationSlug",
      type: "text",
      required: true,
      label: "New Slug (Destination)",
      admin: { readOnly: true },
    },
    {
      name: "kind",
      type: "select",
      options: ["articles", "videos"],
      required: true,
      label: "Content Type",
      admin: { readOnly: true },
    },
    {
      name: "language",
      type: "select",
      options: ["ps", "fa", "en"],
      required: true,
      label: "Language",
      admin: { readOnly: true },
    },
  ],
};

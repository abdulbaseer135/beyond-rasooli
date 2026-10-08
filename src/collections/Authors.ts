import { creationHelpField } from "./shared/creation-help";
import type { CollectionConfig } from "payload";

export const Authors: CollectionConfig = {
  slug: "authors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "updatedAt"],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    creationHelpField(),
    {
      name: "name",
      type: "text",
      required: true,
      label: "Author Name",
    },
    {
      name: "bio",
      type: "textarea",
      localized: true,
      label: "Short Biography",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Author Photo / Avatar",
    },
    {
      name: "socialLinks",
      type: "group",
      label: "Social Profiles & Links",
      admin: {
        description: "Optional links to public social profiles",
      },
      fields: [
        { name: "youtube", type: "text", label: "YouTube Channel" },
        { name: "instagram", type: "text", label: "Instagram Profile" },
        { name: "facebook", type: "text", label: "Facebook Page" },
        { name: "x", type: "text", label: "X (Twitter) Profile" },
        { name: "tiktok", type: "text", label: "TikTok Profile" },
      ],
    },
  ],
};

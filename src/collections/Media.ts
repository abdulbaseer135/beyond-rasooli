import { invalid } from "./shared/validation";
import { extractYouTubeId } from "@/lib/youtube";
import { creationHelpField } from "./shared/creation-help";
import { canAccessEditorial } from "./shared/auth-roles";
import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: ({ req: { user } }) => canAccessEditorial(user),
    update: ({ req: { user } }) => canAccessEditorial(user),
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  hooks: { beforeOperation: [async ({ args, operation, req }) => {
    if (req.user && (operation === "create" || operation === "update")) {
      const data = "data" in args ? args.data : undefined;
      const url = typeof req.data?.url === "string" ? req.data.url : data && "url" in data && typeof data.url === "string" ? data.url : "";
      if (extractYouTubeId(url) || (req.file && !["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(req.file.mimetype))) await invalid(req, "file", "media_image_required");
    }
    return args;
  }] },
  upload: {
    staticDir: process.env.BEYOND_QA === "true" ? ".qa/media" : "public/media",
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
    formatOptions: { format: "webp", options: { quality: 85 } },
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 512,
        position: "centre",
      },
      {
        name: "hero",
        width: 1200,
        height: 675,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
  },
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["filename", "alt", "credit", "license"],
  },
  fields: [creationHelpField(),
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Descriptive Alt Text (Required for Accessibility)",
    },
    {
      name: "caption",
      type: "text",
      label: "Visible Caption",
    },
    {
      name: "credit",
      type: "text",
      label: "Credit / Original Source",
    },
    {
      name: "license",
      type: "text",
      label: "Licence / Usage Rights Note",
    },
    {
      name: "expiryDate",
      type: "date",
      label: "Licence Expiry Date (if applicable)",
    },
  ],
};




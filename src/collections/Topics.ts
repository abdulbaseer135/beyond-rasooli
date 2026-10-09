import { creationHelpField } from "./shared/creation-help";
import { slugify } from "./shared/slug";
import { canAccessEditorial } from "./shared/auth-roles";
import type { CollectionConfig } from "payload";

export const Topics: CollectionConfig = {
  slug: "topics",
  access: {
    read: ({ req }) =>
      req.user ? true : { status: { equals: "published" } },
    create: ({ req: { user } }) => canAccessEditorial(user),
    update: ({ req: { user } }) => canAccessEditorial(user),
    delete: ({ req }) => req.user?.role === "admin",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "status"],
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (data && (!data.slug || !String(data.slug).trim()) && data.name) {
          data.slug = slugify(String(data.name));
        }
        // Editors proposing a new topic cannot publish it directly
        if (req.user?.role !== "admin" && data) {
          data.status = "pending";
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
      ({ req, id }) => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:topics");
          invalidateCache("cms:library");
        });
        import("@/lib/notifications").then(({ resolveFounderNotifications }) => {
          resolveFounderNotifications({
            payload: req.payload,
            targetCollection: "topics" as any,
            targetId: id,
          }).catch(() => {});
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
      name: "status",
      type: "select",
      required: true,
      defaultValue: "published",
      admin: {
        position: "sidebar",
        description: "Topic publication status (editor proposals require founder approval)",
      },
      options: [
        { label: "Published (Public)", value: "published" },
        { label: "Pending Founder Approval", value: "pending" },
        { label: "Draft", value: "draft" },
      ],
      access: {
        update: ({ req: { user } }) => user?.role === "admin",
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
        condition: (data, siblingData, { user }) => user?.role === "admin",
        description: "Display order on homepage and topic navigation (lower numbers appear first)",
      },
    },
  ],
};

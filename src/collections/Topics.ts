import { topicState, topicChanged } from "./shared/topic-workflow";
import { publishControlsField } from "./shared/publish-controls";
import { creationHelpField } from "./shared/creation-help";
import { canAccessEditorial } from "./shared/auth-roles";
import type { AccessResult, CollectionConfig } from "payload";

export const Topics: CollectionConfig = {
  slug: "topics",
  access: {
    read: ({ req }): AccessResult =>
      req.user?.role === "admin" ? true : canAccessEditorial(req.user) ? { or: [{ status: { equals: "published" } }, { submittedBy: { equals: req.user?.id } }] } : { status: { equals: "published" } },
    create: ({ req: { user } }) => canAccessEditorial(user),
    update: ({ req: { user }, data }): AccessResult => user?.role === "admin" ? true : canAccessEditorial(user) && !["published", "scheduled", "archived"].includes(data?.status) ? { and: [{ submittedBy: { equals: user?.id } }, { status: { equals: "draft" } }] } : false,
    delete: ({ req }) => req.user?.role === "admin",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "status"],
  },
  hooks: {
    beforeValidate: [topicState],
    afterChange: [topicChanged],
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
    publishControlsField(),
    { name: "submittedBy", type: "relationship", relationTo: "users", index: true, admin: { readOnly: true } },
    { name: "reviewDecision", type: "select", defaultValue: "none", options: ["none", "approved", "changes_requested", "rejected"], admin: { readOnly: true } },
    { name: "reviewNotes", type: "textarea", admin: { readOnly: true } },
    { name: "reviewedBy", type: "relationship", relationTo: "users", admin: { readOnly: true } },
    { name: "reviewedAt", type: "date", admin: { readOnly: true } },
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
      defaultValue: ({ user }) => user?.role === "admin" ? "published" : "draft",
      admin: {
        position: "sidebar",
        description: "Topic publication status (editor proposals require founder approval)",
      },
      options: [
        { label: "Published (Public)", value: "published" },
        { label: "Pending Founder Approval", value: "pending" },
        { label: "Draft", value: "draft" },
      ],

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

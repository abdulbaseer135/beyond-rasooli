import type { CollectionConfig } from "payload";

export const Contacts: CollectionConfig = {
  slug: "contacts",
  admin: {
    useAsTitle: "name",
    group: "Website Management",
    hidden: ({ user }) => user?.role !== "admin",
    defaultColumns: ["name", "email", "reason", "createdAt"],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => user?.role === "admin", // Public submissions go through the validated server endpoint
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Sender Name",
    },
    {
      name: "email",
      type: "email",
      required: true,
      label: "Email Address",
    },
    {
      name: "reason",
      type: "select",
      required: true,
      label: "Inquiry Type",
      options: [
        { label: "Research / Collaboration", value: "collaboration" },
        { label: "Speaking / Discussion", value: "speaking" },
        { label: "Media Inquiry", value: "media" },
        { label: "Editorial Correction / Source Note", value: "correction" },
        { label: "General Message", value: "general" },
      ],
    },
    {
      name: "message",
      type: "textarea",
      required: true,
      label: "Message Content",
    },
    {
      type: "collapsible",
      label: "Technical Submission Details",
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: "locale",
          type: "text",
          label: "Submitter Language / Locale",
          admin: { readOnly: true },
        },
        {
          name: "turnstileVerified",
          type: "checkbox",
          defaultValue: false,
          label: "Cloudflare Turnstile Verified",
          admin: { readOnly: true },
        },
        {
          name: "deliveredViaEmail",
          type: "checkbox",
          defaultValue: false,
          label: "Delivered to Editorial Inbox",
          admin: { readOnly: true },
        },
        {
          name: "ipAddress",
          type: "text",
          label: "IP Address",
          admin: { readOnly: true },
        },
      ],
    },
  ],
};

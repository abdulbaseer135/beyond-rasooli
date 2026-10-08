import { creationHelpField } from "./shared/creation-help";
import type { CollectionConfig } from "payload";
import { invalid } from "./shared/validation";

export const Users: CollectionConfig = {
  slug: "users",
  auth: { maxLoginAttempts: 5, lockTime: 600000, tokenExpiration: 7200, forgotPassword: { expiration: 1800000, minRequestInterval: 60000, generateEmailSubject: async ({req} = {}) => { const messages = await import("@/lib/ui-strings");return (await messages.getMergedMessages(req?.locale === "fa" || req?.locale === "ps" ? req.locale : "en")).ui.reset_subject; }, generateEmailHTML: async ({token,req} = {}) => { const {getMergedMessages} = await import("@/lib/ui-strings");const t=await getMergedMessages(req?.locale === "fa" || req?.locale === "ps" ? req.locale : "en");const origin=process.env.BEYOND_QA === "true" ? "http://localhost:3100" : new URL(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").origin;return `<a href="${origin}/admin/reset/${encodeURIComponent(token || "")}">${t.ui.reset_link.replace(/[<>&"\']/g, "")}</a>`; } }, cookies: { sameSite: "Lax", secure: process.env.NODE_ENV === "production" && process.env.BEYOND_QA !== "true" } },
  hooks: {
    beforeValidate: [async ({ data, operation, req }) => {
      if (!data) return data;
      if (data.password !== undefined && (typeof data.password !== "string" || [...data.password].length < 12 || !/\p{L}/u.test(data.password) || !/\p{N}/u.test(data.password))) await invalid(req, "password", "password_rule");
      if (data["confirm-password"] !== undefined && data["confirm-password"] !== data.password) await invalid(req, "confirm-password", "password_mismatch");
      if (operation === "create") {
        const users = await req.payload.count({ collection: "users", req, overrideAccess: true });
        if (users.totalDocs === 0) data.role = "admin";
      }
      return data;
    }],
    beforeChange: [async ({ data, originalDoc, req }) => {
      if (originalDoc?.role === "admin" && data.role && data.role !== "admin") {
        const admins = await req.payload.count({ collection: "users", req, overrideAccess: true, where: { role: { equals: "admin" } } });
        if (admins.totalDocs <= 1) await invalid(req, "role", "last_admin");
      }
      return data;
    }],
    beforeDelete: [async ({ req, id }) => {
      const user = await req.payload.findByID({ collection: "users", req, id, overrideAccess: true });
      if (user.role === "admin" && (await req.payload.count({ collection: "users", req, overrideAccess: true, where: { role: { equals: "admin" } } })).totalDocs <= 1) await invalid(req, "role", "last_admin");
    }],
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
  },
  access: {
    read: ({ req: { user } }) => user?.role === "admin" ? true : user ? { id: { equals: user.id } } : false,
    create: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) =>
      user?.role === "admin"
        ? true
        : user
          ? { id: { equals: user.id } }
          : false,
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    creationHelpField(),
    {
      name: "name",
      type: "text",
      required: true,
      label: "Full Name",
    },
    {
      name: "bio",
      type: "textarea",
      label: "User Biography",
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: ({ user }: { user?: { id?: string | number } | null }) => (user ? "editor" : "admin"),
      admin: { position: "sidebar", components: { Field: "/src/components/admin/FounderRole#FounderRole" } },
      options: [
        { label: "Admin (Founder)", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      access: {
        update: ({ req: { user } }) => user?.role === "admin",
      },
    },
    {
      name: "socialLinks",
      type: "group",
      label: "Social Profiles",
      admin: {
        description: "Optional author social profiles",
      },
      fields: ["youtube", "instagram", "facebook", "x"].map((name) => ({
        name,
        type: "text" as const,
      })),
    },
  ],
};


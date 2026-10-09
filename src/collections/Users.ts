import { creationHelpField } from "./shared/creation-help";
import type { CollectionConfig } from "payload";
import { invalid } from "./shared/validation";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    maxLoginAttempts: 5,
    lockTime: 600000,
    tokenExpiration: 7200,
    forgotPassword: {
      expiration: 1800000,
      minRequestInterval: 60000,
      generateEmailSubject: async ({ req } = {}) => {
        const messages = await import("@/lib/ui-strings");
        return (
          await messages.getMergedMessages(
            req?.locale === "fa" || req?.locale === "ps" ? req.locale : "en",
          )
        ).ui.reset_subject;
      },
      generateEmailHTML: async ({ token, req } = {}) => {
        const { getMergedMessages } = await import("@/lib/ui-strings");
        const t = await getMergedMessages(
          req?.locale === "fa" || req?.locale === "ps" ? req.locale : "en",
        );
        const origin =
          process.env.BEYOND_QA === "true"
            ? "http://localhost:3100"
            : new URL(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000")
                .origin;
        return `<a href="${origin}/admin/reset/${encodeURIComponent(token || "")}">${t.ui.reset_link.replace(/[<>&"']/g, "")}</a>`;
      },
    },
    cookies: {
      sameSite: "Lax",
      secure:
        process.env.NODE_ENV === "production" &&
        process.env.BEYOND_QA !== "true",
    },
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (!data) return data;
        if (
          data.password !== undefined &&
          (typeof data.password !== "string" ||
            [...data.password].length < 12 ||
            !/\p{L}/u.test(data.password) ||
            !/\p{N}/u.test(data.password))
        )
          await invalid(req, "password", "password_rule");
        if (
          data["confirm-password"] !== undefined &&
          data["confirm-password"] !== data.password
        )
          await invalid(req, "confirm-password", "password_mismatch");
        if (operation === "create") {
          const users = await req.payload.count({
            collection: "users",
            req,
            overrideAccess: true,
          });
          if (users.totalDocs === 0 && !req.context?.publicEditorRegistration) {
            data.role = "admin";
            data.status = "approved";
          } else if (req.user?.role !== "admin") {
            data.role = "editor";
            data.status = "pending";
            if (!data.appliedAt) data.appliedAt = new Date().toISOString();
          }
        }
        if (data.status === "pending" && !data.appliedAt) {
          data.appliedAt = new Date().toISOString();
        }
        return data;
      },
    ],
    beforeLogin: [
      async ({ user }) => {
        if (user.role === "admin") return user;
        const status = (user as unknown as { status?: string }).status;
        if (status === "pending") {
          throw new Error(
            "Your editor application is pending approval by the founder.",
          );
        }
        if (status === "suspended") {
          throw new Error(
            "Your editor account has been suspended by the founder.",
          );
        }
        if (status === "rejected") {
          throw new Error(
            "Your editor application was not approved by the founder.",
          );
        }
        return user;
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        if (req.user?.role !== "admin") {
          if (originalDoc) {
            data.role = originalDoc.role;
            data.status = originalDoc.status;
            data.rejectionReason = originalDoc.rejectionReason;
            data.appliedAt = originalDoc.appliedAt;
            data.authorProfile = originalDoc.authorProfile;
          }
        }
        if (
          originalDoc?.role === "admin" &&
          data.role &&
          data.role !== "admin"
        ) {
          const admins = await req.payload.count({
            collection: "users",
            req,
            overrideAccess: true,
            where: { role: { equals: "admin" } },
          });
          if (admins.totalDocs <= 1) await invalid(req, "role", "last_admin");
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // Automatically sync or create public Author profile for founder and approved editors
        if (doc.role === "admin" || doc.status === "approved") {
          try {
            let authorId = doc.authorProfile;
            if (typeof authorId === "object" && authorId) {
              authorId = authorId.id;
            }

            const authorData = {
              name: doc.name,
              bio: doc.bio || "",
              image: doc.photo || undefined,
              socialLinks: doc.socialLinks || {},
            };

            if (authorId) {
              await req.payload.update({
                collection: "authors",
                id: authorId,
                req,
                overrideAccess: true,
                data: authorData,
              });
            } else {
              // Check if matching author already exists
              const existing = await req.payload.find({
                collection: "authors",
                req,
                overrideAccess: true,
                limit: 1,
                where: { name: { equals: doc.name } },
              });

              let createdId: number | string;
              if (existing.docs.length > 0) {
                createdId = existing.docs[0].id;
                await req.payload.update({
                  collection: "authors",
                  id: createdId,
                  req,
                  overrideAccess: true,
                  data: authorData,
                });
              } else {
                const created = await req.payload.create({
                  collection: "authors",
                  req,
                  overrideAccess: true,
                  data: authorData,
                });
                createdId = created.id;
              }

              // Save link back to user without re-triggering recursive sync
              await req.payload.update({
                collection: "users",
                id: doc.id,
                req,
                overrideAccess: true,
                data: { authorProfile: createdId },
              });
            }
          } catch (err) {
            console.error("Error syncing author profile:", err);
          }
        }

        // Founder notification for new editor applications
        if (doc.role === "editor" && doc.status === "pending") {
          try {
            const { createFounderNotification } = await import(
              "@/lib/notifications"
            );
            await createFounderNotification({
              payload: req.payload,
              type: "editor_registration",
              title: "New Editor Registration",
              message: `${doc.name} has requested to join Beyond Rasooli as an editor.`,
              actorId: doc.id,
              targetCollection: "users",
              targetId: doc.id,
              deduplicationKey: `editor_registration:${doc.id}`,
              link: "/admin/editor-requests",
            });
          } catch (err) {
            console.error("Error creating editor registration notification:", err);
          }
        }

        // Resolve notification when editor status is decided
        if (
          (doc.status === "approved" || doc.status === "rejected") &&
          previousDoc?.status === "pending"
        ) {
          try {
            const { resolveFounderNotifications } = await import(
              "@/lib/notifications"
            );
            await resolveFounderNotifications({
              payload: req.payload,
              targetCollection: "users",
              targetId: doc.id,
            });
          } catch (err) {
            console.error("Error resolving editor registration notification:", err);
          }
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const user = await req.payload.findByID({
          collection: "users",
          req,
          id,
          overrideAccess: true,
        });
        if (
          user.role === "admin" &&
          (
            await req.payload.count({
              collection: "users",
              req,
              overrideAccess: true,
              where: { role: { equals: "admin" } },
            })
          ).totalDocs <= 1
        )
          await invalid(req, "role", "last_admin");
      },
    ],
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role", "status"],
    hidden: true, // Hidden from routine collection sidebar; managed via dedicated Editor dashboard views
  },
  access: {
    read: ({ req: { user } }) =>
      user?.role === "admin"
        ? true
        : user
          ? { id: { equals: user.id } }
          : false,
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
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Profile Photo",
      admin: {
        description: "Author avatar for public article and video bylines",
      },
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: ({
        user,
      }: {
        user?: { id?: string | number } | null;
      }) => (user ? "editor" : "admin"),
      admin: {
        position: "sidebar",
        components: { Field: "/src/components/admin/FounderRole#FounderRole" },
      },
      options: [
        { label: "Admin (Founder)", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      access: {
        update: ({ req: { user } }) => user?.role === "admin",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      admin: {
        position: "sidebar",
        description: "Founder review and activation status",
      },
      options: [
        { label: "Approved (Active)", value: "approved" },
        { label: "Pending Approval", value: "pending" },
        { label: "Rejected", value: "rejected" },
        { label: "Suspended", value: "suspended" },
      ],
      access: {
        update: ({ req: { user } }) => user?.role === "admin",
      },
    },
    {
      name: "reasonForJoining",
      type: "textarea",
      label: "Reason for Joining / Editorial Background",
      admin: {
        description: "Submitted by the applicant during editor registration",
      },
    },
    {
      name: "rejectionReason",
      type: "textarea",
      label: "Internal Founder Rejection / Review Notes",
      admin: {
        description: "Visible to founder when an application is rejected",
      },
      access: {
        read: ({ req: { user } }) => user?.role === "admin",
        update: ({ req: { user } }) => user?.role === "admin",
      },
    },
    {
      name: "appliedAt",
      type: "date",
      label: "Application Date",
      admin: {
        readOnly: true,
      },
      access: {
        update: ({ req: { user } }) => user?.role === "admin",
      },
    },
    {
      name: "authorProfile",
      type: "relationship",
      relationTo: "authors",
      label: "Linked Public Author Profile",
      admin: {
        readOnly: true,
        description: "Automatically synchronized public author profile",
      },
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
      fields: ["youtube", "instagram", "facebook", "x", "tiktok"].map(
        (name) => ({
          name,
          type: "text" as const,
        }),
      ),
    },
  ],
};


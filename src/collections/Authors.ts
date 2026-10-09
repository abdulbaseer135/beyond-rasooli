import { creationHelpField } from "./shared/creation-help";
import { isAdmin, isApprovedEditor } from "./shared/auth-roles";
import type { CollectionConfig } from "payload";

export const Authors: CollectionConfig = {
  slug: "authors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "updatedAt"],
    hidden: true, // Automatically managed and synchronized from user accounts
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => isAdmin(user),
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (isAdmin(user)) return true;
      if (isApprovedEditor(user)) {
        const u = user as { authorProfile?: unknown };
        const profileId = typeof u.authorProfile === "object" && u.authorProfile ? (u.authorProfile as { id: unknown }).id : u.authorProfile;
        return profileId ? { id: { equals: profileId } } : false;
      }
      return false;
    },
    delete: ({ req: { user } }) => isAdmin(user),
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

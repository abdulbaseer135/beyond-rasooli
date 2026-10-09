import { creationHelpField } from "./shared/creation-help";
import { canAccessEditorial } from "./shared/auth-roles";
import type { CollectionConfig } from "payload";

export const Glossary: CollectionConfig = {
  slug: "glossary",
  admin: {
    useAsTitle: "termEn",
    defaultColumns: ["termEn", "termPs", "termFa", "doNotTranslate"],
    hidden: true,
  },
  access: {
    read: ({ req: { user } }) => canAccessEditorial(user),
    create: ({ req: { user } }) => canAccessEditorial(user),
    update: ({ req: { user } }) => canAccessEditorial(user),
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    creationHelpField(),
    {
      name: "termEn",
      type: "text",
      required: true,
      unique: true,
      label: "English Source Term",
      admin: {
        description: "Scientific term or concept in English (e.g. cognitive dissonance)",
      },
    },
    {
      name: "termPs",
      type: "text",
      label: "Standardized Pashto Term",
    },
    {
      name: "termFa",
      type: "text",
      label: "Standardized Dari Term",
    },
    {
      name: "doNotTranslate",
      type: "checkbox",
      defaultValue: false,
      label: "Do Not Translate (Preserve in Latin script / brand terminology)",
    },
    {
      name: "notes",
      type: "textarea",
      label: "Editorial Notes & Domain Context",
    },
  ],
};

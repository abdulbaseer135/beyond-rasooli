import { creationHelpField } from "./shared/creation-help";
import { invalid } from "./shared/validation";
import { canAccessEditorial } from "./shared/auth-roles";
import type { CollectionConfig } from "payload";

export const UIStrings: CollectionConfig = {
  slug: "ui-strings",
  labels: {
    singular: "UI String",
    plural: "UI Strings",
  },
  admin: {
    useAsTitle: "key",
    defaultColumns: ["key", "namespace", "statusPs", "statusFa"],
    hidden: true,
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => canAccessEditorial(user),
    create: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  hooks: {
    afterChange: [
      () => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:ui-strings");
        });
      },
    ],
    afterDelete: [
      () => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:ui-strings");
        });
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        if (data.key && !/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/.test(data.key))
          throw new Error("invalid_ui_key");
        if (
          originalDoc?.id &&
          data.key !== undefined &&
          data.key !== originalDoc.key
        ) {
          await invalid(req, "key", "ui_key_immutable");
        }
        const englishChanged =
          originalDoc?.id &&
          data.valueEn !== undefined &&
          data.valueEn !== originalDoc.valueEn;
        if (englishChanged) {
          data.statusPs = "ai_draft";
          data.statusFa = "ai_draft";
        }
        const placeholders = (text: string) =>
          [
            ...new Set(
              [...text.matchAll(/\{([a-zA-Z_]\w*)(?:,|\})/g)].map(
                (match) => match[1],
              ),
            ),
          ]
            .sort()
            .join(",");
        const expected = placeholders(
          data.valueEn ?? originalDoc?.valueEn ?? "",
        );
        for (const locale of ["Ps", "Fa"]) {
          const valueKey = `value${locale}`;
          const statusKey = `status${locale}`;
          const changed =
            originalDoc?.id &&
            data[valueKey] !== undefined &&
            data[valueKey] !== originalDoc[valueKey];
          const value = data[valueKey] ?? originalDoc?.[valueKey];
          if (
            value?.trim() &&
            (changed || englishChanged || data[statusKey] === "approved") &&
            placeholders(value) !== expected
          )
            await invalid(req, valueKey, "ui_placeholders");
          if (changed) data[statusKey] = "ai_draft";
          if (
            data[statusKey] === "approved" &&
            originalDoc?.[statusKey] !== "approved" &&
            req.user?.role !== "admin"
          )
            await invalid(req, statusKey, "admin_required");
          if (
            data[statusKey] === "approved" &&
            !(data[valueKey] ?? originalDoc?.[valueKey])?.trim()
          )
            await invalid(req, valueKey, "ui_value_missing");
        }
        return data;
      },
    ],
  },
  fields: [
    creationHelpField(),
    {
      type: "tabs",
      tabs: [
        {
          label: "Source & Context",
          fields: [
            {
              name: "key",
              type: "text",
              required: true,
              unique: true,
              index: true,
              label: "Key Identifier",
              admin: {
                description:
                  "Stable lookup key (e.g. nav.watch, home.hero_headline). Immutable after creation.",
              },
            },
            {
              name: "namespace",
              type: "select",
              required: true,
              label: "Namespace / Category",
              options: [
                { label: "Interface", value: "ui" },
                { label: "Navigation", value: "nav" },
                { label: "Home Page", value: "home" },
                { label: "Watch Library", value: "watch" },
                { label: "Read Articles", value: "read" },
                { label: "Video Player", value: "video" },
                { label: "Topics", value: "topics" },
                { label: "Collections", value: "collections" },
                { label: "About", value: "about" },
                { label: "Buttons & Actions", value: "buttons" },
                { label: "Forms & Inputs", value: "forms" },
                { label: "Errors & Notifications", value: "errors" },
                { label: "Search", value: "search" },
                { label: "Translation Labels", value: "translation" },
                { label: "Footer", value: "footer" },
                { label: "Accessibility (A11y)", value: "a11y" },
                { label: "SEO Metadata", value: "seo" },
              ],
            },
            {
              name: "context",
              type: "text",
              label: "Context / Translator Note",
              admin: {
                description: "Editorial context explaining where and how this text appears",
              },
            },
            {
              name: "valueEn",
              type: "text",
              required: true,
              label: "English (Source of Truth)",
            },
          ],
        },
        {
          label: "Translations",
          fields: [
            {
              name: "valuePs",
              type: "text",
              label: "Pashto (Arabic Script)",
            },
            {
              name: "statusPs",
              type: "select",
              defaultValue: "ai_draft",
              label: "Pashto Review Status",
              options: [
                { label: "AI Draft (Generated Starter)", value: "ai_draft" },
                { label: "Needs Review", value: "needs_review" },
                { label: "Approved by Founder", value: "approved" },
              ],
            },
            {
              name: "valueFa",
              type: "text",
              label: "Dari (Afghan Persian)",
            },
            {
              name: "statusFa",
              type: "select",
              defaultValue: "ai_draft",
              label: "Dari Review Status",
              options: [
                { label: "AI Draft (Generated Starter)", value: "ai_draft" },
                { label: "Needs Review", value: "needs_review" },
                { label: "Approved by Founder", value: "approved" },
              ],
            },
          ],
        },
        {
          label: "Advanced",
          fields: [
            {
              name: "placeholders",
              type: "text",
              label: "Preserved Placeholders (e.g. {count}, {minutes})",
              admin: {
                description:
                  "Variables that must be preserved exactly inside translated text",
              },
            },
          ],
        },
      ],
    },
  ],
};

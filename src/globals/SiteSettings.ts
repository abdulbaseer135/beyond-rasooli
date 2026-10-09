import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: {
    group: "Website Management",
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === "admin",
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const next = { ...originalDoc, ...data };
        if (
          next.newsletterEnabled &&
          (!["buttondown", "mailerlite"].includes(next.newsletterProvider) ||
            !process.env.NEWSLETTER_API_KEY)
        )
          throw new Error("newsletter_configuration_required");
        return data;
      },
    ],
    afterChange: [
      () => {
        import("@/lib/data/cache-revalidate").then(({ invalidateCache }) => {
          invalidateCache("cms:site-settings");
        });
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "General",
          fields: [
            {
              name: "siteName",
              type: "text",
              defaultValue: "Beyond Rasooli",
              required: true,
              label: "Site Brand Name",
            },
            {
              name: "tagline",
              type: "text",
              localized: true,
              label: "Site Tagline",
            },
            {
              name: "defaultLocale",
              type: "select",
              defaultValue: "ps",
              required: true,
              label: "Default Language for Visitors",
              options: [
                { label: "Pashto (پښتو)", value: "ps" },
                { label: "Dari (دری)", value: "fa" },
                { label: "English", value: "en" },
              ],
            },
            {
              name: "featuredVideo",
              type: "relationship",
              relationTo: "videos",
              label: "Homepage Featured Video",
              admin: {
                appearance: "select",
                allowCreate: false,
                description:
                  "Featured video on homepage. If not set, latest pinned/recent video is displayed.",
              },
            },
          ],
        },
        {
          label: "Social Channels",
          fields: [
            {
              name: "socialLinks",
              type: "group",
              label: "Official Brand Social Channel Links",
              fields: [
                {
                  name: "youtube",
                  type: "text",
                  defaultValue: "https://youtube.com/@beyondrasooli",
                  label: "YouTube Channel URL",
                },
                {
                  name: "instagram",
                  type: "text",
                  defaultValue: "https://instagram.com/beyondrasooli",
                  label: "Instagram Profile URL",
                },
                {
                  name: "tiktok",
                  type: "text",
                  defaultValue: "https://tiktok.com/@beyondrasooli",
                  label: "TikTok Profile URL",
                },
                {
                  name: "facebook",
                  type: "text",
                  defaultValue: "https://facebook.com/beyondrasooli",
                  label: "Facebook Page URL",
                },
                {
                  name: "x",
                  type: "text",
                  defaultValue: "https://x.com/beyondrasooli",
                  label: "X (Twitter) Profile URL",
                },
              ],
            },
          ],
        },
        {
          label: "SEO Defaults",
          fields: [
            {
              name: "defaultSEOTitle",
              type: "text",
              localized: true,
              label: "Default Website Title Tag",
            },
            {
              name: "defaultSEODescription",
              type: "textarea",
              localized: true,
              label: "Default Website Meta Description",
            },
            {
              name: "defaultOGImage",
              type: "upload",
              relationTo: "media",
              label: "Default Social Share / OpenGraph Image",
            },
          ],
        },
        {
          label: "Features & Budget",
          fields: [
            {
              name: "newsletterEnabled",
              type: "checkbox",
              label:
                "Enable Newsletter Signup in Footer & Articles (Feature Flag)",
              defaultValue: false,
            },
            {
              name: "newsletterProvider",
              type: "select",
              options: [
                { label: "Buttondown", value: "buttondown" },
                { label: "MailerLite", value: "mailerlite" },
              ],
              label: "Newsletter Service Provider",
              admin: {
                description:
                  "Founder-selected provider; API key is configured via environment variables.",
              },
            },
            {
              name: "requireReviewBeforePublic",
              type: "checkbox",
              label:
                "Require Human Review before publishing machine translations (PRD Section 11.4)",
              defaultValue: false,
              admin: {
                description:
                  "When enabled, machine translation drafts cannot be shown publicly until reviewed and approved.",
              },
            },
            {
              name: "translationBudgetUsd",
              type: "number",
              label: "Monthly Translation API Budget Cap (USD)",
              defaultValue: 50,
            },
          ],
        },
        {
          label: "Locale & Formatting",
          fields: [
            {
              name: "publishingTimezone",
              type: "text",
              defaultValue: "Asia/Kabul",
              required: true,
              label: "Editorial Publishing Timezone (IANA)",
              validate: (value: string | null | undefined) => {
                try {
                  new Intl.DateTimeFormat("en", { timeZone: value || "" });
                  return true;
                } catch {
                  return "Enter an IANA timezone such as Asia/Kabul.";
                }
              },
            },
            {
              name: "dateStyle",
              type: "select",
              defaultValue: "medium",
              label: "Date Format Style",
              options: [
                { label: "Short (e.g. 10/8/26)", value: "short" },
                { label: "Medium (e.g. Oct 8, 2026)", value: "medium" },
                { label: "Long (e.g. October 8, 2026)", value: "long" },
              ],
            },
            {
              name: "numberingSystem",
              type: "select",
              defaultValue: "latn",
              label: "Numbering System",
              options: [
                { label: "Latin Numerals (1, 2, 3)", value: "latn" },
                {
                  label: "Eastern Arabic / Persian-Afghan (۱, ۲, ۳)",
                  value: "arabext",
                },
                { label: "Arabic (١, ٢, ٣)", value: "arab" },
              ],
            },
          ],
        },
        {
          label: "Scientific Glossary",
          fields: [
            {
              name: "glossary",
              type: "array",
              label: "Scientific Glossary (Terminology Standardization)",
              admin: {
                description:
                  "Standardized terms injected into AI translation requests to ensure consistency.",
              },
              fields: [
                {
                  name: "termEn",
                  type: "text",
                  required: true,
                  label: "English Source Term",
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
                  label: "Do Not Translate (Preserve in Latin script / brand)",
                  defaultValue: false,
                },
                {
                  name: "notes",
                  type: "text",
                  label: "Context / Scientific Domain Note",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

import test from "node:test";
import assert from "node:assert/strict";
import { Articles } from "../src/collections/Articles";
import { Videos } from "../src/collections/Videos";
import { Topics } from "../src/collections/Topics";
import { Collections } from "../src/collections/Collections";
import { Pages } from "../src/collections/Pages";
import { Authors } from "../src/collections/Authors";
import { Users } from "../src/collections/Users";
import { UIStrings } from "../src/collections/UIStrings";
import { Glossary } from "../src/collections/Glossary";
import { SiteSettings } from "../src/globals/SiteSettings";
import { slugify } from "../src/collections/shared/slug";

test("slugify produces clean slugs across English, Pashto and Dari", () => {
  assert.equal(slugify("Why We Misremember"), "why-we-misremember");
  assert.equal(slugify("ولې موږ هېروو؟"), "ولې-موږ-هېروو");
  assert.equal(slugify("چرا فراموش می‌کنیم؟"), "چرا-فراموش-می‌کنیم");
  assert.equal(slugify("How Habits Form (2026)"), "how-habits-form-2026");
});

test("Article collection has tabs and clean default visible fields", () => {
  const tabsField = Articles.fields.find((f: any) => f.type === "tabs") as any;
  assert(tabsField, "Articles must have a tabs field");
  assert.equal(tabsField.tabs.length, 8);
  const labels = tabsField.tabs.map((t: any) => t.label);
  assert.deepEqual(labels, [
    "Content",
    "Media",
    "Classification",
    "Evidence",
    "Publishing",
    "Translations",
    "SEO",
    "Advanced",
  ]);
  const contentTab = tabsField.tabs[0];
  const contentFieldNames = contentTab.fields.map((f: any) => f.name);
  assert.deepEqual(contentFieldNames, [
    "title",
    "language",
    "slug",
    "summary",
    "body",
    "partsEnabled",
  ]);
});

test("Video collection has tabs, inline YouTube autofill, and clean fields", () => {
  const tabsField = Videos.fields.find((f: any) => f.type === "tabs") as any;
  assert(tabsField, "Videos must have a tabs field");
  assert.equal(tabsField.tabs.length, 8);
  const contentTab = tabsField.tabs[0];
  const contentFieldNames = contentTab.fields.map((f: any) => f.name);
  assert.deepEqual(contentFieldNames, [
    "title",
    "language",
    "spokenLanguage",
    "slug",
    "description",
    "transcript",
  ]);
  const videoTab = tabsField.tabs[1];
  assert(videoTab.fields.some((f: any) => f.name === "youtubeAutofill"), "Video tab must have youtubeAutofill UI field");
});

test("Topic collection has simple fields with auto-slug", () => {
  const fieldNames = Topics.fields.map((f: any) => f.name);
  assert(fieldNames.includes("name"));
  assert(fieldNames.includes("slug"));
  assert(fieldNames.includes("description"));
  assert(fieldNames.includes("coverImage"));
  assert(fieldNames.includes("order"));
});

test("Collection editor has Content and Publishing tabs without nested item creation", () => {
  const tabsField = Collections.fields.find((f: any) => f.type === "tabs") as any;
  assert(tabsField, "Collections must have tabs");
  assert.equal(tabsField.tabs.length, 2);
  const contentTab = tabsField.tabs[0];
  const itemsField = contentTab.fields.find((f: any) => f.name === "items");
  assert(itemsField, "items array must exist");
  const videoRel = itemsField.fields.find((f: any) => f.name === "video");
  assert.equal(videoRel.admin?.allowCreate, false, "Collection video relation must disable nested create");
  const articleRel = itemsField.fields.find((f: any) => f.name === "article");
  assert.equal(articleRel.admin?.allowCreate, false, "Collection article relation must disable nested create");
});

test("SiteSettings global has 6 organized tabs", () => {
  const tabsField = SiteSettings.fields.find((f: any) => f.type === "tabs") as any;
  assert(tabsField, "SiteSettings must have tabs");
  assert.equal(tabsField.tabs.length, 6);
  const labels = tabsField.tabs.map((t: any) => t.label);
  assert.deepEqual(labels, [
    "General",
    "Social Channels",
    "SEO Defaults",
    "Features & Budget",
    "Locale & Formatting",
    "Scientific Glossary",
  ]);
});

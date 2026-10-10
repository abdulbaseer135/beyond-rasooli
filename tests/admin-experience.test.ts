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

test("Article collection has simplified 2-tab structure with essential fields and hidden technical metadata", () => {
  const tabsField = Articles.fields.find((f: any) => f.type === "tabs") as any;
  assert(tabsField, "Articles must have a tabs field");
  assert.equal(tabsField.tabs.length, 2, "Articles should have exactly 2 tabs (Content and Publishing & Approvals)");
  const labels = tabsField.tabs.map((t: any) => t.label);
  assert.deepEqual(labels, ["Article Content", "Publishing & Approvals"]);

  const contentTab = tabsField.tabs[0];
  const contentFieldNames = contentTab.fields.map((f: any) => f.name);
  assert(contentFieldNames.includes("title"));
  assert(contentFieldNames.includes("slug"));
  assert(contentFieldNames.includes("summary"));
  assert(contentFieldNames.includes("body"));
  assert(contentFieldNames.includes("topic"));
  assert(contentFieldNames.includes("coverImage"));
  assert(contentFieldNames.includes("author"));
  assert(contentFieldNames.includes("relatedVideo"));
  assert(contentFieldNames.includes("sources"));

  // Check that technical fields exist in schema but are hidden in UI
  const allArticleFields = [...contentTab.fields, ...tabsField.tabs[1].fields];
  const hiddenFields = [
    "readingTimeMinutes",
    "translationGroup",
    "translatedFromLocale",
    "translatedAt",
    "reviewedAt",
    "reviewedBy",
    "sourceChanged",
    "sourceHashAtTranslation",
  ];
  for (const hf of hiddenFields) {
    const field = allArticleFields.find((f: any) => f.name === hf);
    assert(field, `Technical field ${hf} must exist in schema for backend processing`);
    assert.equal(
      typeof field.admin?.condition,
      "function",
      `Technical field ${hf} must have admin.condition hiding it`
    );
    assert.equal(field.admin.condition(), false, `Technical field ${hf} must be hidden`);
  }

  // Publishing & Approvals tab
  const pubTab = tabsField.tabs[1];
  const pubFieldNames = pubTab.fields.map((f: any) => f.name);
  assert(pubFieldNames.includes("reviewDecision"));
  assert(pubFieldNames.includes("reviewNotes"));
  assert(pubFieldNames.includes("submittedBy"));
});

test("Video collection has simplified 2-tab structure with essential fields and hidden technical metadata", () => {
  const tabsField = Videos.fields.find((f: any) => f.type === "tabs") as any;
  assert(tabsField, "Videos must have a tabs field");
  assert.equal(tabsField.tabs.length, 2, "Videos should have exactly 2 tabs (Details and Publishing & Approvals)");
  const labels = tabsField.tabs.map((t: any) => t.label);
  assert.deepEqual(labels, ["Video Details", "Publishing & Approvals"]);

  const detailsTab = tabsField.tabs[0];
  const detailsFieldNames = detailsTab.fields.map((f: any) => f.name);
  assert(detailsFieldNames.includes("title"));
  assert(detailsFieldNames.includes("youtubeUrl"));
  assert(detailsFieldNames.includes("slug"));
  assert(detailsFieldNames.includes("description"));
  assert(detailsFieldNames.includes("topic"));
  assert(detailsFieldNames.includes("thumbnail"));
  assert(detailsFieldNames.includes("duration"));
  assert(detailsFieldNames.includes("relatedArticle"));
  assert(detailsFieldNames.includes("sources"));
  assert(detailsFieldNames.includes("transcript"));

  // Check that technical fields exist but are hidden
  const allVideoFields = [...detailsTab.fields, ...tabsField.tabs[1].fields];
  const hiddenVideoFields = [
    "durationSeconds",
    "remotePosterUrl",
    "summary",
    "translationGroup",
    "translatedFromLocale",
  ];
  for (const hf of hiddenVideoFields) {
    const field = allVideoFields.find((f: any) => f.name === hf);
    assert(field, `Technical field ${hf} must exist in schema`);
    assert.equal(field.admin?.condition?.(), false, `Technical field ${hf} must be hidden`);
  }

  // Publishing tab
  const pubTab = tabsField.tabs[1];
  const pubFieldNames = pubTab.fields.map((f: any) => f.name);
  assert(pubFieldNames.includes("reviewDecision"));
  assert(pubFieldNames.includes("reviewNotes"));
  assert(pubFieldNames.includes("submittedBy"));
});

test("Topic collection has status field, auto-slug, and hides order from non-admins", () => {
  const fieldNames = Topics.fields.map((f: any) => f.name);
  assert(fieldNames.includes("name"));
  assert(fieldNames.includes("slug"));
  assert(fieldNames.includes("description"));
  assert(fieldNames.includes("coverImage"));
  assert(fieldNames.includes("status"));
  assert(fieldNames.includes("order"));

  const statusField = Topics.fields.find((f: any) => f.name === "status") as any;
  assert.equal(statusField.defaultValue({ user: { role: "admin" } }), "published");
  assert.equal(statusField.defaultValue({ user: { role: "editor" } }), "draft");
  const orderField = Topics.fields.find((f: any) => f.name === "order") as any;
  assert(typeof orderField.admin?.condition === "function");
  assert.equal(orderField.admin.condition({}, {}, { user: { role: "editor" } }), false);
  assert.equal(orderField.admin.condition({}, {}, { user: { role: "admin" } }), true);
});

test("Users collection has status field and profile sync fields", () => {
  const fieldNames = Users.fields.map((f: any) => f.name);
  assert(fieldNames.includes("status"));
  assert(fieldNames.includes("reasonForJoining"));
  assert(fieldNames.includes("rejectionReason"));
  assert(fieldNames.includes("appliedAt"));
  assert(fieldNames.includes("authorProfile"));

  const statusField = Users.fields.find((f: any) => f.name === "status") as any;
  const statusValues = statusField.options.map((o: any) => (typeof o === "string" ? o : o.value));
  assert.deepEqual(statusValues, ["approved", "pending", "rejected", "suspended"]);
});

test("Admin sidebar hides raw Users, Authors, Glossaries, and technical collections", () => {
  assert.equal((Users.admin as any)?.hidden, true);
  assert.equal((Authors.admin as any)?.hidden, true);
  assert.equal((Glossary.admin as any)?.hidden, true);
  assert.equal((UIStrings.admin as any)?.hidden, true);
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

test("SiteSettings global has 6 organized tabs and is restricted to admin", () => {
  const tabsField = SiteSettings.fields.find((f: any) => f.type === "tabs") as any;
  assert(tabsField, "SiteSettings must have tabs");
  assert.equal(tabsField.tabs.length, 6);
  assert.equal((SiteSettings.admin as any)?.group, "Website Management");
  assert.equal((SiteSettings.admin as any)?.hidden?.({ user: { role: "admin" } }), false);
  assert.equal((SiteSettings.admin as any)?.hidden?.({ user: { role: "editor" } }), true);
});

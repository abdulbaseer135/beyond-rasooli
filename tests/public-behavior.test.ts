import { collectProse, replaceProse } from "../src/lib/translation/structure";
import test from "node:test";
import assert from "node:assert/strict";
import { eligible } from "../src/lib/data/publication";
import {
  normalizeArabicScript,
  matchesQuery,
} from "../src/lib/search-normalize";
import { extractYouTubeId } from "../src/lib/youtube";
import { filterItems, pageLimit, moreHref } from "../src/lib/discovery";
import { validateContact } from "../src/lib/contact-validation";
test("unpublished/future/invalid-dated documents cannot be served", () => {
  for (const status of ["draft", "in_review", "scheduled", "archived"])
    assert.equal(eligible({ status }), false);
  assert.equal(
    eligible({ status: "published", publishedAt: "2100-01-01" }),
    false,
  );
  assert.equal(
    eligible({ status: "published", publishedAt: "not-a-date" }),
    false,
  );
  assert.equal(
    eligible({ status: "published", publishedAt: "2020-01-01" }),
    true,
  );
});
test("review gate distinguishes machine translations from public originals", () => {
  assert.equal(
    eligible({ status: "published", translationStatus: "machine_draft" }, true),
    false,
  );
  assert.equal(
    eligible(
      { status: "published", translationStatus: "machine_draft" },
      false,
    ),
    true,
  );
  assert.equal(
    eligible({ status: "published", translationStatus: "reviewed" }, true),
    true,
  );
});
test("Arabic matching normalizes yeh/kaf and diacritics without losing Pashto letters", () => {
  assert.equal(
    normalizeArabicScript("\u0643\u064e\u064a"),
    normalizeArabicScript("\u06a9\u06cc"),
  );
  assert.equal(
    normalizeArabicScript(
      "\u0681\u0685\u0689\u0693\u0696\u069a\u06bc\u06cd\u0626",
    ),
    "\u0681\u0685\u0689\u0693\u0696\u069a\u06bc\u06cd\u0626",
  );
  assert(matchesQuery("retrieval MEMORY", "Scientific memory retrieval"));
});
test("YouTube accepts official URLs and rejects deceptive hosts/invalid IDs", () => {
  assert.equal(extractYouTubeId("https://youtu.be/abcdefghijk"), "abcdefghijk");
  assert.equal(
    extractYouTubeId("https://www.youtube.com/shorts/abcdefghijk"),
    "abcdefghijk",
  );
  assert.equal(
    extractYouTubeId("https://youtube.com.attacker.test/watch?v=abcdefghijk"),
    null,
  );
  assert.equal(extractYouTubeId("javascript:abcdefghijk"), null);
});
test("Watch filters spoken language, not translated page language", () => {
  const item = {
    topicSlug: "science",
    language: "en",
    spokenLanguage: "ps",
    title: "Science",
    tags: [],
    featuredOrder: 0,
  };
  assert.equal(filterItems([item], { language: "ps" }, "watch").length, 1);
  assert.equal(filterItems([item], { language: "en" }, "watch").length, 0);
});
test("sorting, pagination and load-more retain bounded URL state", () => {
  const base = {
    topicSlug: "science",
    language: "en",
    title: "Test",
    tags: [],
  };
  const items = [
    { ...base, featuredOrder: 0, publishedAt: "2025-01-01" },
    { ...base, featuredOrder: 1, publishedAt: "2024-01-01" },
  ];
  assert.equal(
    filterItems(items, { sort: "featured" }, "watch")[0].featuredOrder,
    1,
  );
  assert.equal(
    filterItems(items, { sort: "latest" }, "watch")[0].featuredOrder,
    0,
  );
  assert.equal(pageLimit({ limit: "99999" }), 120);
  assert.equal(pageLimit({ limit: "NaN" }), 12);
  assert(
    moreHref("/ps/watch", { topic: "science", language: "ps" }, 12).includes(
      "language=ps&limit=24",
    ),
  );
});
test("contact rejects malformed data and oversized messages", () => {
  assert.deepEqual(
    validateContact({
      name: "Reader",
      email: "reader@example.com",
      reason: "general",
      message: "A real editorial question.",
    }),
    {},
  );
  assert.equal(
    validateContact({
      name: "",
      email: "bad",
      reason: "invalid",
      message: "short",
    }).email,
    "email_invalid",
  );
  assert(
    validateContact({
      name: "Reader",
      email: "reader@example.com",
      reason: "general",
      message: "x".repeat(10001),
    }).message,
  );
});

test("translation preserves rich-text structure, formatting and URLs", () => {
  const tree = {
    root: {
      type: "root",
      children: [
        {
          type: "heading",
          tag: "h2",
          children: [{ type: "text", text: "Memory", format: 1 }],
        },
        {
          type: "link",
          fields: { url: "https://example.com/2024" },
          children: [{ type: "text", text: "Study" }],
        },
      ],
    },
  };
  assert.deepEqual(collectProse(tree), ["Memory", "Study"]);
  const translated = replaceProse(tree, [
    "Translated title",
    "Translated link",
  ]) as typeof tree;
  assert.equal(translated.root.children[0].tag, "h2");
  assert.equal(translated.root.children[0].children[0].format, 1);
  assert.equal(
    translated.root.children[1].fields?.url,
    "https://example.com/2024",
  );
  assert.throws(() => replaceProse(tree, ["Only one node"]));
});

test("internal source-change flags survive reviewed translation updates", async () => {
  const { contentState } =
    await import("../src/collections/shared/publication");
  const internal = await contentState({
    data: { translationStatus: "reviewed", sourceChanged: true },
    collection: { slug: "videos" },
    originalDoc: { status: "published" },
    req: { user: { role: "admin" }, context: { sourceChangeFlag: true } },
  } as unknown as Parameters<typeof contentState>[0]);
  assert.equal(internal.sourceChanged, true);
  const reviewed = await contentState({
    data: { translationStatus: "reviewed", sourceChanged: true },
    collection: { slug: "videos" },
    originalDoc: { status: "published" },
    req: { user: { role: "admin" }, context: {} },
  } as unknown as Parameters<typeof contentState>[0]);
  assert.equal(reviewed.sourceChanged, false);
});

test("localization repair fills missing native values as drafts and preserves founder wording", async () => {
  const { missingUIValues } = await import("../src/lib/localization/ui-seed");
  const complete = missingUIValues("nav.watch");
  assert.equal(complete.valueEn, "Watch");
  assert(complete.valuePs);
  assert(complete.valueFa);
  assert.equal(complete.statusPs, "ai_draft");
  assert.equal(complete.statusFa, "ai_draft");
  const preserved = missingUIValues("nav.watch", {
    valueEn: "Watch",
    valuePs: "Founder Pashto wording",
    valueFa: "",
  });
  assert.equal(preserved.valuePs, undefined);
  assert.equal(preserved.statusPs, undefined);
  assert(preserved.valueFa);
  assert.equal(preserved.statusFa, "ai_draft");
  const changedSource = missingUIValues("nav.watch", {
    valueEn: "Founder changed English meaning",
    valuePs: "",
    valueFa: "",
  });
  assert.deepEqual(changedSource, {});
  assert.deepEqual(missingUIValues("unrecognized.custom_label"), {});
});

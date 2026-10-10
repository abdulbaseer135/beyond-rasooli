import test from "node:test";
import assert from "node:assert/strict";
import { resolveLanguages } from "../src/lib/data/language-resolution";
import { filterItems } from "../src/lib/discovery";

test("public originals remain accessible for every supported language pair without paid translation", () => {
  for (const language of ["en", "ps", "fa"] as const) for (const target of ["en", "ps", "fa"] as const) {
    const original = { id: 1, title: "Original", language, status: "published", translationGroup: "group", body: { url: "https://example.org", text: "Original" }, author: 9 };
    const [result] = resolveLanguages([original], target, true);
    assert.equal(result.language, language);
    assert.deepEqual(result.body, original.body);
    assert.equal(result.author, 9);
    assert.equal(Boolean(result.translationUnavailable), target !== language);
  }
});
test("explicit target-language listing filters keep public original fallbacks", () => {
  const [fallback] = resolveLanguages([{ id: 1, title: "Sleep", language: "en" as const, status: "published", topicSlug: "sleep", tags: [], featuredOrder: 0 }], "ps", true);
  assert.equal(filterItems([fallback], { language: "ps" }, "read").length, 1);
  assert.equal(fallback.language, "en");
});
test("approved target translations take precedence and unsafe records never enter fallback", () => {
  const docs = [
    { id: 1, language: "en" as const, status: "published", translationGroup: "group" },
    { id: 2, language: "ps" as const, status: "published", translationGroup: "group", translationStatus: "reviewed" },
    { id: 3, language: "fa" as const, status: "draft", translationGroup: "private" },
    { id: 4, language: "fa" as const, status: "published", translationGroup: "machine", translationStatus: "machine_draft" },
    { id: 5, language: "fa" as const, status: "published", translationGroup: "future", publishedAt: "2099-01-01" },
  ];
  assert.deepEqual(resolveLanguages(docs, "ps", true).map(d => d.id), [2]);
});

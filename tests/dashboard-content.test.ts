import test from "node:test";
import assert from "node:assert/strict";
import { dashboardWhere, getDashboardContent } from "../src/lib/admin-content";

test("topic review and editor ownership filters use the correct persisted fields", () => {
  const topic = dashboardWhere("topics", { id: 8, role: "editor" }, "in_review");
  assert.deepEqual(topic, { and: [{ submittedBy: { equals: 8 } }, { status: { equals: "pending" } }] });
  const article = dashboardWhere("articles", { id: 8, role: "editor" });
  assert.deepEqual(article, { and: [{ or: [{ author: { equals: 8 } }, { submittedBy: { equals: 8 } }] }] });
});
test("dashboard merges all three types with accurate totals and bounded pagination", async () => {
  const calls: unknown[] = [];
  const payload = { find: async (options: { collection: string; limit: number; page: number; overrideAccess: boolean }) => {
    calls.push(options);
    assert.equal(options.limit, 10); assert.equal(options.page, 2); assert.equal(options.overrideAccess, false);
    return { docs: [{ id: 1, title: options.collection, name: options.collection, status: options.collection === "topics" ? "pending" : "in_review", updatedAt: "2026-10-09T00:00:00Z", submittedBy: { name: "Contributor" } }], totalDocs: 31, hasNextPage: true };
  } };
  const result = await getDashboardContent(payload as never, { id: 1, role: "admin" } as never, { page: "2" }, true);
  assert.equal(calls.length, 3); assert.equal(result.total, 93); assert.equal(result.hasNextPage, true);
  assert.deepEqual(result.items.map(i => i.type), ["article", "video", "topic"]);
  assert(result.items.every(i => i.status === "in_review" && i.contributor === "Contributor"));
});

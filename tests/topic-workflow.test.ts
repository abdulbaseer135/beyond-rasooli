import test from "node:test";
import assert from "node:assert/strict";
import { topicState, topicChanged } from "../src/collections/shared/topic-workflow";

test("editor topic drafts retain ownership, submit once, and preserve review feedback", async () => {
  const req = { user: { id: 8, role: "editor", status: "approved" } };
  const draft = await topicState({ data: { name: "Sleep", status: "draft", submittedBy: 99 }, req } as never);
  assert.equal(draft.status, "draft");
  assert.equal(draft.submittedBy, 8);
  const pending = await topicState({ data: { status: "pending", reviewNotes: "fake" }, originalDoc: { ...draft, id: 1, reviewNotes: "Founder feedback", reviewDecision: "changes_requested" }, req } as never);
  assert.equal(pending.status, "pending");
  assert.equal(pending.reviewDecision, "none");
  assert.equal(pending.reviewNotes, "Founder feedback");
  for (const originalDoc of [{ ...draft, id: 1, submittedBy: 99 }, { ...draft, id: 1, status: "published" }, { ...draft, id: 1, status: "pending" }]) {
    assert.throws(() => topicState({ data: { name: "Changed" }, originalDoc, req } as never), /own eligible/);
  }
  assert.throws(() => topicState({ data: { name: "Sleep" }, req: { user: { role: "editor", status: "suspended" } } } as never), /approved editor/);
});

test("topic review notifications occur only when entering pending", async () => {
  let created = 0;
  const payload = {
    find: async ({ collection }: { collection: string }) => ({ docs: collection === "users" ? [{ id: 2 }] : [] }),
    create: async ({ data }: { data: { type: string; targetCollection: string } }) => { created++; assert.equal(data.type, "topic_approval"); assert.equal(data.targetCollection, "topics"); return { id: created }; },
  };
  const req = { payload, context: {}, user: { id: 8, name: "Editor" } };
  const doc = { id: 1, name: "Sleep", status: "pending", submittedBy: 8, updatedAt: "2026-10-09T10:00:00Z" };
  await topicChanged({ doc, previousDoc: { status: "draft" }, req } as never);
  await topicChanged({ doc, previousDoc: doc, req } as never);
  assert.equal(created, 1);
});

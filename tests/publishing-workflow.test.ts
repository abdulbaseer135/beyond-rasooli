import { test } from "node:test";
import assert from "node:assert/strict";
import { eligible } from "../src/lib/data/publication";
import { Articles } from "../src/collections/Articles";
import { Videos } from "../src/collections/Videos";

test("eligible() correctly validates public content visibility", () => {
  const now = Date.now();

  // Published in past -> eligible
  assert.equal(
    eligible(
      {
        status: "published",
        publishedAt: new Date(now - 10000).toISOString(),
        translationStatus: "none",
      },
      false,
      now,
    ),
    true,
  );

  // Draft -> NOT eligible
  assert.equal(
    eligible(
      {
        status: "draft",
        publishedAt: new Date(now - 10000).toISOString(),
        translationStatus: "none",
      },
      false,
      now,
    ),
    false,
  );

  // In Review -> NOT eligible
  assert.equal(
    eligible(
      {
        status: "in_review",
        publishedAt: null,
        translationStatus: "none",
      },
      false,
      now,
    ),
    false,
  );

  // Future dated -> NOT eligible
  assert.equal(
    eligible(
      {
        status: "published",
        publishedAt: new Date(now + 100000).toISOString(),
        translationStatus: "none",
      },
      false,
      now,
    ),
    false,
  );

  // Machine draft when review required -> NOT eligible
  assert.equal(
    eligible(
      {
        status: "published",
        publishedAt: new Date(now - 10000).toISOString(),
        translationStatus: "machine_draft",
      },
      true,
      now,
    ),
    false,
  );

  // Original content (translationStatus: 'none' or undefined) when review required -> ELIGIBLE
  assert.equal(
    eligible(
      {
        status: "published",
        publishedAt: new Date(now - 10000).toISOString(),
        translationStatus: "none",
      },
      true,
      now,
    ),
    true,
  );
});

test("Articles and Videos collections include publishControls and creationHelp", () => {
  const articleFields = Articles.fields || [];
  const articleControlField = articleFields.find((f: any) => f && "name" in f && f.name === "publishControls");
  assert.ok(articleControlField, "Articles collection must include publishControlsField");

  const videoFields = Videos.fields || [];
  const videoControlField = videoFields.find((f: any) => f && "name" in f && f.name === "publishControls");
  assert.ok(videoControlField, "Videos collection must include publishControlsField");
});

test("Editor access control strictly blocks setting status to published or archived", () => {
  const editorUser = { id: "99", role: "editor", status: "approved", email: "editor@example.com" };
  const adminUser = { id: "1", role: "admin", email: "founder@example.com" };

  const updateAccess = Articles.access?.update;
  assert.ok(updateAccess, "Articles must have update access function");

  type UpdateArg = Parameters<NonNullable<typeof updateAccess>>[0];

  // Admin can update published
  assert.equal(
    updateAccess({ req: { user: adminUser }, data: { status: "published" }, id: "1" } as unknown as UpdateArg),
    true,
  );

  // Editor CANNOT update to published
  assert.equal(
    updateAccess({ req: { user: editorUser }, data: { status: "published" }, id: "1" } as unknown as UpdateArg),
    false,
  );

  // Editor CANNOT update to archived
  assert.equal(
    updateAccess({ req: { user: editorUser }, data: { status: "archived" }, id: "1" } as unknown as UpdateArg),
    false,
  );

  // Editors can save or submit only their own persisted drafts.
  for (const status of ["draft", "in_review"]) {
    const rule = updateAccess({ req: { user: editorUser }, data: { status }, id: "1" } as unknown as UpdateArg);
    assert.deepEqual(rule, { and: [{ or: [{ author: { equals: "99" } }, { submittedBy: { equals: "99" } }] }, { status: { equals: "draft" } }] });
  }
});

test("archiveBeforeDelete allows Founder (admin) to delete published content directly", async () => {
  const { archiveBeforeDelete } = await import("../src/collections/shared/validation");

  const adminReq = {
    user: { id: "1", role: "admin", email: "founder@example.com" },
    payload: {
      findByID: async () => ({ id: "10", status: "published" }),
    },
  };

  // Admin user deleting published content should not throw
  await assert.doesNotReject(async () => {
    await archiveBeforeDelete({
      req: adminReq as any,
      id: "10",
      collection: { slug: "articles" } as any,
      context: {} as any,
    });
  });

  const editorReq = {
    user: { id: "2", role: "editor", email: "editor@example.com" },
    i18n: { language: "en" },
    locale: "en",
    payload: {
      findByID: async () => ({ id: "10", status: "published" }),
      find: async () => ({ docs: [] }),
    },
  };

  // Non-admin user deleting published content should be rejected
  await assert.rejects(async () => {
    await archiveBeforeDelete({
      req: editorReq as any,
      id: "10",
      collection: { slug: "articles" } as any,
      context: {} as any,
    });
  });
});


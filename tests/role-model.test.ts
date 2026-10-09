import test from "node:test";
import assert from "node:assert/strict";
import {
  isAdmin,
  isApprovedEditor,
  canAccessEditorial,
  editorialContentCreateAccess,
  editorialContentUpdateAccess,
  founderOnlyFieldUpdate,
  founderOnlyFieldCreate,
} from "../src/collections/shared/auth-roles";

test("Role 1 (Founder/Admin) authorization checks", () => {
  const founder = { id: 1, role: "admin", status: "approved" };
  assert.equal(isAdmin(founder), true);
  assert.equal(isApprovedEditor(founder), false);
  assert.equal(canAccessEditorial(founder), true);

  // Founder can create editorial content
  assert.equal(
    editorialContentCreateAccess({ req: { user: founder } } as any),
    true,
  );

  // Founder can update any content
  assert.equal(
    editorialContentUpdateAccess({ req: { user: founder }, data: { status: "published" } } as any),
    true,
  );

  // Founder has field-level access to privileged fields
  assert.equal(founderOnlyFieldUpdate({ req: { user: founder } } as any), true);
  assert.equal(founderOnlyFieldCreate({ req: { user: founder } } as any), true);
});

test("Role 2 (Approved Editor) authorization checks", () => {
  const editor = { id: 42, role: "editor", status: "approved" };
  assert.equal(isAdmin(editor), false);
  assert.equal(isApprovedEditor(editor), true);
  assert.equal(canAccessEditorial(editor), true);

  // Approved editor can create editorial content
  assert.equal(
    editorialContentCreateAccess({ req: { user: editor } } as any),
    true,
  );

  // Approved editor CANNOT directly update status to published or archived or scheduled
  assert.equal(
    editorialContentUpdateAccess({ req: { user: editor }, data: { status: "published" } } as any),
    false,
  );
  assert.equal(
    editorialContentUpdateAccess({ req: { user: editor }, data: { status: "archived" } } as any),
    false,
  );
  assert.equal(
    editorialContentUpdateAccess({ req: { user: editor }, data: { status: "scheduled" } } as any),
    false,
  );

  // Approved editor updating a draft receives row-level ownership where clause
  const updateWhere = editorialContentUpdateAccess({
    req: { user: editor },
    data: { title: "Updated draft" },
  } as any);
  assert.ok(typeof updateWhere === "object" && updateWhere !== null);
  assert.deepEqual(updateWhere, {
    and: [
      {
        or: [
          { author: { equals: 42 } },
          { submittedBy: { equals: 42 } },
        ],
      },
      {
        status: {
          not_in: ["published", "archived"],
        },
      },
    ],
  });

  // Approved editor CANNOT update or create founder-only fields
  assert.equal(founderOnlyFieldUpdate({ req: { user: editor } } as any), false);
  assert.equal(founderOnlyFieldCreate({ req: { user: editor } } as any), false);
});

test("Pending, Suspended, Rejected, and Visitor access denials", () => {
  const pendingEditor = { id: 10, role: "editor", status: "pending" };
  const suspendedEditor = { id: 11, role: "editor", status: "suspended" };
  const rejectedEditor = { id: 12, role: "editor", status: "rejected" };
  const unauth: any = null;

  for (const u of [pendingEditor, suspendedEditor, rejectedEditor, unauth]) {
    assert.equal(isAdmin(u), false);
    assert.equal(isApprovedEditor(u), false);
    assert.equal(canAccessEditorial(u), false);

    assert.equal(
      editorialContentCreateAccess({ req: { user: u } } as any),
      false,
    );
    assert.equal(
      editorialContentUpdateAccess({ req: { user: u }, data: { title: "Test" } } as any),
      false,
    );
  }
});

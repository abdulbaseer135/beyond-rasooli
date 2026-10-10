import test from "node:test";
import assert from "node:assert/strict";
import { APIError } from "payload";
import { Users } from "../src/collections/Users";

test("pending editor notifications share the account transaction", async () => {
  let notifications = 0;
  const req = {
    context: {}, transactionID: "registration-transaction",
    payload: {
      find: async (args: { collection: string; req: unknown }) => {
        assert.equal(args.req, req);
        return { docs: args.collection === "users" ? [{ id: 1 }] : [] };
      },
      create: async (args: { req: unknown; data: { actor: number } }) => {
        assert.equal(args.req, req);
        assert.equal(args.data.actor, 42);
        notifications++;
        return { id: 9 };
      },
    },
  };
  await Users.hooks!.afterChange![0]({
    doc: { id: 42, name: "Applicant", role: "editor", status: "pending" }, req,
  } as never);
  assert.equal(notifications, 1);
});

test("founder status updates persist while editor self-approval is prevented", async () => {
  const hook = Users.hooks!.beforeChange![0];
  const originalDoc = { role: "editor", status: "pending" };
  const founderData = { status: "approved" };
  await hook({ data: founderData, originalDoc, operation: "update", req: { user: { role: "admin" }, context: {} } } as never);
  assert.equal(founderData.status, "approved");
  const editorData = { status: "approved" };
  await hook({ data: editorData, originalDoc, operation: "update", req: { user: { role: "editor" }, context: {} } } as never);
  assert.equal(editorData.status, "pending");
});

test("blocked editor logins return public 403 errors instead of server errors", async () => {
  const hook = Users.hooks!.beforeLogin![0];
  for (const status of ["pending", "rejected", "suspended"]) {
    await assert.rejects(
      () => Promise.resolve(hook({ user: { role: "editor", status } } as never)),
      (error: unknown) => error instanceof APIError && error.status === 403 && error.isPublic,
    );
  }
  const user = { role: "editor", status: "approved" };
  assert.equal(await hook({ user } as never), user);
});

test("internal author linking preserves status and skips recursive synchronization", async () => {
  const data = { authorProfile: 9, status: "approved" };
  const req = { user: null, context: { syncingAuthorProfile: true } };
  await Users.hooks!.beforeChange![0]({ data, originalDoc: { role: "editor", status: "approved" }, operation: "update", req } as never);
  assert.equal(data.authorProfile, 9);
  assert.equal(data.status, "approved");
  await Users.hooks!.afterChange![0]({ doc: data, req } as never);
});

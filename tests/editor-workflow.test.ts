import test from "node:test";
import assert from "node:assert/strict";
import { Users } from "../src/collections/Users";
import { Topics } from "../src/collections/Topics";
import { extractYouTubeId } from "../src/lib/youtube";
import { calculateReadingTime } from "../src/collections/shared/publication";

test("Users collection defines exactly Founder (admin) and Editor roles", () => {
  const roleField = Users.fields.find((f: any) => f.name === "role") as any;
  assert(roleField, "Role field must exist on Users");
  const roleValues = roleField.options.map((o: any) => (typeof o === "string" ? o : o.value));
  assert.deepEqual(roleValues, ["admin", "editor"]);
});

test("Users beforeLogin hook denies unapproved editors", async () => {
  const beforeLoginHook = Users.hooks?.beforeLogin?.[0];
  assert(beforeLoginHook, "beforeLogin hook must exist on Users");

  // 1. Pending editor
  await assert.rejects(
    async () => {
      await (beforeLoginHook as any)({
        user: { role: "editor", status: "pending" },
        req: {},
      });
    },
    /pending approval/i
  );

  // 2. Suspended editor
  await assert.rejects(
    async () => {
      await (beforeLoginHook as any)({
        user: { role: "editor", status: "suspended" },
        req: {},
      });
    },
    /suspended/i
  );

  // 3. Rejected applicant
  await assert.rejects(
    async () => {
      await (beforeLoginHook as any)({
        user: { role: "editor", status: "rejected" },
        req: {},
      });
    },
    /not approved/i
  );

  // 4. Approved editor succeeds
  const approvedUser = { role: "editor", status: "approved" };
  const res = await (beforeLoginHook as any)({
    user: approvedUser,
    req: {},
  });
  assert.deepEqual(res, approvedUser);

  // 5. Admin / Founder succeeds
  const adminUser = { role: "admin", status: "approved" };
  const resAdmin = await (beforeLoginHook as any)({
    user: adminUser,
    req: {},
  });
  assert.deepEqual(resAdmin, adminUser);
});

test("Topic beforeValidate forces editor proposals to status 'pending'", async () => {
  const beforeValidateHook = Topics.hooks?.beforeValidate?.[0];
  assert(beforeValidateHook, "beforeValidate hook must exist on Topics");

  // Editor attempting to publish directly
  const editorReq = { user: { id: 8, role: "editor", status: "approved" } } as any;
  const editorData = { name: "Neuroplasticity", status: "published" };
  const result = await beforeValidateHook({
    data: editorData,
    req: editorReq,
    operation: "create",
  } as any);
  assert.equal(result.status, "pending", "Editor proposed topic must be forced to pending");

  // Founder can publish directly
  const founderReq = { user: { role: "admin" } } as any;
  const founderData = { name: "Cognitive Bias", status: "published" };
  const founderResult = await beforeValidateHook({
    data: founderData,
    req: founderReq,
    operation: "create",
  } as any);
  assert.equal(founderResult.status, "published", "Founder topic can be published directly");
});

test("Reading time calculator computes accurate minutes from prose", () => {
  const text200Words = Array(200).fill("word").join(" ");
  assert.equal(calculateReadingTime(text200Words), 1);

  const text500Words = Array(500).fill("cognition").join(" ");
  assert.equal(calculateReadingTime(text500Words), 3);
});

test("YouTube URL extraction handles standard, shorts, and embed formats", () => {
  assert.equal(
    extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "dQw4w9WgXcQ"
  );
  assert.equal(
    extractYouTubeId("https://youtu.be/dQw4w9WgXcQ"),
    "dQw4w9WgXcQ"
  );
  assert.equal(
    extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    "dQw4w9WgXcQ"
  );
  assert.equal(
    extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    "dQw4w9WgXcQ"
  );
});

test("Users beforeValidate prevents publicEditorRegistration from obtaining admin role even if totalUsers is 0", async () => {
  const beforeValidateHook = Users.hooks?.beforeValidate?.[0];
  assert(beforeValidateHook, "beforeValidate hook must exist on Users");

  const reqMock = {
    payload: {
      count: async () => ({ totalDocs: 0 }),
    },
    context: { publicEditorRegistration: true },
  } as any;

  const data = {
    name: "Prospective Contributor",
    email: "applicant@example.com",
    password: "Password123456",
    role: "editor",
    status: "pending",
  };

  const result = await (beforeValidateHook as any)({
    data,
    operation: "create",
    req: reqMock,
  });

  assert.equal(result.role, "editor", "Public registration must never become admin");
  assert.equal(result.status, "pending", "Public registration must stay pending");
});

test("Users beforeChange prevents non-admin users from altering role or status", async () => {
  const beforeChangeHook = Users.hooks?.beforeChange?.[0];
  assert(beforeChangeHook, "beforeChange hook must exist on Users");

  const nonAdminReq = {
    user: { id: 5, role: "editor", status: "approved" },
    payload: {},
  } as any;

  const originalDoc = {
    id: 5,
    role: "editor",
    status: "approved",
    rejectionReason: "",
    appliedAt: "2026-10-01T00:00:00.000Z",
    authorProfile: 10,
  };

  const maliciousData = {
    role: "admin", // trying to elevate to admin
    status: "approved",
    rejectionReason: "hacked",
    appliedAt: "2020-01-01T00:00:00.000Z",
    authorProfile: 999,
  };

  const result = await (beforeChangeHook as any)({
    data: maliciousData,
    originalDoc,
    operation: "update",
    req: nonAdminReq,
  });

  assert.equal(result.role, "editor", "Role elevation must be prevented");
  assert.equal(result.status, "approved", "Status change must be reverted");
  assert.equal(result.rejectionReason, "", "Rejection reason must be reverted");
  assert.equal(result.appliedAt, "2026-10-01T00:00:00.000Z", "appliedAt must be preserved");
  assert.equal(result.authorProfile, 10, "authorProfile must be preserved");
});


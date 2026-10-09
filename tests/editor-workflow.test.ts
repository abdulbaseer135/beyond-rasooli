import test from "node:test";
import assert from "node:assert/strict";
import { Users } from "../src/collections/Users";
import { Articles } from "../src/collections/Articles";
import { Videos } from "../src/collections/Videos";
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
  const editorReq = { user: { role: "editor" } } as any;
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

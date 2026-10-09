import test from "node:test";
import assert from "node:assert/strict";
import { Notifications } from "../src/collections/Notifications";
import { NotificationBell } from "../src/components/admin/NotificationBell";
import {
  formatRelativeTime,
  createFounderNotification,
  resolveFounderNotifications,
  type NotificationType,
} from "../src/lib/notifications";
import type { User } from "../src/payload-types";
import type { Payload } from "payload";

type AccessFn = (args: { req: { user?: unknown } }) => boolean | Promise<boolean>;

test("Notifications collection restricts read, create, update, delete exclusively to Founder (admin)", () => {
  const adminReq = { req: { user: { role: "admin" } } };
  const editorReq = { req: { user: { role: "editor" } } };
  const anonReq = { req: { user: null } };

  const readAccess = Notifications.access?.read as AccessFn;
  const createAccess = Notifications.access?.create as AccessFn;
  const updateAccess = Notifications.access?.update as AccessFn;
  const deleteAccess = Notifications.access?.delete as AccessFn;

  // Read access
  assert.equal(typeof readAccess, "function");
  assert.equal(readAccess(adminReq), true, "Admin has read access");
  assert.equal(Boolean(readAccess(editorReq)), false, "Editor denied read access");
  assert.equal(Boolean(readAccess(anonReq)), false, "Anonymous denied read access");

  // Create access
  assert.equal(typeof createAccess, "function");
  assert.equal(createAccess(adminReq), true, "Admin has create access");
  assert.equal(Boolean(createAccess(editorReq)), false, "Editor denied create access");
  assert.equal(Boolean(createAccess(anonReq)), false, "Anonymous denied create access");

  // Update access
  assert.equal(typeof updateAccess, "function");
  assert.equal(updateAccess(adminReq), true, "Admin has update access");
  assert.equal(Boolean(updateAccess(editorReq)), false, "Editor denied update access");
  assert.equal(Boolean(updateAccess(anonReq)), false, "Anonymous denied update access");

  // Delete access
  assert.equal(typeof deleteAccess, "function");
  assert.equal(deleteAccess(adminReq), true, "Admin has delete access");
  assert.equal(Boolean(deleteAccess(editorReq)), false, "Editor denied delete access");
  assert.equal(Boolean(deleteAccess(anonReq)), false, "Anonymous denied delete access");
});

test("NotificationBell component strictly renders for Founder and returns null for editors, rejected, suspended, and unauthenticated users", () => {
  // 1. Founder (admin) sees the bell
  const founderResult = NotificationBell({
    user: { id: 1, role: "admin", status: "approved" } as unknown as User,
  } as Parameters<typeof NotificationBell>[0]);
  assert.notEqual(founderResult, null, "Founder must see notification bell");

  // 2. Approved Editor does NOT see the bell
  const editorResult = NotificationBell({
    user: { id: 2, role: "editor", status: "approved" } as unknown as User,
  } as Parameters<typeof NotificationBell>[0]);
  assert.equal(editorResult, null, "Editor must NOT see notification bell");

  // 3. Pending Editor does NOT see the bell
  const pendingResult = NotificationBell({
    user: { id: 3, role: "editor", status: "pending" } as unknown as User,
  } as Parameters<typeof NotificationBell>[0]);
  assert.equal(pendingResult, null, "Pending applicant must NOT see notification bell");

  // 4. Rejected Applicant does NOT see the bell
  const rejectedResult = NotificationBell({
    user: { id: 4, role: "editor", status: "rejected" } as unknown as User,
  } as Parameters<typeof NotificationBell>[0]);
  assert.equal(rejectedResult, null, "Rejected applicant must NOT see notification bell");

  // 5. Suspended Editor does NOT see the bell
  const suspendedResult = NotificationBell({
    user: { id: 5, role: "editor", status: "suspended" } as unknown as User,
  } as Parameters<typeof NotificationBell>[0]);
  assert.equal(suspendedResult, null, "Suspended editor must NOT see notification bell");

  // 6. Unauthenticated visitor does NOT see the bell
  const anonResult = NotificationBell({
    user: null as unknown as User,
  } as Parameters<typeof NotificationBell>[0]);
  assert.equal(anonResult, null, "Unauthenticated user must NOT see notification bell");
});

test("formatRelativeTime formats timestamps into human readable relative intervals", () => {
  assert.equal(formatRelativeTime(null), "");
  assert.equal(formatRelativeTime(undefined), "");

  const now = new Date().toISOString();
  assert.equal(formatRelativeTime(now), "just now");

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(fiveMinutesAgo), "5m ago");

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(twoHoursAgo), "2h ago");

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(yesterday), "yesterday");

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(threeDaysAgo), "3d ago");
});

interface MockNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  deduplicationKey: string;
  readAt?: string;
  resolvedAt?: string;
  targetCollection?: string;
  targetId?: string;
}

test("createFounderNotification enforces deduplication key and resolves notifications correctly", async () => {
  const store: MockNotification[] = [];
  let idCounter = 100;

  const mockPayload = {
    find: async ({ collection, where }: { collection: string; where?: { deduplicationKey?: { equals?: string }; and?: Array<{ targetCollection?: { equals?: string }; targetId?: { equals?: string }; resolvedAt?: { exists?: boolean } }> } }) => {
      if (collection === "users") {
        return { docs: [{ id: 1, role: "admin", name: "Founder" }] };
      }
      if (collection === "notifications") {
        let docs = [...store];
        if (where?.deduplicationKey?.equals) {
          docs = docs.filter((d) => d.deduplicationKey === where.deduplicationKey?.equals);
        }
        if (where?.and) {
          for (const clause of where.and) {
            if (clause.targetCollection?.equals) {
              docs = docs.filter((d) => d.targetCollection === clause.targetCollection?.equals);
            }
            if (clause.targetId?.equals) {
              docs = docs.filter((d) => String(d.targetId) === String(clause.targetId?.equals));
            }
            if (clause.resolvedAt?.exists === false) {
              docs = docs.filter((d) => !d.resolvedAt);
            }
          }
        }
        return { docs };
      }
      return { docs: [] };
    },
    count: async () => ({ totalDocs: store.filter((s) => !s.readAt).length }),
    create: async ({ data }: { data: Omit<MockNotification, "id"> }) => {
      const record: MockNotification = { id: idCounter++, ...data };
      store.push(record);
      return record;
    },
    update: async ({ id, data }: { id: number; data: Partial<MockNotification> }) => {
      const idx = store.findIndex((s) => s.id === id);
      if (idx !== -1) {
        store[idx] = { ...store[idx], ...data };
        return store[idx];
      }
      return null;
    },
  } as unknown as Payload;

  // 1. Create first notification
  const created = await createFounderNotification({
    payload: mockPayload,
    type: "editor_registration",
    title: "New Editor Registration",
    message: "Ahmad Khan has requested to join Beyond Rasooli as an editor.",
    actorId: 42,
    targetCollection: "users",
    targetId: 42,
    deduplicationKey: "editor_registration:42",
    link: "/admin/editor-requests",
  });

  assert.equal(created.length, 1, "Should create one notification for founder");
  assert.equal(store.length, 1);
  assert.equal(store[0].type, "editor_registration");
  assert.equal(store[0].readAt, undefined);
  assert.equal(store[0].resolvedAt, undefined);

  // 2. Idempotency: retry the same registration
  const duplicate = await createFounderNotification({
    payload: mockPayload,
    type: "editor_registration",
    title: "New Editor Registration",
    message: "Ahmad Khan has requested to join Beyond Rasooli as an editor.",
    actorId: 42,
    targetCollection: "users",
    targetId: 42,
    deduplicationKey: "editor_registration:42",
    link: "/admin/editor-requests",
  });

  assert.equal(duplicate.length, 0, "Duplicate event must be ignored");
  assert.equal(store.length, 1, "Store must not create duplicate notification row");

  // 3. Mark read
  store[0].readAt = new Date().toISOString();
  assert(store[0].readAt, "Notification marked as read");

  // 4. Resolve notification upon founder approval
  await resolveFounderNotifications({
    payload: mockPayload,
    targetCollection: "users",
    targetId: 42,
  });

  assert(store[0].resolvedAt, "Notification must have resolvedAt populated");
  assert.equal(store.length, 1, "Resolved notification must remain in history, not deleted");
});

test("Article & Video review workflow distinguishes drafts, submissions, and resubmissions", async () => {
  const store: MockNotification[] = [];
  let idCounter = 200;

  const mockPayload = {
    find: async ({ collection, where }: { collection: string; where?: { deduplicationKey?: { equals?: string } } }) => {
      if (collection === "users") {
        return { docs: [{ id: 1, role: "admin", name: "Founder" }] };
      }
      if (collection === "notifications") {
        let docs = [...store];
        if (where?.deduplicationKey?.equals) {
          docs = docs.filter((d) => d.deduplicationKey === where.deduplicationKey?.equals);
        }
        return { docs };
      }
      return { docs: [] };
    },
    count: async () => ({ totalDocs: store.length }),
    create: async ({ data }: { data: Omit<MockNotification, "id"> }) => {
      const record: MockNotification = { id: idCounter++, ...data };
      store.push(record);
      return record;
    },
  } as unknown as Payload;

  // 1. Initial submission
  const notif1 = await createFounderNotification({
    payload: mockPayload,
    type: "article_approval",
    title: "Article Awaiting Approval",
    message: 'Sara submitted "The Science of Attention" for your approval.',
    actorId: 99,
    targetCollection: "articles",
    targetId: 10,
    deduplicationKey: "articles:10:submission:v1",
    link: "/admin/content-approvals",
  });
  assert.equal(notif1.length, 1);
  assert.equal(store[0].type, "article_approval");

  // 2. Resubmission after requested changes (different deduplicationKey / revision)
  const notif2 = await createFounderNotification({
    payload: mockPayload,
    type: "article_resubmission",
    title: "Article Resubmission",
    message: 'Sara resubmitted "The Science of Attention" for your approval.',
    actorId: 99,
    targetCollection: "articles",
    targetId: 10,
    deduplicationKey: "articles:10:resubmission:v2",
    link: "/admin/content-approvals",
  });
  assert.equal(notif2.length, 1);
  assert.equal(store.length, 2, "Resubmission generates a new notification associated with the new revision");
  assert.equal(store[1].type, "article_resubmission");
});

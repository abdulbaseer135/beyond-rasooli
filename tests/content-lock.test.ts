import test from "node:test";
import assert from "node:assert/strict";
import { withContentLock } from "../src/lib/content-lock";
test("concurrent requests cannot mutate the same content and locks release after failure", async () => {
  const payload = { db: {} };
  const key = `qa-lock:${process.pid}`;
  let release!: () => void;
  let started!: () => void;
  const begun = new Promise<void>(resolve => { started = resolve; });
  const hold = new Promise<void>(resolve => { release = resolve; });
  const first = withContentLock(payload as never, key, async () => { started(); await hold; return 1; });
  await begun;
  await assert.rejects(() => withContentLock(payload as never, key, async () => 2), /being updated/);
  release(); assert.equal(await first, 1);
  await assert.rejects(() => withContentLock(payload as never, key, async () => { throw new Error("failed"); }), /failed/);
  assert.equal(await withContentLock(payload as never, key, async () => 3), 3);
});

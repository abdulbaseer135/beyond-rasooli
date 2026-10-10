import { createHash } from "node:crypto";
import { mkdir, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { APIError, type Payload } from "payload";

/** Cross-worker serialization: PostgreSQL advisory locks, or atomic local SQLite locks. */
export async function withContentLock<T>(payload: Payload, key: string, action: () => Promise<T>): Promise<T> {
  const hash = createHash("sha256").update(`${process.env.DATABASE_URI || process.cwd()}:${key}`).digest("hex");
  const db = payload.db as unknown as { pool?: { connect(): Promise<{ query(sql: string, values: string[]): Promise<{ rows: Array<{ locked: boolean }> }>; release(): void }> } };
  if (db.pool) {
    const client = await db.pool.connect();
    const lockID = BigInt.asIntN(64, BigInt(`0x${hash.slice(0, 16)}`)).toString();
    let locked = false;
    try {
      locked = (await client.query("SELECT pg_try_advisory_lock($1::bigint) AS locked", [lockID])).rows[0].locked;
      if (!locked) throw new APIError("This content is being updated. Refresh and try again.", 409);
      return await action();
    } finally {
      try { if (locked) await client.query("SELECT pg_advisory_unlock($1::bigint)", [lockID]); }
      finally { client.release(); }
    }
  }
  const directory = path.join(tmpdir(), `beyond-rasooli-content-${hash}`);
  try { await mkdir(directory); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new APIError("This content is being updated. Refresh and try again.", 409);
    throw error;
  }
  try { return await action(); } finally { await rmdir(directory); }
}

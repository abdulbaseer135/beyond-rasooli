/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import pg from "pg";

export interface QueryRecord {
  sql: string;
  durationMs: number;
  timestamp: number;
}

export interface PayloadCallRecord {
  type: string;
  collection: string;
  details?: string;
  durationMs: number;
  timestamp: number;
}

interface PerfStore {
  sqlQueries: QueryRecord[];
  payloadCalls: PayloadCallRecord[];
  isHooked: boolean;
}

const g = globalThis as unknown as { __PERF_STORE__?: PerfStore };

if (!g.__PERF_STORE__) {
  g.__PERF_STORE__ = {
    sqlQueries: [],
    payloadCalls: [],
    isHooked: false,
  };
}

const store = g.__PERF_STORE__;

if (!store.isHooked) {
  store.isHooked = true;
  const origClientQuery = pg.Client.prototype.query as any;
  pg.Client.prototype.query = function (this: any, ...args: any[]) {
    const start = performance.now();
    const sqlText = typeof args[0] === "string" ? args[0] : args[0]?.text || "";
    const result = origClientQuery.apply(this, args);

    if (result && typeof result.then === "function") {
      return result.then(
        (res: any) => {
          const duration = performance.now() - start;
          store.sqlQueries.push({
            sql: sqlText.trim(),
            durationMs: Math.round(duration * 100) / 100,
            timestamp: Date.now(),
          });
          return res;
        },
        (err: any) => {
          const duration = performance.now() - start;
          store.sqlQueries.push({
            sql: `[ERROR] ${sqlText.trim()}`,
            durationMs: Math.round(duration * 100) / 100,
            timestamp: Date.now(),
          });
          throw err;
        },
      );
    }
    const duration = performance.now() - start;
    store.sqlQueries.push({
      sql: sqlText.trim(),
      durationMs: Math.round(duration * 100) / 100,
      timestamp: Date.now(),
    });
    return result;
  } as any;
}

export function recordPayloadCall(
  type: string,
  collection: string,
  durationMs: number,
  details?: string,
) {
  store.payloadCalls.push({
    type,
    collection,
    details,
    durationMs: Math.round(durationMs * 100) / 100,
    timestamp: Date.now(),
  });
}

export function resetPerfStore() {
  store.sqlQueries = [];
  store.payloadCalls = [];
}

export function getPerfSnapshot() {
  const sql = [...store.sqlQueries];
  const payload = [...store.payloadCalls];

  // Group duplicate SQL queries
  const duplicates: Record<string, number> = {};
  for (const q of sql) {
    // Normalize parameter placeholders/whitespace for comparison
    const norm = q.sql.replace(/\s+/g, " ");
    duplicates[norm] = (duplicates[norm] || 0) + 1;
  }
  const duplicateQueries = Object.entries(duplicates)
    .filter(([, count]) => count > 1)
    .map(([sqlText, count]) => ({ count, sql: sqlText }));

  const slowestSql = [...sql].sort((a, b) => b.durationMs - a.durationMs).slice(0, 5);
  const totalSqlDurationMs = sql.reduce((sum, q) => sum + q.durationMs, 0);

  return {
    sqlCount: sql.length,
    payloadCount: payload.length,
    totalSqlDurationMs: Math.round(totalSqlDurationMs * 100) / 100,
    duplicateQueries,
    slowestSql,
    sqlQueries: sql,
    payloadCalls: payload,
  };
}

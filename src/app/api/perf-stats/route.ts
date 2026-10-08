import { NextResponse } from "next/server";
import { getPerfSnapshot, resetPerfStore } from "@/lib/perf-profiler";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "reset") {
    resetPerfStore();
    return NextResponse.json({ ok: true, reset: true });
  }

  const snapshot = getPerfSnapshot();
  return NextResponse.json(snapshot);
}

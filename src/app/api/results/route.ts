import { NextResponse } from "next/server";
import { initDb, query } from "@/lib/db";
import type { TestResult } from "@/lib/types";

export async function GET() {
  try {
    await initDb();
    const rows = await query("SELECT cadet_id, data FROM app_results");
    const results: Record<string, TestResult> = {};
    for (const row of rows) {
      results[row.cadet_id as string] = row.data as TestResult;
    }
    return NextResponse.json(results);
  } catch (err) {
    console.error("[api/results GET]", err);
    return NextResponse.json({});
  }
}

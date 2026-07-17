import { NextResponse } from "next/server";
import { initDb, getDb } from "@/lib/db";
import type { TestResult } from "@/lib/types";

export async function GET() {
  try {
    await initDb();
    const sql = getDb();
    const rows = await sql`SELECT cadet_id, data FROM app_results`;
    const results: Record<string, TestResult> = {};
    for (const row of rows) {
      results[row.cadet_id] = row.data as TestResult;
    }
    return NextResponse.json(results);
  } catch (err) {
    console.error("[api/results GET]", err);
    return NextResponse.json({});
  }
}

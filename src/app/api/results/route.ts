import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import type { TestResult } from "@/lib/types";

// GET /api/results — คืน Record<cadetId, TestResult> ทั้งหมด
export async function GET() {
  try {
    await initDb();
    const { rows } = await sql`SELECT cadet_id, data FROM app_results`;
    const results: Record<string, TestResult> = {};
    for (const row of rows) {
      results[row.cadet_id] = row.data as TestResult;
    }
    return NextResponse.json(results);
  } catch (err) {
    console.error("[api/results GET]", err);
    // DB ยังไม่ได้ connect — คืน object ว่างให้ app ใช้ค่า local ได้
    return NextResponse.json({});
  }
}

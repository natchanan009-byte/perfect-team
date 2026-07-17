import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import type { CriteriaConfig } from "@/lib/types";

// GET /api/criteria — คืน CriteriaConfig ปัจจุบัน (null ถ้ายังไม่มีใน DB)
export async function GET() {
  try {
    await initDb();
    const { rows } = await sql`SELECT data FROM app_criteria WHERE id = 1`;
    if (rows.length === 0) return NextResponse.json(null);
    return NextResponse.json(rows[0].data as CriteriaConfig);
  } catch (err) {
    console.error("[api/criteria GET]", err);
    return NextResponse.json(null);
  }
}

// PUT /api/criteria — upsert เกณฑ์ใหม่
export async function PUT(request: Request) {
  try {
    await initDb();
    const data: CriteriaConfig = await request.json();
    await sql`
      INSERT INTO app_criteria (id, data, updated_at)
      VALUES (1, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/criteria PUT]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

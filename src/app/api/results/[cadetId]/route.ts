import { NextResponse } from "next/server";
import { initDb, getDb } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { cadetId: string } }
) {
  try {
    await initDb();
    const sql = getDb();
    const data = await request.json();
    await sql`
      INSERT INTO app_results (cadet_id, data, updated_at)
      VALUES (${params.cadetId}, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (cadet_id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/results PUT]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { cadetId: string } }
) {
  try {
    await initDb();
    const sql = getDb();
    await sql`DELETE FROM app_results WHERE cadet_id = ${params.cadetId}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/results DELETE]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

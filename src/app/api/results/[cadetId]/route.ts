import { NextResponse } from "next/server";
import { initDb, query } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { cadetId: string } }
) {
  try {
    await initDb();
    const data = await request.json();
    await query(
      `INSERT INTO app_results (cadet_id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (cadet_id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [params.cadetId, JSON.stringify(data)]
    );
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
    await query("DELETE FROM app_results WHERE cadet_id = $1", [params.cadetId]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/results DELETE]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

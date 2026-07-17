import { NextResponse } from "next/server";
import { initDb, query } from "@/lib/db";
import type { Cadet } from "@/lib/types";

export async function GET() {
  try {
    await initDb();
    const rows = await query(
      "SELECT data FROM app_cadets ORDER BY (data->>'order')::int ASC"
    );
    return NextResponse.json(rows.map((r) => r.data as Cadet));
  } catch (err) {
    console.error("[api/cadets GET]", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const cadets: Cadet[] = await request.json();
    if (!Array.isArray(cadets) || cadets.length === 0) {
      return NextResponse.json({ ok: false, error: "body must be a non-empty Cadet[]" }, { status: 400 });
    }
    for (const cadet of cadets) {
      await query(
        `INSERT INTO app_cadets (cadet_id, data, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (cadet_id)
         DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
        [cadet.id, JSON.stringify(cadet)]
      );
    }
    return NextResponse.json({ ok: true, imported: cadets.length });
  } catch (err) {
    console.error("[api/cadets POST]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

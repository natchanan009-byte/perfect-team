import { NextResponse } from "next/server";
import { initDb, getDb } from "@/lib/db";
import { computeResult } from "@/lib/scoring";
import { DEFAULT_CRITERIA } from "@/lib/default-criteria";
import type { StationId } from "@/lib/types";

export async function PUT(
  request: Request,
  { params }: { params: { cadetId: string } }
) {
  try {
    await initDb();
    const sql = getDb();
    const rawScores: Partial<Record<StationId, number | null>> = await request.json();

    const rows = await sql`SELECT data FROM app_criteria WHERE id = 1`;
    const criteria = rows.length > 0 ? rows[0].data : DEFAULT_CRITERIA;

    const result = computeResult(criteria, rawScores);
    const fullResult = {
      ...result,
      cadetId: params.cadetId,
      evaluatedAt: new Date().toISOString(),
      criteriaVersion: criteria.version ?? 1,
    };

    await sql`
      INSERT INTO app_results (cadet_id, data, updated_at)
      VALUES (${params.cadetId}, ${JSON.stringify(fullResult)}, NOW())
      ON CONFLICT (cadet_id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;

    return NextResponse.json({
      ok: true,
      cadetId: params.cadetId,
      status: result.status,
      totalScore: result.totalScore,
      averagePercent: result.averagePercent,
    });
  } catch (err) {
    console.error("[api/results/raw PUT]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

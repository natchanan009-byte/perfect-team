import { sql } from "@vercel/postgres";

/**
 * สร้างตารางถ้ายังไม่มี (idempotent — เรียกซ้ำได้ปลอดภัย)
 * app_results  : ผลคะแนนแต่ละ นรต. (1 row / คน)
 * app_criteria : เกณฑ์การให้คะแนน (1 row เสมอ, id = 1)
 */
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_results (
      cadet_id   TEXT        PRIMARY KEY,
      data       JSONB       NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS app_criteria (
      id         INTEGER     PRIMARY KEY DEFAULT 1,
      data       JSONB       NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

import { neon } from "@neondatabase/serverless";

/**
 * สร้าง SQL client จาก POSTGRES_URL (set อัตโนมัติโดย Vercel เมื่อ connect Neon DB)
 * ใช้ HTTP transport — ทำงานได้ใน serverless / edge environment
 */
function getDb() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL env var is not set");
  return neon(url);
}

/**
 * สร้างตารางถ้ายังไม่มี (idempotent — เรียกซ้ำได้ปลอดภัย)
 */
export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS app_cadets (
      cadet_id   TEXT        PRIMARY KEY,
      data       JSONB       NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
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

export { getDb };

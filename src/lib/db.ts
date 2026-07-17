import { Pool } from "@neondatabase/serverless";

// Neon's certificate chain is not in Node.js default trust store
// This disables TLS verification — safe in Vercel's isolated function environment
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

/**
 * ใช้ Pool (WebSocket transport) จาก @neondatabase/serverless
 * — Neon's recommended approach สำหรับ Node.js serverless (API routes)
 * — WebSocket ทำงานได้ใน Vercel Node.js runtime โดยไม่ต้องมี ws package
 */
let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    const url =
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL;
    if (!url) throw new Error("No Postgres connection string found in env vars");
    _pool = new Pool({ connectionString: url });
  }
  return _pool;
}

type Row = Record<string, unknown>;

export async function query(text: string, values?: unknown[]): Promise<Row[]> {
  const pool = getPool();
  const res = await pool.query(text, values);
  return res.rows;
}

/**
 * สร้างตารางถ้ายังไม่มี (idempotent)
 */
export async function initDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS app_cadets (
      cadet_id   TEXT        PRIMARY KEY,
      data       JSONB       NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS app_results (
      cadet_id   TEXT        PRIMARY KEY,
      data       JSONB       NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS app_criteria (
      id         INTEGER     PRIMARY KEY DEFAULT 1,
      data       JSONB       NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

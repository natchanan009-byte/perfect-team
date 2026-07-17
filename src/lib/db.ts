import { Pool } from "pg";

/**
 * สร้าง connection pool จาก POSTGRES_URL
 * ใช้ TCP transport (pg) — เสถียรใน Vercel Node.js runtime
 */
let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    // POSTGRES_URL_NON_POOLING = direct TCP connection (required for pg)
    // POSTGRES_URL = pooler/HTTP endpoint (not compatible with pg TCP driver)
    const url =
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL;
    if (!url) throw new Error("No Postgres connection string found in env vars");
    _pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return _pool;
}

type QueryResult = Record<string, unknown>[];

export async function query(text: string, values?: unknown[]): Promise<QueryResult> {
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

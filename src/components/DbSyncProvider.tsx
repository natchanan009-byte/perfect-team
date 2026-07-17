"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { CriteriaConfig, TestResult } from "@/lib/types";

/**
 * DbSyncProvider — เชื่อม Zustand store กับ Vercel Postgres
 *
 * 1. Mount: ดึงข้อมูลจาก DB → hydrate store (DB = source of truth สำหรับ multi-device)
 * 2. Subscribe: เมื่อ results หรือ criteria เปลี่ยน → push ไป API ทันที (optimistic)
 *
 * ถ้า DB ยังไม่ได้ connect (ไม่มี POSTGRES_URL) API จะคืน {} / null
 * และ store จะใช้ค่าจาก localStorage ต่อไปได้ปกติ
 */
export function DbSyncProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const loaded = useRef(false);

  // ── 1. โหลดจาก DB ครั้งแรก ────────────────────────────────────
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    async function loadFromDb() {
      try {
        const [resultsRes, criteriaRes] = await Promise.all([
          fetch("/api/results"),
          fetch("/api/criteria"),
        ]);
        const dbResults: Record<string, TestResult> = await resultsRes.json();
        const dbCriteria: CriteriaConfig | null = await criteriaRes.json();
        hydrate(dbResults, dbCriteria);
      } catch {
        // DB ยังไม่พร้อม (dev local / DB ไม่ได้ต่อ) — ใช้ localStorage ต่อ
        console.warn("[DbSync] ไม่สามารถโหลดจาก DB ได้ ใช้ข้อมูล local แทน");
      }
    }

    loadFromDb();
  }, [hydrate]);

  // ── 2. Sync results → DB เมื่อมีการเปลี่ยนแปลง ─────────────────
  useEffect(() => {
    let prev = useAppStore.getState().results;

    return useAppStore.subscribe((state) => {
      const curr = state.results;
      if (curr === prev) return;

      // upsert เฉพาะ cadet ที่เปลี่ยน
      for (const cadetId of Object.keys(curr)) {
        if (curr[cadetId] !== prev[cadetId]) {
          fetch(`/api/results/${cadetId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(curr[cadetId]),
          }).catch((e) => console.error("[DbSync] results PUT failed", e));
        }
      }

      // ลบ cadet ที่ถูกลบออกจาก store
      for (const cadetId of Object.keys(prev)) {
        if (!(cadetId in curr)) {
          fetch(`/api/results/${cadetId}`, { method: "DELETE" }).catch((e) =>
            console.error("[DbSync] results DELETE failed", e)
          );
        }
      }

      prev = curr;
    });
  }, []);

  // ── 3. Sync criteria → DB เมื่อมีการเปลี่ยนแปลง ────────────────
  useEffect(() => {
    let prev = useAppStore.getState().criteria;

    return useAppStore.subscribe((state) => {
      const curr = state.criteria;
      if (curr === prev) return;

      fetch("/api/criteria", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(curr),
      }).catch((e) => console.error("[DbSync] criteria PUT failed", e));

      prev = curr;
    });
  }, []);

  return <>{children}</>;
}

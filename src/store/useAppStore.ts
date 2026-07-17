"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cadet, CriteriaConfig, TestResult } from "@/lib/types";
import { DEFAULT_CRITERIA } from "@/lib/default-criteria";
import { MOCK_CADETS } from "@/lib/mock-data";

interface AppState {
  // หมายเหตุ: auth จัดการแยกใน AuthProvider (context) — store นี้เก็บเฉพาะ domain data

  // --- เกณฑ์การให้คะแนน (ปรับได้ในหน้า Settings) ---
  criteria: CriteriaConfig;
  setCriteria: (criteria: CriteriaConfig) => void;
  resetCriteria: () => void;

  // --- ข้อมูล นรต. ---
  cadets: Cadet[];
  setCadets: (cadets: Cadet[]) => void;

  // --- ผลทดสอบที่บันทึกแล้ว (key = cadetId) ---
  results: Record<string, TestResult>;
  saveResult: (result: TestResult & { cadetId: string }) => void;
  deleteResult: (cadetId: string) => void;

  // --- sync จาก DB (DbSyncProvider เรียกตอน mount) ---
  hydrate: (
    dbResults: Record<string, TestResult>,
    dbCriteria: CriteriaConfig | null,
    dbCadets: Cadet[]
  ) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      criteria: DEFAULT_CRITERIA,
      setCriteria: (criteria) => set({ criteria }),
      resetCriteria: () => set({ criteria: DEFAULT_CRITERIA }),

      cadets: MOCK_CADETS,
      setCadets: (cadets) => set({ cadets }),

      results: {},
      saveResult: (result) =>
        set((state) => ({
          results: { ...state.results, [result.cadetId]: result },
        })),
      deleteResult: (cadetId) =>
        set((state) => {
          const { [cadetId]: _removed, ...rest } = state.results;
          return { results: rest };
        }),

      hydrate: (dbResults, dbCriteria, dbCadets) =>
        set((state) => ({
          results:
            Object.keys(dbResults).length > 0 ? dbResults : state.results,
          criteria: dbCriteria ?? state.criteria,
          // ถ้า DB มีรายชื่อ ใช้ DB; ไม่งั้นใช้ mock-data เดิม
          cadets: dbCadets.length > 0 ? dbCadets : state.cadets,
        })),
    }),
    {
      name: "fitness-test-store",
      // เก็บ criteria และ results ไว้ใน localStorage
      partialize: (state) => ({
        criteria: state.criteria,
        results: state.results,
      }),
    }
  )
);

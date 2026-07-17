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

  // --- ผลทดสอบที่บันทึกแล้ว (key = cadetId) ---
  results: Record<string, TestResult>;
  saveResult: (result: TestResult & { cadetId: string }) => void;
  deleteResult: (cadetId: string) => void;

  // --- sync จาก DB (DbSyncProvider เรียกตอน mount) ---
  hydrate: (
    dbResults: Record<string, TestResult>,
    dbCriteria: CriteriaConfig | null
  ) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      criteria: DEFAULT_CRITERIA,
      setCriteria: (criteria) => set({ criteria }),
      resetCriteria: () => set({ criteria: DEFAULT_CRITERIA }),

      cadets: MOCK_CADETS,

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

      hydrate: (dbResults, dbCriteria) =>
        set((state) => ({
          // DB = source of truth; ถ้า DB ว่าง (ครั้งแรก) ใช้ค่า local ต่อ
          results:
            Object.keys(dbResults).length > 0 ? dbResults : state.results,
          criteria: dbCriteria ?? state.criteria,
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

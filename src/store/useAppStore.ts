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

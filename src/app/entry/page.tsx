"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ChevronRight, Circle, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { STATUS_META } from "@/lib/scoring";
import { AppHeader } from "@/components/AppHeader";

export default function EntrySearchPage() {
  const router = useRouter();
  const cadets = useAppStore((s) => s.cadets);
  const results = useAppStore((s) => s.results);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cadets;
    return cadets.filter((c) => {
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      return (
        name.includes(q) ||
        c.order.toString().includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    });
  }, [cadets, query]);

  const doneCount = Object.keys(results).length;

  return (
    <div className="min-h-dvh bg-slate-50 pb-10">
      <AppHeader title="บันทึกคะแนนหน้างาน" subtitle="เลือกรายชื่อ นรต. เพื่อกรอกคะแนน" />

      <main className="mx-auto max-w-2xl px-4">
        {/* แถบค้นหา (sticky ให้กดง่ายบนมือถือ) */}
        <div className="sticky top-2 z-10 -mt-6">
          <div className="glass rounded-2xl p-2 shadow-lg shadow-slate-900/5">
            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหา เลขลำดับ / ชื่อ-นามสกุล / กองร้อย"
                inputMode="search"
                className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* สรุปความคืบหน้า */}
        <div className="mt-4 flex items-center justify-between px-1 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            ทั้งหมด {cadets.length} คน
          </span>
          <span className="font-medium text-brand-accent">
            บันทึกแล้ว {doneCount}/{cadets.length}
          </span>
        </div>

        {/* รายชื่อ */}
        <ul className="mt-3 space-y-2.5">
          {filtered.map((c, i) => {
            const result = results[c.id];
            const meta = result ? STATUS_META[result.status] : null;
            return (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <button
                  onClick={() => router.push(`/entry/${c.id}`)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3.5 text-left shadow-sm transition-all active:scale-[0.99] active:bg-slate-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">
                    {c.order}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{c.company}</p>
                  </div>

                  {result ? (
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold tabular-nums text-slate-900">
                        {result.totalScore}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                        style={{ backgroundColor: meta?.color }}
                      >
                        {meta?.label}
                      </span>
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}

                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-active:translate-x-0.5" />
                </button>
              </motion.li>
            );
          })}

          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-slate-300 bg-white/50 py-12 text-center text-slate-400">
              ไม่พบรายชื่อที่ค้นหา
            </li>
          )}
        </ul>
      </main>
    </div>
  );
}

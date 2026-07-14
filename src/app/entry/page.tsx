"use client";

import { memo, useMemo, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Circle, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { STATUS_META } from "@/lib/scoring";
import type { Cadet, TestResult } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { EmblemWatermark } from "@/components/EmblemWatermark";

// ── CadetRow แยกเป็น component + memo ────────────────────────────────────────
// memo ป้องกันการ re-render ทุก row เมื่อ results ของคนอื่นเปลี่ยน
const CadetRow = memo(function CadetRow({
  cadet,
  result,
  onClick,
}: {
  cadet: Cadet;
  result: TestResult | undefined;
  onClick: () => void;
}) {
  const meta = result ? STATUS_META[result.status] : null;

  return (
    <li>
      <button
        onClick={onClick}
        className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3.5 text-left shadow-sm transition-all active:scale-[0.99] active:bg-slate-50"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">
          {cadet.studentCode ?? cadet.order}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">
            {cadet.firstName} {cadet.lastName}
          </p>
          <p className="text-sm text-slate-500">{cadet.company}</p>
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
    </li>
  );
});

// ── หน้าหลัก ─────────────────────────────────────────────────────────────────
export default function EntrySearchPage() {
  const router = useRouter();
  const cadets = useAppStore((s) => s.cadets);
  const results = useAppStore((s) => s.results);

  const [query, setQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  // useTransition: ทำให้การพิมพ์ไม่บล็อก UI — React จะ render list ในพื้นหลัง
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    startTransition(() => setQuery(value));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cadets;
    return cadets.filter((c) => {
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      return (
        name.includes(q) ||
        c.order.toString().includes(q) ||
        (c.studentCode ?? "").includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    });
  }, [cadets, query]);

  // จัดกลุ่มรายชื่อตามหมวด แล้วเรียงหมวด 1-9
  const groups = useMemo(() => {
    const num = (s: string) => {
      const m = s.match(/\d+/);
      return m ? parseInt(m[0], 10) : 999;
    };
    const map = new Map<string, typeof cadets>();
    for (const c of filtered) {
      const key = c.company || "ไม่ระบุหมวด";
      const arr = map.get(key);
      if (arr) arr.push(c);
      else map.set(key, [c]);
    }
    return Array.from(map.entries())
      .sort((a, b) => num(a[0]) - num(b[0]))
      .map(([company, members]) => ({ company, members }));
  }, [filtered]);

  const doneCount = Object.keys(results).length;

  // รายชื่อหมวดทั้งหมด (ดึงจาก cadets ดิบ ไม่กรองตาม search)
  const allCompanies = useMemo(() => {
    const num = (s: string) => {
      const m = s.match(/\d+/);
      return m ? parseInt(m[0], 10) : 999;
    };
    const set = new Set(cadets.map((c) => c.company || "ไม่ระบุหมวด"));
    return Array.from(set).sort((a, b) => num(a) - num(b));
  }, [cadets]);

  // กรองกลุ่มตามหมวดที่เลือก (null = แสดงทุกหมวด)
  const displayedGroups = selectedCompany
    ? groups.filter((g) => g.company === selectedCompany)
    : groups;

  return (
    <div className="relative min-h-dvh bg-slate-50 pb-10">
      <EmblemWatermark />
      <AppHeader title="บันทึกคะแนน" subtitle="เลือกรายชื่อ นรต. เพื่อกรอกคะแนน" />

      <main className="relative z-10 mx-auto max-w-2xl px-4">
        {/* แถบค้นหา (sticky ให้กดง่ายบนมือถือ) */}
        <div className="sticky top-2 z-10 -mt-6">
          <div className="glass rounded-2xl p-2 shadow-lg shadow-slate-900/5">
            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
              <Search className={`h-5 w-5 shrink-0 transition-colors ${isPending ? "text-brand-accent" : "text-slate-400"}`} />
              <input
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="ค้นหา ลำดับ / เลขประจำตัว / ชื่อ / หมวด"
                inputMode="search"
                className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* เลือกหมวด */}
        <div
          ref={pillsRef}
          className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2 pe-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            onClick={() => setSelectedCompany(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selectedCompany === null
                ? "bg-brand-navy text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            ทั้งหมด
          </button>
          {allCompanies.map((company) => (
            <button
              key={company}
              onClick={() =>
                setSelectedCompany(selectedCompany === company ? null : company)
              }
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                selectedCompany === company
                  ? "bg-brand-navy text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {company}
            </button>
          ))}
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

        {/* รายชื่อ แยกตามหมวด */}
        <div className="mt-3 space-y-6">
          {displayedGroups.map((group) => (
            <section key={group.company}>
              {/* หัวข้อหมวด */}
              <div className="sticky top-[4.5rem] z-[5] -mx-1 mb-2 flex items-center justify-between rounded-xl bg-slate-50/90 px-3 py-2 backdrop-blur">
                <h2 className="flex items-center gap-2 font-bold text-brand-navy">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-navy text-xs font-bold text-white">
                    {group.company.match(/\d+/)?.[0] ?? "?"}
                  </span>
                  {group.company}
                </h2>
                <span className="rounded-full bg-brand-navy/10 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
                  {group.members.length} คน
                </span>
              </div>

              <ul className="space-y-2.5">
                {group.members.map((c) => (
                  <CadetRow
                    key={c.id}
                    cadet={c}
                    result={results[c.id]}
                    onClick={() => router.push(`/entry/${c.id}`)}
                  />
                ))}
              </ul>
            </section>
          ))}

          {displayedGroups.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 py-12 text-center text-slate-400">
              ไม่พบรายชื่อที่ค้นหา
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

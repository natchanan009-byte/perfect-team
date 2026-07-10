"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardCheck,
  TrendingUp,
  Percent,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  groupResults,
  statusBreakdown,
  stationAverages,
  overallSummary,
} from "@/lib/analytics";
import { AppHeader } from "@/components/AppHeader";
import { StatusPieChart } from "@/components/charts/StatusPieChart";
import { StationBarChart } from "@/components/charts/StationBarChart";

export default function DashboardPage() {
  const router = useRouter();
  const cadets = useAppStore((s) => s.cadets);
  const criteria = useAppStore((s) => s.criteria);
  const results = useAppStore((s) => s.results);

  const summary = useMemo(
    () => overallSummary(cadets, results),
    [cadets, results]
  );
  const groups = useMemo(
    () => groupResults(cadets, results),
    [cadets, results]
  );
  const breakdown = useMemo(() => statusBreakdown(results), [results]);
  const stationAvg = useMemo(
    () => stationAverages(criteria, results),
    [criteria, results]
  );

  // สถานีที่คะแนนเฉลี่ยต่ำสุด (จุดอ่อนที่ควรเน้นฝึก)
  const weakest = useMemo(() => {
    if (summary.tested === 0) return null;
    return stationAvg.reduce((min, s) => (s.avg < min.avg ? s : min));
  }, [stationAvg, summary.tested]);

  return (
    <div className="min-h-dvh bg-slate-50 pb-12">
      <AppHeader
        title="สรุปผลและแบ่งกลุ่ม"
        subtitle="ภาพรวมผลการทดสอบสมรรถภาพร่างกาย"
      />

      <main className="mx-auto max-w-4xl px-4">
        {/* การ์ดสรุป 4 ตัว */}
        <div className="-mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="ทั้งหมด"
            value={summary.total}
            unit="คน"
            delay={0}
          />
          <StatCard
            icon={ClipboardCheck}
            label="ทดสอบแล้ว"
            value={summary.tested}
            unit="คน"
            delay={0.05}
          />
          <StatCard
            icon={TrendingUp}
            label="คะแนนเฉลี่ย"
            value={summary.avgScore}
            unit="/ 600"
            delay={0.1}
          />
          <StatCard
            icon={Percent}
            label="อัตราผ่าน"
            value={summary.passRate}
            unit="%"
            delay={0.15}
            accent
          />
        </div>

        {summary.tested === 0 ? (
          <EmptyState onGo={() => router.push("/entry")} />
        ) : (
          <>
            {/* กราฟ 2 ตัว */}
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <ChartCard title="สัดส่วนผลการทดสอบ" subtitle="ผ่าน / ไม่ผ่าน">
                <StatusPieChart data={breakdown} />
              </ChartCard>
              <ChartCard
                title="คะแนนเฉลี่ยรายสถานี"
                subtitle={
                  weakest
                    ? `จุดอ่อนภาพรวม: ${weakest.short} (${weakest.avg} คะแนน)`
                    : undefined
                }
              >
                <StationBarChart data={stationAvg} />
              </ChartCard>
            </div>

            {/* 3 กลุ่ม */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {groups.map((g, i) => (
                <GroupColumn key={g.key} group={g} delay={i * 0.08} />
              ))}
            </div>
          </>
        )}

        {/* ปุ่มไปหน้า Settings */}
        <button
          onClick={() => router.push("/settings")}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
            <Settings className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">ตั้งค่าเกณฑ์คะแนน</p>
            <p className="text-sm text-slate-500">
              ปรับสูตรคิดคะแนนและเกณฑ์ผ่านของแต่ละสถานี
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </button>
      </main>
    </div>
  );
}

// ── การ์ดสถิติด้านบน ─────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  delay = 0,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  unit?: string;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={
        accent
          ? "rounded-2xl bg-brand-accent p-4 text-white shadow-lg shadow-brand-accent/25"
          : "rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
      }
    >
      <div className="flex items-center gap-2">
        <Icon className={accent ? "h-4 w-4 text-white/80" : "h-4 w-4 text-slate-400"} />
        <span className={accent ? "text-xs text-white/80" : "text-xs text-slate-500"}>
          {label}
        </span>
      </div>
      <p className="mt-2">
        <span
          className={
            accent
              ? "text-3xl font-extrabold tabular-nums"
              : "text-3xl font-extrabold tabular-nums text-brand-navy"
          }
        >
          {value}
        </span>
        {unit && (
          <span
            className={
              accent
                ? "ml-1 text-sm font-medium text-white/70"
                : "ml-1 text-sm font-medium text-slate-400"
            }
          >
            {unit}
          </span>
        )}
      </p>
    </motion.div>
  );
}

// ── กรอบการ์ดกราฟ ────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

// ── คอลัมน์กลุ่ม (Smart Grouping) ────────────────────────────
function GroupColumn({
  group,
  delay = 0,
}: {
  group: import("@/lib/analytics").GroupBucket;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: group.color }}
          />
          <h3 className="font-semibold text-slate-900">{group.label}</h3>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-sm font-bold text-white"
          style={{ backgroundColor: group.color }}
        >
          {group.members.length}
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {group.members.map(({ cadet, result }) => (
          <li
            key={cadet.id}
            className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-600">
              {cadet.order}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
              {cadet.firstName} {cadet.lastName}
            </span>
            <span className="text-sm font-bold tabular-nums text-slate-900">
              {result.totalScore}
            </span>
          </li>
        ))}
        {group.members.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
            ไม่มีในกลุ่มนี้
          </li>
        )}
      </ul>
    </motion.div>
  );
}

// ── สถานะว่าง (ยังไม่มีข้อมูล) ────────────────────────────────
function EmptyState({ onGo }: { onGo: () => void }) {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/60 py-16 text-center">
      <p className="text-slate-500">ยังไม่มีข้อมูลผลการทดสอบ</p>
      <button
        onClick={onGo}
        className="mt-3 rounded-xl bg-brand-accent px-5 py-2.5 font-semibold text-white shadow-md shadow-brand-accent/30 transition active:scale-95"
      >
        เริ่มบันทึกคะแนน
      </button>
    </div>
  );
}

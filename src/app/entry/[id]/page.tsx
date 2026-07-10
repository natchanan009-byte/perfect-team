"use client";

import { useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Save, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { computeResult, STATUS_META } from "@/lib/scoring";
import type { StationId, RawScores } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { Stepper } from "@/components/Stepper";
import { TimeInput } from "@/components/TimeInput";
import { ScoreBadge } from "@/components/ScoreBadge";
import { useCountUp } from "@/hooks/useCountUp";

export default function CadetEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const cadets = useAppStore((s) => s.cadets);
  const criteria = useAppStore((s) => s.criteria);
  const results = useAppStore((s) => s.results);
  const saveResult = useAppStore((s) => s.saveResult);

  const cadet = cadets.find((c) => c.id === id);

  // โหลดค่าเดิมถ้าเคยบันทึกไว้ ไม่งั้นเริ่มว่าง
  const [raw, setRaw] = useState<RawScores>(() => {
    const existing = results[id];
    const base = {} as RawScores;
    for (const st of criteria.stations) {
      base[st.id] = existing
        ? existing.stations.find((s) => s.id === st.id)?.raw ?? null
        : null;
    }
    return base;
  });

  const [saved, setSaved] = useState(false);

  // ⭐ คำนวณ real-time ทุกครั้งที่ raw เปลี่ยน — ใช้ engine ตัวเดียวกับ Dashboard
  const result = useMemo(
    () => computeResult(criteria, raw),
    [criteria, raw]
  );

  const animatedTotal = useCountUp(result.totalScore, 500);

  if (!cadet) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50 p-6 text-center">
        <div>
          <p className="text-slate-500">ไม่พบข้อมูล นรต.</p>
          <button
            onClick={() => router.push("/entry")}
            className="mt-3 text-brand-accent underline"
          >
            กลับหน้าค้นหา
          </button>
        </div>
      </div>
    );
  }

  const setStation = (sid: StationId, value: number | null) => {
    setRaw((prev) => ({ ...prev, [sid]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveResult({
      ...result,
      cadetId: cadet.id,
      evaluatedAt: new Date().toISOString(),
      criteriaVersion: criteria.version,
    });
    setSaved(true);
    setTimeout(() => router.push("/entry"), 900);
  };

  const meta = STATUS_META[result.status];

  return (
    <div className="min-h-dvh bg-slate-50 pb-36">
      <AppHeader
        title={`${cadet.firstName} ${cadet.lastName}`}
        subtitle={`ลำดับ ${cadet.order} · ${cadet.company}`}
        backTo="/entry"
      />

      <main className="mx-auto max-w-2xl px-4">
        {/* การ์ดสรุป real-time */}
        <motion.div
          layout
          className="glass -mt-6 rounded-3xl p-5 shadow-xl shadow-slate-900/10"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-500">คะแนนรวม</p>
              <p className="text-4xl font-extrabold tabular-nums text-brand-navy">
                {Math.round(animatedTotal)}
                <span className="text-lg font-medium text-slate-400">
                  {" "}
                  / {result.maxTotal}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">เฉลี่ย</p>
              <p className="text-2xl font-bold tabular-nums text-brand-accent">
                {result.averagePercent}%
              </p>
            </div>
          </div>

          <div className="mt-4">
            <StatusPill result={result} meta={meta} />
          </div>
        </motion.div>

        {/* 6 สถานี */}
        <div className="mt-5 space-y-3.5">
          {criteria.stations.map((st, i) => {
            const sr = result.stations.find((r) => r.id === st.id)!;
            return (
              <motion.div
                key={st.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {i + 1}. {st.label}
                    </p>
                    <p className="text-xs text-slate-400">
                      หน่วย: {unitLabel(st.unit)} · ผ่านขั้นต่ำ {st.minPassScore}{" "}
                      คะแนน
                    </p>
                  </div>
                  <ScoreBadge
                    score={sr.score}
                    passed={sr.passedStation}
                    hasValue={raw[st.id] !== null}
                  />
                </div>

                {st.unit === "seconds" ? (
                  <TimeInput
                    seconds={raw[st.id]}
                    onChange={(sec) => setStation(st.id, sec)}
                  />
                ) : (
                  <Stepper
                    value={raw[st.id]}
                    step={st.step}
                    unit={unitLabel(st.unit)}
                    onChange={(v) => setStation(st.id, v)}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* แถบบันทึกติดขอบล่าง (thumb-friendly) */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <p className="text-xs text-slate-400">ผลสรุป</p>
            <p
              className="font-bold"
              style={{ color: meta.color }}
            >
              {meta.label}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={!result.complete || saved}
            className="flex min-w-[9rem] items-center justify-center gap-2 rounded-2xl bg-brand-accent px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-accent/30 transition active:scale-95 disabled:opacity-40"
          >
            <AnimatePresence mode="wait" initial={false}>
              {saved ? (
                <motion.span
                  key="ok"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-5 w-5" /> บันทึกแล้ว
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Save className="h-5 w-5" /> บันทึกข้อมูล
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
        {!result.complete && (
          <p className="pb-2 text-center text-xs text-amber-500">
            <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
            กรอกให้ครบทั้ง 6 สถานีก่อนบันทึก
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPill({
  result,
  meta,
}: {
  result: ReturnType<typeof computeResult>;
  meta: { label: string; color: string };
}) {
  if (!result.complete) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-400">
        รอกรอกข้อมูลให้ครบ
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.label}
    </span>
  );
}

function unitLabel(unit: string) {
  return unit === "reps" ? "ครั้ง" : unit === "feet" ? "ฟุต" : "วินาที";
}

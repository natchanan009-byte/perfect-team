"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, RotateCcw, Check, Plus, Trash2, Info } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { AppHeader } from "@/components/AppHeader";
import type { CriteriaConfig, ScorePoint, StationId } from "@/lib/types";
import { scoreForStation, secondsToDisplay } from "@/lib/scoring";

/** clone แบบ deep เพื่อแก้ไขใน local state โดยไม่กระทบ store จนกว่าจะกดบันทึก */
function cloneCriteria(c: CriteriaConfig): CriteriaConfig {
  return JSON.parse(JSON.stringify(c));
}

export default function SettingsPage() {
  const router = useRouter();
  const criteria = useAppStore((s) => s.criteria);
  const setCriteria = useAppStore((s) => s.setCriteria);
  const resetCriteria = useAppStore((s) => s.resetCriteria);

  const [draft, setDraft] = useState<CriteriaConfig>(() => cloneCriteria(criteria));
  const [saved, setSaved] = useState(false);

  const markDirty = () => setSaved(false);

  const updateOverall = (patch: Partial<CriteriaConfig["overall"]>) => {
    setDraft((d) => ({ ...d, overall: { ...d.overall, ...patch } }));
    markDirty();
  };

  const updateStationMin = (id: StationId, minPassScore: number) => {
    setDraft((d) => ({
      ...d,
      stations: d.stations.map((st) =>
        st.id === id ? { ...st, minPassScore } : st
      ),
    }));
    markDirty();
  };

  const updatePoint = (
    id: StationId,
    index: number,
    patch: Partial<ScorePoint>
  ) => {
    setDraft((d) => ({
      ...d,
      stations: d.stations.map((st) =>
        st.id === id
          ? {
              ...st,
              table: st.table.map((p, i) =>
                i === index ? { ...p, ...patch } : p
              ),
            }
          : st
      ),
    }));
    markDirty();
  };

  const addPoint = (id: StationId) => {
    setDraft((d) => ({
      ...d,
      stations: d.stations.map((st) =>
        st.id === id
          ? { ...st, table: [...st.table, { value: 0, score: 0 }] }
          : st
      ),
    }));
    markDirty();
  };

  const removePoint = (id: StationId, index: number) => {
    setDraft((d) => ({
      ...d,
      stations: d.stations.map((st) =>
        st.id === id
          ? { ...st, table: st.table.filter((_, i) => i !== index) }
          : st
      ),
    }));
    markDirty();
  };

  const handleSave = () => {
    // เรียงตารางแต่ละสถานีตาม value ก่อนบันทึก + เพิ่ม version
    const cleaned: CriteriaConfig = {
      ...draft,
      version: draft.version + 1,
      stations: draft.stations.map((st) => ({
        ...st,
        table: [...st.table].sort((a, b) => a.value - b.value),
      })),
    };
    setCriteria(cleaned);
    setDraft(cloneCriteria(cleaned));
    setSaved(true);
  };

  const handleReset = () => {
    resetCriteria();
    // อ่านค่า default กลับมาใส่ draft
    setTimeout(() => {
      const fresh = useAppStore.getState().criteria;
      setDraft(cloneCriteria(fresh));
    }, 0);
    setSaved(false);
  };

  return (
    <div className="min-h-dvh bg-slate-50 pb-32">
      <AppHeader
        title="ตั้งค่าเกณฑ์คะแนน"
        subtitle="ปรับสูตรคิดคะแนนและเกณฑ์ผ่านได้เอง"
        backTo="/dashboard"
      />

      <main className="relative z-10 mx-auto max-w-2xl px-4">
        {/* คำอธิบาย */}
        <div className="glass -mt-6 flex gap-3 rounded-2xl p-4 text-sm text-slate-600 shadow-lg shadow-slate-900/5">
          <Info className="h-5 w-5 shrink-0 text-brand-accent" />
          <p>
            ระบบคิดคะแนนแบบ <b>interpolate เชิงเส้น</b> จากตารางด้านล่าง เช่น
            ถ้าดึงข้อ 8 ครั้ง = 60 คะแนน และ 14 ครั้ง = 80 คะแนน แล้วทำได้ 11
            ครั้ง ระบบจะคำนวณคะแนนกึ่งกลางให้อัตโนมัติ การแก้ไขจะมีผลกับการคำนวณทันทีหลังบันทึก
          </p>
        </div>

        {/* เกณฑ์ภาพรวม */}
        <section className="mt-5 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">เกณฑ์ตัดสินภาพรวม</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="คะแนนเฉลี่ยขั้นต่ำเพื่อ 'ผ่านมาตรฐาน' (%)"
              value={draft.overall.passAveragePercent}
              min={0}
              max={100}
              onChange={(v) => updateOverall({ passAveragePercent: v })}
            />
            <NumberField
              label="คะแนนเฉลี่ยเพื่อจัดเป็น 'ดีเยี่ยม' (%)"
              value={draft.overall.excellentAveragePercent}
              min={0}
              max={100}
              onChange={(v) => updateOverall({ excellentAveragePercent: v })}
            />
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <input
              type="checkbox"
              checked={draft.overall.enforceStationMinimum}
              onChange={(e) =>
                updateOverall({ enforceStationMinimum: e.target.checked })
              }
              className="h-5 w-5 rounded accent-brand-accent"
            />
            <span className="text-sm text-slate-700">
              บังคับเงื่อนไขเฉพาะ: ถ้ามีสถานีใดต่ำกว่าคะแนนขั้นต่ำ ให้ถือว่า
              <b> ไม่ผ่านตามเงื่อนไขเฉพาะ</b> แม้คะแนนเฉลี่ยจะผ่าน
            </span>
          </label>
        </section>

        {/* เกณฑ์รายสถานี */}
        <section className="mt-5 space-y-4">
          {draft.stations.map((st) => (
            <div
              key={st.id}
              className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{st.label}</h3>
                <span className="text-xs text-slate-400">
                  {st.direction === "lower" ? "เวลาน้อย = ดี" : "มาก = ดี"} ·
                  หน่วย {unitLabel(st.unit)}
                </span>
              </div>

              <div className="mt-3">
                <NumberField
                  label="คะแนนขั้นต่ำที่ถือว่าผ่านสถานีนี้"
                  value={st.minPassScore}
                  min={0}
                  max={100}
                  onChange={(v) => updateStationMin(st.id, v)}
                />
              </div>

              {/* ตารางแปลงค่า */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">
                    ตารางแปลงค่า → คะแนน
                  </p>
                  <button
                    onClick={() => addPoint(st.id)}
                    className="flex items-center gap-1 rounded-lg bg-brand-accent/10 px-2.5 py-1 text-xs font-medium text-brand-accent transition active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" /> เพิ่มจุด
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1 pb-1 text-xs text-slate-400">
                  <span>
                    ค่าดิบ ({unitLabel(st.unit)}
                    {st.unit === "seconds" ? " — วินาที" : ""})
                  </span>
                  <span>คะแนน (0-100)</span>
                  <span />
                </div>

                <div className="space-y-2">
                  {st.table.map((pt, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
                    >
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={pt.value}
                          onChange={(e) =>
                            updatePoint(st.id, i, {
                              value: Number(e.target.value),
                            })
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-center font-medium tabular-nums outline-none focus:border-brand-accent"
                        />
                        {st.unit === "seconds" && (
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                            {secondsToDisplay(pt.value)}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={pt.score}
                        onChange={(e) =>
                          updatePoint(st.id, i, {
                            score: Number(e.target.value),
                          })
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-center font-medium tabular-nums outline-none focus:border-brand-accent"
                      />
                      <button
                        onClick={() => removePoint(st.id, i)}
                        disabled={st.table.length <= 2}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition active:scale-95 disabled:opacity-30"
                        aria-label="ลบจุด"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* พรีวิวการคำนวณสด */}
                <PreviewLine station={st} />
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* แถบบันทึก/รีเซ็ต ติดขอบล่าง */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3.5 font-medium text-slate-600 transition active:scale-95"
          >
            <RotateCcw className="h-5 w-5" /> ค่าเริ่มต้น
          </button>
          <button
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-accent px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-accent/30 transition active:scale-95"
          >
            {saved ? (
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Check className="h-5 w-5" /> บันทึกแล้ว
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-5 w-5" /> บันทึกเกณฑ์
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ช่องกรอกตัวเลขพร้อม label ─────────────────────────────────
function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-center text-lg font-bold tabular-nums text-brand-navy outline-none focus:border-brand-accent"
      />
    </label>
  );
}

// ── พรีวิวการคำนวณสด (ตรวจว่าเกณฑ์สมเหตุสมผล) ────────────────
function PreviewLine({
  station,
}: {
  station: CriteriaConfig["stations"][number];
}) {
  const sorted = [...station.table].sort((a, b) => a.value - b.value);
  if (sorted.length === 0) return null;
  // ทดสอบค่ากลางระหว่างจุดต่ำสุด-สูงสุด
  const mid = Math.round((sorted[0].value + sorted[sorted.length - 1].value) / 2);
  const score = scoreForStation(station, mid);
  const shown =
    station.unit === "seconds" ? secondsToDisplay(mid) : `${mid}`;
  return (
    <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
      ตัวอย่าง: ค่า <b className="text-slate-700">{shown}</b> {unitLabel(station.unit)} →{" "}
      <b className="text-brand-accent">{score} คะแนน</b>
    </p>
  );
}

function unitLabel(unit: string) {
  return unit === "reps" ? "ครั้ง" : unit === "feet" ? "ฟุต" : "วินาที";
}

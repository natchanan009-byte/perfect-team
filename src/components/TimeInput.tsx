"use client";

import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface TimeInputProps {
  /** ค่าเป็นวินาที (null = ยังไม่กรอก) */
  seconds: number | null;
  onChange: (seconds: number | null) => void;
}

/**
 * กรอกเวลาวิ่งแบบ นาที : วินาที (เก็บภายในเป็นวินาที)
 * มีปุ่ม +/- ปรับทีละ 1 วินาที และแยกช่องนาที/วินาที
 */
export function TimeInput({ seconds, onChange }: TimeInputProps) {
  const total = seconds ?? 0;
  const mm = Math.floor(total / 60);
  const ss = total % 60;

  const clamp = (n: number) => Math.max(0, Math.min(59 * 60 + 59, n));
  const setMinutes = (m: number) => onChange(clamp(m * 60 + ss));
  const setSeconds = (s: number) => onChange(clamp(mm * 60 + s));

  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        onClick={() => onChange(clamp(total - 1))}
        aria-label="ลดเวลา"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm active:bg-slate-200"
      >
        <Minus className="h-7 w-7" strokeWidth={3} />
      </motion.button>

      <div className="flex flex-1 items-center justify-center gap-1 rounded-2xl border-2 border-slate-200 bg-white px-2">
        <input
          type="number"
          inputMode="numeric"
          value={seconds === null ? "" : mm}
          onChange={(e) =>
            setMinutes(e.target.value === "" ? 0 : Number(e.target.value))
          }
          placeholder="0"
          aria-label="นาที"
          className="h-14 w-16 bg-transparent text-center text-2xl font-bold tabular-nums text-slate-900 outline-none"
        />
        <span className="text-2xl font-bold text-slate-400">:</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          value={seconds === null ? "" : ss.toString().padStart(2, "0")}
          onChange={(e) =>
            setSeconds(
              e.target.value === "" ? 0 : Math.min(59, Number(e.target.value))
            )
          }
          placeholder="00"
          aria-label="วินาที"
          className="h-14 w-16 bg-transparent text-center text-2xl font-bold tabular-nums text-slate-900 outline-none"
        />
        <span className="pr-1 text-sm text-slate-400">น.</span>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        onClick={() => onChange(clamp(total + 1))}
        aria-label="เพิ่มเวลา"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-accent text-white shadow-md shadow-brand-accent/30 active:bg-blue-700"
      >
        <Plus className="h-7 w-7" strokeWidth={3} />
      </motion.button>
    </div>
  );
}

"use client";

import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepperProps {
  value: number | null;
  onChange: (value: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
  /** หน่วยแสดงต่อท้าย เช่น "ครั้ง", "ฟุต" */
  unit?: string;
  className?: string;
}

/**
 * ตัวกรอกจำนวนแบบปุ่ม +/- ขนาดใหญ่ (mobile-first, กดด้วยนิ้วโป้งได้)
 * รองรับการพิมพ์ตัวเลขโดยตรงเพื่อความเร็วหน้างาน
 */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  unit,
  className,
}: StepperProps) {
  const current = value ?? 0;

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const dec = () => onChange(clamp(current - step));
  const inc = () => onChange(clamp(current + step));

  const handleType = (raw: string) => {
    if (raw.trim() === "") {
      onChange(null);
      return;
    }
    const n = Number(raw);
    if (!Number.isNaN(n)) onChange(clamp(n));
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        onClick={dec}
        aria-label="ลด"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm transition-colors active:bg-slate-200"
      >
        <Minus className="h-7 w-7" strokeWidth={3} />
      </motion.button>

      <div className="relative flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={value ?? ""}
          onChange={(e) => handleType(e.target.value)}
          placeholder="0"
          className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white text-center text-2xl font-bold tabular-nums text-slate-900 outline-none transition-colors focus:border-brand-accent"
        />
        {unit && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {unit}
          </span>
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        onClick={inc}
        aria-label="เพิ่ม"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-accent text-white shadow-md shadow-brand-accent/30 transition-colors active:bg-blue-700"
      >
        <Plus className="h-7 w-7" strokeWidth={3} />
      </motion.button>
    </div>
  );
}

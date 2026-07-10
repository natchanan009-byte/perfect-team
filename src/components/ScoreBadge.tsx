"use client";

import { Check, X } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  /** คะแนน 0-100 */
  score: number;
  /** ขนาด: sm สำหรับในการ์ดสถานี, lg สำหรับคะแนนรวม */
  size?: "sm" | "lg";
  /** ผ่านคะแนนขั้นต่ำของสถานีไหม (แสดงไอคอน ✓/✗) */
  passed?: boolean;
  /** มีการกรอกค่าแล้วหรือยัง — ถ้ายัง จะแสดง "–" แทนคะแนน */
  hasValue?: boolean;
  className?: string;
}

/** สีของคะแนนตามช่วง (ไล่จากแดง->น้ำเงิน->ฟ้า) */
function toneForScore(score: number): string {
  if (score >= 80) return "text-cyan-500";
  if (score >= 60) return "text-blue-600";
  if (score >= 50) return "text-amber-500";
  return "text-rose-500";
}

/** คะแนนที่วิ่งขึ้นแบบ real-time เมื่อค่าเปลี่ยน */
export function ScoreBadge({
  score,
  size = "sm",
  passed,
  hasValue = true,
  className,
}: ScoreBadgeProps) {
  const animated = useCountUp(hasValue ? score : 0, 500);
  const shown = Math.round(animated);

  if (!hasValue) {
    return (
      <span
        className={cn(
          "font-bold tabular-nums text-slate-300",
          size === "sm" ? "text-2xl" : "text-5xl",
          className
        )}
      >
        –
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      {passed !== undefined && (
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full",
            passed ? "bg-cyan-100 text-cyan-600" : "bg-rose-100 text-rose-500"
          )}
        >
          {passed ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          ) : (
            <X className="h-3.5 w-3.5" strokeWidth={3} />
          )}
        </span>
      )}
      <span
        className={cn(
          "font-bold tabular-nums transition-colors",
          size === "sm" ? "text-2xl" : "text-5xl",
          toneForScore(score),
          className
        )}
      >
        {shown}
      </span>
    </span>
  );
}

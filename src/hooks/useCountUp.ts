"use client";

import { useEffect, useRef, useState } from "react";

/**
 * แอนิเมชันตัวเลขวิ่งจากค่าเดิม -> ค่าใหม่ (count-up / count-down)
 * ใช้ requestAnimationFrame + ease-out เพื่อความนุ่มนวล
 *
 * @param target  ค่าปลายทาง
 * @param duration ระยะเวลา (ms)
 */
export function useCountUp(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = target;
    if (from === to) return;

    startRef.current = null;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const value = from + (to - from) * easeOutCubic(progress);
      setDisplay(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // เก็บค่าล่าสุดไว้เป็นจุดเริ่มครั้งถัดไป
      fromRef.current = target;
    };
  }, [target, duration]);

  return display;
}

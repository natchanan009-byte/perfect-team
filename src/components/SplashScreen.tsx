"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";

/** sessionStorage key — splash จะไม่แสดงซ้ำในรอบ session เดียวกัน */
const SESSION_KEY = "nrt83-splash-shown";

/** cubic-bezier สำหรับ slide-up exit — ความเร็วแบบ iOS system animation */
const EASE_SLIDE: [number, number, number, number] = [0.76, 0, 0.24, 1];

export function SplashScreen() {
  // shouldRender: false → ไม่ render เลย (SSR-safe + session ที่ผ่านมาแล้ว)
  const [shouldRender, setShouldRender] = useState(false);
  // show: ควบคุม AnimatePresence — false จะ trigger exit animation
  const [show, setShow] = useState(true);

  useEffect(() => {
    // เช็ค session ก่อน: ถ้าเคยดูแล้วในรอบนี้ → ข้ามทันที
    if (sessionStorage.getItem(SESSION_KEY)) return;

    setShouldRender(true);

    // เล่น intro ~2.8s แล้วเริ่ม exit
    const exitTimer = setTimeout(() => setShow(false), 2800);
    return () => clearTimeout(exitTimer);
  }, []);

  // บันทึก session หลัง exit animation เสร็จสมบูรณ์
  const handleExitComplete = () => sessionStorage.setItem(SESSION_KEY, "1");

  if (!shouldRender) return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#0F172A]"
          // Exit: slide ขึ้นด้านบนเผย content ด้านหลัง
          exit={{ y: "-100%", transition: { duration: 0.7, ease: EASE_SLIDE } }}
        >
          {/* ─── Aura glow background ─── */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* วงใหญ่ blue */}
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
            {/* วงเล็ก cyan เข้มกว่า */}
            <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/25 blur-[80px]" />
          </motion.div>

          {/* ─── Logo ─── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
          >
            <Logo size={96} />
          </motion.div>

          {/* ─── Title + shimmer sweep ─── */}
          <motion.div
            className="mt-7 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.65 }}
          >
            <div className="relative inline-block overflow-hidden">
              <h1 className="text-[1.35rem] font-bold leading-snug tracking-wide text-white">
                ระบบทดสอบสมรรถภาพร่างกาย
              </h1>

              {/* Shimmer line วิ่งผ่านตัวอักษร */}
              <motion.span
                aria-hidden
                className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                initial={{ x: "-110%" }}
                animate={{ x: "210%" }}
                transition={{ duration: 0.85, ease: "easeInOut", delay: 1.15 }}
              />
            </div>

            {/* Subtitle */}
            <motion.p
              className="mt-1.5 text-sm font-semibold tracking-[0.3em] text-cyan-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.95 }}
            >
              ดิจิทัล · นรต. รุ่น 83
            </motion.p>
          </motion.div>

          {/* ─── Progress bar ติดขอบล่าง ─── */}
          <div className="absolute bottom-12 h-[2px] w-36 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 2.2, ease: "easeInOut", delay: 0.35 }}
            />
          </div>

          {/* ─── เส้นขอบบน (decorative) ─── */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

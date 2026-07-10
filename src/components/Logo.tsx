"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size,
}: {
  className?: string;
  /** ขนาดพิกเซล (ถ้าไม่ส่ง ใช้ className คุมขนาดแทน) */
  size?: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 14 }}
      className={cn("relative", className)}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Glow ring */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full bg-brand-cyan/30 blur-2xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 120 120" className="relative h-full w-full drop-shadow-lg">
        <defs>
          <linearGradient id="shield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="wing" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        {/* Shield */}
        <path
          d="M60 8 L104 24 V60 C104 88 84 106 60 114 C36 106 16 88 16 60 V24 Z"
          fill="url(#shield)"
          stroke="#06B6D4"
          strokeWidth="2"
        />
        {/* Inner emblem — stylized wings + star */}
        <path d="M28 58 Q44 50 58 58 Q44 60 28 62 Z" fill="url(#wing)" opacity="0.9" />
        <path d="M92 58 Q76 50 62 58 Q76 60 92 62 Z" fill="url(#wing)" opacity="0.9" />
        <path
          d="M60 34 l5.5 11.5 12.5 1.8 -9 8.9 2.2 12.6 -11.2 -6 -11.2 6 2.2 -12.6 -9 -8.9 12.5 -1.8 Z"
          fill="#F8FAFC"
        />
        <text
          x="60"
          y="98"
          textAnchor="middle"
          fill="#F8FAFC"
          fontSize="13"
          fontWeight="700"
          letterSpacing="1"
        >
          นรต.
        </text>
      </svg>
    </motion.div>
  );
}

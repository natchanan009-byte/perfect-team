"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  interactive?: boolean;
}

export function GlassCard({
  interactive = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={interactive ? { scale: 1.02, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl",
        "shadow-[0_8px_32px_-8px_rgba(15,23,42,0.15)]",
        interactive && "cursor-pointer hover:shadow-[0_16px_48px_-12px_rgba(37,99,235,0.35)]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

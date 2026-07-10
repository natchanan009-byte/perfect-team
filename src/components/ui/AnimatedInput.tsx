"use client";

import { useState, InputHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export const AnimatedInput = forwardRef<HTMLInputElement, Props>(
  ({ label, icon, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="relative">
        <label className="mb-1.5 block text-sm font-medium text-slate-600">
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <span className="pointer-events-none absolute left-3 text-slate-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "h-12 w-full rounded-xl border border-slate-200 bg-white/70 px-4 text-slate-900 outline-none transition-colors placeholder:text-slate-400",
              icon && "pl-10",
              focused && "border-brand-accent/40",
              className
            )}
            {...props}
          />
          {/* Animated focus line */}
          <motion.span
            className="absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-accent to-brand-cyan"
            initial={false}
            animate={{ width: focused ? "100%" : "0%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";

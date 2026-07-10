"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, BarChart3, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Logo } from "./Logo";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** แสดงปุ่มย้อนกลับแทนโลโก้ (ใช้ในหน้ากรอกคะแนนรายคน) */
  backTo?: string;
}

const NAV = [
  { href: "/entry", label: "บันทึกคะแนน", icon: ClipboardList },
  { href: "/dashboard", label: "สรุปผล", icon: BarChart3 },
];

export function AppHeader({ title, subtitle, backTo }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const username = user?.displayName;

  return (
    <header className="relative overflow-hidden bg-brand-navy pb-10 pt-5 text-white">
      {/* แสงพื้นหลังนุ่มๆ */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-4">
        <div className="flex items-center justify-between">
          {backTo ? (
            <button
              onClick={() => router.push(backTo)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur transition active:scale-95"
              aria-label="ย้อนกลับ"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <Logo className="h-10 w-10" />
          )}

          {/* เมนูนำทาง (ซ่อนบนหน้ารายคนที่มี backTo) */}
          {!backTo && (
            <nav className="flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition"
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span
                      className={`relative flex items-center gap-1.5 ${
                        active ? "text-brand-navy" : "text-white/80"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

          {backTo && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm backdrop-blur transition active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              ออก
            </button>
          )}
        </div>

        <div className="mt-5">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>}
          {!backTo && username && (
            <p className="mt-1 text-xs text-white/50">ผู้บันทึก: {username}</p>
          )}
        </div>
      </div>
    </header>
  );
}

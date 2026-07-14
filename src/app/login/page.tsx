"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { User, Lock, LogIn, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AnimatedInput } from "@/components/ui/AnimatedInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(username.trim(), password, remember);
    if (!ok) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    }
    // สำเร็จ -> AuthProvider จะ redirect ไป /dashboard เอง
  }

  return (
    <main className="relative min-h-dvh overflow-hidden flex items-center justify-center px-4 py-8">
      {/* พื้นหลัง gradient + ออร่าเรืองแสง */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-navy" />
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-accent/30 blur-3xl -z-10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl -z-10"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-7 sm:p-9 shadow-2xl">
          {/* โลโก้ + หัวข้อ */}
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 14 }}
            >
              <Logo size={84} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-4 text-xl font-bold text-white tracking-tight"
            >
              ระบบทดสอบสมรรถภาพร่างกาย
            </motion.h1>
            <p className="mt-1 text-sm text-slate-300">
              Digital Physical Fitness Test by -ขันตี1480.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatedInput
              label="ชื่อผู้ใช้งาน"
              icon={<User size={18} />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <AnimatedInput
              label="รหัสผ่าน"
              type="password"
              icon={<Lock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-200">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/30 bg-white/10 accent-brand-accent"
                />
                จำการเข้าระบบ
              </label>
              <button
                type="button"
                className="text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-400/30 px-3 py-2 text-sm text-red-200"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              <LogIn size={18} />
              เข้าสู่ระบบ
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}

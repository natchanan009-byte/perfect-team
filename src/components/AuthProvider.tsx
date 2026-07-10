"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthUser {
  username: string;
  displayName: string;
  role: "admin" | "operator";
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "fts_auth";

// Mock auth — ในระบบจริงเปลี่ยนไปเรียก API / NextAuth
async function mockAuthenticate(username: string, password: string): Promise<AuthUser | null> {
  await new Promise((r) => setTimeout(r, 900)); // จำลอง network latency
  if (username === "admin" && password === "1234") {
    return { username, displayName: "ผู้ดูแลระบบ", role: "admin" };
  }
  if (username === "operator" && password === "1234") {
    return { username, displayName: "ครูฝึกสถานี", role: "operator" };
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // โหลด session จาก storage ตอนเปิดแอป
  useEffect(() => {
    const raw =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    setLoading(false);
  }, []);

  // Route protection
  useEffect(() => {
    if (loading) return;
    const isLoginPage = pathname === "/login";
    if (!user && !isLoginPage) {
      router.replace("/login");
    } else if (user && isLoginPage) {
      router.replace("/dashboard");
    }
  }, [user, loading, pathname, router]);

  const login = async (username: string, password: string, remember: boolean) => {
    const authed = await mockAuthenticate(username, password);
    if (!authed) return false;
    setUser(authed);
    const store = remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(authed));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

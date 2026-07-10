"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [loading, user, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-brand-navy">
      <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-cyan-400 animate-spin" />
    </div>
  );
}

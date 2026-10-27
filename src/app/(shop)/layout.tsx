"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MiniCart } from "@/components/MiniCart";
import { DemoBanner, LiveModeBlocker } from "@/components/shell";
import { IS_MOCK } from "@/lib/config";
import { useApp } from "@/lib/store";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { ready, user } = useApp();
  const router = useRouter();
  useEffect(() => { if (ready && !user) router.replace("/login"); }, [ready, user, router]);
  if (!IS_MOCK) return <LiveModeBlocker />;
  if (!ready || !user) return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>;
  return (
    <>
      <DemoBanner />
      <Header />
      <div className="mx-auto min-h-[60vh] max-w-7xl px-4 py-6">{children}</div>
      <Footer />
      <MiniCart />
    </>
  );
}

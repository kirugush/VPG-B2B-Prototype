"use client";
import { LOGIN_BG, VpgLogo } from "./Logo";

export function AuthShell({ title, subtitle, children, wide }: { title: string; subtitle?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-brand-50 p-4" style={{ backgroundImage: `url(${LOGIN_BG})`, backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundSize: "min(70vw, 720px)" }}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-xl bg-white p-6 shadow-2xl sm:p-8`}>
        <div className="mb-5 flex justify-center"><VpgLogo className="h-12" /></div>
        <h1 className="text-center text-xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-center text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

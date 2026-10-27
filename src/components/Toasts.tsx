"use client";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useApp } from "@/lib/store";

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-start gap-2 rounded-md border bg-white p-3 shadow-lg">
          {t.kind === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" /> : t.kind === "error" ? <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" /> : <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />}
          <p className="flex-1 text-sm">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss"><X className="h-4 w-4 text-slate-400" /></button>
        </div>
      ))}
    </div>
  );
}

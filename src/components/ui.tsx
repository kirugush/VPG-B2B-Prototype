"use client";
import { Eye, EyeOff, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { InvoiceStatus, OrderStatus, Stock } from "@/lib/types";

export function PasswordInput({ value, onChange, id, placeholder, autoComplete }: { value: string; onChange: (v: string) => void; id?: string; placeholder?: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} className="input pr-10" type={show ? "text" : "password"} value={value} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-alpha-black-40 p-4" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white p-6 shadow-xl ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const ORDER_COLORS: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};
const INV_COLORS: Record<InvoiceStatus, string> = {
  Paid: "bg-green-100 text-green-800",
  Pending: "bg-amber-100 text-amber-800",
  Overdue: "bg-red-100 text-red-800",
};
export function StatusBadge({ status }: { status: OrderStatus | InvoiceStatus }) {
  const cls = (ORDER_COLORS as Record<string, string>)[status] ?? (INV_COLORS as Record<string, string>)[status];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{status}</span>;
}

export function StatusLegend() {
  const items: [string, string][] = [
    ["Delivered / Paid", "bg-green-500"], ["Pending", "bg-amber-500"], ["Processing", "bg-blue-500"], ["Shipped", "bg-indigo-500"], ["Overdue / Cancelled", "bg-red-500"],
  ];
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
      {items.map(([l, c]) => (<span key={l} className="flex items-center gap-1"><span className={`h-2.5 w-2.5 rounded-full ${c}`} />{l}</span>))}
    </div>
  );
}

export const STOCK_LABEL: Record<Stock, { label: string; cls: string }> = {
  in_stock: { label: "In Stock", cls: "text-green-700" },
  out_of_stock: { label: "Out of Stock", cls: "text-red-600" },
  three_days: { label: "Available in 3 Days", cls: "text-amber-600" },
};

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav className="mt-6 flex items-center justify-center gap-1" aria-label="Pagination">
      <button className="btn-outline px-2" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
          <button onClick={() => onChange(n)} aria-current={n === page} className={`h-9 min-w-9 rounded-md px-2 text-sm font-medium ${n === page ? "bg-brand-600 text-white" : "border bg-white hover:bg-slate-50"}`}>{n}</button>
        </span>
      ))}
      <button className="btn-outline px-2" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
    </nav>
  );
}

export function QtyStepper({ value, min, max, onChange, small }: { value: number; min: number; max: number; onChange: (n: number) => void; small?: boolean }) {
  const h = small ? "h-8" : "h-9";
  return (
    <div className={`inline-flex ${h} items-center overflow-hidden rounded-md border border-slate-300 bg-white`}>
      <button type="button" className="px-2.5 text-lg leading-none hover:bg-slate-100 disabled:opacity-40" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">−</button>
      <input className="w-10 border-x border-slate-300 text-center text-sm outline-none" inputMode="numeric" value={value} onChange={(e) => { const n = parseInt(e.target.value.replace(/\D/g, ""), 10); onChange(isNaN(n) ? min : Math.min(max, Math.max(min, n))); }} aria-label="Quantity" />
      <button type="button" className="px-2.5 text-lg leading-none hover:bg-slate-100 disabled:opacity-40" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Increase quantity">+</button>
    </div>
  );
}

export const money = (n: number) => `$${n.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
export const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("en-AU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/* ---------- Shared states & helpers for the B2B modules ---------- */
export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="card space-y-3 p-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }, (_, c) => <Skeleton key={c} className="h-5" />)}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="card p-10 text-center">
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 text-sm text-gray-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{message}</p>
      {onRetry && <button className="btn-outline mt-3" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function ConfirmDialog({ open, title, body, confirmLabel = "Confirm", danger, onConfirm, onCancel }: { open: boolean; title: string; body: React.ReactNode; confirmLabel?: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="text-sm text-gray-700">{body}</div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-outline" onClick={onCancel}>Cancel</button>
        <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-bold">{title}</h1>{subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function DemoTag({ children = "Demo data" }: { children?: React.ReactNode }) {
  return <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">{children}</span>;
}

const QUOTE_COLORS: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Submitted: "bg-blue-100 text-blue-800",
  "Under Review": "bg-indigo-100 text-indigo-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Expired: "bg-orange-100 text-orange-800",
  Converted: "bg-emerald-100 text-emerald-800",
};
const MISC_COLORS: Record<string, string> = {
  "Awaiting payment": "bg-amber-100 text-amber-800",
  Authorized: "bg-blue-100 text-blue-800",
  Paid: "bg-green-100 text-green-800",
  "Partially refunded": "bg-orange-100 text-orange-800",
  Refunded: "bg-gray-100 text-gray-700",
  Unfulfilled: "bg-amber-100 text-amber-800",
  "Partially fulfilled": "bg-indigo-100 text-indigo-800",
  Fulfilled: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Active: "bg-green-100 text-green-800",
  Invited: "bg-blue-100 text-blue-800",
  Disabled: "bg-gray-200 text-gray-700",
};
export function Pill({ label }: { label: string }) {
  const cls = QUOTE_COLORS[label] ?? MISC_COLORS[label] ?? "bg-gray-100 text-gray-700";
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

export function SortHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
  return (
    <th className="th" aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <button className="inline-flex items-center gap-1 uppercase hover:text-gray-900" onClick={onClick}>{label}<span aria-hidden="true">{active ? (dir === "asc" ? "▲" : "▼") : ""}</span></button>
    </th>
  );
}

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

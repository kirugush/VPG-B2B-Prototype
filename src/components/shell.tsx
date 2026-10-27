"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DATA_MODE, IS_MOCK } from "@/lib/config";

export function DemoBanner() {
  if (!IS_MOCK) return null;
  return (
    <div className="bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900" role="status">
      <b>Demo mode</b> — sample data only. Quotes, orders, credit and invoices shown here are not real transactions. (Switch with <code>NEXT_PUBLIC_DATA_MODE</code>.)
    </div>
  );
}

export function LiveModeBlocker() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-900" role="alert">
        <h1 className="text-lg font-bold">Live mode is not fully configured</h1>
        <p className="mt-2">
          <code>NEXT_PUBLIC_DATA_MODE={DATA_MODE}</code> disables all demo fixtures, and the live BigCommerce / AWS clients for quotes,
          orders, bulk ordering, favorites, invoices and users are not wired yet. To avoid showing fabricated data, the storefront
          is blocked instead of silently falling back to mock data.
        </p>
        <p className="mt-2">Set <code>NEXT_PUBLIC_DATA_MODE=mock</code> to run the demo, or complete the integration steps in <code>ARCHITECTURE.md</code> and <code>PROGRESS.md</code>.</p>
      </div>
    </main>
  );
}

export interface Crumb { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
            {c.href && i < items.length - 1 ? <Link href={c.href} className="hover:text-brand-600 hover:underline">{c.label}</Link> : <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "font-medium text-gray-900" : ""}>{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

const LABELS: Record<string, string> = {
  account: "My Account", quotes: "Quotes", orders: "Orders", "bulk-orders": "Bulk Orders", reorder: "Re-order",
  "shopping-lists": "Favorites", invoices: "Invoices", credit: "Credit & Account Status", users: "Company Users & Permissions",
  "store-locator": "Store Locator", settings: "Account Settings", addresses: "Address", new: "New",
};

export function crumbsFor(path: string): Crumb[] {
  const parts = path.split("/").filter(Boolean);
  const out: Crumb[] = [{ label: "Home", href: "/" }];
  let acc = "";
  parts.forEach((p) => {
    acc += `/${p}`;
    out.push({ label: LABELS[p] ?? decodeURIComponent(p), href: acc });
  });
  return out;
}

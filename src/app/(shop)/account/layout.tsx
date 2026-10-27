"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Building2, CreditCard, FileText, FileSpreadsheet, Heart, LayoutDashboard, LogOut, MapPin, Package, Quote, RotateCcw, Settings, Store, Users } from "lucide-react";
import { Breadcrumbs, crumbsFor } from "@/components/shell";
import { can, permissionForPath, type Permission } from "@/lib/permissions";
import { useApp } from "@/lib/store";

const NAV: { href: string; label: string; icon: typeof Package; perm: Permission | null }[] = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, perm: null },
  { href: "/account/quotes", label: "Quotes", icon: Quote, perm: "quotes" },
  { href: "/account/orders", label: "Orders", icon: Package, perm: "orders" },
  { href: "/account/bulk-orders", label: "Bulk Orders", icon: FileSpreadsheet, perm: "bulk" },
  { href: "/account/reorder", label: "Re-order", icon: RotateCcw, perm: "reorder" },
  { href: "/account/shopping-lists", label: "Favorites", icon: Heart, perm: "favorites" },
  { href: "/account/invoices", label: "Invoices", icon: FileText, perm: "invoices" },
  { href: "/account/credit", label: "Credit & Account Status", icon: CreditCard, perm: "credit" },
  { href: "/account/users", label: "Company Users & Permissions", icon: Users, perm: "users" },
  { href: "/account/store-locator", label: "Store Locator", icon: Store, perm: "locator" },
  { href: "/account/addresses", label: "Address", icon: MapPin, perm: "addresses" },
  { href: "/account/settings", label: "Account Settings", icon: Settings, perm: "settings" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const path = usePathname();
  const router = useRouter();
  // Route guarding by role: only links/actions the user may use are shown, and direct URLs are blocked.
  const need = permissionForPath(path);
  const blocked = !!need && !can(user?.role, need);
  useEffect(() => { if (blocked) router.replace("/account"); }, [blocked, router]);

  const active = (h: string) => (h === "/account" ? path === h : path.startsWith(h));
  if (blocked) return null;
  return (
    <div>
      <Breadcrumbs items={crumbsFor(path)} />
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <nav aria-label="My account" className="card h-fit p-2">
          <p className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500"><Building2 className="h-4 w-4" aria-hidden="true" />{user?.role}</p>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {NAV.filter((i) => !i.perm || can(user?.role, i.perm)).map(({ href, label, icon: I }) => (
              <li key={href} className="shrink-0">
                <Link href={href} aria-current={active(href) ? "page" : undefined} className={`flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${active(href) ? "bg-brand-600 text-white" : "hover:bg-gray-100"}`}><I className="h-4 w-4" aria-hidden="true" />{label}</Link>
              </li>
            ))}
            <li className="shrink-0"><button onClick={() => { logout(); router.push("/login"); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"><LogOut className="h-4 w-4" aria-hidden="true" />Logout</button></li>
          </ul>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

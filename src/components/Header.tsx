"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingCart, Store, User as UserIcon, X } from "lucide-react";
import { VpgLogo } from "./Logo";
import { CATEGORIES, STORE } from "@/mocks/data";
import { can } from "@/lib/permissions";
import { useApp } from "@/lib/store";

export function Header() {
  const { user, company, totals, logout, setMiniCartOpen } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [mega, setMega] = useState(false);
  const [profile, setProfile] = useState(false);
  const [mobile, setMobile] = useState(false);
  const pRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (pRef.current && !pRef.current.contains(e.target as Node)) setProfile(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const go = (href: string) => { setProfile(false); setMega(false); setMobile(false); router.push(href); };
  const menu: [string, string][] = [
    ["My Account Dashboard", "/account"],
    ["Orders", "/account/orders"],
    ...(can(user?.role, "quotes") ? ([["Quotes", "/account/quotes"], ["Bulk Orders", "/account/bulk-orders"], ["Re-order", "/account/reorder"], ["Store Locator", "/account/store-locator"]] as [string, string][]) : []),
    ["Shopping Lists", "/account/shopping-lists"],
    ["Address", "/account/addresses"],
    ...(can(user?.role, "settings") ? ([["Account Settings", "/account/settings"]] as [string, string][]) : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Store strip */}
      <div className="bg-black text-white">
        <div className="mx-auto flex max-w-[1600px] justify-end px-4 py-2 text-xs sm:text-sm">
          <span className="flex items-center gap-2"><Store className="h-4 w-4" />Your store is set to <Link href="/account/addresses" className="underline">{STORE.name}</Link></span>
        </div>
      </div>
      {/* Main bar */}
      <div className="bg-black">
        <div className="mx-auto flex max-w-[1600px] items-stretch gap-3 pr-4">
          <button className="px-3 text-white lg:hidden" onClick={() => setMobile((m) => !m)} aria-label="Menu">{mobile ? <X /> : <Menu />}</button>
          <Link href="/" className="flex shrink-0 items-center bg-white px-4 py-3 sm:px-6"><VpgLogo className="h-8 sm:h-9" /></Link>
          <Link href="/" className="hidden shrink-0 items-center px-2 sm:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={company.logoUrl} alt={`${company.name} logo`} className="h-9 w-auto max-w-[170px] object-contain" />
          </Link>
          <form className="my-2.5 hidden flex-1 md:block" onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`); }} role="search">
            <div className="relative">
              <input value={q} onChange={(e) => setQ(e.target.value)} className="h-10 w-full rounded-full bg-white px-5 pr-12 text-sm text-black outline-none focus:ring-2 focus:ring-brand-400" placeholder="Search by product name or number" aria-label="Search products" />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600" aria-label="Search"><Search className="h-5 w-5" /></button>
            </div>
          </form>
          <div className="ml-auto flex items-center gap-1 text-white md:ml-0">
            <button className="relative rounded-md p-2 hover:bg-white/10" onClick={() => setMiniCartOpen(true)} aria-label={`Cart, ${totals.count} items`}>
              <ShoppingCart className="h-6 w-6" />
              {totals.count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white">{totals.count}</span>}
            </button>
            <div className="relative" ref={pRef}>
              <button className="flex items-center gap-1 rounded-md p-2 hover:bg-white/10" onClick={() => setProfile((p) => !p)} aria-label="Account menu" aria-expanded={profile}>
                <UserIcon className="h-6 w-6" /><span className="hidden text-sm font-medium xl:inline">{user?.firstName}</span><ChevronDown className="h-4 w-4" />
              </button>
              {profile && (
                <div className="absolute right-0 mt-1 w-60 rounded-md border bg-white py-1 text-gray-900 shadow-lg">
                  <div className="border-b px-4 py-2 text-xs text-gray-500">{user?.firstName} {user?.lastName}<br />{user?.role}</div>
                  {menu.map(([l, h]) => (<button key={l} onClick={() => go(h)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50">{l}</button>))}
                  <button onClick={() => { logout(); router.push("/login"); }} className="block w-full border-t px-4 py-2 text-left text-sm text-brand-600 hover:bg-gray-50">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <form className="bg-black px-4 pb-3 md:hidden" onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} className="h-10 w-full rounded-full bg-white px-5 text-sm text-black outline-none" placeholder="Search by product name or number" aria-label="Search products" />
      </form>

      {/* Category nav + mega menu (desktop) */}
      <nav className="hidden border-b bg-white lg:block" onMouseLeave={() => setMega(false)}>
        <div className="mx-auto flex max-w-[1600px] items-stretch justify-between pl-2">
          <div className="flex flex-1 items-center justify-between">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} onMouseEnter={() => setMega(true)} className="px-3 py-3.5 text-sm text-gray-900 hover:text-brand-600">{c.name}</Link>
            ))}
          </div>
          <div className="ml-4 flex items-stretch">
            <Link href="/search?q=" onMouseEnter={() => setMega(false)} className="flex items-center border-l bg-brand-50 px-4 text-sm font-medium text-brand-600 hover:bg-brand-100">New Arrivals</Link>
            <Link href="/search?q=&sort=price_asc" onMouseEnter={() => setMega(false)} className="flex items-center border-l bg-brand-50 px-4 text-sm font-medium text-brand-600 hover:bg-brand-100">Offers</Link>
          </div>
        </div>
        {mega && (
          <div className="absolute left-0 right-0 border-b bg-white text-gray-800 shadow-lg">
            <div className="mx-auto grid max-w-[1600px] grid-cols-3 gap-6 px-6 py-6 xl:grid-cols-4">
              {CATEGORIES.map((c) => (
                <div key={c.slug}>
                  <Link href={`/category/${c.slug}`} onClick={() => setMega(false)} className="font-semibold text-brand-600 hover:underline">{c.name}</Link>
                  <ul className="mt-1 space-y-0.5">{c.children.map((ch) => (<li key={ch}><Link href={`/search?q=${encodeURIComponent(ch.split(" ")[0])}&category=${c.slug}`} onClick={() => setMega(false)} className="text-sm text-gray-600 hover:text-brand-600">{ch}</Link></li>))}</ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {mobile && (
        <nav className="max-h-[70vh] overflow-y-auto border-t bg-white lg:hidden">
          {CATEGORIES.map((c) => (
            <details key={c.slug} className="border-b">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">{c.name}</summary>
              <div className="bg-gray-50 pb-2">
                <button onClick={() => go(`/category/${c.slug}`)} className="block w-full px-6 py-2 text-left text-sm text-brand-600">View all {c.name}</button>
                {c.children.map((ch) => (<button key={ch} onClick={() => go(`/category/${c.slug}`)} className="block w-full px-6 py-2 text-left text-sm">{ch}</button>))}
              </div>
            </details>
          ))}
        </nav>
      )}
    </header>
  );
}

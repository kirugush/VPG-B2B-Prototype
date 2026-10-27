"use client";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { QtyStepper, STOCK_LABEL, money } from "@/components/ui";
import { PRODUCTS } from "@/mocks/data";
import { useApp } from "@/lib/store";

export default function CartPage() {
  const { cart, setQty, removeFromCart, removeMany, totals, coupon, applyCoupon, clearCoupon } = useApp();
  const [sel, setSel] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const lines = cart.map((l) => ({ l, p: PRODUCTS.find((x) => x.id === l.productId)! })).filter((x) => x.p);

  if (lines.length === 0)
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-3 text-xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-slate-500">Add products to your cart to get started.</p>
        <Link href="/search?q=" className="btn-primary mt-5">Browse products</Link>
      </div>
    );
  const all = sel.length === lines.length;
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Shopping Cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card">
          <div className="flex items-center justify-between border-b p-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={all} onChange={() => setSel(all ? [] : lines.map((x) => x.p.id))} /> Select all</label>
            <button className="btn-outline text-red-600" disabled={sel.length === 0} onClick={() => { removeMany(sel); setSel([]); }}><Trash2 className="h-4 w-4" /> Delete Selected</button>
          </div>
          <ul className="divide-y">
            {lines.map(({ l, p }) => {
              const st = STOCK_LABEL[p.stock];
              const unit = p.offerPrice ?? p.price;
              return (
                <li key={p.id} className="flex gap-3 p-4">
                  <input type="checkbox" className="mt-1" aria-label={`Select ${p.title}`} checked={sel.includes(p.id)} onChange={() => setSel((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" className="h-20 w-20 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${p.id}`} className="font-semibold hover:text-brand-600">{p.title}</Link>
                    <p className="line-clamp-2 text-sm text-slate-600">{p.description}</p>
                    <p className="text-xs text-slate-500">SKU {p.sku} · UOM {p.uom} · <span className={st.cls}>{st.label}</span></p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <QtyStepper value={l.qty} min={p.minQty} max={p.maxQty} onChange={(n) => setQty(p.id, n)} />
                      <span className="text-xs text-slate-400">min {p.minQty} / max {p.maxQty}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{money(unit * l.qty)}</p>
                    <p className="text-xs text-slate-500">{money(unit)} / {p.uom}</p>
                    <button onClick={() => { removeFromCart(p.id); setSel((s) => s.filter((x) => x !== p.id)); }} aria-label={`Delete ${p.title}`} className="mt-2 text-slate-400 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="card h-fit space-y-3 p-4">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (applyCoupon(code)) setCode(""); }}>
            <input className="input" placeholder="Gift / discount coupon" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Coupon code" />
            <button className="btn-outline">Apply</button>
          </form>
          {coupon && <p className="flex items-center justify-between rounded bg-green-50 px-2 py-1 text-sm text-green-800">Coupon {coupon} applied <button className="underline" onClick={clearCoupon}>remove</button></p>}
          <dl className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
            {totals.discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount</dt><dd>−{money(totals.discount)}</dd></div>}
            <div className="flex justify-between"><dt>GST (15%)</dt><dd>{money(totals.gst)}</dd></div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
          </dl>
          <Link href="/checkout" className="btn-accent w-full">Continue to Checkout</Link>
        </aside>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { X, Trash2 } from "lucide-react";
import { PRODUCTS } from "@/mocks/data";
import { relatedProducts } from "@/lib/services";
import { useApp } from "@/lib/store";
import { QtyStepper, money } from "./ui";
import { ProductCard } from "./ProductCard";

export function MiniCart() {
  const { miniCartOpen, setMiniCartOpen, cart, setQty, removeFromCart, totals } = useApp();
  if (!miniCartOpen) return null;
  const lines = cart.map((l) => ({ l, p: PRODUCTS.find((x) => x.id === l.productId)! })).filter((x) => x.p);
  const last = lines[lines.length - 1]?.p;
  const related = last ? relatedProducts(last, cart.map((c) => c.productId), 8) : [];
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Mini cart">
      <div className="absolute inset-0 bg-alpha-black-40" onClick={() => setMiniCartOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold">Your Cart ({totals.count})</h2>
          <button onClick={() => setMiniCartOpen(false)} aria-label="Close cart"><X /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? <p className="p-6 text-center text-slate-500">Your cart is empty.</p> : (
            <ul className="divide-y">
              {lines.map(({ l, p }) => (
                <li key={p.id} className="flex gap-3 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" className="h-16 w-16 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${p.id}`} onClick={() => setMiniCartOpen(false)} className="line-clamp-2 text-sm font-semibold hover:text-brand-600">{p.title}</Link>
                    <p className="text-xs text-slate-500">UOM: {p.uom}</p>
                    <p className="text-sm">{p.offerPrice ? (<><span className="font-bold text-accent-600">{money(p.offerPrice)}</span> <span className="text-xs text-slate-400 line-through">{money(p.price)}</span></>) : <span className="font-bold">{money(p.price)}</span>}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <QtyStepper small value={l.qty} min={p.minQty} max={p.maxQty} onChange={(n) => setQty(p.id, n)} />
                      <button onClick={() => removeFromCart(p.id)} aria-label={`Remove ${p.title}`} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {related.length > 0 && (
            <section className="border-t bg-slate-50 p-4">
              <h3 className="mb-2 font-semibold">Related Products</h3>
              <div className="flex snap-x gap-3 overflow-x-auto pb-2">
                {related.map((p) => (<div key={p.id} className="w-48 shrink-0 snap-start"><ProductCard p={p} compact /></div>))}
              </div>
            </section>
          )}
        </div>
        <div className="space-y-2 border-t p-4">
          <div className="flex justify-between text-sm"><span>Subtotal (ex GST)</span><span className="font-bold">{money(totals.subtotal)}</span></div>
          <Link href="/cart" onClick={() => setMiniCartOpen(false)} className="btn-primary w-full">View Cart</Link>
        </div>
      </aside>
    </div>
  );
}

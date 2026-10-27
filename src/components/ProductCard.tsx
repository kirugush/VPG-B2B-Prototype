"use client";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useApp } from "@/lib/store";
import { FavoriteButton } from "./FavoriteButton";
import { QtyStepper, STOCK_LABEL, money } from "./ui";

export function PriceBlock({ p }: { p: Product }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      {p.offerPrice ? (<>
        <span className="text-xl font-extrabold italic text-brand-600">{money(p.offerPrice)}</span>
        <span className="text-sm italic text-gray-400 line-through">{money(p.price)}</span>
      </>) : <span className="text-xl font-extrabold italic">{money(p.price)}</span>}
      <span className="text-xs not-italic text-gray-500">/ {p.uom}</span>
    </div>
  );
}

export function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const { addToCart } = useApp();
  const [qty, setQty] = useState(p.minQty);
  const st = STOCK_LABEL[p.stock];
  return (
    <article className="flex h-full flex-col overflow-hidden border border-gray-200 bg-white">
      <div className="relative">
        <Link href={`/product/${p.id}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.image} alt={p.title} className="aspect-square w-full bg-white object-contain p-4" loading="lazy" /></Link>
        {p.offerPrice && <span className="absolute left-0 top-3 bg-green-700 px-3 py-0.5 text-xs font-bold uppercase text-white">Offer</span>}
        <div className="absolute right-2 top-2"><FavoriteButton productId={p.id} /></div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-4 pt-1">
        <p className={`text-right text-xs font-semibold ${st.cls}`}>{st.label}</p>
        <Link href={`/product/${p.id}`} className="font-medium leading-snug hover:text-brand-600">{p.title}</Link>
        <p className="text-xs text-gray-500">SKU {p.sku}</p>
        {!compact && <p className="line-clamp-2 text-sm text-gray-600">{p.description}</p>}
        <div className="py-2"><QtyStepper value={qty} min={p.minQty} max={p.maxQty} onChange={setQty} small /></div>
      </div>
      <div className="mt-auto flex items-center justify-between bg-gray-100 px-4 py-3">
        <PriceBlock p={p} />
        <button aria-label={`Add ${p.title} to cart`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={p.stock === "out_of_stock"} onClick={() => addToCart(p.id, qty)}><ShoppingCart className="h-5 w-5" /></button>
      </div>
    </article>
  );
}

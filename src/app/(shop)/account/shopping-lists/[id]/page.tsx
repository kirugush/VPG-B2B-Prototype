"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShoppingCart, Trash2 } from "lucide-react";
import { STOCK_LABEL } from "@/components/ui";
import { PRODUCTS } from "@/mocks/data";
import { useApp } from "@/lib/store";

export default function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const { lists, addToCart, addListToCart, removeFromList, toast } = useApp();
  const list = lists.find((l) => l.id === id);
  if (!list) return <div className="card p-8 text-center">List not found. <Link href="/account/shopping-lists" className="text-brand-600 underline">Back</Link></div>;
  const items = list.productIds.map((pid) => PRODUCTS.find((p) => p.id === pid)!).filter(Boolean);
  return (
    <div className="space-y-4">
      <Link href="/account/shopping-lists" className="text-sm text-brand-600 hover:underline">← Back to lists</Link>
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold">{list.name} <span className="text-base font-normal text-slate-500">({items.length} items)</span></h1><button className="btn-primary" disabled={items.length === 0} onClick={() => addListToCart(list.id)}><ShoppingCart className="h-4 w-4" /> Add All to Cart</button></div>
      <ul className="card divide-y">
        {items.map((p) => { const st = STOCK_LABEL[p.stock]; return (
          <li key={p.id} className="flex flex-wrap gap-3 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt="" className="h-20 w-20 rounded object-cover" />
            <div className="min-w-0 flex-1"><Link href={`/product/${p.id}`} className="font-semibold hover:text-brand-600">{p.title}</Link><p className="line-clamp-2 text-sm text-slate-600">{p.description}</p><p className="text-xs text-slate-500">SKU {p.sku} · <span className={st.cls}>{st.label}</span></p></div>
            <div className="flex items-center gap-2"><button className="btn-primary" disabled={p.stock === "out_of_stock"} onClick={() => addToCart(p.id, 1)}>Add to Cart</button><button aria-label={`Remove ${p.title}`} className="text-slate-400 hover:text-red-600" onClick={() => { removeFromList(list.id, p.id); toast("Removed from list."); }}><Trash2 className="h-5 w-5" /></button></div>
          </li>); })}
        {items.length === 0 && <li className="p-8 text-center text-slate-500">This list is empty.</li>}
      </ul>
    </div>
  );
}

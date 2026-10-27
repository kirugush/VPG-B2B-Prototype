"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PriceBlock, ProductCard } from "@/components/ProductCard";
import { QtyStepper, STOCK_LABEL } from "@/components/ui";
import { getCategory, getProduct, relatedProducts } from "@/lib/services";
import { useApp } from "@/lib/store";

export default function PDP() {
  const { id } = useParams<{ id: string }>();
  const p = getProduct(id);
  const { addToCart } = useApp();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  if (!p) return notFound();
  const st = STOCK_LABEL[p.stock];
  const cat = getCategory(p.category);
  const related = relatedProducts(p, [], 4);
  return (
    <div>
      <nav className="mb-4 text-sm text-slate-500"><Link href="/" className="hover:underline">Home</Link> / {cat && <Link href={`/category/${cat.slug}`} className="hover:underline">{cat.name}</Link>} / {p.title}</nav>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.gallery[img]} alt={p.title} className="aspect-square w-full rounded-lg border bg-slate-100 object-cover" />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {p.gallery.map((g, i) => (<button key={i} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`} className={`overflow-hidden rounded border-2 ${i === img ? "border-brand-600" : "border-transparent"}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={g} alt="" className="aspect-square w-full object-cover" /></button>))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3"><h1 className="text-2xl font-bold">{p.title}</h1><FavoriteButton productId={p.id} /></div>
          <p className="text-sm text-slate-500">SKU {p.sku} · {p.brand}</p>
          <PriceBlock p={p} />
          <p className={`font-medium ${st.cls}`}>{st.label}</p>
          <p className="text-slate-700">{p.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} min={p.minQty} max={p.maxQty} onChange={setQty} />
            <button className="btn-primary" disabled={p.stock === "out_of_stock"} onClick={() => addToCart(p.id, qty)}><ShoppingCart className="h-4 w-4" /> Add to Cart</button>
          </div>
          <p className="text-xs text-slate-500">Min {p.minQty} · Max {p.maxQty} per order · Unit of measure: {p.uom}</p>
          <section>
            <h2 className="mb-2 mt-4 font-bold">Specifications</h2>
            <table className="w-full text-sm"><tbody>{Object.entries(p.specs).map(([k, v]) => (<tr key={k} className="border-b"><th className="w-40 py-2 pr-2 text-left font-medium text-slate-500">{k}</th><td className="py-2">{v}</td></tr>))}</tbody></table>
          </section>
        </div>
      </div>
      <section className="mt-12">
        <h2 className="mb-3 text-xl font-bold">Related Products</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
      </section>
    </div>
  );
}

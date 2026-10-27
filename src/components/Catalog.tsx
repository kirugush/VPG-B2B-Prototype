"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "@/mocks/data";
import { catalogSearch } from "@/lib/services";
import { ProductCard } from "./ProductCard";
import { Pagination } from "./ui";

const csv = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function Catalog({ category, title, showQuick }: { category?: string; title: string; showQuick?: boolean }) {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = sp.get("q") ?? "";
  const cat = category ?? sp.get("category") ?? undefined;
  const brand = csv(sp.get("brand"));
  const stock = csv(sp.get("stock"));
  const sort = (sp.get("sort") ?? "relevance") as "relevance" | "price_asc" | "price_desc" | "name";
  const min = sp.get("min") ? Number(sp.get("min")) : undefined;
  const max = sp.get("max") ? Number(sp.get("max")) : undefined;
  const page = Number(sp.get("page") ?? 1);

  const res = useMemo(() => catalogSearch({ q, category: cat, brand, stock, sort, minPrice: min, maxPrice: max, page, pageSize: 20 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, cat, sp.get("brand"), sp.get("stock"), sort, min, max, page]);
  // brands available regardless of brand filter
  const allBrands = useMemo(() => catalogSearch({ q, category: cat, pageSize: 1000 }).brands, [q, cat]);

  const update = (patch: Record<string, string | null>) => {
    const n = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v === null || v === "" ? n.delete(k) : n.set(k, v)));
    if (!("page" in patch)) n.delete("page");
    router.push(`${path}?${n.toString()}`, { scroll: false });
  };
  const toggle = (key: "brand" | "stock", cur: string[], v: string) =>
    update({ [key]: (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(",") });

  const STOCKS = [["in_stock", "In Stock"], ["three_days", "Available in 3 Days"], ["out_of_stock", "Out of Stock"]];
  const filters = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Categories</h3>
        <ul className="space-y-1 text-sm">
          {CATEGORIES.map((c) => (<li key={c.slug}><Link href={`/category/${c.slug}`} className={`block rounded px-2 py-1 hover:bg-slate-100 ${c.slug === cat ? "bg-brand-50 font-semibold text-brand-700" : ""}`}>{c.name}</Link></li>))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Brand</h3>
        {allBrands.map((b) => (<label key={b} className="flex items-center gap-2 py-0.5 text-sm"><input type="checkbox" checked={brand.includes(b)} onChange={() => toggle("brand", brand, b)} />{b}</label>))}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Availability</h3>
        {STOCKS.map(([v, l]) => (<label key={v} className="flex items-center gap-2 py-0.5 text-sm"><input type="checkbox" checked={stock.includes(v)} onChange={() => toggle("stock", stock, v)} />{l}</label>))}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Price</h3>
        <form className="flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); update({ min: String(f.get("min") ?? ""), max: String(f.get("max") ?? "") }); }}>
          <input name="min" defaultValue={min ?? ""} placeholder="Min" className="input py-1.5" inputMode="numeric" />
          <span>–</span>
          <input name="max" defaultValue={max ?? ""} placeholder="Max" className="input py-1.5" inputMode="numeric" />
          <button className="btn-outline px-2 py-1.5">Go</button>
        </form>
      </div>
      <button className="text-sm text-brand-600 hover:underline" onClick={() => router.push(`${path}${q ? `?q=${encodeURIComponent(q)}` : ""}`)}>Clear filters</button>
    </div>
  );

  return (
    <div>
      <h1 className="mb-4 border-b pb-3 text-center text-2xl font-bold text-brand-600">{title}</h1>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-gray-600"><b className="font-semibold text-gray-900">{res.total}</b> product{res.total === 1 ? "" : "s"}{q && <> for “{q}”</>}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline lg:hidden" onClick={() => setFiltersOpen((o) => !o)}><SlidersHorizontal className="h-4 w-4" /> Filters</button>
          <select className="input w-auto" value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
            <option value="relevance">Sort: Relevance</option><option value="name">Name A–Z</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {showQuick && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-white p-3" aria-label="Quick filters">
          <span className="text-sm font-semibold text-slate-500">Quick filters:</span>
          <button onClick={() => update({ stock: stock.includes("in_stock") ? null : "in_stock" })} className={`rounded-full border px-3 py-1 text-sm ${stock.includes("in_stock") ? "border-brand-600 bg-brand-600 text-white" : "bg-white hover:bg-slate-50"}`}>In stock</button>
          <button onClick={() => update({ sort: sort === "price_asc" ? null : "price_asc" })} className={`rounded-full border px-3 py-1 text-sm ${sort === "price_asc" ? "border-brand-600 bg-brand-600 text-white" : "bg-white hover:bg-slate-50"}`}>Lowest price</button>
          {CATEGORIES.slice(0, 6).map((c) => (<button key={c.slug} onClick={() => update({ category: cat === c.slug ? null : c.slug })} className={`rounded-full border px-3 py-1 text-sm ${cat === c.slug ? "border-brand-600 bg-brand-600 text-white" : "bg-white hover:bg-slate-50"}`}>{c.name}</button>))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} card h-fit p-4 lg:block`}>{filters}</aside>
        <div>
          {res.items.length === 0 ? (
            <div className="card p-10 text-center text-slate-500">No products match your search. Try fewer filters.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">{res.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          )}
          <Pagination page={res.page} pages={res.pages} onChange={(p) => update({ page: String(p) })} />
        </div>
      </div>
    </div>
  );
}

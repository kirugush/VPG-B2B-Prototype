"use client";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { catalogSearch, getProduct } from "@/lib/services";
import type { QuoteLine } from "@/lib/types";
import { QtyStepper, money } from "./ui";

/** Product picker + editable line list shared by "request a quote" and draft editing. */
export function QuoteLinesEditor({ lines, onChange }: { lines: QuoteLine[]; onChange: (l: QuoteLine[]) => void }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => (q.trim().length < 2 ? [] : catalogSearch({ q, pageSize: 8 }).items.filter((p) => !p.discontinued)), [q]);

  const add = (id: string) => {
    const p = getProduct(id);
    if (!p || lines.some((l) => l.productId === id)) return;
    const list = p.offerPrice ?? p.price;
    onChange([...lines, { productId: id, qty: Math.max(p.minQty, 1), listPrice: list, quotedPrice: list }]);
    setQ("");
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <label className="label" htmlFor="qp">Add products</label>
        <input id="qp" className="input" placeholder="Search by product name or SKU (min 2 characters)" value={q} onChange={(e) => setQ(e.target.value)} />
        {results.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-white shadow-lg" role="listbox">
            {results.map((p) => (
              <li key={p.id}><button type="button" className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50" onClick={() => add(p.id)}>
                <span><b>{p.sku}</b> · {p.title}</span><span className="text-gray-500">{money(p.offerPrice ?? p.price)} / {p.uom}</span></button></li>
            ))}
          </ul>
        )}
      </div>
      {lines.length === 0 ? <p className="rounded-md border border-dashed p-6 text-center text-sm text-gray-500">No products yet. Search above to add some.</p> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead><tr><th className="th">Product</th><th className="th">Qty</th><th className="th">Unit price</th><th className="th">Line total</th><th className="th"><span className="sr-only">Remove</span></th></tr></thead>
            <tbody className="divide-y">
              {lines.map((l) => { const p = getProduct(l.productId); return (
                <tr key={l.productId}>
                  <td className="td"><b>{p?.sku}</b> · {p?.title}</td>
                  <td className="td"><QtyStepper small value={l.qty} min={p?.minQty ?? 1} max={p?.maxQty ?? 99} onChange={(n) => onChange(lines.map((x) => (x.productId === l.productId ? { ...x, qty: n } : x)))} /></td>
                  <td className="td">{money(l.quotedPrice)}</td><td className="td">{money(l.quotedPrice * l.qty)}</td>
                  <td className="td"><button aria-label={`Remove ${p?.title}`} className="text-gray-400 hover:text-brand-600" onClick={() => onChange(lines.filter((x) => x.productId !== l.productId))}><Trash2 className="h-4 w-4" /></button></td>
                </tr>); })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

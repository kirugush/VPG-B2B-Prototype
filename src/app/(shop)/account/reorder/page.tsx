"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Download, Heart } from "lucide-react";
import { DemoTag, EmptyState, PageHeader, QtyStepper, STOCK_LABEL, downloadBlob, fmtDate, money } from "@/components/ui";
import { canAccessInvoice, generateInvoicePdf } from "@/lib/invoices";
import { buildReorder, clampQty, lineFromProduct, type ReorderLine, type ReorderStatus } from "@/lib/reorder";
import { catalogSearch } from "@/lib/services";
import { useApp } from "@/lib/store";
import { PRODUCTS } from "@/mocks/data";

const STATUS_UI: Record<ReorderStatus, { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-green-100 text-green-800" },
  delayed: { label: "Available in 3 days", cls: "bg-amber-100 text-amber-800" },
  unavailable: { label: "Out of stock", cls: "bg-red-100 text-red-800" },
  discontinued: { label: "Discontinued", cls: "bg-gray-200 text-gray-800" },
  missing: { label: "No longer listed", cls: "bg-gray-200 text-gray-800" },
};

function Reorder() {
  const { orders, invoices, lists, company, user, addManyToCart, createList, toggleInList, toast } = useApp();
  const sp = useSearchParams();
  const [orderId, setOrderId] = useState(sp.get("order") ?? "");
  const order = orders.find((o) => o.id === orderId);
  const [lines, setLines] = useState<ReorderLine[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);
  const [listId, setListId] = useState("");
  const [newList, setNewList] = useState("");
  const [find, setFind] = useState("");

  // Revalidate against CURRENT catalog data whenever the source order changes.
  useEffect(() => {
    if (!order) { setLines([]); setPicked(new Set()); return; }
    const built = buildReorder(order, PRODUCTS);
    setLines(built);
    setPicked(new Set(built.filter((l) => l.purchasable).map((l) => l.productId)));
    setAdded(false);
  }, [order]);

  const matches = useMemo(() => (find.trim().length < 2 ? [] : catalogSearch({ q: find, pageSize: 6 }).items.filter((p) => !p.discontinued && !lines.some((l) => l.productId === p.id))), [find, lines]);
  const chosen = lines.filter((l) => picked.has(l.productId) && l.purchasable && l.currentUnitPrice != null);
  const nowTotal = chosen.reduce((s, l) => s + (l.currentUnitPrice ?? 0) * l.qty, 0);
  const thenTotal = chosen.reduce((s, l) => s + l.originalUnitPrice * l.qty, 0);
  const invoice = order ? invoices.find((i) => i.orderId === order.id) : undefined;

  const setQty = (id: string, n: number) => setLines((ls) => ls.map((l) => { if (l.productId !== id) return l; const p = PRODUCTS.find((x) => x.id === id)!; return { ...l, qty: clampQty(p, n), qtyNote: undefined }; }));
  const replace = (l: ReorderLine) => {
    if (!l.replacement) return;
    const nl = lineFromProduct(l.replacement, l.qtyOriginal, l.originalUnitPrice, PRODUCTS);
    setLines((ls) => ls.map((x) => (x.productId === l.productId ? nl : x)));
    setPicked((p) => { const n = new Set(p); n.delete(l.productId); n.add(nl.productId); return n; });
  };
  const addProduct = (id: string) => {
    const p = PRODUCTS.find((x) => x.id === id)!;
    const nl = lineFromProduct(p, 1, p.offerPrice ?? p.price, PRODUCTS);
    setLines((ls) => [...ls, nl]); setPicked((s) => new Set(s).add(id)); setFind("");
  };
  const addToCart = () => {
    if (chosen.length === 0) return toast("Select at least one available item.", "error");
    const n = addManyToCart(chosen.map((l) => ({ productId: l.productId, qty: l.qty })), { quiet: true });
    toast(`${n} item${n === 1 ? "" : "s"} added to cart at CURRENT prices.`);
    setAdded(true);
  };
  const saveFav = () => {
    const ids = chosen.map((l) => l.productId);
    if (ids.length === 0) return toast("Select at least one item.", "error");
    let target = listId;
    if (!target) { if (!newList.trim()) return toast("Choose a list or name a new one.", "error"); target = createList(newList.trim()); }
    ids.forEach((id) => { const l = lists.find((x) => x.id === target); if (!l || !l.productIds.includes(id)) toggleInList(target, id); });
    toast(`${ids.length} item${ids.length === 1 ? "" : "s"} saved to Favorites.`); setNewList("");
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Re-order" subtitle="Pick a previous order. Prices and availability are re-checked against today's catalog." />
      <div className="card p-4">
        <label className="label" htmlFor="ro">Previous order</label>
        <select id="ro" className="input max-w-md" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
          <option value="">Choose an order…</option>
          {orders.filter((o) => o.status !== "Cancelled").map((o) => <option key={o.id} value={o.id}>{o.id} · {fmtDate(o.date)} · {money(o.total)}</option>)}
        </select>
      </div>

      {!order ? <EmptyState title="No order selected" body="Choose an order above, or start from an order's detail page." /> : (
        <>
          <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-900" role="note">Historical prices are shown for comparison only. Items are added to your cart at <b>today&apos;s</b> eligible price, and shipping, tax, payment and addresses are re-selected at checkout.</p>
          <section className="card overflow-x-auto">
            <h2 className="flex items-center gap-2 border-b p-4 font-bold">Review {order.id} {order.mock && <DemoTag>Demo order</DemoTag>}</h2>
            <table className="w-full min-w-[920px]">
              <caption className="sr-only">Re-order review</caption>
              <thead><tr><th className="th"><span className="sr-only">Select</span></th><th className="th">Product</th><th className="th">Status</th><th className="th">Original qty</th><th className="th">Qty to order</th><th className="th">Original price</th><th className="th">Current price</th><th className="th">Difference</th><th className="th">Line total</th></tr></thead>
              <tbody className="divide-y">
                {lines.map((l) => {
                  const ui = STATUS_UI[l.status];
                  const p = PRODUCTS.find((x) => x.id === l.productId);
                  const d = l.priceDelta;
                  return (
                    <tr key={l.productId} className={l.purchasable ? "" : "bg-gray-50"}>
                      <td className="td"><input type="checkbox" aria-label={`Select ${l.title}`} disabled={!l.purchasable} checked={picked.has(l.productId)} onChange={() => setPicked((s) => { const n = new Set(s); if (n.has(l.productId)) n.delete(l.productId); else n.add(l.productId); return n; })} /></td>
                      <td className="td"><b>{l.sku}</b> · {l.title}{l.replacement && <div className="mt-1 text-xs">Suggested replacement: <b>{l.replacement.title}</b> ({money(l.replacement.offerPrice ?? l.replacement.price)}) <button className="ml-1 font-semibold text-brand-600 underline" onClick={() => replace(l)}>Replace</button></div>}</td>
                      <td className="td"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ui.cls}`}>{ui.label}</span>{p && l.status === "delayed" && <div className={`mt-1 text-xs ${STOCK_LABEL[p.stock].cls}`}>{STOCK_LABEL[p.stock].label}</div>}</td>
                      <td className="td">{l.qtyOriginal}</td>
                      <td className="td">{l.purchasable && p ? <><QtyStepper small value={l.qty} min={p.minQty} max={p.maxQty} onChange={(n) => setQty(l.productId, n)} />{l.qtyNote && <div className="mt-1 text-xs text-amber-700">{l.qtyNote}</div>}</> : "—"}</td>
                      <td className="td text-gray-500">{money(l.originalUnitPrice)}</td>
                      <td className="td font-medium">{l.currentUnitPrice != null ? money(l.currentUnitPrice) : "—"}</td>
                      <td className={`td text-sm font-semibold ${d == null || Math.abs(d) < 0.005 ? "text-gray-400" : d > 0 ? "text-red-600" : "text-green-700"}`}>{d == null || Math.abs(d) < 0.005 ? "No change" : `${d > 0 ? "▲ +" : "▼ −"}${money(Math.abs(d))}`}</td>
                      <td className="td">{l.purchasable && l.currentUnitPrice != null ? money(l.currentUnitPrice * l.qty) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="card space-y-3 p-4">
            <div className="relative max-w-md"><label className="label" htmlFor="fp">Add a missing product</label>
              <input id="fp" className="input" placeholder="Search by name or SKU" value={find} onChange={(e) => setFind(e.target.value)} />
              {matches.length > 0 && <ul className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-lg">{matches.map((p) => <li key={p.id}><button className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50" onClick={() => addProduct(p.id)}><b>{p.sku}</b> · {p.title}</button></li>)}</ul>}
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div><p className="text-gray-500">Selected lines</p><p className="text-xl font-bold">{chosen.length}</p></div>
              <div><p className="text-gray-500">Total at current prices (ex GST)</p><p className="text-xl font-bold">{money(nowTotal)}</p></div>
              <div><p className="text-gray-500">vs. original prices</p><p className={`text-xl font-bold ${nowTotal - thenTotal > 0.005 ? "text-red-600" : nowTotal - thenTotal < -0.005 ? "text-green-700" : ""}`}>{Math.abs(nowTotal - thenTotal) < 0.005 ? "Same" : `${nowTotal > thenTotal ? "+" : "−"}${money(Math.abs(nowTotal - thenTotal))}`}</p></div>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <button className="btn-primary" disabled={chosen.length === 0} onClick={addToCart}>Add {chosen.length} selected to cart</button>
              {invoice && user && canAccessInvoice(invoice, { role: user.role, companyId: company.id }) && <button className="btn-outline" onClick={() => { downloadBlob(`${invoice.id}-DEMO.pdf`, generateInvoicePdf(invoice, order, company)); }}><Download className="h-4 w-4" /> Previous invoice {invoice.id}</button>}
            </div>
            <div className="flex flex-wrap items-end gap-2 border-t pt-3">
              <div><label className="label" htmlFor="sf">Save selected to Favorites</label>
                <select id="sf" className="input" value={listId} onChange={(e) => setListId(e.target.value)}><option value="">New list…</option>{lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
              {!listId && <div><label className="label" htmlFor="nl">New list name</label><input id="nl" className="input" value={newList} maxLength={60} onChange={(e) => setNewList(e.target.value)} /></div>}
              <button className="btn-outline" disabled={chosen.length === 0} onClick={saveFav}><Heart className="h-4 w-4" /> Save</button>
            </div>
            {added && <p className="rounded-md bg-green-50 p-3 text-sm text-green-900" role="status">Added to cart. <Link href="/cart" className="font-semibold underline">Continue to cart and checkout</Link></p>}
          </section>
        </>
      )}
    </div>
  );
}
export default function Page() { return <Suspense fallback={null}><Reorder /></Suspense>; }

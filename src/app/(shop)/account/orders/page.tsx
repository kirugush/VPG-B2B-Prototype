"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { DemoTag, EmptyState, PageHeader, Pagination, Pill, SortHeader, StatusLegend, fmtDate, money } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { Order } from "@/lib/types";

type SortKey = "id" | "date" | "total" | "status";

function Orders() {
  const { orders } = useApp();
  const sp = useSearchParams();
  const [status, setStatus] = useState(sp.get("status") ?? "");
  const [pay, setPay] = useState("");
  const [ful, setFul] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("date");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  const rows = useMemo(() => {
    const list = orders.filter((o) => {
      if (status === "open" ? !(o.status === "Pending" || o.status === "Processing") : status && o.status !== status) return false;
      if (pay && o.paymentStatus !== pay) return false;
      if (ful && o.fulfillmentStatus !== ful) return false;
      if (from && o.date.slice(0, 10) < from) return false;
      if (to && o.date.slice(0, 10) > to) return false;
      if (q && !`${o.id} ${o.po} ${o.customerName ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    const val = (o: Order) => (sort === "total" ? o.total : o[sort]);
    return list.sort((a, b) => { const A = val(a), B = val(b); return (A < B ? -1 : A > B ? 1 : 0) * (dir === "asc" ? 1 : -1); });
  }, [orders, status, pay, ful, from, to, q, sort, dir]);

  const pages = Math.max(1, Math.ceil(rows.length / 10));
  const cur = Math.min(page, pages);
  const toggle = (k: SortKey) => { if (sort === k) setDir((d) => (d === "asc" ? "desc" : "asc")); else { setSort(k); setDir("asc"); } setPage(1); };
  const sel = (id: string, label: string, v: string, set: (v: string) => void, opts: string[]) => (
    <div><label className="label" htmlFor={id}>{label}</label><select id={id} className="input" value={v} onChange={(e) => reset(set)(e.target.value)}><option value="">All</option>{opts.map((s) => <option key={s}>{s}</option>)}</select></div>
  );
  return (
    <div className="space-y-4">
      <PageHeader title="Orders" subtitle={`${rows.length} of ${orders.length} orders`} />
      <div className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div><label className="label" htmlFor="st">Order status</label><select id="st" className="input" value={status} onChange={(e) => reset(setStatus)(e.target.value)}><option value="">All</option><option value="open">Open (Pending + Processing)</option>{["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => <option key={s}>{s}</option>)}</select></div>
        {sel("pay", "Payment status", pay, setPay, ["Awaiting payment", "Authorized", "Paid", "Partially refunded", "Refunded"])}
        {sel("ful", "Fulfillment", ful, setFul, ["Unfulfilled", "Partially fulfilled", "Fulfilled", "Cancelled"])}
        <div><label className="label" htmlFor="s">Search</label><input id="s" className="input" placeholder="Order ID, PO or customer" value={q} onChange={(e) => reset(setQ)(e.target.value)} /></div>
        <div><label className="label" htmlFor="f">From</label><input id="f" type="date" className="input" value={from} onChange={(e) => reset(setFrom)(e.target.value)} /></div>
        <div><label className="label" htmlFor="t">To</label><input id="t" type="date" className="input" value={to} onChange={(e) => reset(setTo)(e.target.value)} /></div>
      </div>
      <StatusLegend />
      {rows.length === 0 ? <EmptyState title="No orders match your filters" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[1150px]">
            <caption className="sr-only">Orders</caption>
            <thead><tr>
              <SortHeader label="Order ID" active={sort === "id"} dir={dir} onClick={() => toggle("id")} />
              <SortHeader label="Date" active={sort === "date"} dir={dir} onClick={() => toggle("date")} />
              <th className="th">Customer</th><th className="th">Items</th><th className="th">Subtotal</th><th className="th">Discount</th><th className="th">Shipping</th><th className="th">Tax</th>
              <SortHeader label="Total" active={sort === "total"} dir={dir} onClick={() => toggle("total")} />
              <th className="th">Payment</th><th className="th">Fulfillment</th>
              <SortHeader label="Status" active={sort === "status"} dir={dir} onClick={() => toggle("status")} />
              <th className="th">Track</th><th className="th">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {rows.slice((cur - 1) * 10, cur * 10).map((o) => (
                <tr key={o.id}>
                  <td className="td font-medium">{o.id} {o.mock && <DemoTag>Demo</DemoTag>}</td><td className="td">{fmtDate(o.date)}</td>
                  <td className="td">{o.customerName ?? "—"}</td><td className="td">{o.lines.reduce((s, l) => s + l.qty, 0)}</td>
                  <td className="td">{money(o.subtotal)}</td><td className="td">{o.discount ? `−${money(o.discount)}` : "—"}</td><td className="td">{o.shipping ? money(o.shipping) : "—"}</td><td className="td">{money(o.gst)}</td>
                  <td className="td font-semibold">{money(o.total)}</td>
                  <td className="td">{o.paymentStatus ? <Pill label={o.paymentStatus} /> : "—"}</td><td className="td">{o.fulfillmentStatus ? <Pill label={o.fulfillmentStatus} /> : "—"}</td>
                  <td className="td"><Pill label={o.status} /></td>
                  <td className="td">{o.tracking ? <span className="text-brand-600">{o.tracking}</span> : <span className="text-gray-400">—</span>}</td>
                  <td className="td"><Link href={`/account/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">View Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={cur} pages={pages} onChange={setPage} />
    </div>
  );
}
export default function Page() { return <Suspense fallback={null}><Orders /></Suspense>; }

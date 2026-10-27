"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Eye } from "lucide-react";
import { DemoTag, EmptyState, Modal, PageHeader, Pagination, StatusBadge, StatusLegend, downloadBlob, fmtDate, money } from "@/components/ui";
import { canAccessInvoice, generateInvoicePdf, DEMO_NOTICE } from "@/lib/invoices";
import { useApp } from "@/lib/store";
import type { Invoice } from "@/lib/types";

const AMOUNTS: [string, string, (n: number) => boolean][] = [["", "Any amount", () => true], ["lt500", "Under $500", (n) => n < 500], ["500-2000", "$500 – $2,000", (n) => n >= 500 && n <= 2000], ["gt2000", "Over $2,000", (n) => n > 2000]];

export default function Invoices() {
  const { invoices, orders, company, user, toast } = useApp();
  const [status, setStatus] = useState("");
  const [amt, setAmt] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<{ inv: Invoice; url: string } | null>(null);

  // Authorization is applied to every request, not just to the list.
  const allowed = useMemo(() => invoices.filter((i) => user && canAccessInvoice(i, { role: user.role, companyId: company.id })), [invoices, user, company.id]);
  const rows = useMemo(() => {
    const f = AMOUNTS.find((a) => a[0] === amt)![2];
    return allowed.filter((i) => (!status || i.status === status) && f(i.amount) && (!from || i.issued.slice(0, 10) >= from) && (!to || i.issued.slice(0, 10) <= to) && (!q || `${i.id} ${i.orderId ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  }, [allowed, status, amt, from, to, q]);
  const pages = Math.max(1, Math.ceil(rows.length / 10));
  const cur = Math.min(page, pages);
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  const build = (inv: Invoice) => {
    if (!user || !canAccessInvoice(inv, { role: user.role, companyId: company.id })) { toast("You are not authorised to access this invoice.", "error"); return null; }
    return generateInvoicePdf(inv, orders.find((o) => o.id === inv.orderId), company);
  };
  const download = (inv: Invoice) => { const b = build(inv); if (b) { downloadBlob(`${inv.id}-DEMO.pdf`, b); toast(`${inv.id}-DEMO.pdf downloaded.`); } };
  const open = (inv: Invoice) => { const b = build(inv); if (b) setPreview({ inv, url: URL.createObjectURL(b) }); };
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  return (
    <div className="space-y-4">
      <PageHeader title="Invoices" subtitle={`${rows.length} invoices`} actions={<DemoTag>Demonstration documents</DemoTag>} />
      <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900" role="note">{DEMO_NOTICE}. These PDFs are samples built from demo data. Real tax invoices come from the authoritative billing source once jurisdiction rules are confirmed.</p>
      <div className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div><label className="label" htmlFor="is">Status</label><select id="is" className="input" value={status} onChange={(e) => reset(setStatus)(e.target.value)}><option value="">All</option><option>Paid</option><option>Pending</option><option>Overdue</option></select></div>
        <div><label className="label" htmlFor="ia">Amount</label><select id="ia" className="input" value={amt} onChange={(e) => reset(setAmt)(e.target.value)}>{AMOUNTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <div><label className="label" htmlFor="if">From</label><input id="if" type="date" className="input" value={from} onChange={(e) => reset(setFrom)(e.target.value)} /></div>
        <div><label className="label" htmlFor="it">To</label><input id="it" type="date" className="input" value={to} onChange={(e) => reset(setTo)(e.target.value)} /></div>
        <div><label className="label" htmlFor="iq">Search</label><input id="iq" className="input" placeholder="Invoice or order number" value={q} onChange={(e) => reset(setQ)(e.target.value)} /></div>
      </div>
      <StatusLegend />
      {rows.length === 0 ? <EmptyState title="No invoices match your filters" /> : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[820px]"><caption className="sr-only">Invoices</caption>
          <thead><tr><th className="th">Invoice Number</th><th className="th">Order</th><th className="th">Date Issued</th><th className="th">Due Date</th><th className="th">Company</th><th className="th">Amount</th><th className="th">Status</th><th className="th">Actions</th></tr></thead>
          <tbody className="divide-y">{rows.slice((cur - 1) * 10, cur * 10).map((i) => (
            <tr key={i.id}><td className="td font-medium">{i.id}</td>
              <td className="td">{i.orderId ? <Link className="text-brand-600 hover:underline" href={`/account/orders/${i.orderId}`}>{i.orderId}</Link> : "—"}</td>
              <td className="td">{fmtDate(i.issued)}</td><td className="td">{fmtDate(i.due)}</td><td className="td">{company.name}</td><td className="td font-semibold">{money(i.amount)}</td><td className="td"><StatusBadge status={i.status} /></td>
              <td className="td"><div className="flex gap-3"><button className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline" onClick={() => open(i)}><Eye className="h-4 w-4" />Preview</button><button className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline" onClick={() => download(i)}><Download className="h-4 w-4" />Download PDF</button></div></td></tr>))}
          </tbody></table></div>
      )}
      <Pagination page={cur} pages={pages} onChange={setPage} />
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview ? `${preview.inv.id} (demonstration)` : ""} wide>
        {preview && <iframe title={`Preview of ${preview.inv.id}`} src={preview.url} className="h-[70vh] w-full rounded border" />}
      </Modal>
    </div>
  );
}

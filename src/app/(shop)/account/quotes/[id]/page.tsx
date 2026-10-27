"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog, DemoTag, Modal, PageHeader, Pill, fmtDate, fmtDateTime, money } from "@/components/ui";
import { QuoteLinesEditor } from "@/components/QuoteLinesEditor";
import { allowedActions, effectiveStatus, quoteTotals } from "@/lib/quotes";
import { can } from "@/lib/permissions";
import { getProduct } from "@/lib/services";
import { useApp } from "@/lib/store";
import type { QuoteLine } from "@/lib/types";

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { quotes, orders, user, addresses, quoteAction, updateQuote, addQuoteNote, convertQuoteToOrder } = useApp();
  const quote = quotes.find((x) => x.id === id);
  const [editing, setEditing] = useState(false);
  const [draftLines, setDraftLines] = useState<QuoteLine[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDiscount, setDraftDiscount] = useState(0);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [convertOpen, setConvertOpen] = useState(false);
  const [note, setNote] = useState("");
  const [vis, setVis] = useState<"internal" | "customer">("customer");

  if (!quote) return <div className="card p-8 text-center">Quote not found. <Link href="/account/quotes" className="text-brand-600 underline">Back to quotes</Link></div>;
  const st = effectiveStatus(quote);
  const actions = allowedActions(quote, user?.role);
  const t = quoteTotals(editing ? { ...quote, lines: draftLines, discountPct: draftDiscount } : quote);
  const ship = addresses.find((a) => a.isDefault);
  const order = quote.orderId ? orders.find((o) => o.id === quote.orderId) : undefined;

  const startEdit = () => { setDraftLines(quote.lines); setDraftTitle(quote.title); setDraftDiscount(quote.discountPct); setEditing(true); };
  const saveEdit = () => { updateQuote(quote.id, { title: draftTitle, lines: draftLines, discountPct: draftDiscount }); setEditing(false); };
  const lines = editing ? draftLines : quote.lines;

  return (
    <div className="space-y-4">
      <Link href="/account/quotes" className="text-sm text-brand-600 hover:underline">← Back to quotes</Link>
      <PageHeader title={`${quote.id} · ${quote.title}`} subtitle={`Expires ${fmtDate(quote.expiresAt)}`} actions={<><Pill label={st} />{quote.mock && <DemoTag>Demo quote</DemoTag>}</>} />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Quote actions">
        {actions.includes("edit") && !editing && <button className="btn-outline" onClick={startEdit}>Edit quote</button>}
        {editing && <><button className="btn-primary" onClick={saveEdit} disabled={draftLines.length === 0}>Save changes</button><button className="btn-outline" onClick={() => setEditing(false)}>Cancel</button></>}
        {actions.includes("submit") && !editing && <button className="btn-primary" onClick={() => quoteAction(quote.id, "submit")}>Submit for review</button>}
        {actions.includes("approve") && <button className="btn-primary" onClick={() => quoteAction(quote.id, "approve")}>Approve</button>}
        {actions.includes("reject") && <button className="btn-danger" onClick={() => setRejectOpen(true)}>Reject</button>}
        {actions.includes("reopen") && <button className="btn-outline" onClick={() => quoteAction(quote.id, "reopen")}>Re-open as draft</button>}
        {actions.includes("convert") && <button className="btn-accent" onClick={() => setConvertOpen(true)}>Convert to order</button>}
        {quote.orderId && <Link href={`/account/orders/${quote.orderId}`} className="btn-outline">View order {quote.orderId}</Link>}
      </div>
      {st === "Expired" && <p className="rounded-md bg-orange-50 p-3 text-sm text-orange-800" role="status">This quote has expired and can no longer be approved or converted. Create a new quote to continue.</p>}
      {!can(user?.role, "quoteApprove") && ["Submitted", "Under Review"].includes(st) && <p className="text-sm text-gray-500">Waiting for an Admin to approve or reject this quote.</p>}

      <section className="card grid gap-4 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><p className="text-gray-500">Company</p><p className="font-medium">{quote.companyName}</p></div>
        <div><p className="text-gray-500">Contact</p><p className="font-medium">{quote.contactName}</p><p className="text-xs">{quote.contactEmail}</p></div>
        <div><p className="text-gray-500">Created</p><p className="font-medium">{fmtDateTime(quote.createdAt)}</p></div>
        <div><p className="text-gray-500">Assigned rep</p><p className="font-medium">{quote.assignedRep ?? "Unassigned"}</p></div>
        <div><p className="text-gray-500">Billing</p><p className="font-medium">{quote.companyName}</p></div>
        <div className="sm:col-span-3"><p className="text-gray-500">Shipping (default address)</p><p className="font-medium">{ship ? `${ship.line1}, ${ship.suburb}, ${ship.state}` : "Set at checkout"}</p></div>
      </section>

      {editing && (
        <section className="card space-y-3 p-4">
          <div><label className="label" htmlFor="et">Title</label><input id="et" className="input" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} /></div>
          {can(user?.role, "quoteApprove") && <div><label className="label" htmlFor="ed">Discount % (Admin only, max 30)</label><input id="ed" type="number" min={0} max={30} step={0.5} className="input w-32" value={draftDiscount} onChange={(e) => setDraftDiscount(Number(e.target.value))} /></div>}
          <QuoteLinesEditor lines={draftLines} onChange={setDraftLines} />
        </section>
      )}

      {!editing && (
        <section className="card overflow-x-auto">
          <h2 className="border-b p-4 font-bold">Line items</h2>
          <table className="w-full min-w-[640px]">
            <thead><tr><th className="th">Product</th><th className="th">Qty</th><th className="th">List price</th><th className="th">Quoted price</th><th className="th">Line total</th></tr></thead>
            <tbody className="divide-y">
              {lines.map((l) => { const p = getProduct(l.productId); const save = l.listPrice - l.quotedPrice; return (
                <tr key={l.productId}><td className="td"><b>{p?.sku}</b> · {p?.title}</td><td className="td">{l.qty} {p?.uom}</td>
                  <td className="td text-gray-500">{money(l.listPrice)}</td>
                  <td className="td font-medium">{money(l.quotedPrice)}{save > 0.005 && <span className="ml-1 text-xs text-green-700">(−{money(save)})</span>}</td>
                  <td className="td">{money(l.quotedPrice * l.qty)}</td></tr>); })}
            </tbody>
          </table>
        </section>
      )}
      <section className="card ml-auto w-full max-w-sm space-y-1 p-4 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
        <div className="flex justify-between"><span>Discount ({editing ? draftDiscount : quote.discountPct}%)</span><span>−{money(t.discount)}</span></div>
        <div className="flex justify-between"><span>GST</span><span>{money(t.tax)}</span></div>
        <div className="flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span>{money(t.total)}</span></div>
        <p className="text-xs text-gray-500">Freight is calculated at checkout.</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="mb-2 font-bold">Notes</h2>
          <ul className="space-y-2 text-sm">
            {quote.notes.length === 0 && <li className="text-gray-500">No notes yet.</li>}
            {quote.notes.map((n, i) => (<li key={i} className="rounded bg-gray-50 p-2"><p className="text-xs text-gray-500">{n.by} · {fmtDateTime(n.at)} · {n.visibility === "internal" ? "Internal only" : "Visible to customer"}</p><p>{n.text}</p></li>))}
          </ul>
          <form className="mt-3 space-y-2" onSubmit={(e) => { e.preventDefault(); addQuoteNote(quote.id, note, vis); setNote(""); }}>
            <label className="label" htmlFor="nt">Add a note</label>
            <textarea id="nt" className="input" rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex items-center justify-between gap-2">
              <select aria-label="Note visibility" className="input w-auto" value={vis} onChange={(e) => setVis(e.target.value as "internal" | "customer")}><option value="customer">Visible to customer</option><option value="internal">Internal only</option></select>
              <button className="btn-outline" disabled={!note.trim()}>Add note</button>
            </div>
          </form>
        </section>
        <section className="card p-4">
          <h2 className="mb-2 font-bold">Activity history</h2>
          <ol className="space-y-2 border-l-2 border-gray-200 pl-4 text-sm">
            {[...quote.history].reverse().map((h, i) => (<li key={i}><p className="font-medium">{h.event}</p><p className="text-xs text-gray-500">{h.by} · {fmtDateTime(h.at)}</p></li>))}
          </ol>
          {order && <p className="mt-3 text-sm">Linked order: <Link href={`/account/orders/${order.id}`} className="text-brand-600 underline">{order.id}</Link></p>}
        </section>
      </div>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject quote">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); quoteAction(quote.id, "reject", reason.trim()); setRejectOpen(false); setReason(""); }}>
          <label className="label" htmlFor="rr">Reason (shown in history)</label>
          <textarea id="rr" required className="input" rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex justify-end gap-2"><button type="button" className="btn-outline" onClick={() => setRejectOpen(false)}>Cancel</button><button className="btn-danger">Reject quote</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={convertOpen} title="Convert to order" confirmLabel="Convert" body={<>Create an order from <b>{quote.id}</b> ({money(t.total)})? A quote can only be converted once. In this demo, a demonstration order is created.</>} onCancel={() => setConvertOpen(false)} onConfirm={() => { setConvertOpen(false); convertQuoteToOrder(quote.id); }} />
    </div>
  );
}

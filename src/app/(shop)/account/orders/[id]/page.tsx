"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { OrderSummary } from "@/components/OrderSummary";
import { ConfirmDialog, DemoTag, PageHeader, Pill, downloadBlob, fmtDateTime } from "@/components/ui";
import { canAccessInvoice, generateInvoicePdf } from "@/lib/invoices";
import { can } from "@/lib/permissions";
import { useApp } from "@/lib/store";

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { orders, invoices, user, company, requestCancellation, toast } = useApp();
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const o = orders.find((x) => x.id === id);
  if (!o) return <div className="card p-8 text-center">Order not found. <Link href="/account/orders" className="text-brand-600 underline">Back to orders</Link></div>;

  const invoice = invoices.find((i) => i.orderId === o.id);
  const showInvoice = !!invoice && !!user && canAccessInvoice(invoice, { role: user.role, companyId: company.id });
  const canAct = can(user?.role, "orderActions");
  const canCancel = canAct && ["Pending", "Processing"].includes(o.status) && !o.cancellationRequested;
  const refunded = o.paymentStatus === "Refunded" || o.paymentStatus === "Partially refunded";

  return (
    <div className="space-y-4">
      <Link href="/account/orders" className="text-sm text-brand-600 hover:underline">← Back to orders</Link>
      <PageHeader title={`Order ${o.id}`} actions={<>{o.mock && <DemoTag>Demo order</DemoTag>}<Pill label={o.status} /></>} />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Order actions">
        {canAct && <button className="btn-primary" onClick={() => router.push(`/account/reorder?order=${o.id}`)}><RotateCcw className="h-4 w-4" /> Re-order eligible items</button>}
        {showInvoice && invoice && <button className="btn-outline" onClick={() => { downloadBlob(`${invoice.id}.pdf`, generateInvoicePdf(invoice, o, company)); toast(`${invoice.id}.pdf (demonstration) downloaded.`); }}><Download className="h-4 w-4" /> Download invoice {invoice.id}</button>}
        {canCancel && <button className="btn-outline text-brand-600" onClick={() => setCancelOpen(true)}>Request cancellation</button>}
        {o.cancellationRequested && <span className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">Cancellation requested — awaiting review</span>}
      </div>

      <section className="card grid gap-4 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><p className="text-gray-500">Order placed</p><p className="font-medium">{fmtDateTime(o.date)}</p></div>
        <div><p className="text-gray-500">PO number</p><p className="font-medium">{o.po}</p></div>
        <div><p className="text-gray-500">Customer</p><p className="font-medium">{o.customerName ?? "—"}</p></div>
        <div><p className="text-gray-500">Shipping method</p><p className="font-medium">{o.shippingMethod}</p></div>
        <div><p className="text-gray-500">Payment</p><p className="font-medium">{o.payment}</p>{o.paymentStatus && <Pill label={o.paymentStatus} />}</div>
        <div><p className="text-gray-500">Fulfillment</p>{o.fulfillmentStatus ? <Pill label={o.fulfillmentStatus} /> : "—"}</div>
        <div><p className="text-gray-500">Originating quote</p>{o.quoteId ? <Link className="font-medium text-brand-600 underline" href={`/account/quotes/${o.quoteId}`}>{o.quoteId}</Link> : <p className="font-medium">—</p>}</div>
        <div><p className="text-gray-500">Bulk submission</p><p className="font-medium">{o.bulkRef ?? "—"}</p></div>
      </section>

      <OrderSummary order={o} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4 text-sm">
          <h2 className="mb-2 font-bold">Shipment &amp; tracking</h2>
          {o.tracking ? <p>{o.carrier ?? "Carrier"} · tracking <b>{o.tracking}</b></p> : <p className="text-gray-500">No shipment yet. Tracking appears once the order ships.</p>}
          {refunded && <p className="mt-3 rounded bg-gray-50 p-2 text-gray-700">Refund status shown as recorded in the source system ({o.paymentStatus}). No refund is created from this screen.</p>}
        </section>
        <section className="card p-4">
          <h2 className="mb-2 font-bold">Order history</h2>
          <ol className="space-y-2 border-l-2 border-gray-200 pl-4 text-sm">
            {[...(o.history ?? [])].reverse().map((h, i) => (<li key={i}><p className="font-medium">{h.event}</p><p className="text-xs text-gray-500">{fmtDateTime(h.at)}</p></li>))}
            {!o.history?.length && <li className="text-gray-500">No history recorded.</li>}
          </ol>
        </section>
      </div>

      <ConfirmDialog open={cancelOpen} title="Request cancellation" confirmLabel="Send request" body={
        <div className="space-y-2"><p>This sends a request to VPG. The order is <b>not</b> cancelled, and nothing is refunded, until it is confirmed.</p>
          <label className="label" htmlFor="cr">Reason (optional)</label><textarea id="cr" className="input" rows={2} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} /></div>}
        onCancel={() => setCancelOpen(false)} onConfirm={() => { requestCancellation(o.id, reason.trim()); setCancelOpen(false); setReason(""); }} />
    </div>
  );
}

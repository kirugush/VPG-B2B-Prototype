"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { OrderSummary } from "@/components/OrderSummary";
import { useApp } from "@/lib/store";

export default function Confirmation() {
  const { id } = useParams<{ id: string }>();
  const { orders } = useApp();
  const o = orders.find((x) => x.id === id);
  if (!o) return <div className="card p-8 text-center">Order not found. <Link href="/" className="text-brand-600 underline">Go home</Link></div>;
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        <h1 className="mt-2 text-2xl font-bold">Thank you — your order is confirmed</h1>
        <p className="text-slate-500">Order <b>{o.id}</b> has been received.</p>
      </div>
      <OrderSummary order={o} />
      <section className="card p-4">
        <h2 className="mb-2 font-bold">What&apos;s Next?</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>You&apos;ll receive an order confirmation email shortly.</li>
          <li>Our team will pick and pack your items and notify you when they ship or are ready to collect.</li>
          <li>Your tax invoice will appear under My Account → Invoices.</li>
          <li>Track progress any time from My Account → Orders.</li>
        </ol>
      </section>
      <div className="text-center"><Link href="/" className="btn-primary">Continue Shopping</Link></div>
    </div>
  );
}

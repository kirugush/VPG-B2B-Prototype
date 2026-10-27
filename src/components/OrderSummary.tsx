"use client";
import { PRODUCTS } from "@/mocks/data";
import type { Order } from "@/lib/types";
import { money } from "./ui";

export function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="border-b p-4 font-bold">Order summary</h2>
        <ul className="divide-y">
          {order.lines.map((l) => {
            const p = PRODUCTS.find((x) => x.id === l.productId);
            return (
              <li key={l.productId} className="flex gap-3 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p && <img src={p.image} alt="" className="h-16 w-16 rounded object-cover" />}
                <div className="flex-1 text-sm"><p className="font-semibold">{p?.title ?? l.productId}</p><p className="line-clamp-2 text-slate-600">{p?.description}</p><p className="text-xs text-slate-500">Qty {l.qty} × {money(l.price)} / {p?.uom}</p></div>
                <p className="font-semibold">{money(l.price * l.qty)}</p>
              </li>
            );
          })}
        </ul>
        <dl className="space-y-1 border-t p-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
          {!!order.discount && <div className="flex justify-between text-green-700"><dt>Discount</dt><dd>−{money(order.discount)}</dd></div>}
          {!!order.shipping && <div className="flex justify-between"><dt>Shipping</dt><dd>{money(order.shipping)}</dd></div>}
          <div className="flex justify-between"><dt>GST</dt><dd>{money(order.gst)}</dd></div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold"><dt>Total</dt><dd>{money(order.total)}</dd></div>
        </dl>
      </section>
      <section className="card grid gap-4 p-4 text-sm sm:grid-cols-2">
        <div><h3 className="font-bold">Shipping address</h3><p className="text-slate-600">{order.shippingAddress}</p></div>
        <div><h3 className="font-bold">Billing address</h3><p className="text-slate-600">{order.billingAddress}</p></div>
        <div><h3 className="font-bold">PO number</h3><p className="text-slate-600">{order.po}</p></div>
        <div><h3 className="font-bold">Payment method</h3><p className="text-slate-600">{order.payment}</p></div>
        <div><h3 className="font-bold">Shipping method</h3><p className="text-slate-600">{order.shippingMethod}</p></div>
      </section>
    </div>
  );
}

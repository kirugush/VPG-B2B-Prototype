"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AddressForm, formatAddress } from "@/components/AddressForm";
import { Modal, money } from "@/components/ui";
import { PRODUCTS, STORE } from "@/mocks/data";
import { checkCreditEligibility } from "@/lib/credit";
import { useApp } from "@/lib/store";

type Payment = "Pay by Account" | "PayPal" | "Stripe";

export default function Checkout() {
  const { cart, totals, addresses, saveAddress, company, availableCredit, user, placeOrder, toast } = useApp();
  const router = useRouter();
  const [delivery, setDelivery] = useState<"ship" | "collect">("ship");
  const [addrId, setAddrId] = useState<string>(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "");
  const [addrModal, setAddrModal] = useState(false);
  const [collector, setCollector] = useState<"me" | "other">("me");
  const [other, setOther] = useState({ name: "", phone: "" });
  const [otherModal, setOtherModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [ship, setShip] = useState("Standard Shipping");
  const [reqDate, setReqDate] = useState("");
  const [po, setPo] = useState("");
  const [pay, setPay] = useState<Payment>("Pay by Account");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitted = useRef(false); // idempotency guard against double-submit
  const [err, setErr] = useState<string | null>(null);

  const lines = cart.map((l) => ({ l, p: PRODUCTS.find((x) => x.id === l.productId)! })).filter((x) => x.p);
  if (lines.length === 0)
    return <div className="card mx-auto max-w-lg p-10 text-center"><p>Your cart is empty.</p><Link href="/search?q=" className="btn-primary mt-4">Browse products</Link></div>;

  const addr = addresses.find((a) => a.id === addrId);
  const juniorOver = user?.role === "Junior Buyer" && totals.total > availableCredit;
  const accountOver = pay === "Pay by Account" && totals.total > availableCredit;

  async function submit() {
    if (submitted.current) return;
    setErr(null);
    if (delivery === "ship" && !addr) return setErr("Please choose or add a delivery address.");
    if (delivery === "collect" && collector === "other" && !other.name) return setErr("Please enter the collector's details.");
    if (!po.trim()) return setErr("A Purchase Order number is required.");
    if (!terms) return setErr("Please accept the terms and conditions.");
    submitted.current = true;
    setBusy(true);
    // Trusted-path credit decision (server route -> AWS in live mode). A failed lookup is NEVER an approval.
    const needsCredit = pay === "Pay by Account" || user?.role === "Junior Buyer";
    if (needsCredit) {
      const key = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `k${Date.now()}${Math.random().toString(36).slice(2)}`;
      const decision = await checkCreditEligibility(company.id, totals.total, company.creditUsed, key);
      if (!decision.ok) {
        submitted.current = false;
        setBusy(false);
        return setErr(`We could not verify your credit, so the order was not placed. ${decision.error}`);
      }
      if (!decision.data.approved) {
        submitted.current = false;
        setBusy(false);
        return setErr(`This order exceeds your available credit by ${money(decision.data.shortfall)}.`);
      }
    }
    const shipTo = delivery === "ship" && addr ? formatAddress(addr) : `Click & Collect – ${STORE.name}, ${STORE.address} (${collector === "me" ? "collected by account holder" : `collected by ${other.name} ${other.phone}`})`;
    const order = placeOrder({
      po: po.trim(),
      shippingMethod: delivery === "collect" ? "Click and Collect" : `${ship}${reqDate ? ` (requested ${reqDate})` : ""}`,
      deliveryMethod: delivery === "ship" ? "Ship to My Location" : "Click and Collect",
      payment: pay,
      shippingAddress: shipTo,
      billingAddress: `${company.name}, ${company.address}`,
    });
    toast("Order placed successfully.");
    router.push(`/order-confirmation/${order.id}`);
  }

  const radio = (checked: boolean, onChange: () => void, label: React.ReactNode, sub?: React.ReactNode) => (
    <label className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${checked ? "border-brand-500 bg-brand-50" : "bg-white"}`}>
      <input type="radio" className="mt-1" checked={checked} onChange={onChange} /><div><div className="font-medium">{label}</div>{sub && <div className="text-sm text-slate-500">{sub}</div>}</div>
    </label>
  );

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card space-y-3 p-4">
            <h2 className="font-bold">1. Delivery method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {radio(delivery === "ship", () => setDelivery("ship"), "Ship to My Location")}
              {radio(delivery === "collect", () => setDelivery("collect"), "Click and Collect")}
            </div>
            {delivery === "ship" ? (
              <div className="space-y-2">
                {addresses.map((a) => radio(addrId === a.id, () => setAddrId(a.id), <>{a.firstName} {a.lastName}{a.isDefault && <span className="ml-2 rounded bg-brand-100 px-1.5 text-xs text-brand-700">Default</span>}</>, formatAddress(a)))}
                <button className="btn-outline" onClick={() => setAddrModal(true)}>+ Add New Address</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-md bg-slate-50 p-3 text-sm"><p className="font-semibold">{STORE.name}</p><p>{STORE.address}</p><p>{STORE.hours}</p><p>{STORE.phone}</p></div>
                {radio(collector === "me", () => setCollector("me"), "I will collect")}
                {radio(collector === "other", () => { setCollector("other"); setOtherModal(true); }, "Someone else will collect", collector === "other" && other.name ? `${other.name} · ${other.phone}` : undefined)}
                <div><label className="label" htmlFor="notes">Notes (optional)</label><textarea id="notes" className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              </div>
            )}
          </section>

          {delivery === "ship" && (
            <section className="card space-y-3 p-4">
              <h2 className="font-bold">2. Shipping method</h2>
              {radio(ship === "Standard Shipping", () => setShip("Standard Shipping"), "Standard Shipping", "5–7 business days")}
              {radio(ship === "Overnight Shipping", () => setShip("Overnight Shipping"), "Overnight Shipping", "1–2 business days")}
              <div><label className="label" htmlFor="rd">Requested shipment date (optional)</label><input id="rd" type="date" className="input" value={reqDate} onChange={(e) => setReqDate(e.target.value)} /></div>
            </section>
          )}

          <section className="card space-y-3 p-4">
            <h2 className="font-bold">{delivery === "ship" ? "3" : "2"}. Purchase order</h2>
            <div><label className="label" htmlFor="po">PO Number</label><input id="po" className="input" value={po} onChange={(e) => setPo(e.target.value)} /></div>
          </section>

          <section className="card space-y-3 p-4">
            <h2 className="font-bold">{delivery === "ship" ? "4" : "3"}. Payment</h2>
            {radio(pay === "Pay by Account", () => setPay("Pay by Account"), "Pay by Account", <>Available credit {money(availableCredit)} of {money(company.creditLimit)}</>)}
            {radio(pay === "PayPal", () => setPay("PayPal"), "PayPal")}
            {radio(pay === "Stripe", () => setPay("Stripe"), "Credit / debit card (Stripe)")}
            {(accountOver || juniorOver) && <p className="rounded bg-red-50 p-2 text-sm text-red-700" role="alert">{user?.role === "Junior Buyer" ? "Junior Buyers can only place orders up to the available credit limit." : "This order exceeds your available credit."} Reduce the order or contact your Admin.</p>}
          </section>
        </div>

        <aside className="card h-fit space-y-3 p-4">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <ul className="max-h-72 divide-y overflow-y-auto">
            {lines.map(({ l, p }) => (
              <li key={p.id} className="flex gap-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" className="h-14 w-14 rounded object-cover" />
                <div className="min-w-0 flex-1 text-sm"><p className="font-semibold">{p.title}</p><p className="line-clamp-1 text-xs text-slate-500">{p.description}</p><p className="text-xs text-slate-500">Qty {l.qty} × {money(p.offerPrice ?? p.price)} / {p.uom}</p></div>
                <p className="text-sm font-semibold">{money((p.offerPrice ?? p.price) * l.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
            {totals.discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount</dt><dd>−{money(totals.discount)}</dd></div>}
            <div className="flex justify-between"><dt>GST (15%)</dt><dd>{money(totals.gst)}</dd></div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
          </dl>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> I agree to the Terms and Conditions</label>
          {err && <p className="rounded bg-red-50 p-2 text-sm text-red-700" role="alert">{err}</p>}
          <button className="btn-accent w-full" disabled={busy || accountOver || juniorOver} onClick={submit}>{busy ? "Placing order…" : "Place Order"}</button>
        </aside>
      </div>

      <Modal open={addrModal} onClose={() => setAddrModal(false)} title="Add New Address" wide>
        <AddressForm onCancel={() => setAddrModal(false)} onSave={(a) => { const id = saveAddress(a); setAddrId(id); setAddrModal(false); toast("Address saved."); }} />
      </Modal>
      <Modal open={otherModal} onClose={() => { setOtherModal(false); if (!other.name) setCollector("me"); }} title="Who will collect?">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setOtherModal(false); }}>
          <div><label className="label" htmlFor="cn">Collector&apos;s name</label><input id="cn" required className="input" value={other.name} onChange={(e) => setOther({ ...other, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="cp">Collector&apos;s phone</label><input id="cp" required type="tel" className="input" value={other.phone} onChange={(e) => setOther({ ...other, phone: e.target.value })} /></div>
          <button className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </div>
  );
}

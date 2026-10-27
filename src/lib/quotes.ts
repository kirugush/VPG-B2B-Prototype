import { GST_RATE, type Order, type Quote, type QuoteStatus, type Role } from "./types";
import { can } from "./permissions";

const r2 = (n: number) => Math.round(n * 100) / 100;

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  lineCount: number;
}

export function quoteTotals(q: Quote): QuoteTotals {
  const subtotal = r2(q.lines.reduce((s, l) => s + l.quotedPrice * l.qty, 0));
  const discount = r2(subtotal * (q.discountPct / 100));
  const tax = r2((subtotal - discount) * GST_RATE);
  return { subtotal, discount, tax, total: r2(subtotal - discount + tax), lineCount: q.lines.length };
}

/** A quote past its expiry date is Expired unless it has already been converted. */
export function effectiveStatus(q: Quote, now = Date.now()): QuoteStatus {
  if (q.status === "Converted") return "Converted";
  if (["Approved", "Submitted", "Under Review", "Draft"].includes(q.status) && new Date(q.expiresAt).getTime() < now) return "Expired";
  return q.status;
}

export type QuoteAction = "edit" | "submit" | "approve" | "reject" | "reopen" | "convert" | "note";

export function allowedActions(q: Quote, role: Role | undefined, now = Date.now()): QuoteAction[] {
  const st = effectiveStatus(q, now);
  const out: QuoteAction[] = [];
  if (!can(role, "quotes")) return out;
  out.push("note");
  if (st === "Draft") out.push("edit", "submit");
  if (["Submitted", "Under Review"].includes(st) && can(role, "quoteApprove")) out.push("approve", "reject");
  if (st === "Rejected") out.push("reopen");
  if (st === "Approved" && can(role, "quoteConvert") && !q.orderId) out.push("convert");
  return out;
}

export class QuoteActionError extends Error {}

/** Pure state transition. Throws QuoteActionError for illegal transitions. */
export function applyQuoteAction(q: Quote, action: Exclude<QuoteAction, "edit" | "note" | "convert">, actor: { name: string; role: Role }, now = Date.now(), reason?: string): Quote {
  if (!allowedActions(q, actor.role, now).includes(action)) {
    throw new QuoteActionError(`Action "${action}" is not allowed for ${actor.role} on a ${effectiveStatus(q, now)} quote.`);
  }
  const at = new Date(now).toISOString();
  const next: Record<typeof action, [QuoteStatus, string]> = {
    submit: ["Submitted", "Submitted for review"],
    approve: ["Approved", "Approved"],
    reject: ["Rejected", `Rejected${reason ? `: ${reason}` : ""}`],
    reopen: ["Draft", "Re-opened as draft"],
  };
  const [status, event] = next[action];
  return { ...q, status, history: [...q.history, { at, by: actor.name, event }] };
}

/**
 * Idempotent quote -> order conversion. If an order already exists for the quote
 * (by quote.orderId or any order.quoteId), NO new order is created.
 */
export function convertQuote(
  q: Quote,
  existingOrders: Order[],
  actor: { name: string; role: Role },
  now = Date.now(),
): { quote: Quote; order?: Order; created: boolean; error?: string } {
  const linked = existingOrders.find((o) => o.quoteId === q.id) ?? (q.orderId ? existingOrders.find((o) => o.id === q.orderId) : undefined);
  if (linked) return { quote: q.orderId ? q : { ...q, status: "Converted", orderId: linked.id }, order: linked, created: false };
  if (!allowedActions(q, actor.role, now).includes("convert")) {
    return { quote: q, created: false, error: `Only an approved, unexpired quote can be converted (current: ${effectiveStatus(q, now)}).` };
  }
  const t = quoteTotals(q);
  const at = new Date(now).toISOString();
  const nextNum = 10240 + existingOrders.length;
  const order: Order = {
    id: `ORD-${nextNum}`,
    companyId: q.companyId,
    customerName: q.contactName,
    date: at,
    status: "Pending",
    paymentStatus: "Awaiting payment",
    fulfillmentStatus: "Unfulfilled",
    po: `QUOTE-${q.id}`,
    lines: q.lines.map((l) => ({ productId: l.productId, qty: l.qty, price: r2(l.quotedPrice * (1 - q.discountPct / 100)) })),
    subtotal: r2(t.subtotal - t.discount),
    discount: t.discount,
    shipping: 0,
    gst: t.tax,
    total: t.total,
    shippingMethod: "To be selected at checkout",
    deliveryMethod: "Ship to My Location",
    payment: "To be arranged at checkout",
    shippingAddress: "To be confirmed at checkout",
    billingAddress: q.companyName,
    quoteId: q.id,
    history: [{ at, event: `Order created from quote ${q.id}` }],
    mock: true,
  };
  const quote: Quote = { ...q, status: "Converted", orderId: order.id, history: [...q.history, { at, by: actor.name, event: `Converted to order ${order.id}` }] };
  return { quote, order, created: true };
}

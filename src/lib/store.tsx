"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  COMPANY,
  PRODUCTS,
  SEED_ADDRESSES,
  SEED_INVOICES,
  SEED_LISTS,
  SEED_ORDERS,
  SEED_USERS,
} from "@/mocks/data";
import { SEED_QUOTES } from "@/mocks/quotes";
import { can, isB2BRole } from "./permissions";
import { applyQuoteAction, convertQuote, QuoteActionError, type QuoteAction } from "./quotes";
import {
  GST_RATE,
  type Address,
  type AuditEvent,
  type BulkSubmission,
  type CartLine,
  type Company,
  type Invoice,
  type Order,
  type Quote,
  type QuoteLine,
  type ShoppingList,
  type User,
  type UserStatus,
} from "./types";

export { can };

export interface Toast {
  id: number;
  message: string;
  kind: "success" | "error" | "info";
}

export const COUPONS: Record<string, number> = { VPG10: 0.1, ICE5: 0.05 };

export interface Totals {
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  count: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function computeTotals(lines: CartLine[], couponPct = 0): Totals {
  const subtotal = r2(
    lines.reduce((s, l) => {
      const p = PRODUCTS.find((x) => x.id === l.productId);
      return s + (p ? (p.offerPrice ?? p.price) * l.qty : 0);
    }, 0),
  );
  const discount = r2(subtotal * couponPct);
  const taxable = subtotal - discount;
  const gst = r2(taxable * GST_RATE);
  return { subtotal, discount, gst, total: r2(taxable + gst), count: lines.reduce((s, l) => s + l.qty, 0) };
}

interface Persisted {
  users: User[];
  currentUserId: string | null;
  company: Company;
  cart: CartLine[];
  coupon: string | null;
  lists: ShoppingList[];
  addresses: Address[];
  orders: Order[];
  invoices: Invoice[];
  quotes: Quote[];
  bulkSubmissions: BulkSubmission[];
  audit: AuditEvent[];
}

type NewQuote = { title: string; lines: QuoteLine[]; discountPct?: number; submit?: boolean };

interface Ctx extends Omit<Persisted, "lists" | "quotes" | "orders" | "invoices"> {
  ready: boolean;
  user: User | null;
  lists: ShoppingList[]; // visible to the current user
  quotes: Quote[]; // current company only
  orders: Order[]; // current company only
  invoices: Invoice[]; // current company only
  availableCredit: number;
  totals: Totals;
  couponPct: number;
  toasts: Toast[];
  miniCartOpen: boolean;
  setMiniCartOpen: (b: boolean) => void;
  toast: (message: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
  // auth
  login: (email: string, password: string) => string | null;
  logout: () => void;
  register: (data: Omit<User, "id"> & { business: string; bpg: string }) => string | null;
  resetPassword: (pw: string) => void;
  // company
  setLogo: (url: string) => void;
  updateProfile: (patch: Partial<User>) => void;
  // users (Admin only; enforced here as the mock "server")
  addUser: (u: Omit<User, "id" | "password">) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resendInvite: (id: string) => void;
  setUserStatus: (id: string, status: UserStatus) => void;
  // cart
  addToCart: (productId: string, qty?: number, opts?: { silent?: boolean; noOpen?: boolean }) => void;
  addManyToCart: (lines: { productId: string; qty: number }[], opts?: { quiet?: boolean }) => number;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  removeMany: (ids: string[]) => void;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  // lists
  createList: (name: string, productId?: string) => string;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  toggleInList: (listId: string, productId: string) => void;
  removeFromList: (listId: string, productId: string) => void;
  addListToCart: (listId: string) => void;
  isFavorite: (productId: string) => boolean;
  // addresses
  saveAddress: (a: Omit<Address, "id"> & { id?: string }) => string;
  deleteAddress: (id: string) => void;
  // orders
  placeOrder: (o: Pick<Order, "po" | "shippingMethod" | "deliveryMethod" | "payment" | "shippingAddress" | "billingAddress">) => Order;
  requestCancellation: (orderId: string, reason: string) => boolean;
  // quotes
  createQuote: (q: NewQuote) => string | null;
  updateQuote: (id: string, patch: { title?: string; lines?: QuoteLine[]; discountPct?: number }) => void;
  quoteAction: (id: string, action: Exclude<QuoteAction, "edit" | "note" | "convert">, reason?: string) => void;
  addQuoteNote: (id: string, text: string, visibility: "internal" | "customer") => void;
  convertQuoteToOrder: (id: string) => { orderId?: string; created: boolean } | null;
  // bulk
  recordBulkSubmission: (s: Omit<BulkSubmission, "id" | "at" | "userId" | "userName" | "companyId" | "reference">) => string;
}

const AppCtx = createContext<Ctx | null>(null);
const KEY = "vpg-b2b-state-v2";
let tid = 0;

const fullName = (u: User | null | undefined) => (u ? `${u.firstName} ${u.lastName}` : "System");

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<Persisted>({
    users: SEED_USERS,
    currentUserId: null,
    company: COMPANY,
    cart: [],
    coupon: null,
    lists: SEED_LISTS,
    addresses: SEED_ADDRESSES,
    orders: SEED_ORDERS,
    invoices: SEED_INVOICES,
    quotes: SEED_QUOTES,
    bulkSubmissions: [],
    audit: [],
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const converting = useRef(new Set<string>()); // duplicate-submit guard for quote conversion

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState((s) => ({ ...s, ...JSON.parse(raw) }));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, [state, ready]);

  const patch = useCallback((p: Partial<Persisted> | ((s: Persisted) => Partial<Persisted>)) => {
    setState((s) => ({ ...s, ...(typeof p === "function" ? p(s) : p) }));
  }, []);

  const toast = useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = ++tid;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const audit = (s: Persisted, action: string, detail: string): AuditEvent[] => {
    const actor = s.users.find((u) => u.id === s.currentUserId);
    return [{ id: `au${Date.now()}${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString(), actorId: actor?.id ?? "-", actorName: fullName(actor), action, detail }, ...s.audit].slice(0, 200);
  };

  const user = state.users.find((u) => u.id === state.currentUserId) ?? null;
  const couponPct = state.coupon ? (COUPONS[state.coupon] ?? 0) : 0;
  const totals = useMemo(() => computeTotals(state.cart, couponPct), [state.cart, couponPct]);
  const availableCredit = Math.max(0, state.company.creditLimit - state.company.creditUsed);

  const companyId = state.company.id;
  const b2b = isB2BRole(user?.role);
  const visibleLists = state.lists.filter((l) => (l.companyId ?? companyId) === companyId && (b2b || l.shared || l.ownerId === user?.id));
  const visibleQuotes = state.quotes.filter((q) => q.companyId === companyId);
  const visibleOrders = state.orders.filter((o) => !o.companyId || o.companyId === companyId);
  const visibleInvoices = state.invoices.filter((i) => !i.companyId || i.companyId === companyId);

  const needAdmin = () => {
    if (!can(user?.role, "users")) {
      toast("You do not have permission to manage users.", "error");
      return false;
    }
    return true;
  };
  const adminCount = (users: User[]) => users.filter((u) => u.role === "Admin" && u.status !== "Disabled").length;

  const value: Ctx = {
    ...state,
    lists: visibleLists,
    quotes: visibleQuotes,
    orders: visibleOrders,
    invoices: visibleInvoices,
    ready,
    user,
    availableCredit,
    totals,
    couponPct,
    toasts,
    miniCartOpen,
    setMiniCartOpen,
    toast,
    dismissToast,

    login(email, password) {
      const u = stateRef.current.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
      if (!u || u.password !== password) return "Invalid email or password.";
      if (u.status === "Disabled") return "This account has been disabled. Contact your company Admin.";
      patch((s) => ({ currentUserId: u.id, users: s.users.map((x) => (x.id === u.id && x.status === "Invited" ? { ...x, status: "Active" } : x)) }));
      return null;
    },
    logout() {
      patch({ currentUserId: null });
    },
    register(d) {
      if (stateRef.current.users.some((u) => u.email.toLowerCase() === d.email.toLowerCase()))
        return "An account with this email already exists.";
      const { business, bpg, ...rest } = d;
      patch((s) => ({
        users: [...s.users, { ...rest, id: `u${Date.now()}`, password: "Password1!", status: "Active", companyId: s.company.id }],
        company: { ...s.company, name: business || s.company.name, bpgNumber: bpg || s.company.bpgNumber },
      }));
      return null;
    },
    resetPassword(pw) {
      patch((s) => ({ users: s.users.map((u, i) => (i === 0 ? { ...u, password: pw } : u)) }));
    },

    setLogo: (url) => patch((s) => ({ company: { ...s.company, logoUrl: url } })),
    updateProfile: (p) =>
      patch((s) => ({ users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, ...p } : u)) })),

    addUser(u) {
      if (!needAdmin()) return;
      patch((s) => ({
        users: [...s.users, { ...u, companyId: s.company.id, id: `u${Date.now()}`, password: "Welcome1!", status: "Invited" }],
        audit: audit(s, "user.created", `${u.email} (${u.role}) invited`),
      }));
    },
    updateUser(id, p) {
      if (!needAdmin()) return;
      const cur = stateRef.current;
      const target = cur.users.find((u) => u.id === id);
      if (target?.role === "Admin" && p.role && p.role !== "Admin" && adminCount(cur.users) <= 1) {
        toast("The company must keep at least one Admin.", "error");
        return;
      }
      patch((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...p } : u)), audit: audit(s, "user.updated", `${target?.email ?? id}: ${Object.keys(p).join(", ")}`) }));
    },
    deleteUser(id) {
      if (!needAdmin()) return;
      const cur = stateRef.current;
      const target = cur.users.find((u) => u.id === id);
      if (id === cur.currentUserId) return toast("You cannot delete your own account.", "error");
      if (target?.role === "Admin" && adminCount(cur.users) <= 1) return toast("The company must keep at least one Admin.", "error");
      patch((s) => ({ users: s.users.filter((u) => u.id !== id), audit: audit(s, "user.deleted", target?.email ?? id) }));
    },
    resendInvite(id) {
      if (!needAdmin()) return;
      const t = stateRef.current.users.find((u) => u.id === id);
      patch((s) => ({ audit: audit(s, "user.invite_resent", t?.email ?? id) }));
      toast(`Invitation re-sent to ${t?.email} (demo: no email is actually sent).`, "info");
    },
    setUserStatus(id, status) {
      if (!needAdmin()) return;
      const cur = stateRef.current;
      const t = cur.users.find((u) => u.id === id);
      if (id === cur.currentUserId) return toast("You cannot change your own status.", "error");
      if (t?.role === "Admin" && status === "Disabled" && adminCount(cur.users) <= 1) return toast("The company must keep at least one Admin.", "error");
      patch((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status } : u)), audit: audit(s, "user.status", `${t?.email}: ${status}`) }));
    },

    addToCart(productId, qty = 1, opts) {
      const p = PRODUCTS.find((x) => x.id === productId);
      if (!p) return;
      if (p.discontinued || p.stock === "out_of_stock") {
        toast(p.discontinued ? "This product is discontinued." : "This product is out of stock.", "error");
        return;
      }
      patch((s) => {
        // Idempotent: one line per product; repeat adds merge quantity (clamped to max).
        const existing = s.cart.find((l) => l.productId === productId);
        if (existing)
          return {
            cart: s.cart.map((l) => (l.productId === productId ? { ...l, qty: Math.min(p.maxQty, l.qty + qty) } : l)),
          };
        return { cart: [...s.cart, { productId, qty: Math.min(p.maxQty, Math.max(p.minQty, qty)) }] };
      });
      if (!opts?.noOpen) setMiniCartOpen(true);
      if (!opts?.silent) toast(`${p.title} added to cart.`);
    },
    addManyToCart(lines, opts) {
      let added = 0;
      patch((s) => {
        let cart = s.cart;
        for (const { productId, qty } of lines) {
          const p = PRODUCTS.find((x) => x.id === productId);
          if (!p || p.discontinued || p.stock === "out_of_stock" || qty <= 0) continue;
          const ex = cart.find((l) => l.productId === productId);
          cart = ex
            ? cart.map((l) => (l.productId === productId ? { ...l, qty: Math.min(p.maxQty, l.qty + qty) } : l))
            : [...cart, { productId, qty: Math.min(p.maxQty, Math.max(p.minQty, qty)) }];
          added++;
        }
        return { cart };
      });
      const n = lines.filter((l) => { const p = PRODUCTS.find((x) => x.id === l.productId); return p && !p.discontinued && p.stock !== "out_of_stock" && l.qty > 0; }).length;
      if (!opts?.quiet) toast(n ? `${n} line${n > 1 ? "s" : ""} added to cart.` : "Nothing could be added to the cart.", n ? "success" : "error");
      return n || added;
    },
    setQty(productId, qty) {
      const p = PRODUCTS.find((x) => x.id === productId);
      if (!p) return;
      const q = Math.min(p.maxQty, Math.max(p.minQty, Math.floor(qty) || p.minQty));
      patch((s) => ({ cart: s.cart.map((l) => (l.productId === productId ? { ...l, qty: q } : l)) }));
    },
    removeFromCart(productId) {
      patch((s) => ({ cart: s.cart.filter((l) => l.productId !== productId) }));
      toast("Product successfully deleted from cart.");
    },
    removeMany(ids) {
      patch((s) => ({ cart: s.cart.filter((l) => !ids.includes(l.productId)) }));
      toast(`${ids.length} product${ids.length > 1 ? "s" : ""} successfully deleted from cart.`);
    },
    applyCoupon(code) {
      const c = code.trim().toUpperCase();
      if (!(c in COUPONS)) {
        toast("Invalid coupon code.", "error");
        return false;
      }
      patch({ coupon: c });
      toast(`Coupon ${c} applied.`);
      return true;
    },
    clearCoupon: () => patch({ coupon: null }),

    createList(name, productId) {
      const id = `l${Date.now()}`;
      patch((s) => ({ lists: [...s.lists, { id, name, productIds: productId ? [productId] : [], companyId: s.company.id, ownerId: s.currentUserId ?? undefined, shared: false }] }));
      return id;
    },
    renameList: (id, name) => patch((s) => ({ lists: s.lists.map((l) => (l.id === id ? { ...l, name } : l)) })),
    deleteList: (id) => patch((s) => ({ lists: s.lists.filter((l) => l.id !== id) })),
    toggleInList(listId, productId) {
      patch((s) => ({
        lists: s.lists.map((l) =>
          l.id !== listId
            ? l
            : { ...l, productIds: l.productIds.includes(productId) ? l.productIds.filter((x) => x !== productId) : [...l.productIds, productId] },
        ),
      }));
    },
    removeFromList: (listId, productId) =>
      patch((s) => ({ lists: s.lists.map((l) => (l.id === listId ? { ...l, productIds: l.productIds.filter((x) => x !== productId) } : l)) })),
    addListToCart(listId) {
      const l = stateRef.current.lists.find((x) => x.id === listId);
      if (!l) return;
      const lines = l.productIds.map((productId) => ({ productId, qty: 1 }));
      const n = value.addManyToCart(lines, { quiet: true });
      toast(n ? `${n} item${n > 1 ? "s" : ""} from "${l.name}" added to cart.` : "No purchasable items to add.", n ? "success" : "error");
    },
    isFavorite: (pid) => visibleLists.some((l) => l.productIds.includes(pid)),

    saveAddress(a) {
      const id = a.id ?? `a${Date.now()}`;
      patch((s) => {
        let list = a.id ? s.addresses.map((x) => (x.id === a.id ? { ...a, id } : x)) : [...s.addresses, { ...a, id }];
        if (a.isDefault || list.length === 1) list = list.map((x) => ({ ...x, isDefault: x.id === id }));
        return { addresses: list };
      });
      return id;
    },
    deleteAddress(id) {
      patch((s) => {
        const rest = s.addresses.filter((a) => a.id !== id);
        if (rest.length && !rest.some((a) => a.isDefault)) rest[0] = { ...rest[0], isDefault: true };
        return { addresses: rest };
      });
    },

    placeOrder(o) {
      const s = stateRef.current;
      const lines = s.cart.map((l) => {
        const p = PRODUCTS.find((x) => x.id === l.productId)!;
        return { productId: l.productId, qty: l.qty, price: p.offerPrice ?? p.price };
      });
      const t = computeTotals(s.cart, COUPONS[s.coupon ?? ""] ?? 0);
      const num = 10240 + s.orders.length;
      const at = new Date().toISOString();
      const me = s.users.find((u) => u.id === s.currentUserId);
      const order: Order = {
        ...o,
        id: `ORD-${num}`,
        companyId: s.company.id,
        customerName: fullName(me),
        date: at,
        status: "Pending",
        paymentStatus: o.payment === "Pay by Account" ? "Authorized" : "Awaiting payment",
        fulfillmentStatus: "Unfulfilled",
        lines,
        subtotal: t.subtotal - t.discount,
        discount: t.discount,
        shipping: 0,
        gst: t.gst,
        total: t.total,
        history: [{ at, event: "Order placed" }],
        mock: true,
      };
      const invoice: Invoice = {
        id: `INV-${30500 + s.invoices.length}`,
        companyId: s.company.id,
        issued: at,
        due: new Date(Date.now() + 30 * 86400000).toISOString(),
        amount: order.total,
        status: "Pending",
        orderId: order.id,
      };
      patch((st) => ({
        orders: [order, ...st.orders],
        invoices: [invoice, ...st.invoices],
        cart: [],
        coupon: null,
        company: o.payment === "Pay by Account" ? { ...st.company, creditUsed: r2(st.company.creditUsed + order.total) } : st.company,
        audit: audit(st, "order.placed", `${order.id} (${order.payment})`),
      }));
      return order;
    },
    requestCancellation(orderId, reason) {
      const o = stateRef.current.orders.find((x) => x.id === orderId);
      if (!o || !can(user?.role, "orderActions")) { toast("You cannot request changes to this order.", "error"); return false; }
      if (!["Pending", "Processing"].includes(o.status) || o.cancellationRequested) {
        toast("A cancellation can only be requested once, for orders that have not shipped.", "error");
        return false;
      }
      const at = new Date().toISOString();
      patch((s) => ({
        orders: s.orders.map((x) => (x.id === orderId ? { ...x, cancellationRequested: true, history: [...(x.history ?? []), { at, event: `Cancellation requested${reason ? `: ${reason}` : ""} (awaiting review)` }] } : x)),
        audit: audit(s, "order.cancellation_requested", orderId),
      }));
      // Deliberately NOT cancelling or refunding: that needs an authorised BigCommerce operation.
      toast("Cancellation request recorded. The order is not cancelled until VPG confirms.", "info");
      return true;
    },

    createQuote({ title, lines, discountPct = 0, submit }) {
      if (!can(user?.role, "quotes") || !user) { toast("You do not have permission to create quotes.", "error"); return null; }
      if (lines.length === 0) { toast("Add at least one product to the quote.", "error"); return null; }
      const s = stateRef.current;
      const n = s.quotes.reduce((m, q) => Math.max(m, Number(q.id.split("-")[2]) || 0), 0) + 1;
      const id = `Q-2026-${String(n).padStart(4, "0")}`;
      const now = Date.now();
      const at = new Date(now).toISOString();
      const q: Quote = {
        id, title: title.trim() || "Untitled quote", companyId: s.company.id, companyName: s.company.name,
        contactName: fullName(user), contactEmail: user.email, createdBy: user.id, createdAt: at,
        expiresAt: new Date(now + 30 * 86400000).toISOString(), status: submit ? "Submitted" : "Draft",
        lines, discountPct: Math.min(30, Math.max(0, discountPct)), notes: [],
        history: [{ at, by: fullName(user), event: "Quote created" }, ...(submit ? [{ at, by: fullName(user), event: "Submitted for review" }] : [])],
        mock: true,
      };
      patch((st) => ({ quotes: [q, ...st.quotes], audit: audit(st, "quote.created", id) }));
      return id;
    },
    updateQuote(id, p) {
      const q = stateRef.current.quotes.find((x) => x.id === id);
      if (!q || q.status !== "Draft" || !can(user?.role, "quotes")) { toast("Only draft quotes can be edited.", "error"); return; }
      const at = new Date().toISOString();
      patch((s) => ({
        quotes: s.quotes.map((x) => (x.id === id ? { ...x, ...p, discountPct: p.discountPct != null ? Math.min(30, Math.max(0, p.discountPct)) : x.discountPct, history: [...x.history, { at, by: fullName(user), event: "Quote edited" }] } : x)),
      }));
    },
    quoteAction(id, action, reason) {
      const q = stateRef.current.quotes.find((x) => x.id === id);
      if (!q || !user) return;
      try {
        const next = applyQuoteAction(q, action, { name: fullName(user), role: user.role }, Date.now(), reason);
        patch((s) => ({ quotes: s.quotes.map((x) => (x.id === id ? next : x)), audit: audit(s, `quote.${action}`, id) }));
        toast(`Quote ${id}: ${next.status}.`);
      } catch (e) {
        toast(e instanceof QuoteActionError ? e.message : "Action failed.", "error");
      }
    },
    addQuoteNote(id, text, visibility) {
      if (!text.trim() || !user || !can(user.role, "quotes")) return;
      const at = new Date().toISOString();
      patch((s) => ({ quotes: s.quotes.map((x) => (x.id === id ? { ...x, notes: [...x.notes, { at, by: fullName(user), visibility, text: text.trim().slice(0, 1000) }] } : x)) }));
    },
    convertQuoteToOrder(id) {
      if (!user) return null;
      if (converting.current.has(id)) return null; // ignore double-click while in flight
      const cur = stateRef.current;
      const q = cur.quotes.find((x) => x.id === id && x.companyId === cur.company.id);
      if (!q) return null;
      converting.current.add(id);
      const actor = { name: fullName(user), role: user.role };
      const r = convertQuote(q, cur.orders, actor);
      if (r.error) {
        converting.current.delete(id);
        toast(r.error, "error");
        return null;
      }
      patch((s) => {
        const sq = s.quotes.find((x) => x.id === id);
        if (!sq) return {};
        // Re-evaluate against the latest state so a duplicate submit can never add a second order.
        const again = convertQuote(sq, s.orders, actor);
        if (!again.created || !again.order) return { quotes: s.quotes.map((x) => (x.id === id ? again.quote : x)) };
        return { quotes: s.quotes.map((x) => (x.id === id ? again.quote : x)), orders: [again.order, ...s.orders], audit: audit(s, "quote.converted", `${id} -> ${again.order.id}`) };
      });
      setTimeout(() => converting.current.delete(id), 500);
      toast(r.created ? `Quote ${id} converted to order ${r.order?.id} (demo order).` : `Quote ${id} was already converted to ${r.order?.id}.`, r.created ? "success" : "info");
      return { orderId: r.order?.id, created: r.created };
    },

    recordBulkSubmission(sub) {
      const s = stateRef.current;
      const reference = `BULK-${3000 + s.bulkSubmissions.length + 1}`;
      const rec: BulkSubmission = { ...sub, id: `bs${Date.now()}`, at: new Date().toISOString(), userId: user?.id ?? "-", userName: fullName(user), companyId: s.company.id, reference };
      patch((st) => ({ bulkSubmissions: [rec, ...st.bulkSubmissions].slice(0, 100), audit: audit(st, "bulk.submitted", `${reference} (${sub.linesValid}/${sub.linesSubmitted} valid)`) }));
      return reference;
    },
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside AppProvider");
  return c;
}

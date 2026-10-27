import type { Order, Product } from "./types";

/**
 * Re-order revalidation. Historical prices are shown only for comparison; the price
 * used going forward is always the CURRENT eligible price from the catalog.
 */
export type ReorderStatus = "available" | "delayed" | "unavailable" | "discontinued" | "missing";

export interface ReorderLine {
  productId: string;
  sku: string;
  title: string;
  uom: string;
  status: ReorderStatus;
  purchasable: boolean;
  qtyOriginal: number;
  qty: number;
  qtyNote?: string;
  originalUnitPrice: number;
  currentUnitPrice: number | null;
  priceDelta: number | null; // current - original (per unit)
  replacement?: Product;
}

const effective = (p: Product) => p.offerPrice ?? p.price;
const r2 = (n: number) => Math.round(n * 100) / 100;

export function findReplacement(p: Product, catalog: Product[]): Product | undefined {
  const target = effective(p);
  return catalog
    .filter((c) => c.category === p.category && c.id !== p.id && !c.discontinued && c.stock !== "out_of_stock")
    .sort((a, b) => Math.abs(effective(a) - target) - Math.abs(effective(b) - target))[0];
}

/** Build one revalidated line from a CURRENT catalog product. */
export function lineFromProduct(p: Product, qtyOriginal: number, originalUnitPrice: number, catalog: Product[]): ReorderLine {
  let status: ReorderStatus = "available";
  if (p.discontinued) status = "discontinued";
  else if (p.stock === "out_of_stock") status = "unavailable";
  else if (p.stock === "three_days") status = "delayed";
  const purchasable = status === "available" || status === "delayed";
  let qty = qtyOriginal;
  let qtyNote: string | undefined;
  if (purchasable && qty < p.minQty) { qty = p.minQty; qtyNote = `Raised to minimum ${p.minQty}`; }
  if (purchasable && qty > p.maxQty) { qty = p.maxQty; qtyNote = `Reduced to maximum ${p.maxQty}`; }
  const cur = effective(p);
  return {
    productId: p.id, sku: p.sku, title: p.title, uom: p.uom, status, purchasable,
    qtyOriginal, qty: purchasable ? qty : 0, qtyNote,
    originalUnitPrice, currentUnitPrice: cur, priceDelta: r2(cur - originalUnitPrice),
    replacement: purchasable ? undefined : findReplacement(p, catalog),
  };
}

export function buildReorder(order: Order, catalog: Product[]): ReorderLine[] {
  return order.lines.map((l) => {
    const p = catalog.find((x) => x.id === l.productId);
    if (!p) {
      return { productId: l.productId, sku: l.productId, title: "Product no longer in catalog", uom: "-", status: "missing" as const, purchasable: false, qtyOriginal: l.qty, qty: 0, originalUnitPrice: l.price, currentUnitPrice: null, priceDelta: null };
    }
    return lineFromProduct(p, l.qty, l.price, catalog);
  });
}

/** Clamp a user-edited quantity against current rules. */
export function clampQty(p: Product, qty: number): number {
  return Math.min(p.maxQty, Math.max(p.minQty, Math.floor(qty) || p.minQty));
}

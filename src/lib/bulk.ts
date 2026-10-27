import { LIMITS } from "./config";
import { parseCsv, toCsv } from "./csv";
import type { Product } from "./types";

/**
 * Bulk-order parsing and validation.
 *
 * Trust model: uploaded prices, discounts, stock and eligibility are IGNORED. Every
 * resolved value (price, availability, purchasability) comes from the catalog passed in
 * (BigCommerce in live mode). Nothing here creates an order.
 */

export interface BulkRowInput {
  row: number; // 1-based row number as the user sees it (header excluded)
  sku: string;
  qty: string;
  ref?: string;
}

export type IssueCode =
  | "EMPTY_SKU"
  | "UNKNOWN_SKU"
  | "BAD_QTY"
  | "QTY_RULE"
  | "OUT_OF_STOCK"
  | "DISCONTINUED"
  | "DUPLICATE_MERGED"
  | "AVAILABLE_LATER"
  | "IGNORED_PRICE";

export interface BulkIssue {
  row: number;
  sku: string;
  code: IssueCode;
  severity: "error" | "warning";
  message: string;
}

export interface BulkLine {
  sku: string;
  productId: string;
  title: string;
  uom: string;
  stock: Product["stock"];
  qty: number;
  unitPrice: number;
  subtotal: number;
  rows: number[];
  ref?: string;
}

export interface BulkResult {
  lines: BulkLine[];
  issues: BulkIssue[];
  rowsSubmitted: number;
  rowsRejected: number;
}

export interface ParseOutcome {
  rows: BulkRowInput[];
  fileErrors: string[];
}

export const normSku = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

/** Validate raw file properties before reading the content. */
export function validateCsvFile(file: { name: string; size: number; type?: string }): string[] {
  const errs: string[] = [];
  if (!/\.csv$/i.test(file.name)) errs.push("File must have a .csv extension.");
  if (file.type && !/(csv|excel|plain)/i.test(file.type) && file.type !== "") errs.push(`Unexpected file type "${file.type}".`);
  if (file.size === 0) errs.push("File is empty.");
  if (file.size > LIMITS.csvMaxBytes) errs.push(`File is larger than ${Math.round(LIMITS.csvMaxBytes / 1000)} KB.`);
  return errs;
}

export function parseBulkCsv(text: string): ParseOutcome {
  const fileErrors: string[] = [];
  const grid = parseCsv(text);
  if (grid.length === 0) return { rows: [], fileErrors: ["The file contains no rows."] };
  const header = grid[0].map((h) => h.trim().toLowerCase());
  const iSku = header.findIndex((h) => h === "sku");
  const iQty = header.findIndex((h) => h === "quantity" || h === "qty");
  const iRef = header.findIndex((h) => h === "reference" || h === "ref");
  if (iSku < 0 || iQty < 0) {
    return { rows: [], fileErrors: ['Header row must contain "SKU" and "Quantity" columns (optional: "Reference").'] };
  }
  const body = grid.slice(1);
  if (body.length === 0) fileErrors.push("The file has a header but no data rows.");
  if (body.length > LIMITS.csvMaxRows) fileErrors.push(`Too many rows (${body.length}). The limit is ${LIMITS.csvMaxRows}.`);
  const rows = body.slice(0, LIMITS.csvMaxRows).map((r, k) => ({
    row: k + 1,
    sku: (r[iSku] ?? "").trim(),
    qty: (r[iQty] ?? "").trim(),
    ref: iRef >= 0 ? (r[iRef] ?? "").trim().slice(0, 60) : undefined,
  }));
  return { rows, fileErrors };
}

/** Paste from a spreadsheet or type lines: "SKU<tab|comma|space>qty". */
export function parsePaste(text: string): ParseOutcome {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const fileErrors: string[] = [];
  if (lines.length > LIMITS.pasteMaxRows) fileErrors.push(`Too many lines (${lines.length}). The limit is ${LIMITS.pasteMaxRows}.`);
  const rows = lines.slice(0, LIMITS.pasteMaxRows).map((l, k) => {
    const parts = l.split(/[\t,;]|\s{1,}/).map((x) => x.trim()).filter(Boolean);
    return { row: k + 1, sku: parts[0] ?? "", qty: parts[1] ?? "1", ref: parts[2] };
  });
  return { rows, fileErrors };
}

export function validateBulk(rows: BulkRowInput[], catalog: Product[]): BulkResult {
  const issues: BulkIssue[] = [];
  const bySku = new Map(catalog.map((p) => [normSku(p.sku), p]));
  const rejected = new Set<number>();

  type Acc = { product: Product; qty: number; rows: number[]; ref?: string };
  const acc = new Map<string, Acc>();
  const order: string[] = [];

  for (const r of rows) {
    const sku = normSku(r.sku);
    if (!sku) {
      issues.push({ row: r.row, sku: "", code: "EMPTY_SKU", severity: "error", message: "SKU is empty." });
      rejected.add(r.row);
      continue;
    }
    if (!/^\d+$/.test(r.qty.trim()) || Number(r.qty) <= 0) {
      issues.push({ row: r.row, sku, code: "BAD_QTY", severity: "error", message: `Quantity "${r.qty}" must be a whole number greater than 0.` });
      rejected.add(r.row);
      continue;
    }
    const product = bySku.get(sku);
    if (!product) {
      issues.push({ row: r.row, sku, code: "UNKNOWN_SKU", severity: "error", message: `SKU ${sku} was not found in the catalog.` });
      rejected.add(r.row);
      continue;
    }
    const qty = Number(r.qty);
    const existing = acc.get(sku);
    if (existing) {
      // Deterministic duplicate handling: quantities are summed into the first occurrence.
      existing.qty += qty;
      existing.rows.push(r.row);
      issues.push({ row: r.row, sku, code: "DUPLICATE_MERGED", severity: "warning", message: `Duplicate of row ${existing.rows[0]}; quantity merged.` });
    } else {
      acc.set(sku, { product, qty, rows: [r.row], ref: r.ref });
      order.push(sku);
    }
  }

  const lines: BulkLine[] = [];
  for (const sku of order) {
    const a = acc.get(sku)!;
    const p = a.product;
    const reject = (code: IssueCode, message: string) => {
      issues.push({ row: a.rows[0], sku, code, severity: "error", message });
      a.rows.forEach((x) => rejected.add(x));
    };
    if (p.discontinued) { reject("DISCONTINUED", `${sku} is discontinued and cannot be ordered.`); continue; }
    if (p.stock === "out_of_stock") { reject("OUT_OF_STOCK", `${sku} is out of stock.`); continue; }
    if (a.qty < p.minQty || a.qty > p.maxQty) {
      reject("QTY_RULE", `Quantity ${a.qty} for ${sku} is outside the allowed range ${p.minQty}-${p.maxQty}.`);
      continue;
    }
    if (p.stock === "three_days") {
      issues.push({ row: a.rows[0], sku, code: "AVAILABLE_LATER", severity: "warning", message: `${sku} is available in 3 days.` });
    }
    const unitPrice = p.offerPrice ?? p.price;
    lines.push({
      sku, productId: p.id, title: p.title, uom: p.uom, stock: p.stock, qty: a.qty,
      unitPrice, subtotal: Math.round(unitPrice * a.qty * 100) / 100, rows: a.rows, ref: a.ref,
    });
  }
  issues.sort((x, y) => x.row - y.row);
  return { lines, issues, rowsSubmitted: rows.length, rowsRejected: rejected.size };
}

/** Downloadable error report (spreadsheet-injection safe). */
export function errorReportCsv(result: BulkResult): string {
  const rows: (string | number)[][] = [["Row", "SKU", "Severity", "Code", "Message"]];
  result.issues.forEach((i) => rows.push([i.row, i.sku, i.severity, i.code, i.message]));
  return toCsv(rows);
}

export function sampleCsv(kind: "valid" | "errors", catalog: Product[]): string {
  const ok = catalog.filter((p) => !p.discontinued && p.stock !== "out_of_stock");
  const out = catalog.find((p) => p.stock === "out_of_stock");
  const disc = catalog.find((p) => p.discontinued);
  const rows: (string | number)[][] = [["SKU", "Quantity", "Reference"]];
  if (kind === "valid") {
    ok.slice(0, 8).forEach((p, i) => rows.push([p.sku, 2 + i, `LINE-${i + 1}`]));
  } else {
    rows.push([ok[0].sku, 4, "valid"], ["NOPE-0001", 2, "unknown sku"], [ok[1].sku, "abc", "bad qty"], [ok[0].sku, 3, "duplicate"],
      [ok[2].sku, 500, "over max"], ["", 1, "empty sku"]);
    if (out) rows.push([out.sku, 1, "out of stock"]);
    if (disc) rows.push([disc.sku, 1, "discontinued"]);
  }
  return toCsv(rows);
}

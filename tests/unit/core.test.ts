import { describe, expect, it } from "vitest";
import { STORES } from "@/mocks/stores";
import { PRODUCTS, SEED_INVOICES, FOREIGN_INVOICES, SEED_ORDERS } from "@/mocks/data";
import { can } from "@/lib/permissions";
import { sanitizeCell, toCsv, parseCsv } from "@/lib/csv";
import { parsePaste, validateBulk, validateCsvFile } from "@/lib/bulk";
import { buildReorder } from "@/lib/reorder";
import { canAccessInvoice } from "@/lib/invoices";

describe("stores dataset", () => {
  it("has exactly 36 unique stores with required country split", () => {
    expect(STORES).toHaveLength(36);
    expect(new Set(STORES.map((s) => s.id)).size).toBe(36);
    const c: Record<string, number> = {};
    STORES.forEach((s) => (c[s.country] = (c[s.country] ?? 0) + 1));
    expect(c).toMatchObject({ India: 12, "United States": 8, "United Kingdom": 6, Australia: 5, Canada: 5 });
    STORES.forEach((s) => { expect(Math.abs(s.lat)).toBeLessThanOrEqual(90); expect(Math.abs(s.lng)).toBeLessThanOrEqual(180); });
  });
});

describe("permissions", () => {
  it("excludes Junior Buyer from B2B features", () => {
    for (const p of ["quotes", "bulk", "reorder", "credit", "locator", "invoices", "users"] as const) expect(can("Junior Buyer", p)).toBe(false);
  });
  it("lets Senior use B2B features but not users or quote approval", () => {
    expect(can("Senior Purchase Manager", "bulk")).toBe(true);
    expect(can("Senior Purchase Manager", "users")).toBe(false);
    expect(can("Senior Purchase Manager", "quoteApprove")).toBe(false);
    expect(can("Admin", "users")).toBe(true);
  });
});

describe("csv", () => {
  it("neutralises formula injection", () => {
    expect(sanitizeCell("=cmd()")).not.toMatch(/^=/);
    expect(toCsv([["+1", "ok"]])).not.toMatch(/^\+/);
  });
  it("parses quoted cells", () => { expect(parseCsv('a,"b,c"\n1,2')[0]).toEqual(["a", "b,c"]); });
  it("rejects oversized or wrong-type files", () => {
    expect(validateCsvFile({ name: "x.csv", size: 5_000_000 }).length).toBeGreaterThan(0);
    expect(validateCsvFile({ name: "x.exe", size: 10 }).length).toBeGreaterThan(0);
  });
});

describe("bulk validation", () => {
  it("flags unknown SKUs and discontinued products", () => {
    const disc = PRODUCTS.find((p) => p.discontinued)!;
    const ok = PRODUCTS.find((p) => !p.discontinued && p.stock !== "out_of_stock")!;
    const r = validateBulk(parsePaste(`${ok.sku},${ok.minQty}\nNOPE-123,1\n${disc.sku},1`).rows, PRODUCTS);
    expect(r.lines.map((l) => l.productId)).toEqual([ok.id]);
    expect(r.rowsSubmitted).toBe(3);
    expect(r.rowsRejected).toBe(2);
    expect(r.issues.some((i) => i.sku.includes("NOPE"))).toBe(true);
  });
});

describe("reorder", () => {
  it("never marks discontinued items purchasable", () => {
    const disc = PRODUCTS.find((p) => p.discontinued)!;
    const o = { ...SEED_ORDERS[0], lines: [{ productId: disc.id, qty: 2, price: 10 }] };
    const l = buildReorder(o, PRODUCTS)[0];
    expect(l.purchasable).toBe(false);
    expect(l.qty).toBe(0);
  });
  it("flags missing products", () => {
    const o = { ...SEED_ORDERS[0], lines: [{ productId: "zzz", qty: 1, price: 1 }] };
    expect(buildReorder(o, PRODUCTS)[0].status).toBe("missing");
  });
});

describe("invoice authorization", () => {
  it("blocks Junior and other companies", () => {
    const own = SEED_INVOICES[0];
    expect(canAccessInvoice(own, { role: "Junior Buyer", companyId: own.companyId })).toBe(false);
    expect(canAccessInvoice(own, { role: "Admin", companyId: own.companyId })).toBe(true);
    expect(canAccessInvoice(FOREIGN_INVOICES[0], { role: "Admin", companyId: own.companyId })).toBe(false);
  });
});

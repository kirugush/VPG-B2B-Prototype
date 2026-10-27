/**
 * Service boundary.
 *
 * Every function here is the seam where a real backend plugs in. Today they run
 * against mock data so the storefront works with no credentials. Mapping:
 *
 *  - catalog*            -> BigCommerce GraphQL Storefront API (Catalyst `client.fetch`)
 *  - credit              -> src/lib/credit.ts + /api/credit/* (AWS in live mode)
 *  - invoices            -> src/lib/invoices.ts (AWS PDF + signed URL in live mode)
 */
import { CATEGORIES, PRODUCTS } from "@/mocks/data";
import type { Product } from "./types";

export interface CatalogQuery {
  category?: string;
  q?: string;
  brand?: string[];
  stock?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "name";
  page?: number;
  pageSize?: number;
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  brands: string[];
}

export function catalogSearch(query: CatalogQuery): CatalogResult {
  const pageSize = query.pageSize ?? 20;
  let list = PRODUCTS.slice();
  if (query.category) list = list.filter((p) => p.category === query.category);
  if (query.q) {
    const q = query.q.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q),
    );
  }
  const brands = Array.from(new Set(list.map((p) => p.brand))).sort();
  if (query.brand?.length) list = list.filter((p) => query.brand!.includes(p.brand));
  if (query.stock?.length) list = list.filter((p) => query.stock!.includes(p.stock));
  const eff = (p: Product) => p.offerPrice ?? p.price;
  if (query.minPrice != null) list = list.filter((p) => eff(p) >= query.minPrice!);
  if (query.maxPrice != null) list = list.filter((p) => eff(p) <= query.maxPrice!);
  if (query.sort === "price_asc") list.sort((a, b) => eff(a) - eff(b));
  else if (query.sort === "price_desc") list.sort((a, b) => eff(b) - eff(a));
  else if (query.sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), pages);
  return { items: list.slice((page - 1) * pageSize, page * pageSize), total, page, pages, brands };
}

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export function relatedProducts(product: Product, exclude: string[] = [], n = 8): Product[] {
  return PRODUCTS.filter((p) => !p.discontinued && p.category === product.category && p.id !== product.id && !exclude.includes(p.id))
    .concat(PRODUCTS.filter((p) => !p.discontinued && p.category !== product.category))
    .filter((p) => !exclude.includes(p.id) && p.id !== product.id)
    .slice(0, n);
}

import type { Role } from "./types";

/**
 * Central permission matrix.
 *
 * The B2B feature set (quotes, bulk orders, re-order, invoices, credit & account
 * status, store locator, company users) is for Admin and Senior Purchase Manager
 * only. Junior Buyers keep the original storefront: browse, order within available
 * credit, view orders, favourites and addresses.
 *
 * NOTE: this drives UI and route guards. In live mode the same rules MUST be enforced
 * server-side (BigCommerce B2B Edition roles / AWS authorizer) - never trust the browser.
 */
export type Permission =
  | "quotes"
  | "quoteApprove"
  | "quoteConvert"
  | "orders"
  | "orderActions"
  | "bulk"
  | "reorder"
  | "invoices"
  | "credit"
  | "locator"
  | "favorites"
  | "addresses"
  | "users"
  | "settings"
  | "logo";

const SENIOR: Permission[] = [
  "quotes", "quoteConvert", "orders", "orderActions", "bulk", "reorder", "invoices",
  "credit", "locator", "favorites", "addresses", "settings",
];

export const PERMISSIONS: Record<Role, Permission[]> = {
  Admin: [...SENIOR, "quoteApprove", "users", "logo"],
  "Senior Purchase Manager": SENIOR,
  "Junior Buyer": ["orders", "favorites", "addresses"],
};

export function can(role: Role | undefined, perm: Permission): boolean {
  if (!role) return false;
  return PERMISSIONS[role].includes(perm);
}

/** Roles that may use the B2B feature set. */
export const isB2BRole = (role: Role | undefined) => can(role, "quotes");

export const PERMISSION_LABELS: Record<Permission, string> = {
  quotes: "Quotes (view, request, edit, submit)",
  quoteApprove: "Quotes - approve / reject",
  quoteConvert: "Quotes - convert approved quote to order",
  orders: "View orders",
  orderActions: "Order actions (re-order, cancellation request)",
  bulk: "Bulk ordering",
  reorder: "Re-order",
  invoices: "Invoices",
  credit: "Credit & account status",
  locator: "Store locator",
  favorites: "Favourites & saved lists",
  addresses: "Address book",
  users: "Company users & permissions",
  settings: "Account settings",
  logo: "Company logo upload",
};

/** Map an /account path to the permission that guards it. */
export function permissionForPath(path: string): Permission | null {
  const table: [string, Permission][] = [
    ["/account/quotes", "quotes"],
    ["/account/bulk-orders", "bulk"],
    ["/account/reorder", "reorder"],
    ["/account/invoices", "invoices"],
    ["/account/credit", "credit"],
    ["/account/store-locator", "locator"],
    ["/account/users", "users"],
    ["/account/settings", "settings"],
  ];
  const hit = table.find(([p]) => path === p || path.startsWith(p + "/"));
  return hit ? hit[1] : null;
}

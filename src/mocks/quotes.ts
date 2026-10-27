import type { Quote, QuoteStatus } from "@/lib/types";
import { PRODUCTS, SEED_USERS, COMPANY, OTHER_COMPANIES } from "./data";

/**
 * 24 demonstration quotes: 18 for the signed-in company (c1) covering every status,
 * plus 6 for other companies that must never be visible to c1 users.
 * Dates are fixed (not "now") so fixtures are stable.
 */
const BASE = Date.UTC(2026, 9, 21, 4, 0);
const DAY = 86400000;
const iso = (offsetDays: number) => new Date(BASE + offsetDays * DAY).toISOString();
const r2 = (n: number) => Math.round(n * 100) / 100;

const TITLES = [
  "Q4 compressor refresh", "Walk-in cold room sensors", "Pump rebuild kits - resort kitchens", "Filter cartridges (annual)",
  "Control boards for 6 machines", "Evaporator plates - bar line", "Fan motors and capacitors", "Descaler & sanitiser stock-up",
  "Valve assortment", "Hoshizaki service bundle", "Scotsman spares", "Cutter grids (x4)", "Bin thermostat probes",
  "Maintenance kits - all outlets", "Water level sensors", "Condenser coils - 3 sites", "Drain pump replacements", "Cleaning programme H1",
  "Marine ice maker parts", "Resort laundry-room fittings", "Bakery proofing sensors", "Island ferry galley kit", "Dockside chiller parts", "Spare relay boards",
];

const STATUS_PLAN: QuoteStatus[] = [
  "Draft", "Draft",
  "Submitted", "Submitted", "Submitted",
  "Under Review", "Under Review", "Under Review",
  "Approved", "Approved", "Approved", "Approved",
  "Rejected", "Rejected",
  "Expired", "Expired",
  "Converted", "Converted",
];

function build(i: number, status: QuoteStatus, companyId: string, companyName: string, contact: { name: string; email: string; by: string }): Quote {
  const n = 3 + (i % 3);
  const lines = Array.from({ length: n }, (_, k) => {
    const p = PRODUCTS[(i * 7 + k * 11) % PRODUCTS.length];
    const list = p.offerPrice ?? p.price;
    return { productId: p.id, qty: 2 + ((i + k) % 6) * 2, listPrice: list, quotedPrice: r2(list * (0.88 + ((i + k) % 5) * 0.02)) };
  });
  const createdDays = -(40 - i);
  const expiresDays = status === "Expired" ? -(3 + (i % 5)) : status === "Approved" ? 14 + (i % 20) : status === "Converted" ? 10 : 21 + (i % 10);
  const id = `Q-2026-${String(i + 1).padStart(4, "0")}`;
  const history = [{ at: iso(createdDays), by: contact.name, event: "Quote created" }];
  if (status !== "Draft") history.push({ at: iso(createdDays + 1), by: contact.name, event: "Submitted for review" });
  if (["Under Review", "Approved", "Rejected", "Converted", "Expired"].includes(status)) history.push({ at: iso(createdDays + 2), by: "VPG Sales", event: "Review started" });
  if (["Approved", "Converted"].includes(status)) history.push({ at: iso(createdDays + 4), by: "Anita Sharma", event: "Approved" });
  if (status === "Rejected") history.push({ at: iso(createdDays + 4), by: "Anita Sharma", event: "Rejected: pricing outside agreed band" });
  if (status === "Converted") history.push({ at: iso(createdDays + 6), by: "Ravi Prasad", event: "Converted to order" });
  return {
    id,
    title: TITLES[i % TITLES.length],
    companyId,
    companyName,
    contactName: contact.name,
    contactEmail: contact.email,
    createdBy: contact.by,
    createdAt: iso(createdDays),
    expiresAt: iso(expiresDays),
    status,
    lines,
    discountPct: [0, 5, 0, 7.5, 10][i % 5],
    assignedRep: i % 3 === 0 ? undefined : ["Lani Cakau", "Jone Ratu", "Priya Singh"][i % 3],
    notes: i % 2 ? [{ at: iso(createdDays + 1), by: "VPG Sales", visibility: "customer", text: "Prices valid for the quote period; freight quoted separately." }, { at: iso(createdDays + 1), by: "VPG Sales", visibility: "internal", text: "Margin check done - within band." }] : [],
    history,
    mock: true,
  };
}

const u = (id: string) => SEED_USERS.find((x) => x.id === id)!;
const contacts = [u("u1"), u("u2")].map((x) => ({ name: `${x.firstName} ${x.lastName}`, email: x.email, by: x.id }));

export const SEED_QUOTES: Quote[] = [
  ...STATUS_PLAN.map((s, i) => build(i, s, COMPANY.id, COMPANY.name, contacts[i % 2])),
  ...OTHER_COMPANIES.flatMap((c, k) => [
    build(18 + k * 2, "Approved", c.id, c.name, { name: "Other Buyer", email: `buyer@${c.id}.example`, by: "x1" }),
    build(19 + k * 2, "Submitted", c.id, c.name, { name: "Other Buyer", email: `buyer@${c.id}.example`, by: "x1" }),
  ]),
];
// Converted quotes (index 16, 17) link to mock orders ORD-10245 / ORD-10251, which link back via quoteId.
SEED_QUOTES[16].orderId = "ORD-10245";
SEED_QUOTES[17].orderId = "ORD-10251";

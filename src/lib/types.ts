export type Role = "Admin" | "Senior Purchase Manager" | "Junior Buyer";
export const ROLES: Role[] = ["Admin", "Senior Purchase Manager", "Junior Buyer"];

export type Stock = "in_stock" | "out_of_stock" | "three_days";

export interface Product {
  id: string;
  sku: string;
  title: string;
  description: string;
  category: string; // category slug
  brand: string;
  image: string;
  gallery: string[];
  uom: string;
  price: number;
  offerPrice?: number;
  stock: Stock;
  minQty: number;
  maxQty: number;
  specs: Record<string, string>;
  /** Discontinued products can be viewed but never purchased. */
  discontinued?: boolean;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export type UserStatus = "Active" | "Invited" | "Disabled";

export interface User {
  id: string;
  companyId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  department?: string;
  password: string;
  status?: UserStatus;
  primaryContact?: boolean;
}

export interface Company {
  id: string;
  name: string;
  bpgNumber: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
  creditUsed: number;
  logoUrl: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  line1: string;
  line2: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  productIds: string[];
  companyId?: string;
  ownerId?: string;
  /** Shared lists are visible to every user in the company. */
  shared?: boolean;
}

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "Awaiting payment" | "Authorized" | "Paid" | "Partially refunded" | "Refunded";
export type FulfillmentStatus = "Unfulfilled" | "Partially fulfilled" | "Fulfilled" | "Cancelled";

export interface OrderLine {
  productId: string;
  qty: number;
  price: number; // unit price actually charged at the time
}

export interface OrderEvent {
  at: string;
  event: string;
}

export interface Order {
  id: string;
  companyId?: string;
  customerName?: string;
  date: string; // ISO
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  po: string;
  lines: OrderLine[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  gst: number;
  total: number;
  shippingMethod: string;
  deliveryMethod: string;
  payment: string;
  shippingAddress: string;
  billingAddress: string;
  tracking?: string;
  carrier?: string;
  quoteId?: string;
  bulkRef?: string;
  cancellationRequested?: boolean;
  history?: OrderEvent[];
  /** True for fixtures and for orders created while running in mock mode. */
  mock?: boolean;
}

export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

export interface Invoice {
  id: string;
  companyId?: string;
  issued: string;
  due: string;
  amount: number;
  status: InvoiceStatus;
  orderId?: string;
}

/* ---------------- Quotes ---------------- */
export type QuoteStatus = "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected" | "Expired" | "Converted";

export interface QuoteLine {
  productId: string;
  qty: number;
  listPrice: number;
  quotedPrice: number;
}

export interface QuoteNote {
  at: string;
  by: string;
  visibility: "internal" | "customer";
  text: string;
}

export interface QuoteEvent {
  at: string;
  by: string;
  event: string;
}

export interface Quote {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  status: QuoteStatus;
  lines: QuoteLine[];
  /** Percentage discount applied on top of quoted prices (0-30). */
  discountPct: number;
  assignedRep?: string;
  notes: QuoteNote[];
  history: QuoteEvent[];
  orderId?: string;
  mock?: boolean;
}

/* ---------------- Bulk ordering ---------------- */
export interface BulkSubmission {
  id: string;
  at: string;
  userId: string;
  userName: string;
  companyId: string;
  source: "quick" | "paste" | "csv" | "list" | "order";
  fileName?: string;
  linesSubmitted: number;
  linesValid: number;
  linesRejected: number;
  outcome: "Added to cart" | "Quote requested" | "Saved only";
  reference: string;
}

/* ---------------- Stores ---------------- */
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type WeeklyHours = Record<DayKey, [string, string] | null>;

export interface Store {
  id: string;
  number: string;
  name: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
  /** True when the coordinate is a city-centre approximation. */
  coordsApproximate: boolean;
  phone: string;
  email: string;
  hours: WeeklyHours;
  timeZone: string;
  services: string[];
  description: string;
  active: boolean;
  /** All generated records are demonstration data. */
  demo: true;
}

/* ---------------- Credit ---------------- */
export interface CreditAccount {
  companyId: string;
  accountStatus: "Good standing" | "On hold" | "Under review" | "Restricted";
  approvedLimit: number;
  utilized: number;
  available: number;
  pending: number;
  lastSync: string; // ISO
  reviewStatus: "None" | "Scheduled" | "In progress";
  restrictions: string[];
  source: "mock" | "live";
}

export interface CreditDecision {
  approved: boolean;
  available: number;
  shortfall: number;
  decisionId: string;
  checkedAt: string;
}

/* ---------------- Audit ---------------- */
export interface AuditEvent {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  detail: string;
}

export const GST_RATE = 0.15; // Fiji VAT 15%; set per market
export const STATES = [
  "NSW",
  "VIC",
  "QLD",
  "WA",
  "SA",
  "TAS",
  "ACT",
  "NT",
  "Central Division",
  "Western Division",
  "Northern Division",
  "Eastern Division",
];
export const DEPARTMENTS = ["Procurement", "Operations", "Finance", "Maintenance", "Warehouse"];

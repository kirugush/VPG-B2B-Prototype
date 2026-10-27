import type {
  Address,
  FulfillmentStatus,
  PaymentStatus,
  Company,
  Invoice,
  Order,
  Product,
  ShoppingList,
  Stock,
  User,
} from "@/lib/types";

/* ---------- Categories (mirror of the reference-site mega menu; edit freely) ---------- */
export interface Category {
  slug: string;
  name: string;
  children: string[];
}
export const CATEGORIES: Category[] = [
  { slug: "water-pumps", name: "Water Pumps", children: ["Circulation Pumps", "Drain Pumps", "Pump Kits"] },
  { slug: "valves", name: "Valves & Solenoids", children: ["Water Inlet Valves", "Hot Gas Valves", "Dump Valves"] },
  { slug: "condensers", name: "Condensers & Fans", children: ["Fan Motors", "Fan Blades", "Condenser Coils"] },
  { slug: "compressors", name: "Compressors", children: ["Reciprocating", "Scroll", "Start Kits"] },
  { slug: "sensors", name: "Sensors & Probes", children: ["Bin Thermostats", "Thickness Probes", "Water Level Sensors"] },
  { slug: "controls", name: "Control Boards", children: ["Main Boards", "Relays & Contactors", "Display Boards"] },
  { slug: "evaporators", name: "Evaporators & Ice Making", children: ["Evaporator Plates", "Water Distributors", "Cutter Grids"] },
  { slug: "filtration", name: "Filters & Water Treatment", children: ["Cartridges", "Housings", "Scale Inhibitors"] },
  { slug: "cleaning", name: "Cleaning & Sanitisers", children: ["Ice Machine Cleaner", "Sanitiser", "Maintenance Kits"] },
];

const PALETTE = ["#1f5aa6", "#2f7d6d", "#7a4fa3", "#b5651d", "#3b6ea5", "#8a2f3b", "#4a5d23", "#34495e"];

export function placeholderImage(label: string, idx = 0): string {
  const c = PALETTE[idx % PALETTE.length];
  const text = label.length > 22 ? label.slice(0, 21) + "…" : label;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c}' stop-opacity='.15'/><stop offset='1' stop-color='${c}' stop-opacity='.35'/></linearGradient></defs><rect width='400' height='400' fill='url(#g)'/><circle cx='200' cy='170' r='70' fill='none' stroke='${c}' stroke-width='10'/><rect x='170' y='140' width='60' height='60' rx='8' fill='${c}' opacity='.8'/><text x='200' y='310' font-family='sans-serif' font-size='20' fill='${c}' text-anchor='middle'>${text.replace(/&/g, "&amp;")}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ---------- Products ---------- */
const BRANDS = ["Manitowoc", "Scotsman", "Hoshizaki", "Ice-O-Matic", "Universal"];
const STOCKS: Stock[] = ["in_stock", "in_stock", "in_stock", "three_days", "in_stock", "out_of_stock"];
const UOMS = ["Each", "Each", "Each", "Pack of 2", "Kit", "Each"];

const NAMES: Record<string, string[]> = {
  "water-pumps": ["Circulation Pump 230V", "Drain Pump 115V", "Pump Rebuild Kit", "Water Pump Motor", "Pump Impeller Set", "Sump Pump Assembly", "Submersible Pump 24V"],
  valves: ["Water Inlet Valve 1/4in", "Hot Gas Solenoid Valve", "Dump Valve 24V", "Check Valve Brass", "Solenoid Coil 120V", "Flow Control Valve", "Purge Valve Assembly"],
  condensers: ["Fan Motor 230V", "Fan Blade 9in", "Condenser Coil Air-Cooled", "Fan Cycle Control", "Condenser Fan Shroud", "Water-Cooled Condenser", "Fan Capacitor 5uF"],
  compressors: ["Compressor 1HP R404A", "Compressor Start Kit", "Scroll Compressor 2HP", "Run Capacitor 40uF", "Compressor Relay", "Overload Protector", "Compressor Mounting Kit"],
  sensors: ["Bin Thermostat Probe", "Ice Thickness Probe", "Water Level Sensor", "Thermistor Assembly", "Evaporator Temp Sensor", "Bin Level Control", "Float Switch"],
  controls: ["Main Control Board", "Contactor 24V", "Display Board", "Relay Board 12V", "Control Transformer", "Wiring Harness", "Power Switch Assembly"],
  evaporators: ["Evaporator Plate Assembly", "Water Distributor Tube", "Cutter Grid 30in", "Water Curtain", "Evaporator Cover", "Spray Bar Kit", "Ice Chute Assembly"],
  filtration: ["Water Filter Cartridge", "Filter Housing Single", "Scale Inhibitor Cartridge", "Filter Head Assembly", "Carbon Filter 10in", "Replacement Filter Twin Pack", "Pre-Filter Sediment"],
  cleaning: ["Ice Machine Cleaner 4L", "Nickel-Safe Sanitiser 4L", "Descaler Concentrate 1L", "Cleaning Brush Set", "Maintenance Kit Annual", "Sanitising Wipes", "Lubricant Food-Grade"],
};

function buildProducts(): Product[] {
  const out: Product[] = [];
  let n = 0;
  CATEGORIES.forEach((cat, ci) => {
    NAMES[cat.slug].forEach((name, i) => {
      n++;
      const price = Math.round((18 + ((n * 37) % 420) + i * 6.5) * 100) / 100;
      const offer = n % 3 === 0 ? Math.round(price * 0.88 * 100) / 100 : undefined;
      const brand = BRANDS[(ci + i) % BRANDS.length];
      out.push({
        id: `p${n}`,
        sku: `VPG-${(1000 + n * 7).toString()}`,
        title: `${name}`,
        description: `${brand}-compatible ${name.toLowerCase()} for commercial ice machines. Built to OEM tolerances for reliable, long-life service.`,
        category: cat.slug,
        brand,
        image: placeholderImage(name, ci),
        gallery: [0, 1, 2, 3].map((k) => placeholderImage(`${name} #${k + 1}`, ci + k)),
        uom: UOMS[(n + i) % UOMS.length],
        price,
        offerPrice: offer,
        stock: STOCKS[(n + ci) % STOCKS.length],
        minQty: 1,
        maxQty: 99,
        discontinued: [12, 33, 47].includes(n) || undefined,
        specs: {
          Brand: brand,
          SKU: `VPG-${1000 + n * 7}`,
          Voltage: i % 2 ? "115V" : "230V",
          Material: i % 3 === 0 ? "Stainless steel" : "Food-grade polymer",
          Warranty: "12 months",
          "Compatible models": `${brand} series ${100 + i * 20}-${400 + i * 20}`,
        },
      });
    });
  });
  return out;
}
export const PRODUCTS: Product[] = buildProducts();

/* ---------- Companies, users, addresses ---------- */
export const COMPANY: Company = {
  id: "c1",
  name: "Coral Coast Hospitality Pty Ltd",
  bpgNumber: "VPG-204518",
  email: "accounts@coralcoast.example",
  phone: "+679 331 0000",
  address: "12 Harbour Street, Suva, Central Division, Fiji",
  creditLimit: 50000,
  creditUsed: 18450,
  // Sample placeholder customer logo (replaced by Admin upload)
  logoUrl:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='64' viewBox='0 0 220 64'><rect width='220' height='64' rx='8' fill='#0e7490'/><circle cx='32' cy='32' r='16' fill='#fff' opacity='.9'/><text x='58' y='39' font-family='sans-serif' font-size='20' font-weight='700' fill='#fff'>Coral Coast</text></svg>`,
    ),
};

/** Other B2B companies. Only c1 is the signed-in tenant; the others prove company-level data isolation. */
export const OTHER_COMPANIES = [
  { id: "c2", name: "Pacific Marine Supplies Ltd", bpgNumber: "VPG-118203" },
  { id: "c3", name: "Island Resorts Group", bpgNumber: "VPG-330774" },
  { id: "c4", name: "Harbour Bakery Co", bpgNumber: "VPG-402991" },
];

export const SEED_USERS: User[] = [
  { id: "u1", companyId: "c1", firstName: "Anita", lastName: "Sharma", email: "admin@demo.com", phone: "+679 900 1111", role: "Admin", department: "Finance", password: "Password1!", primaryContact: true, status: "Active" },
  { id: "u2", companyId: "c1", firstName: "Ravi", lastName: "Prasad", email: "manager@demo.com", phone: "+679 900 2222", role: "Senior Purchase Manager", department: "Procurement", password: "Password1!", status: "Active" },
  { id: "u3", companyId: "c1", firstName: "Mere", lastName: "Tui", email: "buyer@demo.com", phone: "+679 900 3333", role: "Junior Buyer", department: "Operations", password: "Password1!", status: "Active" },
  { id: "u4", companyId: "c1", firstName: "Sefa", lastName: "Naidu", email: "sefa@coralcoast.example", phone: "+679 900 4444", role: "Junior Buyer", department: "Warehouse", password: "Welcome1!", status: "Invited" },
];

export const SEED_ADDRESSES: Address[] = [
  { id: "a1", firstName: "Anita", lastName: "Sharma", company: COMPANY.name, line1: "12 Harbour Street", line2: "", suburb: "Suva", state: "Central Division", postcode: "0000", country: "Fiji", phone: "+679 331 0000", isDefault: true },
  { id: "a2", firstName: "Ravi", lastName: "Prasad", company: COMPANY.name, line1: "Lot 4 Queens Road", line2: "Warehouse B", suburb: "Nadi", state: "Western Division", postcode: "0000", country: "Fiji", phone: "+679 670 0000", isDefault: false },
];

export const SEED_LISTS: ShoppingList[] = [
  { id: "l1", name: "Monthly consumables", productIds: ["p57", "p58", "p59", "p50"], companyId: "c1", ownerId: "u2", shared: true },
  { id: "l2", name: "Hoshizaki service kit", productIds: ["p1", "p8", "p12", "p15"], companyId: "c1", ownerId: "u1", shared: false },
  { id: "l3", name: "Buyer shortlist", productIds: ["p20", "p21"], companyId: "c1", ownerId: "u3", shared: false },
  { id: "l4", name: "Other company list (hidden)", productIds: ["p2"], companyId: "c2", ownerId: "x9", shared: true },
];

/* ---------- Orders (32, all marked mock) ---------- */
const addr = "Anita Sharma, Coral Coast Hospitality Pty Ltd, 12 Harbour Street, Suva, Central Division, Fiji";
const r2 = (n: number) => Math.round(n * 100) / 100;
const PRICE_FACTOR = [0.9, 1, 1.08, 1, 0.95, 1.12];
const EXTRA: Record<number, string> = { 3: "p12", 6: "p33", 9: "p47", 14: "p6", 17: "p12" };

const PAY: Record<Order["status"], PaymentStatus> = {
  Pending: "Awaiting payment",
  Processing: "Authorized",
  Shipped: "Paid",
  Delivered: "Paid",
  Cancelled: "Refunded",
};
const FULFIL: Record<Order["status"], FulfillmentStatus> = {
  Pending: "Unfulfilled",
  Processing: "Unfulfilled",
  Shipped: "Partially fulfilled",
  Delivered: "Fulfilled",
  Cancelled: "Cancelled",
};
/** order index -> quote id (converted quotes link back to these orders) */
export const QUOTE_ORDER_LINKS: Record<number, string> = { 5: "Q-2026-0017", 11: "Q-2026-0018" };

function mkOrder(i: number, status: Order["status"], daysAgo: number, ids: [string, number][]): Order {
  const f = PRICE_FACTOR[i % PRICE_FACTOR.length];
  const lines = ids.map(([pid, qty]) => {
    const p = PRODUCTS.find((x) => x.id === pid)!;
    return { productId: pid, qty, price: r2((p.offerPrice ?? p.price) * f) };
  });
  const subtotal = r2(lines.reduce((s, l) => s + l.price * l.qty, 0));
  const gst = r2(subtotal * 0.15);
  const shipping = i % 5 === 0 ? 0 : i % 2 ? 60 : 25;
  const d = new Date(Date.UTC(2026, 9, 14 - daysAgo, 3, 20));
  const iso = d.toISOString();
  const shipped = status === "Shipped" || status === "Delivered";
  const history: Order["history"] = [{ at: iso, event: "Order placed" }];
  if (status !== "Pending") history.push({ at: new Date(d.getTime() + 3600e3).toISOString(), event: "Payment authorized" });
  if (shipped) history.push({ at: new Date(d.getTime() + 36e5 * 30).toISOString(), event: "Shipped with FijiPost" });
  if (status === "Delivered") history.push({ at: new Date(d.getTime() + 36e5 * 96).toISOString(), event: "Delivered" });
  if (status === "Cancelled") history.push({ at: new Date(d.getTime() + 36e5 * 5).toISOString(), event: "Order cancelled and payment refunded" });
  return {
    id: `ORD-${10240 + i}`,
    companyId: "c1",
    customerName: i % 3 === 0 ? "Anita Sharma" : i % 3 === 1 ? "Ravi Prasad" : "Mere Tui",
    date: iso,
    status,
    paymentStatus: PAY[status],
    fulfillmentStatus: FULFIL[status],
    po: `PO-${5500 + i}`,
    lines,
    subtotal,
    discount: 0,
    shipping,
    gst,
    total: r2(subtotal + gst + shipping),
    shippingMethod: i % 2 ? "Overnight Shipping" : "Standard Shipping",
    deliveryMethod: "Ship to My Location",
    payment: "Pay by Account",
    shippingAddress: addr,
    billingAddress: addr,
    tracking: shipped ? `FJ${700000 + i * 31}` : undefined,
    carrier: shipped ? "FijiPost" : undefined,
    quoteId: QUOTE_ORDER_LINKS[i],
    bulkRef: i % 7 === 4 ? `BULK-${2000 + i}` : undefined,
    history,
    mock: true,
  };
}
const STAT: Order["status"][] = ["Pending", "Processing", "Shipped", "Delivered", "Delivered", "Shipped", "Cancelled", "Processing"];
export const SEED_ORDERS: Order[] = Array.from({ length: 32 }, (_, i) => {
  const lines: [string, number][] = [
    [`p${((i * 3) % 60) + 1}`, (i % 4) + 1],
    [`p${((i * 5 + 7) % 60) + 1}`, (i % 3) + 1],
  ];
  if (EXTRA[i]) lines.push([EXTRA[i], 2]);
  return mkOrder(i, STAT[i % STAT.length], i * 3 + 1, lines);
});

export const SEED_INVOICES: Invoice[] = Array.from({ length: 24 }, (_, i) => {
  const o = SEED_ORDERS[i];
  const issued = new Date(o.date);
  const due = new Date(issued.getTime() + 30 * 86400000);
  const status: Invoice["status"] = i % 5 === 0 ? "Overdue" : i % 3 === 0 ? "Pending" : "Paid";
  return { id: `INV-${30500 + i}`, companyId: "c1", issued: issued.toISOString(), due: due.toISOString(), amount: o.total, status, orderId: o.id };
});
/** Invoices of another company: must never be reachable by c1 users. */
export const FOREIGN_INVOICES: Invoice[] = [
  { id: "INV-99001", companyId: "c2", issued: "2026-09-01T00:00:00.000Z", due: "2026-10-01T00:00:00.000Z", amount: 1520.5, status: "Paid" },
];

/* ---------- Store info for click & collect ---------- */
export const STORE = {
  name: "Vinod Patel Group – Suva Trade Counter",
  address: "Foster Road, Walu Bay, Suva, Fiji",
  hours: "Mon–Fri 7:30am–5:00pm, Sat 8:00am–1:00pm",
  phone: "+679 331 2000",
};

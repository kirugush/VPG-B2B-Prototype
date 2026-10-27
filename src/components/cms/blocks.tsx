import Link from "next/link";
import { Headphones, PackageCheck, ShieldCheck, Truck } from "lucide-react";

/**
 * Makeswift-editable presentation blocks.
 *
 * Rules (see ARCHITECTURE.md): CMS controls only presentation/content props. These
 * components never receive or modify authorization, pricing, credit or transaction logic.
 * Every prop has a default so a missing CMS field falls back to sensible content.
 */

export interface CampaignBannerProps { text?: string; ctaLabel?: string; ctaHref?: string; tone?: "brand" | "dark" | "light" }
export function CampaignBanner({ text = "Annual maintenance kits now available for trade accounts.", ctaLabel = "Shop now", ctaHref = "/category/cleaning", tone = "brand" }: CampaignBannerProps) {
  const cls = tone === "dark" ? "bg-black text-white" : tone === "light" ? "bg-brand-50 text-brand-800" : "bg-brand-600 text-white";
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-lg px-5 py-3 ${cls}`}>
      <p className="text-sm font-medium">{text}</p>
      <Link href={ctaHref} className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-gray-100">{ctaLabel}</Link>
    </div>
  );
}

export interface InfoPanelProps { title?: string; items?: string[]; footnote?: string }

export function BulkOrderInstructions({
  title = "How bulk ordering works",
  items = [
    "Enter SKUs and quantities in the quick form, paste lines from a spreadsheet, or upload a CSV.",
    "CSV columns: SKU, Quantity and an optional Reference. Maximum 500 rows and 1 MB.",
    "Prices, stock and eligibility are always looked up from the catalog. Prices in a file are ignored.",
    "Review the preview, fix any flagged rows, then add the valid lines to your cart. Uploading never places an order.",
  ],
  footnote = "Displayed price and stock are confirmed at checkout.",
}: InfoPanelProps) {
  return (
    <section className="card p-4" aria-labelledby="bulk-help">
      <h2 id="bulk-help" className="font-bold">{title}</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-600">{items.map((t) => <li key={t}>{t}</li>)}</ol>
      {footnote && <p className="mt-2 text-xs text-gray-500">{footnote}</p>}
    </section>
  );
}

export function QuoteRequestInfo({
  title = "Requesting a quote",
  items = [
    "Choose products and quantities, then save as a draft or submit for review.",
    "Our team reviews pricing; Admins approve or reject submitted quotes.",
    "Approved quotes stay valid until their expiry date and can be converted to an order once.",
  ],
  footnote,
}: InfoPanelProps) {
  return (
    <section className="rounded-lg border border-brand-100 bg-brand-25 p-4" aria-labelledby="quote-help">
      <h2 id="quote-help" className="font-bold text-brand-700">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">{items.map((t) => <li key={t}>{t}</li>)}</ul>
      {footnote && <p className="mt-2 text-xs text-gray-500">{footnote}</p>}
    </section>
  );
}

export function StoreLocatorIntro({ title = "Find a trade counter", body = "Search our 36 demonstration stores by name, city, state or postal code, or use your location to see what is nearest." }: { title?: string; body?: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-gray-600">{body}</p>
    </div>
  );
}

export interface FaqItem { q: string; a: string }
export function FaqSection({
  title = "Frequently asked questions",
  items = [
    { q: "Why was my CSV row rejected?", a: "Rows are rejected for unknown or empty SKUs, quantities that are not whole numbers, quantities outside the product's min/max, and products that are discontinued or out of stock. Download the error report for details." },
    { q: "Can I change the price in my file?", a: "No. Prices always come from your account's eligible catalog pricing." },
    { q: "Does uploading a file place an order?", a: "No. Valid lines are added to your cart and you continue through the normal checkout." },
    { q: "Who can approve quotes?", a: "Company Admins. Senior Purchase Managers can create, edit, submit and convert approved quotes." },
  ],
}: { title?: string; items?: FaqItem[] }) {
  return (
    <section aria-labelledby="faq-h">
      <h2 id="faq-h" className="mb-2 font-bold">{title}</h2>
      <div className="card divide-y">
        {items.map((f) => (
          <details key={f.q} className="group p-3">
            <summary className="cursor-pointer text-sm font-medium">{f.q}</summary>
            <p className="mt-2 text-sm text-gray-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ContactPanel({ title = "Need help?", phone = "+679 331 2000", email = "tradesales@example.com", hours = "Mon-Fri 7:30am-5:00pm" }: { title?: string; phone?: string; email?: string; hours?: string }) {
  return (
    <section className="card p-4 text-sm">
      <h2 className="mb-1 font-bold">{title}</h2>
      <p>Phone: <a className="text-brand-600 hover:underline" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></p>
      <p>Email: <a className="text-brand-600 hover:underline" href={`mailto:${email}`}>{email}</a></p>
      <p className="text-gray-500">{hours}</p>
    </section>
  );
}

export function ServiceHighlights({ items = [
  { icon: "truck", title: "Fast dispatch", body: "Same-day dispatch on in-stock parts." },
  { icon: "shield", title: "12-month warranty", body: "On all compatible parts." },
  { icon: "pack", title: "Account pricing", body: "Negotiated and offer prices at checkout." },
  { icon: "support", title: "Technical support", body: "Parts identification by phone." },
] }: { items?: { icon: string; title: string; body: string }[] }) {
  const icons: Record<string, typeof Truck> = { truck: Truck, shield: ShieldCheck, pack: PackageCheck, support: Headphones };
  return (
    <section aria-label="Service highlights" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => { const I = icons[s.icon] ?? Truck; return (
        <div key={s.title} className="card flex gap-3 p-4"><I className="h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" /><div><p className="font-semibold">{s.title}</p><p className="text-sm text-gray-600">{s.body}</p></div></div>
      ); })}
    </section>
  );
}

export function ProductEducation({ title = "Choosing the right part", body = "Match the machine model, voltage and refrigerant before ordering. Call technical support if unsure." }: { title?: string; body?: string }) {
  return <section className="rounded-lg bg-gray-100 p-4"><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-gray-600">{body}</p></section>;
}

export function CategoryIntro({ title, body }: { title: string; body?: string }) {
  return <section><h2 className="text-lg font-bold">{title}</h2>{body && <p className="text-sm text-gray-600">{body}</p>}</section>;
}

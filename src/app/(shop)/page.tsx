"use client";
import Link from "next/link";
import { CreditCard, FileText, Package, Truck } from "lucide-react";
import { Hero } from "@/components/cms/Hero";
import { Promotions } from "@/components/cms/Promotions";
import { ProductCard } from "@/components/ProductCard";
import { money } from "@/components/ui";
import { PRODUCTS } from "@/mocks/data";
import { useApp } from "@/lib/store";

function Widget({ icon, title, value, href, children }: { icon: React.ReactNode; title: string; value?: React.ReactNode; href?: string; children?: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">{icon}{title}</div>
      {value !== undefined && <p className="mt-2 text-3xl font-extrabold text-brand-700">{value}</p>}
      {children}
      {href && <Link href={href} className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline">View All</Link>}
    </div>
  );
}

export default function Home() {
  const { user, orders, invoices, company, availableCredit } = useApp();
  const open = orders.filter((o) => o.status === "Pending" || o.status === "Processing").length;
  const shipping = orders.filter((o) => o.status === "Shipped").length;
  const invCount = invoices.filter((i) => i.status !== "Paid").length;
  const featured = PRODUCTS.filter((p) => p.offerPrice && p.stock !== "out_of_stock").slice(0, 8);
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-sm text-slate-500">Welcome back, <b>{user?.firstName}</b> · {user?.role}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Widget icon={<Package className="h-4 w-4" />} title="Open Orders" value={open} href="/account/orders?status=open" />
          <Widget icon={<Truck className="h-4 w-4" />} title="Shipping Orders" value={shipping} href="/account/orders?status=Shipped" />
          <Widget icon={<FileText className="h-4 w-4" />} title="Invoices" value={invCount} href="/account/invoices" />
          <Widget icon={<CreditCard className="h-4 w-4" />} title="Credit Information">
            <p className="mt-2 text-sm text-slate-500">Total limit</p><p className="text-lg font-bold">{money(company.creditLimit)}</p>
            <p className="mt-1 text-sm text-slate-500">Available</p><p className="text-lg font-bold text-green-700">{money(availableCredit)}</p>
          </Widget>
        </div>
        {user?.role === "Junior Buyer" && <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">As a Junior Buyer you can place orders up to the available credit limit of {money(availableCredit)}.</p>}
      </div>
      <Hero />
      <section>
        <div className="mb-3 flex items-end justify-between"><h2 className="text-xl font-bold">Featured Products</h2><Link href="/search?q=" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{featured.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>
      <Promotions />
    </div>
  );
}

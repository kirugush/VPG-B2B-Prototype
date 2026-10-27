"use client";
import Link from "next/link";
import { StatusBadge, StatusLegend, fmtDate, money } from "@/components/ui";
import { can } from "@/lib/permissions";
import { useApp } from "@/lib/store";

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (<div className="flex justify-between gap-3 border-b py-1.5 text-sm last:border-0"><dt className="text-slate-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>);

export default function Dashboard() {
  const { user, company, orders, invoices, availableCredit } = useApp();
  const open = orders.filter((o) => o.status === "Pending" || o.status === "Processing").slice(0, 5);
  const shipped = orders.filter((o) => o.status === "Shipped").slice(0, 5);
  const pct = Math.min(100, Math.round((company.creditUsed / company.creditLimit) * 100));
  const qty = (o: (typeof orders)[number]) => o.lines.reduce((s, l) => s + l.qty, 0);
  const orderTable = (rows: typeof orders) => (
    <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className="th">Order ID</th><th className="th">Date</th><th className="th">Qty</th><th className="th">Amount</th><th className="th">Status</th></tr></thead>
      <tbody className="divide-y">{rows.map((o) => (<tr key={o.id}><td className="td"><Link className="text-brand-600 hover:underline" href={`/account/orders/${o.id}`}>{o.id}</Link></td><td className="td">{fmtDate(o.date)}</td><td className="td">{qty(o)}</td><td className="td">{money(o.total)}</td><td className="td"><StatusBadge status={o.status} /></td></tr>))}{rows.length === 0 && <tr><td className="td text-slate-500" colSpan={5}>None.</td></tr>}</tbody></table></div>
  );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Account Dashboard</h1>
      <div className="grid gap-4 xl:grid-cols-3">
        <section className="card p-4"><h2 className="mb-2 font-bold">User Details {user?.role === "Admin" && <span className="ml-1 rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-700">Primary Contact</span>}</h2>
          <dl><Row k="First Name" v={user?.firstName} /><Row k="Last Name" v={user?.lastName} /><Row k="Email" v={user?.email} /><Row k="Phone" v={user?.phone} /><Row k="Company" v={company.name} /><Row k="Role" v={user?.role} /></dl></section>
        <section className="card p-4"><h2 className="mb-2 font-bold">Company Details</h2>
          <dl><Row k="Company Name" v={company.name} /><Row k="BPG / Customer No." v={company.bpgNumber} /><Row k="Company Email" v={company.email} /><Row k="Address" v={company.address} /><Row k="Phone" v={company.phone} /></dl></section>
        <section className="card p-4"><h2 className="mb-2 font-bold">Credit Information</h2>
          <dl><Row k="Credit Limit" v={money(company.creditLimit)} /><Row k="Available Credit" v={<span className="text-green-700">{money(availableCredit)}</span>} /><Row k="% Usage" v={`${pct}%`} /></dl>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className={`h-full ${pct > 85 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} /></div></section>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4"><div className="mb-2 flex justify-between"><h2 className="font-bold">Open Orders</h2><Link href="/account/orders?status=open" className="text-sm text-brand-600 hover:underline">View all</Link></div>{orderTable(open)}</section>
        <section className="card p-4"><div className="mb-2 flex justify-between"><h2 className="font-bold">Shipped Orders</h2><Link href="/account/orders?status=Shipped" className="text-sm text-brand-600 hover:underline">View all</Link></div>{orderTable(shipped)}</section>
      </div>
      {can(user?.role, "invoices") && <section className="card p-4"><div className="mb-2 flex flex-wrap justify-between gap-2"><h2 className="font-bold">Invoices</h2><StatusLegend /></div>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className="th">Invoice ID</th><th className="th">Date</th><th className="th">Due</th><th className="th">Amount</th><th className="th">Status</th></tr></thead>
          <tbody className="divide-y">{invoices.slice(0, 5).map((i) => (<tr key={i.id}><td className="td">{i.id}</td><td className="td">{fmtDate(i.issued)}</td><td className="td">{fmtDate(i.due)}</td><td className="td">{money(i.amount)}</td><td className="td"><StatusBadge status={i.status} /></td></tr>))}</tbody></table></div></section>}
    </div>
  );
}

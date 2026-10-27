"use client";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { can, useApp } from "@/lib/store";
import { ROLES, type Role } from "@/lib/types";

export default function Settings() {
  const { user, company, updateProfile, setLogo, toast } = useApp();
  const [f, setF] = useState({ firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", email: user?.email ?? "", phone: user?.phone ?? "", role: (user?.role ?? "Admin") as Role });
  const [companyName, setCompanyName] = useState(company.name);
  const file = useRef<HTMLInputElement>(null);
  const isAdmin = can(user?.role, "logo");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files?.[0];
    if (!fl) return;
    if (!fl.type.startsWith("image/")) return toast("Please choose an image file.", "error");
    if (fl.size > 1_500_000) return toast("Logo must be under 1.5 MB.", "error");
    const r = new FileReader();
    r.onload = () => { setLogo(String(r.result)); toast("Company logo updated."); };
    r.readAsDataURL(fl);
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <form className="card grid gap-4 p-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); updateProfile({ firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone, ...(isAdmin ? { role: f.role } : {}) }); toast("Profile updated."); }}>
        <h2 className="font-bold sm:col-span-2">Profile</h2>
        <div><label className="label" htmlFor="fn">First Name</label><input id="fn" className="input" required value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></div>
        <div><label className="label" htmlFor="ln">Last Name</label><input id="ln" className="input" required value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></div>
        <div><label className="label" htmlFor="em">Email</label><input id="em" type="email" className="input" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><label className="label" htmlFor="ph">Phone</label><input id="ph" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <div><label className="label" htmlFor="co">Company Name</label><input id="co" className="input bg-slate-50" readOnly value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
        <div><label className="label" htmlFor="ro">Role</label><select id="ro" className="input" disabled={!isAdmin} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div className="sm:col-span-2"><button className="btn-primary">Save changes</button></div>
      </form>
      <section className="card space-y-3 p-4">
        <h2 className="font-bold">Company Logo</h2>
        <p className="text-sm text-slate-500">Shown beside the Vinod Patel Group logo in the header on every page.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={company.logoUrl} alt="Current company logo" className="h-16 w-auto rounded border bg-white p-1" />
        {isAdmin ? (<><input ref={file} type="file" accept="image/*" hidden onChange={onFile} /><button className="btn-outline" onClick={() => file.current?.click()}><Upload className="h-4 w-4" /> Upload Company Logo</button></>) : <p className="text-sm text-amber-700">Only an Admin can change the company logo.</p>}
      </section>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { useApp } from "@/lib/store";
import { ROLES, STATES, type Role } from "@/lib/types";

export default function RegisterPage() {
  const { register, toast } = useApp();
  const router = useRouter();
  const [f, setF] = useState({ business: "", bpg: "", line1: "", line2: "", suburb: "", state: "", firstName: "", lastName: "", role: "" as Role | "", email: "", phone: "", agree: false });
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));
  const field = (k: keyof typeof f, label: string, type = "text", req = true) => (
    <div><label className="label" htmlFor={k}>{label}</label><input id={k} type={type} required={req} className="input" value={f[k] as string} onChange={(e) => set(k, e.target.value)} /></div>
  );
  return (
    <AuthShell title="Register for a trade account" subtitle="Your application is reviewed by the Vinod Patel Group accounts team." wide>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => {
        e.preventDefault();
        if (!f.agree) return setErr("Please accept the Terms and Conditions & Privacy Policy.");
        const r = register({ business: f.business, bpg: f.bpg, firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone, role: f.role as Role, password: "" });
        if (r) return setErr(r);
        toast("Registration submitted. You can now sign in.");
        router.push("/login");
      }}>
        <div className="sm:col-span-2">{field("business", "Legal Business Name")}</div>
        <div className="sm:col-span-2">{field("bpg", "VPG Number / Customer Number")}</div>
        {field("line1", "Address Line 1")}
        {field("line2", "Address Line 2", "text", false)}
        {field("suburb", "Suburb")}
        <div><label className="label" htmlFor="state">State / Territory</label><select id="state" required className="input" value={f.state} onChange={(e) => set("state", e.target.value)}><option value="">Select…</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
        {field("firstName", "First Name")}
        {field("lastName", "Last Name")}
        <div className="sm:col-span-2"><label className="label" htmlFor="role">Position / Role</label><select id="role" required className="input" value={f.role} onChange={(e) => set("role", e.target.value)}><option value="">Select…</option>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
        {field("email", "Email Address", "email")}
        {field("phone", "Phone Number", "tel")}
        <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" className="mt-1" checked={f.agree} onChange={(e) => set("agree", e.target.checked)} /> I agree to the Terms and Conditions &amp; Privacy Policy</label>
        {err && <p className="rounded bg-red-50 p-2 text-sm text-red-700 sm:col-span-2" role="alert">{err}</p>}
        <button className="btn-primary sm:col-span-2" type="submit">Submit</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign In</Link></p>
    </AuthShell>
  );
}

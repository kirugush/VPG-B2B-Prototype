"use client";
import { useState } from "react";
import { STATES, type Address } from "@/lib/types";

const EMPTY: Omit<Address, "id"> = { firstName: "", lastName: "", company: "", line1: "", line2: "", suburb: "", state: "", postcode: "", country: "Fiji", phone: "", isDefault: false };

export function AddressForm({ initial, onSave, onCancel, submitLabel = "Save Address" }: { initial?: Address; onSave: (a: Omit<Address, "id"> & { id?: string }) => void; onCancel: () => void; submitLabel?: string }) {
  const [f, setF] = useState<Omit<Address, "id"> & { id?: string }>(initial ?? EMPTY);
  const set = (k: keyof Address, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));
  const t = (k: keyof Address, label: string, req = true, type = "text") => (
    <div><label className="label" htmlFor={`ad-${k}`}>{label}</label><input id={`ad-${k}`} type={type} required={req} className="input" value={f[k] as string} onChange={(e) => set(k, e.target.value)} /></div>
  );
  return (
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      {t("firstName", "Full Name")}{t("lastName", "Last Name")}
      <div className="sm:col-span-2">{t("company", "Company Name", false)}</div>
      {t("line1", "Address Line 1")}{t("line2", "Address Line 2", false)}
      {t("suburb", "Suburb")}
      <div><label className="label" htmlFor="ad-state">State / Territory</label><select id="ad-state" required className="input" value={f.state} onChange={(e) => set("state", e.target.value)}><option value="">Select…</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
      {t("postcode", "Postcode")}{t("country", "Country")}
      <div className="sm:col-span-2">{t("phone", "Phone Number", true, "tel")}</div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={f.isDefault} onChange={(e) => set("isDefault", e.target.checked)} /> Set as default address</label>
      <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-outline" onClick={onCancel}>Cancel</button><button className="btn-primary" type="submit">{submitLabel}</button></div>
    </form>
  );
}

export const formatAddress = (a: Address) => [`${a.firstName} ${a.lastName}`, a.company, a.line1, a.line2, `${a.suburb}, ${a.state} ${a.postcode}`, a.country].filter(Boolean).join(", ");

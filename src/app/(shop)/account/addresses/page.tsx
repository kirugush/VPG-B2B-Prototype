"use client";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AddressForm } from "@/components/AddressForm";
import { Modal } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { Address } from "@/lib/types";

export default function Addresses() {
  const { addresses, saveAddress, deleteAddress, toast } = useApp();
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [del, setDel] = useState<Address | null>(null);
  const sorted = [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)); // default pinned on top
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Address Book</h1><button className="btn-primary" onClick={() => setEditing("new")}>+ Add Address</button></div>
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((a) => (
          <article key={a.id} className={`card p-4 ${a.isDefault ? "border-brand-500 ring-1 ring-brand-500" : ""}`}>
            <div className="mb-1 flex items-start justify-between"><h2 className="font-bold">{a.firstName} {a.lastName}</h2>{a.isDefault && <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">Default</span>}</div>
            <p className="text-sm text-slate-600">{a.company}<br />{a.line1}{a.line2 && <>, {a.line2}</>}<br />{a.suburb}, {a.state} {a.postcode}<br />{a.country}<br />{a.phone}</p>
            <div className="mt-3 flex gap-3 text-sm">
              <button className="flex items-center gap-1 text-brand-600 hover:underline" onClick={() => setEditing(a)}><Pencil className="h-4 w-4" />Edit</button>
              <button className="flex items-center gap-1 text-red-600 hover:underline" onClick={() => setDel(a)}><Trash2 className="h-4 w-4" />Delete</button>
            </div>
          </article>
        ))}
        {sorted.length === 0 && <p className="card p-8 text-center text-slate-500 md:col-span-2">No saved addresses yet.</p>}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add Address" : "Edit Address"} wide>
        {editing && <AddressForm initial={editing === "new" ? undefined : editing} onCancel={() => setEditing(null)} onSave={(a) => { saveAddress(a); setEditing(null); toast("Address saved."); }} />}
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} title="Delete address">
        <p className="text-sm">Are you sure you want to delete this shipping address?</p>
        <div className="mt-5 flex justify-end gap-2"><button className="btn-outline" onClick={() => setDel(null)}>Cancel</button><button className="btn-danger" onClick={() => { deleteAddress(del!.id); setDel(null); toast("Address deleted."); }}>Delete</button></div>
      </Modal>
    </div>
  );
}

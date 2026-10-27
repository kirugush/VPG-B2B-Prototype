"use client";
import { useState } from "react";
import { Mail, Pencil, Trash2, UserX, UserCheck } from "lucide-react";
import { Modal } from "@/components/ui";
import { PERMISSIONS, PERMISSION_LABELS, type Permission } from "@/lib/permissions";
import { useApp } from "@/lib/store";
import { DEPARTMENTS, ROLES, type Role, type User } from "@/lib/types";

type Form = { firstName: string; lastName: string; email: string; role: Role; phone: string; department: string };
const EMPTY: Form = { firstName: "", lastName: "", email: "", role: "Junior Buyer", phone: "", department: DEPARTMENTS[0] };

export default function Users() {
  const { users, user: me, addUser, updateUser, deleteUser, resendInvite, setUserStatus, audit, toast, company } = useApp();
  const [editing, setEditing] = useState<User | "new" | null>(null);
  const [f, setF] = useState<Form>(EMPTY);
  const [del, setDel] = useState<User | null>(null);
  const open = (u: User | "new") => { setEditing(u); setF(u === "new" ? EMPTY : { firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, phone: u.phone, department: u.department ?? DEPARTMENTS[0] }); };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">User Management</h1><p className="text-sm text-slate-500">Users under {company.name}</p></div><button className="btn-primary" onClick={() => open("new")}>+ Create User</button></div>
      <div className="card overflow-x-auto"><table className="w-full"><thead><tr><th className="th">Name</th><th className="th">Email</th><th className="th">Role</th><th className="th">Department</th><th className="th">Status</th><th className="th">Actions</th></tr></thead>
        <tbody className="divide-y">{users.map((u) => (<tr key={u.id}><td className="td font-medium">{u.firstName} {u.lastName}{u.id === me?.id && <span className="ml-2 text-xs text-slate-400">(you)</span>}</td><td className="td">{u.email}</td><td className="td">{u.role}</td><td className="td">{u.department ?? "—"}</td><td className="td"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.status === "Disabled" ? "bg-gray-200" : u.status === "Invited" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{u.status ?? "Active"}</span></td>
          <td className="td"><div className="flex gap-3">{u.status === "Invited" && <button aria-label={`Resend invite to ${u.firstName}`} className="text-brand-600" onClick={() => resendInvite(u.id)}><Mail className="h-4 w-4" /></button>}{u.id !== me?.id && (u.status === "Disabled" ? <button aria-label={`Enable ${u.firstName}`} className="text-green-700" onClick={() => setUserStatus(u.id, "Active")}><UserCheck className="h-4 w-4" /></button> : <button aria-label={`Disable ${u.firstName}`} className="text-amber-700" onClick={() => setUserStatus(u.id, "Disabled")}><UserX className="h-4 w-4" /></button>)}<button aria-label={`Edit ${u.firstName}`} className="text-brand-600" onClick={() => open(u)}><Pencil className="h-4 w-4" /></button><button aria-label={`Delete ${u.firstName}`} disabled={u.id === me?.id} className="text-red-600 disabled:opacity-30" onClick={() => setDel(u)}><Trash2 className="h-4 w-4" /></button></div></td></tr>))}</tbody></table></div>
      <section className="card overflow-x-auto">
        <h2 className="border-b p-4 font-bold">Role permissions</h2>
        <table className="w-full min-w-[560px]"><caption className="sr-only">Permission matrix</caption>
          <thead><tr><th className="th">Capability</th>{ROLES.map((r) => <th key={r} className="th">{r}</th>)}</tr></thead>
          <tbody className="divide-y">{(Object.keys(PERMISSION_LABELS) as Permission[]).map((p) => (
            <tr key={p}><td className="td">{PERMISSION_LABELS[p]}</td>{ROLES.map((r) => <td key={r} className="td">{PERMISSIONS[r].includes(p) ? <span aria-label="Allowed">✓</span> : <span aria-label="Not allowed" className="text-gray-300">—</span>}</td>)}</tr>
          ))}</tbody></table>
      </section>
      <section className="card">
        <h2 className="border-b p-4 font-bold">Audit trail</h2>
        {audit.length === 0 ? <p className="p-4 text-sm text-gray-500">No changes recorded yet.</p> : (
          <ul className="divide-y text-sm">{audit.slice(0, 25).map((a) => <li key={a.id} className="flex flex-wrap gap-x-3 p-3"><span className="text-gray-500">{new Date(a.at).toLocaleString()}</span><b>{a.actorName}</b><span>{a.action}</span><span className="text-gray-600">{a.detail}</span></li>)}</ul>
        )}
      </section>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Create User" : "Edit User"}>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (editing === "new") { addUser(f); toast("User created. An invitation email would be sent."); } else if (editing) { updateUser(editing.id, f); toast("User updated."); } setEditing(null); }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="u1">Full Name</label><input id="u1" required className="input" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} /></div>
            <div><label className="label" htmlFor="u2">Last Name</label><input id="u2" required className="input" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} /></div>
          </div>
          <div><label className="label" htmlFor="u3">Email</label><input id="u3" type="email" required className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className="label" htmlFor="u4">Role</label><select id="u4" className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
          <div><label className="label" htmlFor="u5">Phone</label><input id="u5" type="tel" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><label className="label" htmlFor="u6">Department</label><select id="u6" className="input" value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div className="flex justify-end gap-2"><button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form>
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} title="Delete user">
        <p className="text-sm">Delete {del?.firstName} {del?.lastName}? They will lose access immediately.</p>
        <div className="mt-5 flex justify-end gap-2"><button className="btn-outline" onClick={() => setDel(null)}>Cancel</button><button className="btn-danger" onClick={() => { deleteUser(del!.id); setDel(null); toast("User deleted."); }}>Delete</button></div>
      </Modal>
    </div>
  );
}

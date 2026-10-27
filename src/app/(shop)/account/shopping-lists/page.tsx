"use client";
import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { ShoppingList } from "@/lib/types";

export default function Lists() {
  const { lists, createList, renameList, deleteList, addListToCart, toast } = useApp();
  const [edit, setEdit] = useState<ShoppingList | "new" | null>(null);
  const [name, setName] = useState("");
  const [del, setDel] = useState<ShoppingList | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Favorites / Shopping Lists</h1><button className="btn-primary" onClick={() => { setEdit("new"); setName(""); }}><Plus className="h-4 w-4" /> New List</button></div>
      <div className="card overflow-x-auto"><table className="w-full"><thead><tr><th className="th">List name</th><th className="th">Items</th><th className="th">Actions</th></tr></thead>
        <tbody className="divide-y">{lists.map((l) => (<tr key={l.id}><td className="td font-medium">{l.name}</td><td className="td">{l.productIds.length}</td>
          <td className="td"><div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href={`/account/shopping-lists/${l.id}`} className="flex items-center gap-1 text-brand-600 hover:underline"><Eye className="h-4 w-4" />View</Link>
            <button className="flex items-center gap-1 text-brand-600 hover:underline" onClick={() => { setEdit(l); setName(l.name); }}><Pencil className="h-4 w-4" />Edit</button>
            <button className="flex items-center gap-1 text-red-600 hover:underline" onClick={() => setDel(l)}><Trash2 className="h-4 w-4" />Delete</button>
            <button className="btn-primary px-3 py-1" disabled={l.productIds.length === 0} onClick={() => addListToCart(l.id)}><ShoppingCart className="h-4 w-4" />Add All to Cart</button></div></td></tr>))}
          {lists.length === 0 && <tr><td colSpan={3} className="td py-8 text-center text-slate-500">No lists yet. Tap the heart on any product to start one.</td></tr>}</tbody></table></div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit === "new" ? "New list" : "Rename list"}>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; if (edit === "new") createList(name.trim()); else if (edit) renameList(edit.id, name.trim()); toast("List saved."); setEdit(null); }}>
          <div><label className="label" htmlFor="ln">List name</label><input id="ln" className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <button className="btn-primary w-full">Save</button>
        </form>
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} title="Delete list"><p className="text-sm">Delete “{del?.name}”? Products themselves are not affected.</p>
        <div className="mt-5 flex justify-end gap-2"><button className="btn-outline" onClick={() => setDel(null)}>Cancel</button><button className="btn-danger" onClick={() => { deleteList(del!.id); setDel(null); toast("List deleted."); }}>Delete</button></div></Modal>
    </div>
  );
}

"use client";
import { Heart, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";

export function FavoriteButton({ productId }: { productId: string }) {
  const { lists, isFavorite, toggleInList, createList, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const fav = isFavorite(productId);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Add to favorites" aria-expanded={open} className="rounded-full bg-alpha-white-90 p-1.5 shadow hover:bg-white">
        <Heart className={`h-5 w-5 ${fav ? "fill-accent-500 text-accent-500" : "text-slate-500"}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-64 rounded-md border bg-white p-3 text-sm shadow-lg">
          <p className="mb-2 font-semibold">Save to list</p>
          <ul className="max-h-40 space-y-1 overflow-y-auto">
            {lists.map((l) => (
              <li key={l.id}><label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={l.productIds.includes(productId)} onChange={() => { toggleInList(l.id, productId); toast(l.productIds.includes(productId) ? `Removed from "${l.name}".` : `Added to "${l.name}".`); }} />{l.name}<span className="ml-auto text-xs text-slate-400">{l.productIds.length}</span></label></li>
            ))}
            {lists.length === 0 && <li className="text-slate-500">No lists yet.</li>}
          </ul>
          <form className="mt-3 flex gap-1 border-t pt-3" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; createList(name.trim(), productId); toast(`Created "${name.trim()}" and added product.`); setName(""); }}>
            <input className="input py-1.5" placeholder="New list name" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn-primary px-2" aria-label="Create list"><Plus className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </div>
  );
}

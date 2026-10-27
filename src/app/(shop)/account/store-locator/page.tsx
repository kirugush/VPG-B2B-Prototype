"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { DemoTag, EmptyState, PageHeader } from "@/components/ui";
import { formatHours, haversineKm, isOpenNow } from "@/lib/geo";
import { STORES } from "@/mocks/stores";
import type { DayKey } from "@/lib/types";

const StoreMap = dynamic(() => import("@/components/StoreMap"), { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-lg bg-gray-100" /> });
const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function StoreLocator() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [service, setService] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [geoMsg, setGeoMsg] = useState("");
  const [manual, setManual] = useState("");

  const services = useMemo(() => Array.from(new Set(STORES.flatMap((s) => s.services))).sort(), []);
  const countries = useMemo(() => Array.from(new Set(STORES.map((s) => s.country))).sort(), []);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    let r = STORES.filter((s) => s.active)
      .filter((s) => !country || s.country === country)
      .filter((s) => !service || s.services.includes(service))
      .filter((s) => !t || `${s.name} ${s.city} ${s.region} ${s.postalCode} ${s.number}`.toLowerCase().includes(t))
      .filter((s) => !openOnly || isOpenNow(s));
    const withD = r.map((s) => ({ s, d: me ? haversineKm(me, s) : null }));
    if (me) withD.sort((a, b) => a.d! - b.d!);
    return withD;
  }, [q, country, service, openOnly, me]);
  const onSelect = useCallback((id: string) => { setSel(id); document.getElementById(`store-${id}`)?.scrollIntoView({ block: "nearest" }); }, []);

  const locate = () => {
    if (!navigator.geolocation) return setGeoMsg("Geolocation is not supported. Enter a city or postcode below.");
    navigator.geolocation.getCurrentPosition(
      (p) => { setMe({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoMsg(""); },
      () => setGeoMsg("Location permission denied or unavailable. Enter a city below instead."),
      { timeout: 8000 },
    );
  };
  const useManual = () => {
    const t = manual.trim().toLowerCase(); if (!t) return;
    const m = STORES.find((s) => s.city.toLowerCase() === t || s.postalCode.toLowerCase() === t);
    if (m) { setMe({ lat: m.lat, lng: m.lng }); setGeoMsg(""); } else setGeoMsg("No match. Try the name of a city that has a store.");
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Store Locator" subtitle={`${list.length} of ${STORES.length} locations`} />
      <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900" role="note"><DemoTag>Demo data</DemoTag> Store addresses, phone numbers and e-mails are fictional placeholders and map pins are city-centre approximations.</p>
      <div className="card grid gap-3 p-4 md:grid-cols-4">
        <div><label className="label" htmlFor="sq">Search</label><input id="sq" className="input" placeholder="City, postcode, store" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div><label className="label" htmlFor="sc">Country</label><select id="sc" className="input" value={country} onChange={(e) => setCountry(e.target.value)}><option value="">All</option>{countries.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label" htmlFor="ss">Service</label><select id="ss" className="input" value={service} onChange={(e) => setService(e.target.value)}><option value="">Any</option>{services.map((c) => <option key={c}>{c}</option>)}</select></div>
        <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> Open now</label>
        <div className="flex flex-wrap items-end gap-2 md:col-span-4">
          <button className="btn-outline" onClick={locate}>Use my location</button>
          <input aria-label="City or postcode" className="input max-w-xs" placeholder="…or enter a city / postcode" value={manual} onChange={(e) => setManual(e.target.value)} onKeyDown={(e) => e.key === "Enter" && useManual()} />
          <button className="btn-outline" onClick={useManual}>Sort by distance</button>
          {me && <button className="text-sm underline" onClick={() => setMe(null)}>Clear</button>}
          {geoMsg && <span className="text-sm text-amber-800" role="status">{geoMsg}</span>}
        </div>
      </div>
      {list.length === 0 ? <EmptyState title="No stores match" body="Clear a filter or broaden your search." /> : (
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <StoreMap stores={list.map((x) => x.s)} selectedId={sel} onSelect={onSelect} user={me} />
          <ul className="max-h-[420px] space-y-2 overflow-y-auto" aria-label="Store list">
            {list.map(({ s, d }) => {
              const open = isOpenNow(s);
              return (
                <li key={s.id} id={`store-${s.id}`}>
                  <button className={`card w-full p-3 text-left ${sel === s.id ? "ring-2 ring-brand-600" : ""}`} onClick={() => setSel(s.id)} aria-pressed={sel === s.id}>
                    <div className="flex justify-between gap-2"><b>{s.name}</b><span className={`text-xs font-semibold ${open ? "text-green-700" : "text-red-700"}`}>{open ? "Open now" : "Closed"}</span></div>
                    <p className="text-sm text-gray-600">{s.address}, {s.city} {s.postalCode}, {s.country}</p>
                    {d != null && <p className="text-xs text-gray-500">{d.toFixed(0)} km away</p>}
                    {sel === s.id && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p>{s.phone} · {s.email}</p><p>{s.services.join(", ")}</p><p className="text-gray-600">{s.description}</p>
                        <table className="text-xs"><tbody>{DAYS.map((k) => <tr key={k}><td className="pr-3 capitalize">{k}</td><td>{formatHours(s.hours[k])}</td></tr>)}</tbody></table>
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

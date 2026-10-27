"use client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Store } from "@/lib/types";

export default function StoreMap({ stores, selectedId, onSelect, user }: { stores: Store[]; selectedId: string | null; onSelect: (id: string) => void; user: { lat: number; lng: number } | null }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const markers = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { scrollWheelZoom: false }).setView([20, 0], 2);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap contributors" }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => { map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers(); markers.current = {};
    stores.forEach((s) => {
      const m = L.marker([s.lat, s.lng], {
        title: s.name,
        icon: L.divIcon({ className: "", html: `<div style="background:#b10a15;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font:600 11px sans-serif;border:2px solid #fff;box-shadow:0 1px 3px #0006">${s.number}</div>`, iconSize: [24, 24], iconAnchor: [12, 12] }),
      }).on("click", () => onSelect(s.id));
      m.addTo(layer.current!); markers.current[s.id] = m;
    });
    if (user) L.circleMarker([user.lat, user.lng], { radius: 8, color: "#2563eb" }).addTo(layer.current);
    const pts = stores.map((s) => [s.lat, s.lng] as [number, number]);
    if (pts.length) map.current.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 12 });
  }, [stores, user, onSelect]);

  useEffect(() => {
    const m = selectedId ? markers.current[selectedId] : null;
    if (m && map.current) map.current.setView(m.getLatLng(), Math.max(map.current.getZoom(), 10));
  }, [selectedId]);

  return <div ref={el} className="h-[420px] w-full rounded-lg border" role="region" aria-label="Map of stores" />;
}

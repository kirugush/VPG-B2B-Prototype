import type { DayKey, Store } from "./types";

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

const DAYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Local day/time at the store's own time zone. */
export function localTime(timeZone: string, now = new Date()): { day: DayKey; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const wd = parts.find((p) => p.type === "weekday")!.value.toLowerCase().slice(0, 3) as DayKey;
  let h = Number(parts.find((p) => p.type === "hour")!.value);
  if (h === 24) h = 0;
  const m = Number(parts.find((p) => p.type === "minute")!.value);
  return { day: DAYS.includes(wd) ? wd : "mon", minutes: h * 60 + m };
}

const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));

export function isOpenNow(store: Store, now = new Date()): boolean {
  if (!store.active) return false;
  const { day, minutes } = localTime(store.timeZone, now);
  const h = store.hours[day];
  return !!h && minutes >= toMin(h[0]) && minutes < toMin(h[1]);
}

export function formatHours(h: [string, string] | null): string {
  return h ? `${h[0]}–${h[1]}` : "Closed";
}

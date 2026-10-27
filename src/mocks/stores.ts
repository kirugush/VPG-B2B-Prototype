import type { DayKey, Store, WeeklyHours } from "@/lib/types";

/**
 * Exactly 36 DEMONSTRATION stores: India 12, United States 8, United Kingdom 6,
 * Australia 5, Canada 5. Street addresses, phone numbers and e-mails are fictional
 * (example.com / reserved number ranges) and are NOT verified real-world business data.
 * Coordinates are city-centre approximations (coordsApproximate = true).
 */
interface Seed {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  tz: string;
  postal: string;
  cc: string;
}

const SEEDS: Seed[] = [
  // India (12)
  { city: "Bengaluru", region: "Karnataka", country: "India", lat: 12.9716, lng: 77.5946, tz: "Asia/Kolkata", postal: "560001", cc: "+91" },
  { city: "Mumbai", region: "Maharashtra", country: "India", lat: 19.076, lng: 72.8777, tz: "Asia/Kolkata", postal: "400001", cc: "+91" },
  { city: "Delhi", region: "Delhi", country: "India", lat: 28.6139, lng: 77.209, tz: "Asia/Kolkata", postal: "110001", cc: "+91" },
  { city: "Hyderabad", region: "Telangana", country: "India", lat: 17.385, lng: 78.4867, tz: "Asia/Kolkata", postal: "500001", cc: "+91" },
  { city: "Chennai", region: "Tamil Nadu", country: "India", lat: 13.0827, lng: 80.2707, tz: "Asia/Kolkata", postal: "600001", cc: "+91" },
  { city: "Kolkata", region: "West Bengal", country: "India", lat: 22.5726, lng: 88.3639, tz: "Asia/Kolkata", postal: "700001", cc: "+91" },
  { city: "Pune", region: "Maharashtra", country: "India", lat: 18.5204, lng: 73.8567, tz: "Asia/Kolkata", postal: "411001", cc: "+91" },
  { city: "Ahmedabad", region: "Gujarat", country: "India", lat: 23.0225, lng: 72.5714, tz: "Asia/Kolkata", postal: "380001", cc: "+91" },
  { city: "Jaipur", region: "Rajasthan", country: "India", lat: 26.9124, lng: 75.7873, tz: "Asia/Kolkata", postal: "302001", cc: "+91" },
  { city: "Kochi", region: "Kerala", country: "India", lat: 9.9312, lng: 76.2673, tz: "Asia/Kolkata", postal: "682001", cc: "+91" },
  { city: "Lucknow", region: "Uttar Pradesh", country: "India", lat: 26.8467, lng: 80.9462, tz: "Asia/Kolkata", postal: "226001", cc: "+91" },
  { city: "Chandigarh", region: "Chandigarh", country: "India", lat: 30.7333, lng: 76.7794, tz: "Asia/Kolkata", postal: "160017", cc: "+91" },
  // United States (8)
  { city: "New York", region: "NY", country: "United States", lat: 40.7128, lng: -74.006, tz: "America/New_York", postal: "10001", cc: "+1" },
  { city: "Los Angeles", region: "CA", country: "United States", lat: 34.0522, lng: -118.2437, tz: "America/Los_Angeles", postal: "90001", cc: "+1" },
  { city: "Chicago", region: "IL", country: "United States", lat: 41.8781, lng: -87.6298, tz: "America/Chicago", postal: "60601", cc: "+1" },
  { city: "Houston", region: "TX", country: "United States", lat: 29.7604, lng: -95.3698, tz: "America/Chicago", postal: "77001", cc: "+1" },
  { city: "Phoenix", region: "AZ", country: "United States", lat: 33.4484, lng: -112.074, tz: "America/Phoenix", postal: "85001", cc: "+1" },
  { city: "Seattle", region: "WA", country: "United States", lat: 47.6062, lng: -122.3321, tz: "America/Los_Angeles", postal: "98101", cc: "+1" },
  { city: "Atlanta", region: "GA", country: "United States", lat: 33.749, lng: -84.388, tz: "America/New_York", postal: "30301", cc: "+1" },
  { city: "Boston", region: "MA", country: "United States", lat: 42.3601, lng: -71.0589, tz: "America/New_York", postal: "02101", cc: "+1" },
  // United Kingdom (6)
  { city: "London", region: "England", country: "United Kingdom", lat: 51.5074, lng: -0.1278, tz: "Europe/London", postal: "EC1A 1AA", cc: "+44" },
  { city: "Manchester", region: "England", country: "United Kingdom", lat: 53.4808, lng: -2.2426, tz: "Europe/London", postal: "M1 1AA", cc: "+44" },
  { city: "Birmingham", region: "England", country: "United Kingdom", lat: 52.4862, lng: -1.8904, tz: "Europe/London", postal: "B1 1AA", cc: "+44" },
  { city: "Glasgow", region: "Scotland", country: "United Kingdom", lat: 55.8642, lng: -4.2518, tz: "Europe/London", postal: "G1 1AA", cc: "+44" },
  { city: "Leeds", region: "England", country: "United Kingdom", lat: 53.8008, lng: -1.5491, tz: "Europe/London", postal: "LS1 1AA", cc: "+44" },
  { city: "Bristol", region: "England", country: "United Kingdom", lat: 51.4545, lng: -2.5879, tz: "Europe/London", postal: "BS1 1AA", cc: "+44" },
  // Australia (5)
  { city: "Sydney", region: "NSW", country: "Australia", lat: -33.8688, lng: 151.2093, tz: "Australia/Sydney", postal: "2000", cc: "+61" },
  { city: "Melbourne", region: "VIC", country: "Australia", lat: -37.8136, lng: 144.9631, tz: "Australia/Melbourne", postal: "3000", cc: "+61" },
  { city: "Brisbane", region: "QLD", country: "Australia", lat: -27.4698, lng: 153.0251, tz: "Australia/Brisbane", postal: "4000", cc: "+61" },
  { city: "Perth", region: "WA", country: "Australia", lat: -31.9505, lng: 115.8605, tz: "Australia/Perth", postal: "6000", cc: "+61" },
  { city: "Adelaide", region: "SA", country: "Australia", lat: -34.9285, lng: 138.6007, tz: "Australia/Adelaide", postal: "5000", cc: "+61" },
  // Canada (5)
  { city: "Toronto", region: "ON", country: "Canada", lat: 43.6532, lng: -79.3832, tz: "America/Toronto", postal: "M5H 2N2", cc: "+1" },
  { city: "Vancouver", region: "BC", country: "Canada", lat: 49.2827, lng: -123.1207, tz: "America/Vancouver", postal: "V6B 1A1", cc: "+1" },
  { city: "Montreal", region: "QC", country: "Canada", lat: 45.5017, lng: -73.5673, tz: "America/Toronto", postal: "H2Y 1A1", cc: "+1" },
  { city: "Calgary", region: "AB", country: "Canada", lat: 51.0447, lng: -114.0719, tz: "America/Edmonton", postal: "T2P 1A1", cc: "+1" },
  { city: "Ottawa", region: "ON", country: "Canada", lat: 45.4215, lng: -75.6972, tz: "America/Toronto", postal: "K1P 1A1", cc: "+1" },
];

const ALL_SERVICES = ["Trade counter", "Click & collect", "Parts identification", "Technical support", "Returns", "Account top-up", "Delivery dispatch"];
const INACTIVE_IDS = new Set([8, 21, 33]); // 1-based store numbers that are closed (demonstrates active filter)

const hours = (open: string, close: string, sat: [string, string] | null): WeeklyHours => {
  const wk: [string, string] = [open, close];
  const d: Record<DayKey, [string, string] | null> = { mon: wk, tue: wk, wed: wk, thu: wk, fri: wk, sat, sun: null };
  return d;
};

export const STORES: Store[] = SEEDS.map((s, i) => {
  const n = i + 1;
  const services = ALL_SERVICES.filter((_, k) => k < 2 || (n + k) % 3 !== 0);
  const phoneBody = `${555}-01${String(n).padStart(2, "0")}`;
  return {
    id: `ST-${String(n).padStart(3, "0")}`,
    number: String(1000 + n),
    name: `VPG Trade Counter ${s.city}`,
    address: `${100 + n * 7} Example Trade Park Road`,
    city: s.city,
    region: s.region,
    postalCode: s.postal,
    country: s.country,
    lat: s.lat,
    lng: s.lng,
    coordsApproximate: true,
    phone: `${s.cc} ${phoneBody}`,
    email: `${s.city.toLowerCase().replace(/\s+/g, "")}@stores.example.com`,
    hours: s.country === "India" ? hours("09:30", "19:00", ["10:00", "16:00"]) : s.country === "United States" || s.country === "Canada" ? hours("08:00", "18:00", ["09:00", "14:00"]) : hours("07:30", "17:30", n % 2 ? ["08:00", "12:30"] : null),
    timeZone: s.tz,
    services,
    description: `Demonstration record: trade counter serving ${s.city} and surrounding area. Not verified business data.`,
    active: !INACTIVE_IDS.has(n),
    demo: true as const,
  };
});

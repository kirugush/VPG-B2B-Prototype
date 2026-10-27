import { NextResponse } from "next/server";
import { CREDIT_LIMITS } from "@/mocks/credit";
import { clientKey, DATA_MODE_SERVER, problem, rateLimit } from "@/lib/server/guard";
import type { CreditAccount } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!rateLimit(`credit:${clientKey(req)}`)) return problem(429, "RATE_LIMITED", "Too many requests.");
  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId") ?? "";
  if (!/^c\d{1,6}$/.test(companyId)) return problem(400, "BAD_REQUEST", "Invalid companyId.");

  if (DATA_MODE_SERVER === "live") {
    const base = process.env.AWS_API_BASE_URL;
    const key = process.env.AWS_API_KEY;
    if (!base || !key) return problem(503, "NOT_CONFIGURED", "Credit service is not configured (AWS_API_BASE_URL / AWS_API_KEY).");
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 5000);
      const res = await fetch(`${base}/credit/${encodeURIComponent(companyId)}`, { headers: { "x-api-key": key }, signal: ctl.signal, cache: "no-store" });
      clearTimeout(t);
      if (!res.ok) return problem(502, "UPSTREAM_ERROR", "Credit source returned an error.");
      return NextResponse.json({ ...(await res.json()), source: "live" });
    } catch {
      return problem(504, "UPSTREAM_TIMEOUT", "Credit source did not respond in time.");
    }
  }

  // ---- mock mode ----
  if (url.searchParams.get("simulate") === "outage") return problem(503, "SIMULATED_OUTAGE", "Simulated credit source outage (demo).");
  const cfg = CREDIT_LIMITS[companyId];
  if (!cfg) return problem(404, "NOT_FOUND", "Unknown company.");
  const utilized = Math.max(0, Math.min(Number(url.searchParams.get("mockUtilized")) || 0, cfg.limit));
  const pending = Math.round(utilized * 0.08);
  const stale = url.searchParams.get("simulate") === "stale";
  const body: CreditAccount = {
    companyId,
    accountStatus: cfg.status,
    approvedLimit: cfg.limit,
    utilized,
    available: Math.max(0, cfg.limit - utilized),
    pending,
    lastSync: new Date(Date.now() - (stale ? 3 * 3600_000 : 4 * 60_000)).toISOString(),
    reviewStatus: cfg.review,
    restrictions: cfg.restrictions,
    source: "mock",
  };
  return NextResponse.json(body);
}

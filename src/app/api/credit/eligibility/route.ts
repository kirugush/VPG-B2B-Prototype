import { NextResponse } from "next/server";
import { CREDIT_LIMITS } from "@/mocks/credit";
import { clientKey, DATA_MODE_SERVER, problem, rateLimit } from "@/lib/server/guard";

export const dynamic = "force-dynamic";
const seen = new Map<string, unknown>(); // idempotency (per instance; DynamoDB in AWS)

/**
 * Trusted-path credit decision. The CLIENT-SIDE button state is never the security
 * boundary: checkout calls this before authorising the order and treats any failure as
 * "not approved".
 */
export async function POST(req: Request) {
  if (!rateLimit(`elig:${clientKey(req)}`, 30)) return problem(429, "RATE_LIMITED", "Too many requests.");
  const raw = await req.text();
  if (raw.length > 2000) return problem(413, "TOO_LARGE", "Request too large.");
  let b: { companyId?: string; amount?: number; idempotencyKey?: string; mockUtilized?: number };
  try { b = JSON.parse(raw); } catch { return problem(400, "BAD_JSON", "Invalid JSON."); }
  if (!b.companyId || !/^c\d{1,6}$/.test(b.companyId)) return problem(400, "BAD_REQUEST", "Invalid companyId.");
  if (typeof b.amount !== "number" || !isFinite(b.amount) || b.amount <= 0 || b.amount > 10_000_000) return problem(400, "BAD_REQUEST", "Invalid amount.");
  if (!b.idempotencyKey || !/^[A-Za-z0-9_-]{8,64}$/.test(b.idempotencyKey)) return problem(400, "BAD_REQUEST", "Invalid idempotencyKey.");
  const cached = seen.get(b.idempotencyKey);
  if (cached) return NextResponse.json(cached);

  if (DATA_MODE_SERVER === "live") {
    const base = process.env.AWS_API_BASE_URL;
    const key = process.env.AWS_API_KEY;
    if (!base || !key) return problem(503, "NOT_CONFIGURED", "Credit service is not configured.");
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 5000);
      const res = await fetch(`${base}/credit/${encodeURIComponent(b.companyId)}/eligibility`, {
        method: "POST", headers: { "x-api-key": key, "content-type": "application/json" },
        body: JSON.stringify({ amount: b.amount, idempotencyKey: b.idempotencyKey }), signal: ctl.signal,
      });
      clearTimeout(t);
      if (!res.ok) return problem(502, "UPSTREAM_ERROR", "Credit decision unavailable.");
      const out = await res.json();
      seen.set(b.idempotencyKey, out);
      return NextResponse.json(out);
    } catch {
      return problem(504, "UPSTREAM_TIMEOUT", "Credit decision unavailable.");
    }
  }

  const cfg = CREDIT_LIMITS[b.companyId];
  if (!cfg) return problem(404, "NOT_FOUND", "Unknown company.");
  if (cfg.status === "On hold" || cfg.status === "Restricted") {
    const d = { approved: false, available: 0, shortfall: b.amount, decisionId: `dec_${b.idempotencyKey}`, checkedAt: new Date().toISOString(), reason: `Account ${cfg.status.toLowerCase()}` };
    seen.set(b.idempotencyKey, d);
    return NextResponse.json(d);
  }
  // Mock mode only: utilised amount comes from the demo client state (documented limitation).
  const utilized = Math.max(0, Math.min(Number(b.mockUtilized) || 0, cfg.limit));
  const available = Math.max(0, cfg.limit - utilized);
  const d = { approved: b.amount <= available, available, shortfall: Math.max(0, b.amount - available), decisionId: `dec_${b.idempotencyKey}`, checkedAt: new Date().toISOString() };
  seen.set(b.idempotencyKey, d);
  return NextResponse.json(d);
}

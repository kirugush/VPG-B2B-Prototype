import { IS_MOCK, LIMITS } from "./config";
import type { CreditAccount, CreditDecision } from "./types";

export type CreditResult<T> = { ok: true; data: T } | { ok: false; error: string };

function isAccount(x: unknown): x is CreditAccount {
  const a = x as CreditAccount;
  return !!a && typeof a.companyId === "string" && typeof a.approvedLimit === "number" && typeof a.utilized === "number" &&
    typeof a.available === "number" && typeof a.lastSync === "string" && typeof a.accountStatus === "string";
}
function isDecision(x: unknown): x is CreditDecision {
  const d = x as CreditDecision;
  return !!d && typeof d.approved === "boolean" && typeof d.available === "number" && typeof d.decisionId === "string";
}

async function fetchJson(url: string, init?: RequestInit, retries = 1): Promise<unknown> {
  let last: unknown;
  for (let i = 0; i <= retries; i++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), LIMITS.creditTimeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: ctl.signal, cache: "no-store" });
      if (res.ok) return await res.json();
      const body = await res.json().catch(() => null);
      last = new Error(body?.error?.message ?? `HTTP ${res.status}`);
      if (res.status < 500) break; // do not retry client errors
    } catch (e) { last = e; } finally { clearTimeout(t); }
  }
  throw last instanceof Error ? last : new Error("Credit service unreachable");
}

export const isStale = (a: CreditAccount, now = Date.now()) => now - new Date(a.lastSync).getTime() > LIMITS.creditStaleMs;

export async function fetchCreditAccount(companyId: string, mockUtilized: number, simulate?: "outage" | "stale"): Promise<CreditResult<CreditAccount>> {
  const q = new URLSearchParams({ companyId });
  if (IS_MOCK) { q.set("mockUtilized", String(mockUtilized)); if (simulate) q.set("simulate", simulate); }
  try {
    const data = await fetchJson(`/api/credit/account?${q}`);
    if (!isAccount(data)) return { ok: false, error: "Credit service returned an unexpected response." };
    return { ok: true, data };
  } catch (e) {
    // A failed lookup is NEVER an approval and never silently becomes mock data.
    return { ok: false, error: e instanceof Error ? e.message : "Credit lookup failed." };
  }
}

export async function checkCreditEligibility(companyId: string, amount: number, mockUtilized: number, idempotencyKey: string): Promise<CreditResult<CreditDecision>> {
  try {
    const data = await fetchJson(
      "/api/credit/eligibility",
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ companyId, amount, idempotencyKey, mockUtilized: IS_MOCK ? mockUtilized : undefined }) },
      1,
    );
    if (!isDecision(data)) return { ok: false, error: "Credit service returned an unexpected response." };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Credit check failed." };
  }
}

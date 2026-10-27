// SCAFFOLD: replace `lookupCredit` with the ERP / BigCommerce B2B call. Not deployed or tested on AWS.
type Ev = { httpMethod: string; queryStringParameters?: Record<string, string> | null; body?: string | null };
const json = (statusCode: number, body: unknown) => ({ statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

async function lookupCredit(_companyId: string): Promise<{ limit: number; utilized: number; pending: number } | null> {
  return null; // TODO integrate the real credit source
}

export const handler = async (ev: Ev) => {
  if (ev.httpMethod === "GET") {
    const id = ev.queryStringParameters?.companyId;
    if (!id) return json(400, { error: { code: "BAD_REQUEST", message: "companyId required" } });
    const c = await lookupCredit(id);
    if (!c) return json(503, { error: { code: "SOURCE_UNAVAILABLE", message: "Credit source unavailable" } }); // never approve on failure
    return json(200, { companyId: id, approvedLimit: c.limit, utilized: c.utilized, pending: c.pending, available: c.limit - c.utilized - c.pending, lastSync: new Date().toISOString(), accountStatus: "Good standing", reviewStatus: "None", restrictions: [], source: "live" });
  }
  let b: { companyId?: string; amount?: number; idempotencyKey?: string };
  try { b = JSON.parse(ev.body ?? "{}"); } catch { return json(400, { error: { code: "BAD_JSON", message: "Invalid JSON" } }); }
  if (!b.companyId || !b.idempotencyKey || typeof b.amount !== "number" || b.amount < 0) return json(400, { error: { code: "BAD_REQUEST", message: "Invalid payload" } });
  const c = await lookupCredit(b.companyId);
  if (!c) return json(503, { error: { code: "SOURCE_UNAVAILABLE", message: "Credit source unavailable" } });
  const available = c.limit - c.utilized - c.pending;
  return json(200, { approved: b.amount <= available, available, shortfall: Math.max(0, b.amount - available), decisionId: `d-${b.idempotencyKey}`, checkedAt: new Date().toISOString() });
};

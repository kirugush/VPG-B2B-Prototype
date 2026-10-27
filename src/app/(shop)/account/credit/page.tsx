"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { DemoTag, PageHeader, fmtDate, money } from "@/components/ui";
import { fetchCreditAccount, isStale } from "@/lib/credit";
import { useApp } from "@/lib/store";
import type { CreditAccount } from "@/lib/types";

export default function CreditPage() {
  const { company } = useApp();
  const [acct, setAcct] = useState<CreditAccount | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [outage, setOutage] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr(null);
    const r = await fetchCreditAccount(company.id, company.creditUsed, outage ? "outage" : undefined);
    if (r.ok) setAcct(r.data); else setErr(r.error);
    setLoading(false);
  }, [company.id, company.creditUsed, outage]);
  useEffect(() => { load(); }, [load]);

  const stale = acct ? isStale(acct) : false;
  const pct = acct && acct.approvedLimit > 0 ? Math.min(100, Math.round((acct.utilized / acct.approvedLimit) * 100)) : 0;

  return (
    <div className="space-y-4">
      <PageHeader title="Credit & Account Status" subtitle={company.name} />
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
        {acct?.source === "mock" && <DemoTag>Demo data</DemoTag>}
        {acct?.source === "mock" && (
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={outage} onChange={(e) => setOutage(e.target.checked)} /> Simulate credit service outage (demo)</label>
        )}
      </div>

      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
          <b>Credit information is unavailable.</b> {err} Checkout is blocked until credit can be verified; nothing is assumed approved.
        </div>
      )}
      {stale && acct && <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900" role="status">This data was last synced {new Date(acct.lastSync).toLocaleString()} and may be out of date. Press Refresh.</div>}

      {acct && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["Approved limit", money(acct.approvedLimit)], ["Utilized", money(acct.utilized)], ["Pending orders", money(acct.pending)], ["Available", money(acct.available)]].map(([k, v]) => (
              <div key={k} className="card p-4"><p className="text-sm text-gray-500">{k}</p><p className="text-2xl font-bold">{v}</p></div>
            ))}
          </section>
          <section className="card p-4">
            <div className="mb-2 flex justify-between text-sm"><span>Utilization</span><span>{pct}%</span></div>
            <div className="h-3 rounded-full bg-gray-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Credit utilization"><div className={`h-3 rounded-full ${pct > 85 ? "bg-red-600" : "bg-green-600"}`} style={{ width: `${pct}%` }} /></div>
          </section>
          <section className="card space-y-2 p-4 text-sm">
            <p><b>Account status:</b> {acct.accountStatus}</p>
            <p><b>Credit review:</b> {acct.reviewStatus}</p>
            <p><b>Last synced:</b> {fmtDate(acct.lastSync)} {new Date(acct.lastSync).toLocaleTimeString()}</p>
            <div><b>Restrictions:</b>{acct.restrictions.length ? <ul className="list-disc pl-5">{acct.restrictions.map((r) => <li key={r}>{r}</li>)}</ul> : " None"}</div>
          </section>
        </>
      )}
    </div>
  );
}

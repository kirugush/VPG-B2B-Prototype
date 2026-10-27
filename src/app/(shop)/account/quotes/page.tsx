"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { QuoteRequestInfo } from "@/components/cms/blocks";
import { DemoTag, EmptyState, PageHeader, Pagination, Pill, SortHeader, fmtDate, money } from "@/components/ui";
import { can } from "@/lib/permissions";
import { effectiveStatus, quoteTotals } from "@/lib/quotes";
import { useApp } from "@/lib/store";
import type { QuoteStatus } from "@/lib/types";

const STATUSES: ("All" | QuoteStatus)[] = ["All", "Draft", "Submitted", "Under Review", "Approved", "Rejected", "Expired", "Converted"];
type SortKey = "id" | "createdAt" | "expiresAt" | "total" | "status";

export default function QuotesPage() {
  const { quotes, user } = useApp();
  const [tab, setTab] = useState<"All" | QuoteStatus>("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const now = Date.now();

  const rows = useMemo(() => quotes.map((x) => ({ x, st: effectiveStatus(x, now), t: quoteTotals(x) })), [quotes, now]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: rows.length };
    rows.forEach((r) => (c[r.st] = (c[r.st] ?? 0) + 1));
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = rows.filter((r) => (tab === "All" || r.st === tab) && (!needle || `${r.x.id} ${r.x.title} ${r.x.contactName} ${r.x.contactEmail} ${r.x.companyName}`.toLowerCase().includes(needle)));
    const val = (r: (typeof rows)[number]) => (sort === "total" ? r.t.total : sort === "status" ? r.st : sort === "id" ? r.x.id : r.x[sort]);
    list.sort((a, b) => { const A = val(a), B = val(b); return (A < B ? -1 : A > B ? 1 : 0) * (dir === "asc" ? 1 : -1); });
    return list;
  }, [rows, tab, q, sort, dir]);

  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const cur = Math.min(page, pages);
  const toggle = (k: SortKey) => { if (sort === k) setDir((d) => (d === "asc" ? "desc" : "asc")); else { setSort(k); setDir("asc"); } setPage(1); };

  return (
    <div className="space-y-4">
      <PageHeader title="Quotes" subtitle={`${quotes.length} quotes for your company`} actions={can(user?.role, "quotes") && <Link href="/account/quotes/new" className="btn-primary"><Plus className="h-4 w-4" /> Request a Quote</Link>} />
      <QuoteRequestInfo />
      <div role="tablist" aria-label="Quote status" className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} role="tab" aria-selected={tab === s} onClick={() => { setTab(s); setPage(1); }} className={`rounded-full border px-3 py-1 text-sm ${tab === s ? "border-brand-600 bg-brand-600 text-white" : "bg-white hover:bg-gray-50"}`}>{s} <span className="opacity-70">({counts[s] ?? 0})</span></button>
        ))}
      </div>
      <div className="card p-3"><label className="label" htmlFor="qs">Search quotes</label><input id="qs" className="input" placeholder="Quote ID, title, contact or email" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
      {filtered.length === 0 ? <EmptyState title="No quotes match" body="Try a different status or search term." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <caption className="sr-only">Quotes</caption>
            <thead><tr>
              <SortHeader label="Quote ID" active={sort === "id"} dir={dir} onClick={() => toggle("id")} />
              <th className="th">Title</th><th className="th">Customer / Company</th>
              <SortHeader label="Created" active={sort === "createdAt"} dir={dir} onClick={() => toggle("createdAt")} />
              <SortHeader label="Expires" active={sort === "expiresAt"} dir={dir} onClick={() => toggle("expiresAt")} />
              <th className="th">Lines</th><th className="th">Subtotal</th><th className="th">Discount</th><th className="th">Tax</th>
              <SortHeader label="Total" active={sort === "total"} dir={dir} onClick={() => toggle("total")} />
              <SortHeader label="Status" active={sort === "status"} dir={dir} onClick={() => toggle("status")} />
              <th className="th">Rep</th><th className="th">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.slice((cur - 1) * 10, cur * 10).map(({ x, st, t }) => (
                <tr key={x.id}>
                  <td className="td font-medium"><Link href={`/account/quotes/${x.id}`} className="text-brand-600 hover:underline">{x.id}</Link> {x.mock && <DemoTag>Demo</DemoTag>}</td>
                  <td className="td">{x.title}</td>
                  <td className="td">{x.contactName}<br /><span className="text-xs text-gray-500">{x.companyName} · {x.contactEmail}</span></td>
                  <td className="td">{fmtDate(x.createdAt)}</td><td className="td">{fmtDate(x.expiresAt)}</td>
                  <td className="td">{t.lineCount}</td><td className="td">{money(t.subtotal)}</td><td className="td">{t.discount ? `−${money(t.discount)}` : "—"}</td><td className="td">{money(t.tax)}</td>
                  <td className="td font-semibold">{money(t.total)}</td><td className="td"><Pill label={st} /></td>
                  <td className="td">{x.assignedRep ?? <span className="text-gray-400">Unassigned</span>}</td>
                  <td className="td"><Link href={`/account/quotes/${x.id}`} className="font-semibold text-brand-600 hover:underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={cur} pages={pages} onChange={setPage} />
    </div>
  );
}

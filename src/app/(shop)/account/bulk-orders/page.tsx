"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Plus, Trash2, XCircle } from "lucide-react";
import { BulkOrderInstructions, FaqSection } from "@/components/cms/blocks";
import { EmptyState, PageHeader, STOCK_LABEL, downloadBlob, fmtDateTime, money } from "@/components/ui";
import { LIMITS } from "@/lib/config";
import { errorReportCsv, normSku, parseBulkCsv, parsePaste, sampleCsv, validateBulk, validateCsvFile, type BulkRowInput } from "@/lib/bulk";
import { useApp } from "@/lib/store";
import { PRODUCTS } from "@/mocks/data";

interface GridRow { sku: string; qty: string; ref?: string }
const blank = (): GridRow => ({ sku: "", qty: "" });
type Source = "quick" | "paste" | "csv" | "list" | "order";

export default function BulkOrders() {
  const { lists, orders, bulkSubmissions, addManyToCart, createList, toggleInList, createQuote, recordBulkSubmission, toast } = useApp();
  const [rows, setRows] = useState<GridRow[]>(() => Array.from({ length: 5 }, blank));
  const [tab, setTab] = useState<"quick" | "paste" | "csv">("quick");
  const [paste, setPaste] = useState("");
  const [source, setSource] = useState<Source>("quick");
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [done, setDone] = useState<{ ref: string; added: number; outcome: string } | null>(null);
  const [saveName, setSaveName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Live validation. Prices/stock always come from the catalog, never from the input.
  const inputs: BulkRowInput[] = useMemo(
    () => rows.map((r, i) => ({ row: i + 1, sku: r.sku, qty: r.qty === "" ? (r.sku ? "1" : "") : r.qty, ref: r.ref })).filter((r) => r.sku.trim() || r.qty.trim()),
    [rows],
  );
  const result = useMemo(() => validateBulk(inputs, PRODUCTS), [inputs]);
  const lineByRow = useMemo(() => { const m = new Map<number, (typeof result.lines)[number]>(); result.lines.forEach((l) => m.set(l.rows[0], l)); return m; }, [result]);
  const errors = result.issues.filter((i) => i.severity === "error");
  const total = result.lines.reduce((s, l) => s + l.subtotal, 0);

  const loadRows = (incoming: GridRow[], src: Source, replace = true) => {
    const keep = replace ? [] : rows.filter((r) => r.sku.trim() || r.qty.trim());
    const merged = [...keep, ...incoming].slice(0, LIMITS.csvMaxRows);
    setRows(merged.length ? [...merged, blank()] : Array.from({ length: 5 }, blank));
    setSource(src);
    setDone(null);
  };
  const update = (i: number, p: Partial<GridRow>) => { setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...p } : r))); setDone(null); };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const errs = validateCsvFile(f);
    setFileName(f.name);
    if (errs.length) { setFileErrors(errs); return; }
    const out = parseBulkCsv(await f.text());
    setFileErrors(out.fileErrors);
    if (out.rows.length) loadRows(out.rows.map((r) => ({ sku: r.sku, qty: r.qty, ref: r.ref })), "csv");
    if (fileRef.current) fileRef.current.value = ""; // allows re-upload after correcting the file
  };
  const onLoadPaste = () => {
    const out = parsePaste(paste);
    setFileErrors(out.fileErrors);
    if (out.rows.length) { loadRows(out.rows.map((r) => ({ sku: r.sku, qty: r.qty, ref: r.ref })), "paste", false); setPaste(""); }
  };
  const record = (outcome: "Added to cart" | "Quote requested" | "Saved only") =>
    recordBulkSubmission({ source, fileName, linesSubmitted: result.rowsSubmitted, linesValid: result.lines.length, linesRejected: result.rowsRejected, outcome });

  const addToCart = () => {
    if (result.lines.length === 0) return toast("There are no valid lines to add.", "error");
    const n = addManyToCart(result.lines.map((l) => ({ productId: l.productId, qty: l.qty })), { quiet: true });
    const ref = record("Added to cart");
    setDone({ ref, added: n, outcome: "Added to cart" });
    toast(`${n} line${n === 1 ? "" : "s"} added to cart (${ref}). No order has been placed.`);
  };
  const requestQuote = () => {
    if (result.lines.length === 0) return toast("There are no valid lines to quote.", "error");
    const id = createQuote({ title: `Bulk quote request ${new Date().toLocaleDateString("en-AU")}`, lines: result.lines.map((l) => { const p = PRODUCTS.find((x) => x.id === l.productId)!; const price = p.offerPrice ?? p.price; return { productId: l.productId, qty: l.qty, listPrice: price, quotedPrice: price }; }), submit: false });
    if (id) { const ref = record("Quote requested"); setDone({ ref, added: result.lines.length, outcome: `Draft quote ${id} created` }); }
  };
  const saveList = () => {
    if (!saveName.trim() || result.lines.length === 0) return toast("Enter a list name and at least one valid line.", "error");
    const id = createList(saveName.trim());
    result.lines.forEach((l) => toggleInList(id, l.productId));
    record("Saved only");
    toast(`Saved ${result.lines.length} products to list "${saveName.trim()}".`);
    setSaveName("");
  };
  const clearAll = () => { setRows(Array.from({ length: 5 }, blank)); setFileErrors([]); setFileName(undefined); setDone(null); };

  return (
    <div className="space-y-4">
      <PageHeader title="Bulk Orders" subtitle="Quick order form, paste from a spreadsheet, or upload a CSV." />
      <BulkOrderInstructions />

      <div role="tablist" aria-label="Entry method" className="flex flex-wrap gap-2">
        {([["quick", "Quick order form"], ["paste", "Paste from spreadsheet"], ["csv", "Upload CSV"]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full border px-4 py-1.5 text-sm ${tab === k ? "border-brand-600 bg-brand-600 text-white" : "bg-white hover:bg-gray-50"}`}>{l}</button>
        ))}
      </div>

      {tab === "paste" && (
        <section className="card space-y-2 p-4">
          <label className="label" htmlFor="paste">Paste lines (SKU, then quantity — separated by tab, comma or space)</label>
          <textarea id="paste" className="input font-mono" rows={5} placeholder={"VPG-1007\t4\nVPG-1014 2"} value={paste} onChange={(e) => setPaste(e.target.value)} />
          <button className="btn-primary" onClick={onLoadPaste} disabled={!paste.trim()}>Load into form</button>
        </section>
      )}
      {tab === "csv" && (
        <section className="card space-y-3 p-4">
          <div>
            <label className="label" htmlFor="csv">CSV file (max {Math.round(LIMITS.csvMaxBytes / 1000)} KB, {LIMITS.csvMaxRows} rows)</label>
            <input id="csv" ref={fileRef} type="file" accept=".csv,text/csv" className="block w-full text-sm" onChange={(e) => onFile(e.target.files?.[0])} />
            {fileName && <p className="mt-1 text-xs text-gray-500">Loaded: {fileName}</p>}
          </div>
          <p className="text-sm text-gray-600">Format: header row <code>SKU,Quantity,Reference</code> (Reference optional). Prices in a file are ignored.</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-outline" onClick={() => downloadBlob("bulk-sample-valid.csv", new Blob([sampleCsv("valid", PRODUCTS)], { type: "text/csv" }))}><Download className="h-4 w-4" /> Sample (valid)</button>
            <button className="btn-outline" onClick={() => downloadBlob("bulk-sample-errors.csv", new Blob([sampleCsv("errors", PRODUCTS)], { type: "text/csv" }))}><Download className="h-4 w-4" /> Sample (with errors)</button>
          </div>
        </section>
      )}
      {fileErrors.length > 0 && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{fileErrors.map((e) => <p key={e}>{e}</p>)}</div>}

      <section className="card p-4">
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <div><label className="label" htmlFor="fl">Add from saved list</label>
            <select id="fl" className="input" defaultValue="" onChange={(e) => { const l = lists.find((x) => x.id === e.target.value); if (l) loadRows(l.productIds.map((id) => { const p = PRODUCTS.find((x) => x.id === id); return { sku: p?.sku ?? id, qty: "1" }; }), "list", false); e.target.value = ""; }}>
              <option value="">Choose a list…</option>{lists.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.productIds.length})</option>)}</select></div>
          <div><label className="label" htmlFor="fo">Add from previous order</label>
            <select id="fo" className="input" defaultValue="" onChange={(e) => { const o = orders.find((x) => x.id === e.target.value); if (o) loadRows(o.lines.map((l) => ({ sku: PRODUCTS.find((p) => p.id === l.productId)?.sku ?? l.productId, qty: String(l.qty) })), "order", false); e.target.value = ""; }}>
              <option value="">Choose an order…</option>{orders.slice(0, 15).map((o) => <option key={o.id} value={o.id}>{o.id} · {fmtDateTime(o.date).slice(0, 12)}</option>)}</select></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <caption className="sr-only">Bulk order lines</caption>
            <thead><tr><th className="th">#</th><th className="th">SKU</th><th className="th">Product</th><th className="th">UOM</th><th className="th">Availability</th><th className="th">Your price</th><th className="th">Qty</th><th className="th">Line subtotal</th><th className="th">Status</th><th className="th"><span className="sr-only">Remove</span></th></tr></thead>
            <tbody className="divide-y">
              {rows.map((r, i) => {
                const p = PRODUCTS.find((x) => normSku(x.sku) === normSku(r.sku));
                const issues = result.issues.filter((x) => x.row === i + 1);
                const err = issues.find((x) => x.severity === "error");
                const line = lineByRow.get(i + 1);
                const used = r.sku.trim() || r.qty.trim();
                return (
                  <tr key={i} className={err ? "bg-red-50" : ""}>
                    <td className="td text-gray-400">{i + 1}</td>
                    <td className="td"><input aria-label={`SKU row ${i + 1}`} className="input w-32 py-1.5" value={r.sku} onChange={(e) => update(i, { sku: e.target.value })} maxLength={40} /></td>
                    <td className="td">{p ? <span className="flex items-center gap-2">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.image} alt="" className="h-9 w-9 rounded object-cover" /><span className="max-w-[220px] truncate">{p.title}</span></span> : <span className="text-gray-300">—</span>}</td>
                    <td className="td">{p?.uom ?? "—"}</td>
                    <td className="td">{p ? (p.discontinued ? <span className="font-medium text-red-600">Discontinued</span> : <span className={`font-medium ${STOCK_LABEL[p.stock].cls}`}>{STOCK_LABEL[p.stock].label}</span>) : "—"}</td>
                    <td className="td">{p ? `${money(p.offerPrice ?? p.price)}` : "—"}</td>
                    <td className="td"><input aria-label={`Quantity row ${i + 1}`} inputMode="numeric" className="input w-20 py-1.5" value={r.qty} onChange={(e) => update(i, { qty: e.target.value })} maxLength={6} />{p && <span className="ml-1 text-[11px] text-gray-400">{p.minQty}-{p.maxQty}</span>}</td>
                    <td className="td">{line ? money(line.subtotal) : "—"}</td>
                    <td className="td text-xs">
                      {!used ? null : err ? <span className="flex items-start gap-1 text-red-700"><XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{err.message}</span></span>
                        : issues.length ? <span className="flex items-start gap-1 text-amber-700"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{issues[0].message}</span></span>
                        : line ? <span className="flex items-center gap-1 text-green-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Valid</span> : null}
                    </td>
                    <td className="td"><button aria-label={`Remove row ${i + 1}`} className="text-gray-400 hover:text-brand-600" onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((_, k) => k !== i) : [blank()]))}><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button className="btn-outline mt-3" onClick={() => setRows((rs) => (rs.length < LIMITS.csvMaxRows ? [...rs, blank()] : rs))}><Plus className="h-4 w-4" /> Add row</button>
      </section>

      <section className="card p-4" aria-live="polite">
        <h2 className="mb-2 font-bold">Review</h2>
        {inputs.length === 0 ? <p className="text-sm text-gray-500">Enter or load some lines to see a preview.</p> : (
          <div className="grid gap-3 text-sm sm:grid-cols-4">
            <div><p className="text-gray-500">Rows submitted</p><p className="text-xl font-bold">{result.rowsSubmitted}</p></div>
            <div><p className="text-gray-500">Valid lines</p><p className="text-xl font-bold text-green-700">{result.lines.length}</p></div>
            <div><p className="text-gray-500">Rejected rows</p><p className={`text-xl font-bold ${result.rowsRejected ? "text-red-600" : ""}`}>{result.rowsRejected}</p></div>
            <div><p className="text-gray-500">Estimated total (ex GST)</p><p className="text-xl font-bold">{money(total)}</p></div>
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">Prices and availability are indicative until confirmed at checkout.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="btn-primary" disabled={result.lines.length === 0} onClick={addToCart}>Add {result.lines.length || ""} valid line{result.lines.length === 1 ? "" : "s"} to cart</button>
          <button className="btn-outline" disabled={result.lines.length === 0} onClick={requestQuote}>Create quote request</button>
          {result.issues.length > 0 && <button className="btn-outline" onClick={() => downloadBlob("bulk-error-report.csv", new Blob([errorReportCsv(result)], { type: "text/csv" }))}><Download className="h-4 w-4" /> Download error report ({errors.length} error{errors.length === 1 ? "" : "s"})</button>}
          <button className="btn-outline" onClick={clearAll}>Clear form</button>
        </div>
        <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); saveList(); }}>
          <div><label className="label" htmlFor="sl">Save valid lines as a reusable list</label><input id="sl" className="input" value={saveName} maxLength={60} onChange={(e) => setSaveName(e.target.value)} placeholder="List name" /></div>
          <button className="btn-outline" disabled={result.lines.length === 0 || !saveName.trim()}>Save list</button>
        </form>
        {done && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900" role="status">
            <p className="font-semibold">{done.outcome} · reference {done.ref}</p>
            <p>No order has been placed. Continue to checkout when you are ready.</p>
            <Link href="/cart" className="mt-2 inline-block font-semibold underline">Go to cart</Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-bold">Submission history</h2>
        {bulkSubmissions.length === 0 ? <EmptyState title="No submissions yet" body="Add lines to your cart or request a quote to see them here." /> : (
          <div className="card overflow-x-auto"><table className="w-full min-w-[640px]"><thead><tr><th className="th">Reference</th><th className="th">Date</th><th className="th">User</th><th className="th">Source</th><th className="th">Submitted</th><th className="th">Valid</th><th className="th">Rejected</th><th className="th">Outcome</th></tr></thead>
            <tbody className="divide-y">{bulkSubmissions.map((s) => (<tr key={s.id}><td className="td font-medium">{s.reference}</td><td className="td">{fmtDateTime(s.at)}</td><td className="td">{s.userName}</td><td className="td capitalize">{s.source}{s.fileName ? ` (${s.fileName})` : ""}</td><td className="td">{s.linesSubmitted}</td><td className="td">{s.linesValid}</td><td className="td">{s.linesRejected}</td><td className="td">{s.outcome}</td></tr>))}</tbody></table></div>
        )}
      </section>
      <FaqSection />
    </div>
  );
}

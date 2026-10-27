"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuoteLinesEditor } from "@/components/QuoteLinesEditor";
import { PageHeader } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { QuoteLine } from "@/lib/types";

export default function NewQuote() {
  const { createQuote, toast } = useApp();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [busy, setBusy] = useState(false);

  const save = (submit: boolean) => {
    if (busy) return;
    if (!title.trim()) return toast("Give the quote a title.", "error");
    setBusy(true);
    const id = createQuote({ title, lines, submit });
    if (id) { toast(submit ? `Quote ${id} submitted for review.` : `Draft ${id} saved.`); router.push(`/account/quotes/${id}`); } else setBusy(false);
  };
  return (
    <div className="space-y-4">
      <PageHeader title="Request a Quote" subtitle="Pricing shown is your current eligible price. Our team may return a negotiated price." />
      <div className="card space-y-4 p-4">
        <div><label className="label" htmlFor="qt">Quote title</label><input id="qt" className="input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q4 compressor refresh" /></div>
        <QuoteLinesEditor lines={lines} onChange={setLines} />
        <div className="flex flex-wrap justify-end gap-2">
          <button className="btn-outline" disabled={busy} onClick={() => save(false)}>Save as Draft</button>
          <button className="btn-primary" disabled={busy || lines.length === 0} onClick={() => save(true)}>Submit for Review</button>
        </div>
      </div>
    </div>
  );
}

import { getProduct } from "./services";
import { can } from "./permissions";
import type { Invoice, Order, Role } from "./types";

/**
 * Authorization for invoice access. Same rule MUST be enforced server-side in live mode
 * (AWS authorizer + company-scoped S3 prefix + short-lived signed URLs).
 */
export function canAccessInvoice(inv: Invoice, user: { companyId?: string; role: Role }): boolean {
  if (!can(user.role, "invoices")) return false;
  return !!inv.companyId && inv.companyId === (user.companyId ?? "c1");
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "?");

export const DEMO_NOTICE = "DEMONSTRATION DOCUMENT - NOT A TAX INVOICE";

/**
 * Demonstration PDF built in the browser. In live mode invoices come from the ERP /
 * BigCommerce, or an AWS PDF service using an approved brand template. A custom
 * informational PDF is NOT a legally valid tax invoice until compliance is signed off
 * for the relevant jurisdiction.
 */
export function generateInvoicePdf(inv: Invoice, order: Order | undefined, company: { name: string; bpgNumber: string; address: string }): Blob {
  const lines: string[] = [];
  let y = 800;
  const add = (text: string, size = 11, x = 50) => {
    lines.push(`BT /F1 ${size} Tf ${x} ${y} Td (${esc(text)}) Tj ET`);
    y -= size + 7;
  };
  add(DEMO_NOTICE, 12);
  y -= 4;
  add("Vinod Patel Group", 18);
  add(`Invoice ${inv.id}`, 14);
  y -= 6;
  add(`Bill to: ${company.name} (${company.bpgNumber})`);
  add(company.address, 10);
  add(`Issued: ${new Date(inv.issued).toLocaleDateString("en-AU")}    Due: ${new Date(inv.due).toLocaleDateString("en-AU")}    Status: ${inv.status}`);
  if (order) {
    add(`Order: ${order.id}    PO: ${order.po}${order.quoteId ? `    Quote: ${order.quoteId}` : ""}`);
    y -= 8;
    add("Items", 13);
    order.lines.forEach((l) => {
      const p = getProduct(l.productId);
      add(`${p?.sku ?? l.productId}  ${p?.title ?? ""}  x${l.qty} @ $${l.price.toFixed(2)} = $${(l.qty * l.price).toFixed(2)}`, 10);
    });
    y -= 6;
    add(`Subtotal: $${order.subtotal.toFixed(2)}`);
    if (order.shipping) add(`Shipping: $${order.shipping.toFixed(2)}`);
    add(`GST: $${order.gst.toFixed(2)}`);
  }
  add(`Amount due: $${inv.amount.toFixed(2)}`, 14);
  y -= 10;
  add("Sample document generated from demonstration data. Not valid for tax or accounting purposes.", 9);
  const stream = lines.join("\n");
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => (pdf += `${o.toString().padStart(10, "0")} 00000 n \n`));
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

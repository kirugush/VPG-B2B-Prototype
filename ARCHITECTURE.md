# Architecture

## Source of truth (target)
| Domain | Target system | Today |
|---|---|---|
| Catalog, pricing, stock | BigCommerce | `src/mocks/data.ts` via `src/lib/services.ts` |
| Orders, quotes, companies, users | BigCommerce B2B Edition (native) | localStorage state in `src/lib/store.tsx` |
| Credit | ERP/BC via AWS | `/api/credit/*` (mock rules or AWS proxy) |
| Favorites, bulk history, audit, invoice PDFs | AWS (custom) | store + `src/lib/invoices.ts` (demo PDF) |
| Marketing content | Makeswift | `src/components/cms/blocks.tsx` (registration unverified) |

## Rules enforced in code
- `NEXT_PUBLIC_DATA_MODE=live` shows a blocker; it never fabricates mock data.
- Credit gating runs in server routes; a failed lookup blocks checkout, never approves.
- CSV upload never creates an order; it fills an editable grid.
- Permissions: `src/lib/permissions.ts` (Admin/Senior only for B2B features); routes guarded by `permissionForPath`.
- Invoices: `canAccessInvoice` (company isolation); demo PDFs labelled "NOT A TAX INVOICE".
- Makeswift content must never touch auth, pricing or credit.

## Mock data
All fixtures live under `src/mocks/`.

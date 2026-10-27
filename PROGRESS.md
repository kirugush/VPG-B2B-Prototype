# Progress

| Module | Built (mock) | Native reused / AWS needed | Deferred / open |
|---|---|---|---|
| Quotes | list/new/detail, approve (Admin), idempotent convert | BC B2B quotes (native) | live wiring |
| Orders | list/detail, cancellation *request* only | BC orders | refunds not simulated |
| Bulk ordering | quick/paste/CSV grid, validation, error report | AWS history | live |
| Re-order | revalidated review, replacements, cart, favorites | BC cart | live |
| Favorites | existing lists | AWS | discontinued badges, bulk hand-off |
| Credit | page + server eligibility routes | AWS/ERP | real source (scaffold in `aws/`) |
| Users/Company | status, invite, permission matrix, audit | BC B2B users | company profile editing, company switching |
| Invoices | authorised demo PDF | AWS PDF + signed URL | real tax invoice |
| Store locator | 36 demo stores, Leaflet map, filters | none | real store data |
| Makeswift blocks | defined with defaults | Makeswift | registration unverified |
| Tests | Vitest unit (10) | | Playwright/axe e2e not written; Lighthouse not run |

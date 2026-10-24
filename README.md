# VPG B2B Trade Portal

B2B storefront for Vinod Patel Group (ice-machine parts). Next.js 15 App Router + React 19 + Tailwind, structured so BigCommerce (B2B Edition), Makeswift and an AWS API layer plug in at clearly marked seams.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Demo accounts (password `Password1!`)

| Email | Role |
|---|---|
| admin@demo.com | Admin |
| manager@demo.com | Senior Purchase Manager |
| buyer@demo.com | Junior Buyer |

Coupon codes: `VPG10` (10%), `ICE5` (5%). State is persisted in `localStorage` (key `vpg-b2b-state-v1`).

## Status: what is real vs mocked

All screens in the brief are built and working end-to-end against **mock data**. No BigCommerce, Makeswift or AWS credentials were available, so nothing is wired to them yet.

| Concern | Today | Production target |
|---|---|---|
| Catalog, search, pricing, stock | `src/lib/services.ts` + `mock-data.ts` | BigCommerce GraphQL Storefront API (Catalyst `client.fetch`) |
| Cart, checkout, orders | `src/lib/store.tsx` | BigCommerce Cart/Checkout APIs; B2B Edition quotes/orders |
| Customer groups, credit limit | `COMPANY` in mock data | BC B2B Edition company credit |
| Real-time credit check | `checkCredit()` | AWS API Gateway + Lambda |
| Favorites / shopping lists | store (`lists`) | AWS (DynamoDB) or BC B2B shopping lists |
| User management by BPG ID | store (`users`) | AWS Lambda + BC B2B Edition users API |
| Invoice PDF | `generateInvoicePdf()` (client-side) | AWS Lambda + S3 signed URL |
| Hero, promotions, footer | `src/components/cms/*` | Makeswift components (`runtime.registerComponent`) |
| Auth | local credential check | BC customer login (B2B Edition) / JWT |

## Important caveats

- **Catalyst**: this project follows Catalyst's stack (Next.js App Router, Tailwind) but is **not** scaffolded from the Catalyst template, since that requires a BigCommerce store. To adopt Catalyst, run `npm create @bigcommerce/catalyst@latest` and port `src/components`, `src/app` and the `services.ts` seam onto its data layer.
- **Branding**: theme values are ported from the site's own `global.css` (primary red `356 93% 35%`, Inter, black header). Edit the CSS variables at the top of `src/app/globals.css` to re-theme. The site CSS is Tailwind v4; this project stays on Tailwind v3 with the supplied `tailwind.config.js`, so the v4-only syntax (`@theme`, `@plugin`, `@source`), the Sriracha font-face and the `.container` overrides were not copied. The VPG logo is hotlinked from the URL in the brief.
- **Mega menu / categories**: the reference site's menu did not load, so `CATEGORIES` in `mock-data.ts` is an ice-machine-parts taxonomy, not a mirror of the site. Footer links and social URLs come from the live site's footer.
- **GST** is 15% (`GST_RATE` in `types.ts`); adjust per market.
- Passwords are stored in plain text in localStorage for the demo only.

## Role rules

- **Admin**: everything, including User Management and company logo upload.
- **Senior Purchase Manager**: all operational data and Account Settings; no User Management or logo upload.
- **Junior Buyer**: can browse and order; checkout is blocked when the total exceeds available credit; no Account Settings or User Management (nav hidden and routes redirect to `/account`).

## Layout

```
src/app/(auth)    login, register, forgot/reset password, success
src/app/(shop)    home, search, category, product, cart, checkout, confirmation
src/app/(shop)/account   dashboard, orders, invoices, addresses, settings, users, shopping lists
src/components    Header (mega menu), MiniCart, ProductCard, Catalog, ui, cms/*
src/lib           types, mock-data, services (backend seam), store (state)
```

## B2B features (Admin and Senior Purchase Manager only)
Quotes, Bulk Orders, Re-order, Credit & Account Status, Invoices, Store Locator; Admin also manages users. Junior Buyer cannot reach these (nav hidden, routes redirect).
- Mock/live: `NEXT_PUBLIC_DATA_MODE` (see `.env.example`). Live mode needs `AWS_API_BASE_URL`/`AWS_API_KEY` and shows a blocker until a real backend exists.
- Tests: `npm test` (Vitest). See ARCHITECTURE.md and PROGRESS.md. `aws/` is an undeployed design scaffold.

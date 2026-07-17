# MyProtein Mongolia (GainHub)

A protein / fitness supplement e-commerce storefront for the Mongolian market —
whey, creatine, BCAA, pre-workout, bundles. Pivoted from an earlier project
(BathHub, a bathroom/sanitaryware demo) into a standalone product with a real
backend: Postgres via Prisma, Cloudinary image uploads, and a full admin panel.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript**
- **Prisma 7** with the `pg` driver adapter, **PostgreSQL** (Neon in production)
- **Cloudinary** (`next-cloudinary`) for product image uploads
- **bcryptjs** + **jose** for password hashing / JWT session auth
- **Tailwind CSS v4** (theme tokens in `src/app/globals.css`)

## Features

- **Catalog** — categories, products, per-product flavor variants and bundles
  (`prisma/schema.prisma`: `Category`, `Product`, `ProductVariant`, `ProductFlavor`,
  `BundleItem`), product grid with filters/search/sort, product detail pages.
- **Cart / Checkout / Orders** — cart context, delivery-address checkout flow,
  order history (`Order`, `OrderItem` models), saved addresses.
- **Auth** — email/password registration & login (`bcryptjs` hashing, JWT session
  cookie via `jose`), protected `/profile` and `/orders`.
- **Admin** (`src/app/(admin)/admin`) — separate login, dashboard, product
  CRUD with Cloudinary image upload (`ProductForm`), order management,
  site-wide promotion banner/popup settings (`PromotionSetting` model).
- **Marketing** — promotion popup + marquee strip driven by admin-configured
  promotion settings.

Route structure uses two App Router groups: `(shop)` for the public storefront
and `(admin)` for `/admin/*`, each with its own layout.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Requires a `.env` with at least:

```
DATABASE_URL=postgresql://...
AUTH_SECRET=<random string>
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
```

Then apply the schema and seed catalog data:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Seeding creates one admin account (`isAdmin: true`) from `prisma/seed.ts` —
check that file locally for the credentials; they aren't published here since
this repo is public.

Other scripts:

```bash
npm run build    # prisma generate && next build (type-checked)
npm run start    # serve the production build
npm run lint     # eslint
```

## Product images

`public/images` (bulk product photography, ~1,700 files) is **gitignored** —
it's not committed to this repo and is managed outside of git. A fresh clone
or deploy will not have these files; the storefront's product-listing image
paths won't resolve until that pipeline is wired up separately. Small,
one-off UI assets (logo, favicon, hero background) *are* committed normally.

## Deployment

- **GitHub**: [Enkhtuvshin02/myproteinmongolia](https://github.com/Enkhtuvshin02/myproteinmongolia)
  (public), connected to Vercel for auto-deploy on push to `main`.
- **Vercel**: project `myproteinmongolia`, team `tuvshin674-4953s-projects`.
  Production: <https://myproteinmongolia.vercel.app>
- **Database**: a dedicated Neon Postgres instance provisioned via the Vercel
  Marketplace integration, separate from any other project's database.
- **Env vars** are set per-environment (Production/Preview/Development) in the
  Vercel project settings — `DATABASE_URL` (+ related Neon vars, auto-managed
  by the integration), `AUTH_SECRET`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

To redeploy manually: `vercel --prod` (project must be linked via
`vercel link`; `.vercel/` is gitignored).

## Project structure

```
src/
├── app/
│   ├── (shop)/                 # public storefront: layout, home, product, cart,
│   │                           #   checkout, orders, profile, login/register
│   ├── (admin)/admin/          # admin login + (dashboard) group: products, orders, promotion
│   └── api/                    # route handlers: auth, products, orders, addresses,
│                               #   admin/*, promotion, sign-upload (Cloudinary)
├── components/                 # header/footer/nav, product cards, cart-context,
│                               #   promotion-popup, marquee-strip, hero, etc.
└── lib/
    ├── db.ts                   # Prisma client
    ├── auth-utils.ts           # password hashing / session helpers
    ├── data.ts, types.ts       # seed data + shared types
    └── checkout.ts             # fees, totals helpers

prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

## Notes

- Mongolian (Cyrillic) UI.
- This project shares its original codebase lineage with BathHub but runs on
  its own GitHub repo, Vercel project, and database — no shared state between
  the two.

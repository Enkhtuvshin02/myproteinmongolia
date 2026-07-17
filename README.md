# BathHub — Bathroom & Sanitaryware E-commerce (demo)

A functional storefront for an online bathroom/sanitaryware shop (toilets, sinks, bidets,
faucets, showers, bathtubs, etc.) for the Mongolian market. It started as a pixel-faithful
clone of [100ail.mn](https://100ail.mn) and was re-skinned into **BathHub**, then
extended with a full cart → checkout → payment flow and authentication.

> ⚠️ **Demo / prototype.** There is no backend. Catalog data is mocked, product images are
> hotlinked from Unsplash, and all state (cart, orders, accounts) lives in `localStorage`.
> Passwords are stored in plaintext — fine for a prototype, **not** for production.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** (theme tokens in `src/app/globals.css`)
- **lucide-react** icons

## Features

- **Catalog** — 11 bathroom categories, ~27 products (`src/lib/data.ts`), category mega-menu,
  product grid with sidebar filters / search / sort, product detail pages.
- **Cart** — slide-out mini-cart + full `/cart` page (qty, remove, promo code `BATH10` = 10% off).
- **Checkout** — `/checkout` delivery-address + customer form (prefilled when signed in),
  И-Баримт toggle, order summary with delivery + eco-bag fees.
- **Payment** — payment-method picker (QR/bank, M банк, card, installment & e-wallet options)
  and a QR/bank-transfer modal (QR is the functional demo path).
- **Orders** — `/orders` list and `/orders/[id]` detail with payment-pending countdown,
  paid / cancelled states, cancel + re-pay.
- **Auth** — `/login` and `/register` with validation, a seeded demo account, sign-out, and
  protected `/profile` & `/orders` (with `?redirect=` return).

### Demo account

```
email:    tuvshin674@gmail.com
password: demo1234
```

The login page also has a **"Туршилтаар нэвтрэх"** one-click demo login.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build (type-checked)
npm run start    # serve the production build
npm run lint     # eslint
```

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # root layout: providers + header/nav/footer chrome
│   ├── page.tsx                # home (hero, category showcase, product sections)
│   ├── product/                # /product grid + /product/[id] detail
│   ├── cart/                   # /cart page
│   ├── checkout/               # /checkout (address → review → payment)
│   ├── orders/                 # /orders list + /orders/[id] detail
│   ├── profile/                # /profile (protected)
│   ├── login/  · register/     # auth pages
│   └── globals.css             # Tailwind v4 + design tokens (brand = ocean blue #0E7FD1)
├── components/
│   ├── header.tsx · top-bar.tsx · category-nav.tsx · footer.tsx
│   ├── account-menu.tsx · cart-drawer.tsx · product-card.tsx · ...
│   ├── auth/                   # auth-card, login-form, register-form, sign-in-prompt
│   ├── checkout/               # checkout-steps, order-summary, payment + QR modals
│   ├── cart-context.tsx        # cart state (localStorage)
│   ├── account-context.tsx     # users + session (localStorage)
│   └── orders-context.tsx      # placed orders (localStorage)
└── lib/
    ├── data.ts                 # categories, products, formatPrice
    ├── types.ts                # Product / Category types
    └── checkout.ts             # fees, promo, Order types, totals helper
```

## Notes & known limitations

- **No backend / persistence** beyond the browser — clearing site data resets everything.
- **Auth is illustrative only** (plaintext passwords in `localStorage`). For real use, replace
  `account-context.tsx` with NextAuth/Auth.js or an API with hashed passwords.
- **Images** are hotlinked from `images.unsplash.com` (allow-listed in `next.config.ts`); they
  may change or rate-limit. Swap for your own CDN/product photography before launch.
- Mongolian (Cyrillic) UI; the Inter font is loaded with the `cyrillic` subset.

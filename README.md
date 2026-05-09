# kdpcover.pro

Precision KDP cover & spine width calculator with a paid template store funnel.

> **Domain:** kdpcover.pro · **Host:** Vercel · **Stack:** Next.js 15 + Tailwind v4 + TypeScript

---

## 1. What this is

A free, anonymous, client-side calculator for Amazon KDP paperback and case-laminate hardcover covers (spine width, full-cover dimensions, safe zones, barcode placement). The calculator funnels into a three-tier digital template store sold via Lemon Squeezy.

**Business model**: free utility → paid templates → passive affiliate stack. Designed for **≤ 4 hours/week** maintenance.

| Surface | Role | Revenue |
|---|---|---|
| `/` calculator | Lead magnet, primary SEO target | Indirect |
| `/calculator/[slug]` (~3,200 pSEO routes) | Long-tail SEO capture | Indirect |
| `/templates` + `/templates/[slug]` | Paid digital products | **Primary** |
| `/recommended` | Curated tools list | Affiliate |
| GEO surfaces (`/llms.txt`, `/llms-full.txt`) | AI-search citation | Indirect |

---

## 2. Quick start

```bash
npm install
cp .env.example .env.local      # then fill in checkout + affiliate vars
npm run dev                     # localhost:3000
```

Other commands:

```bash
npm run typecheck               # tsc --noEmit
npm test                        # vitest unit suite (golden-tested vs KDP)
npm run test:e2e                # playwright smoke
npm run build                   # production build (~2,083 static pages)
npm run build:templates         # generates the deliverable SVG + PDF library
npm run build:ext               # builds the optional Chrome extension
```

---

## 3. Architecture

### 3.1 Calculator engine

Pure formulas, zero React imports, 100% unit-tested against KDP's official template generator:

- [lib/kdp/calc.ts](lib/kdp/calc.ts) — spine + full-cover formulas
- [lib/kdp/limits.ts](lib/kdp/limits.ts) — page-count / trim constraints
- [lib/kdp/share.ts](lib/kdp/share.ts) — base64url state encoding for share links
- [lib/kdp/slug.ts](lib/kdp/slug.ts) — pSEO URL parsing + bucket generation
- [lib/kdp/svg-template.ts](lib/kdp/svg-template.ts) — SVG template renderer (also used by `build:templates`)

Multipliers are sourced from the KDP help docs (see §10) and verified per build by `tests/unit/calc.test.ts` against `tests/fixtures/kdp-truth.json`.

### 3.2 Calculator UI

[components/calculator/Calculator.tsx](components/calculator/Calculator.tsx) is a single client component. State lives in a local `useState` (with optional URL-hash sync) — no Zustand/Redux/db needed because there's no persistence requirement. The hash-based state is the source of truth for sharing.

### 3.3 Template store

The store is a static, programmatic surface. There is no database, no order tracking, no user accounts. Lemon Squeezy hosts the checkout, processes payment, handles tax (incl. EU VAT), and delivers the zip file by email. We never see PII.

| File | Role |
|---|---|
| [lib/templates/catalog.ts](lib/templates/catalog.ts) | Single source of truth for SKUs, prices, copy, FAQ |
| [lib/templates/checkout.ts](lib/templates/checkout.ts) | Resolves Lemon Squeezy URLs from env (graceful fallback) |
| [app/templates/page.tsx](app/templates/page.tsx) | Store landing — three-tier ladder |
| [app/templates/[slug]/page.tsx](app/templates/%5Bslug%5D/page.tsx) | Programmatic product detail pages |
| [components/templates/ProductCard.tsx](components/templates/ProductCard.tsx) | Card for the store landing |
| [components/templates/BuyButton.tsx](components/templates/BuyButton.tsx) | Buy CTA + "Notify me" fallback when env unset |
| [components/calculator/TemplateUpsell.tsx](components/calculator/TemplateUpsell.tsx) | Calculator → store funnel |

### 3.4 Funnel topology

```
/                            ──► TemplateUpsell ──► /templates/[recommended-sku]
/calculator/[slug] (pSEO)    ──► PseoTemplateCta ──► /templates/[recommended-sku]
/templates                   ──► ProductCard      ──► /templates/[slug]
/templates/[slug]            ──► BuyButton        ──► Lemon Squeezy hosted checkout
```

`recommendSkuForCalc()` in `lib/templates/catalog.ts` decides which SKU each surface upsells (paperback users → Universal; hardcover users → Mega).

### 3.5 No backend

| Concern | Where it lives |
|---|---|
| Persistence | None (hash-based state on the client) |
| Sessions | None |
| Payment | Lemon Squeezy (hosted) |
| Email delivery | Lemon Squeezy (auto, attached digital download) |
| Receipts | Lemon Squeezy |
| Refunds | Lemon Squeezy dashboard |

---

## 4. Project structure

```
app/
├── (root) page.tsx                         # / — calculator hero
├── about/                                  # /about
├── api/og/                                  # Edge: dynamic OG image
├── calculator/[slug]/                       # ~3,200 pSEO long-tail pages
├── changelog/                               # auto-generated from git log
├── embed/                                   # iframe-only stripped UI
├── extension/                               # Chrome-extension landing
├── network/                                 # cross-promo to sibling sites
├── privacy/, terms/                         # legal
├── recommended/                             # affiliate-aware tools page
├── share/[code]/                            # SSR share-link aliases
├── templates/                               # paid store
│   ├── page.tsx                             # store hub
│   └── [slug]/page.tsx                      # product detail (single/universal/mega)
├── llms.txt / llms-full.txt                 # GEO assets (AI search citations)
├── sitemap.ts, robots.ts, manifest.ts       # crawler infra
└── layout.tsx                               # global shell + analytics + SW

components/
├── calculator/                              # Calculator + diagram + share/embed/upsell
├── site/                                    # Header, Footer, Analytics, AdSlot, etc.
└── templates/                               # ProductCard, BuyButton

lib/
├── ads/                                     # ad-slot config
├── analytics/track.ts                       # typed Vercel Analytics events
├── content/                                 # site-facts, recommendations, network, changelog
├── kdp/                                     # pure calc engine, limits, slug, svg-template
├── seo/jsonld.ts                            # JSON-LD helpers
└── templates/                               # catalog + checkout

scripts/
├── changelog.ts                             # prebuild: writes content/changelog/*.mdx
└── build-templates.ts                       # generates dist/templates/<tier>/*.svg + *.pdf

tests/
├── unit/                                    # vitest (calc, share, slug)
└── fixtures/kdp-truth.json                  # golden values from KDP's generator

extension/                                   # Chrome extension (Vite-built, separate bundle)

dist/templates/                              # GENERATED — git-ignored deliverable library
```

---

## 5. Adding or editing SKUs

Open [lib/templates/catalog.ts](lib/templates/catalog.ts). Each entry in `CATALOG` is:

```ts
{
  slug: "single" | "universal" | "mega",
  name, hook, priceUsd, compareAtUsd,
  highlight: boolean,            // shows "Most popular" badge
  scope, includes[], faq[],
  format: "paperback" | "both" | "designer",
  checkoutEnv: "NEXT_PUBLIC_LS_VARIANT_*",
}
```

Editing the catalog automatically updates:

- Store hub (`/templates`)
- Product page (`/templates/[slug]`)
- Calculator upsell copy
- pSEO upsell copy
- Sitemap entries
- Product / Breadcrumb / FAQPage JSON-LD

If you add a new SKU, add a matching env var to `.env.example`, register it in `lib/templates/checkout.ts`'s `readEnv()` switch, and re-run `npm run build:templates` if it ships a new bundle.

---

## 6. Adding affiliate IDs

[lib/content/recommendations.ts](lib/content/recommendations.ts) is the catalog. Each entry can opt in:

```ts
{
  affiliateEnv: "NEXT_PUBLIC_AFF_ATTICUS",
  affiliateMode: "query",   // or "path"
  affiliateKey: "ref",
}
```

Set the env var to your affiliate code. `resolveRecommendationUrl()` injects it at render. If the env is unset, the bare URL is rendered (no broken links).

To add a brand-new partner: append to `recommendations` array, register the env in `AFFILIATE_ENV_MAP` at the bottom of the file, and add the var to `.env.example`.

---

## 7. The deliverable pipeline

The paid templates ship as zip files uploaded to Lemon Squeezy. They're regenerated from the same calc engine that powers the live calculator, so they can never drift from the published math.

### 7.1 Generate

```bash
npm run build:templates
```

Emits to `dist/templates/`:

| Tier | Files | Size (zipped) |
|---|---|---|
| `single`    | 12 SVG + 12 PDF                  | ~40 KB |
| `universal` | 1,300 SVG + 1,300 PDF + cheatsheet | ~4 MB  |
| `mega`      | 2,516 SVG + 2,516 PDF + cheatsheet | ~8 MB  |

Plus `cheatsheet.html` — print-to-PDF in any browser to ship a one-page reference card.

### 7.2 Zip (Windows / PowerShell)

```powershell
$base = 'dist/templates'
foreach ($t in 'single','universal','mega') {
  $dst = "$base/$t.zip"
  if (Test-Path $dst) { Remove-Item $dst -Force }
  Compress-Archive -Path "$base/$t","$base/cheatsheet.html" -DestinationPath $dst -CompressionLevel Optimal
}
```

On macOS/Linux: `cd dist/templates && for t in single universal mega; do zip -qr "$t.zip" "$t" cheatsheet.html; done`.

### 7.3 Upload to Lemon Squeezy

1. Create a store (anonymous bank-payout works).
2. Create three "digital download" products: `Single Cover Template`, `Universal Cover Pack`, `Designer Mega Pack`.
3. Attach `single.zip` / `universal.zip` / `mega.zip` to each.
4. From each product's Variant page, copy the hosted checkout URL.
5. Paste the three URLs into Vercel env (`NEXT_PUBLIC_LS_VARIANT_SINGLE`, `_UNIVERSAL`, `_MEGA`).
6. Redeploy. Buy buttons activate automatically — no code change required.

### 7.4 Re-issuing files

When KDP publishes a multiplier change, update `lib/kdp/calc.ts`, run `npm run build:templates`, re-zip, and replace the file in Lemon Squeezy. Existing buyers can re-download from their receipt link.

---

## 8. Environment variables

All of these are **optional** — the site builds and ships fine with none of them, with graceful fallbacks ("Notify me" buttons, bare URLs).

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_LS_VARIANT_SINGLE`    | Lemon Squeezy URL for the $19 SKU |
| `NEXT_PUBLIC_LS_VARIANT_UNIVERSAL` | Lemon Squeezy URL for the $49 SKU |
| `NEXT_PUBLIC_LS_VARIANT_MEGA`      | Lemon Squeezy URL for the $99 SKU |
| `NEXT_PUBLIC_AFF_CANVA`            | Canva affiliate code |
| `NEXT_PUBLIC_AFF_BOOKBRUSH`        | BookBrush affiliate code |
| `NEXT_PUBLIC_AFF_ATTICUS`          | Atticus affiliate code |
| `NEXT_PUBLIC_AFF_BOOKBOLT`         | Book Bolt affiliate code |
| `NEXT_PUBLIC_AFF_ROCKET`           | Publisher Rocket affiliate code |
| `NEXT_PUBLIC_AFF_REEDSY`           | Reedsy affiliate code |

See [.env.example](.env.example).

---

## 9. SEO, GEO, performance

### 9.1 SEO (classic)

- `app/sitemap.ts` shards above 45k URLs (currently ~3,200 calc + 3 store + 16 static).
- JSON-LD per surface: `SoftwareApplication`, `Organization`, `FAQPage`, `Product`, `HowTo`, `BreadcrumbList`.
- Per-route canonical + OG metadata; OG image is rendered by `app/api/og` on Edge.

### 9.2 GEO (AI search)

- `public/llms.txt` (summary) + `public/llms-full.txt` (full spec, ingestable by LLMs).
- Canonical-phrasing leading sentences on every facts page so AI snippets quote cleanly.
- `siteFacts` (in [lib/content/site-facts.ts](lib/content/site-facts.ts)) is the source of truth for the LLM-facing assets, the FAQ schema, and the human pages — edit once, propagates everywhere.

### 9.3 Performance budget

| Metric | Target |
|---|---|
| LCP | < 1.8 s |
| CLS | 0 |
| INP | < 150 ms |
| Initial JS (calc route) | < 100 KB gzipped |

Current build: calc route is **140 KB First Load JS** (well within budget). All ad slots reserve `min-height` to keep CLS at 0.

---

## 10. Testing

```bash
npm test           # vitest — pure-formula coverage; all 33 cases must pass
npm run test:e2e   # playwright smoke — calculator → share → restore
```

The unit suite cross-checks every multiplier × paper × format combo against KDP's published values stored in `tests/fixtures/kdp-truth.json`. **Do not change a multiplier without updating the fixture.**

---

## 11. Deployment

Push to `main` → Vercel auto-deploys. Per-PR preview deploys are enabled. The `prebuild` hook runs `scripts/changelog.ts` to flush new `feat:` / `fix:` / `perf:` commits into `content/changelog/`.

Vercel Analytics, Speed Insights, and the service worker register automatically through `app/layout.tsx`.

---

## 12. Sources (KDP authoritative)

- [KDP Paperback Cover Creation](https://kdp.amazon.com/en_US/help/topic/G201953020)
- [KDP Hardcover Cover Creation](https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6)
- [KDP Trim Size, Bleed & Margins](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6)
- [KDP Barcode Requirements](https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW)
- [KDP Print Options](https://kdp.amazon.com/en_US/help/topic/G201834180)
- [KDP Cover Calculator (template generator)](https://kdp.amazon.com/cover-calculator)

---

## 13. License

Source code: private / unlicensed (operator-owned).
Generated KDP templates sold via the store: commercial-use license, see SKU detail pages for terms.

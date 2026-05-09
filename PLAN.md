# KDP Cover & Spine Width Calculator

> **Domain:** kdpcover.pro · **Repo:** GitHub · **Host:** Vercel
> A precision client-side calculator for Amazon KDP paperback and case-laminate hardcover covers.

---

## 1. Product & Strategy

### 1.1 Problem
Independent authors and cover designers routinely fail KDP's automated cover-upload review because spine width, bleed, and wrap allowances differ across paper types and between paperback and hardcover. KDP's own template generator is slow and clunky; users want an instant answer plus a visual safe-zone diagram.

### 1.2 Audience
- **Self-published authors** (over half of authors under 45 now publish independently) producing recurring projects, each with a unique page count.
- **Freelance cover designers** who need to spot-check client specs before laying out artwork.
- **Tier-1 geographic skew** (US/UK/CA/AU) → strong RPM.

### 1.3 Niche & RPM
B2B publishing / digital design. Mediavine target RPM $6–$20, base case $12–$15.

| Scenario | PVs / mo | RPM | Earnings |
|---|---|---|---|
| Min | 5,000 | $6 | $30 |
| Avg | 20,000 | $12 | $240 |
| Max | 50,000 | $20 | $1,000 |

Path-to-$200/mo break-even: ~13,300 monthly PVs at $15 RPM.

### 1.4 Brand
- **Palette:** Modern Earth Tones — Sage Green (`#9CAF88`), Ivory (`#FFFFF0`), Ink (`#1F2421`), Warm Accent (`#C97B5C`).
- **Type:** Instrument Serif (display/headings) + Inter or Lato (UI/numerals — replaces Roboto for tighter tabular figures).
- **Voice:** "Pass KDP's review on the first try." Confidence + precision, not hand-holding.

### 1.5 Distribution
- **pSEO** for every common combination of `format × paper × page-count × trim` (see §2.4).
- **Embed-virality**: third-party blogs and YouTube creators can iframe the tool (see §2.7).
- **GEO**: structured for citation by Perplexity / ChatGPT / Gemini search (see §2.10).
- **Anonymous, no social.** No Twitter/X, Reddit, or community accounts. SEO + GEO + embed only.

---

## 2. Engineering Spec

### 2.1 Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | RSC where possible, "use client" only for the calculator + diagram |
| Styling | Tailwind CSS v4 | No CSS-in-JS; design tokens in `globals.css` |
| Hosting | Vercel | GitHub-connected; preview deploys per PR |
| Runtime | Static + Edge | Static for pages; Edge for `/api/og` only |
| Persistence | **None** | All state in URL hash → no DB, no PII, no cold starts |
| Icons | lucide-react | Tree-shakeable |
| Analytics | Vercel Analytics + Speed Insights + Microsoft Clarity | Clarity for heatmaps/replay |
| Ads | Mediavine (Journey tier at launch) | Slots reserved at build time to keep CLS = 0 |
| Linting | ESLint + Prettier + TypeScript strict | Husky pre-commit |

### 2.2 Calculator Engine — Authoritative Formulas

All multipliers verified against [KDP cover-creation help](https://kdp.amazon.com/en_US/help/topic/G201953020) and the KDP cover-template generator (kdp.amazon.com/cover-calculator).

#### Spine width per page

| Format | Paper | Multiplier (in/page) |
|---|---|---|
| Paperback | White (B&W interior) | **0.002252** |
| Paperback | Cream (B&W interior) | **0.0025** |
| Paperback | Standard Color | **0.002252** |
| Paperback | Premium Color | **0.002347** |
| Hardcover (Case Laminate) | any (KDP treats as premium-color thickness) | **0.002347** |

```ts
spineWidthIn = pageCount * multiplier
```

#### Full cover dimensions

**Paperback:**
```
fullCoverWidth  = (2 × trimWidth)  + spineWidth + (2 × 0.125)   // 0.125" bleed each side
fullCoverHeight =  trimHeight                  + (2 × 0.125)
```

**Hardcover (Case Laminate):**
```
fullCoverWidth  = (2 × trimWidth)
                + spineWidth
                + (2 × 0.4)        // 0.4" hinge on each side of spine
                + (2 × 0.51)       // 0.51" wrap around outer edges (folds inside the case)
fullCoverHeight =  trimHeight + (2 × 0.51)
```

#### Page-count limits

| Format | Min | Max | Spine-text minimum |
|---|---|---|---|
| Paperback | 24 | 828 | 79 pages |
| Hardcover | 75 | 550 | 79 pages (with 0.0625" extra clearance each side) |

(Trim-size-specific maxima also enforced — see `lib/kdp/limits.ts`.)

#### Safe zones / no-text margins

- **Bleed:** 0.125" (3.2 mm) on every outside edge, both formats.
- **Paperback content safe zone:** 0.125" inside the trim line.
- **Hardcover content safe zone:** 0.635" (16 mm) from the outside edge.
- **Hardcover hinge dead-zone:** 0.4" each side of spine — no text/graphics.
- **Barcode area:** 2" × 1.2" recommended (1.4" × 0.8" minimum), bottom-right of back cover, ≥0.25" from spine and trim edges, ≥0.76" from bottom; light/white background; cannot overlap hinge zone on hardcover.

#### Resolution / file requirements (displayed but not enforced by calculator)

- 300 DPI minimum, CMYK preferred, RGB acceptable.
- Single flattened PDF (back + spine + front), fonts embedded, no crop marks.
- ≤40 MB recommended, ≤650 MB hard limit.

#### Output schema

```ts
type CoverCalcOutput = {
  spineWidthIn: number;
  spineWidthMm: number;
  fullCoverWidthIn: number;
  fullCoverHeightIn: number;
  fullCoverWidthMm: number;
  fullCoverHeightMm: number;
  spineTextEligible: boolean;
  warnings: string[];               // e.g. "Hardcover max is 550 pages"
  barcodeBox: { x: number; y: number; w: number; h: number };  // inches, from top-left of full cover
  safeZones: { top: number; bottom: number; outside: number; spineHinge: number };
};
```

All math lives in `lib/kdp/calc.ts` as pure functions with 100% unit-test coverage. No React imports.

### 2.3 Routes & Pages

```
app/
├── (marketing)/
│   ├── page.tsx                      # / — calculator hero + tool
│   ├── about/page.tsx                # /about — story, accuracy methodology, contact
│   └── embed/page.tsx                # /embed — iframe-only stripped UI (see §2.7)
├── calculator/
│   └── [slug]/page.tsx               # pSEO landing pages (see §2.4)
├── share/
│   └── [code]/page.tsx               # /share/<base64> — shareable computed result
├── api/
│   └── og/route.ts                   # Edge: dynamic OG image (next/og ImageResponse)
├── sitemap.ts                        # generateSitemaps shard function
├── robots.ts
├── manifest.ts                       # PWA manifest
└── layout.tsx                        # global layout, analytics, Mediavine script
public/
├── llms.txt                          # GEO summary (see §2.10)
├── llms-full.txt                     # GEO full content
├── sw.js                             # service worker (PWA)
└── og/                               # static OG fallback assets
```

### 2.4 Programmatic SEO

**URL pattern** (single dynamic segment, parsed both ways):
```
/calculator/{format}-{paper}-{pages}-pages
/calculator/{format}-{paper}-{pages}-pages-{trimW}x{trimH}
```

Examples:
- `/calculator/paperback-white-300-pages`
- `/calculator/hardcover-cream-150-pages-6x9`
- `/calculator/paperback-premium-color-220-pages-8.5x11`

**Generation strategy:**
- `generateStaticParams` returns a **curated** ~3,200-route subset:
  - 5 most-common trims (5"×8", 5.5"×8.5", 6"×9", 7"×10", 8.5"×11")
  - 2 formats × 4 paper types
  - ~80 page-count buckets (24, 32, then steps of 4 up to 100, steps of 10 up to 400, steps of 25 up to max)
- Long-tail combos that aren't prebuilt are computed on-demand by the same `[slug]/page.tsx` (no `notFound()` — slug is parsed and rendered live). This avoids the Vercel 45-min build cap and 50k+ static route blow-up.
- Each page contains: H1 with exact spec, computed dims table, SVG diagram, "Try other sizes" internal links to ±1 / ±10 / ±50 page neighbors, and an `HowTo` JSON-LD schema.

**Internal linking density:** every pSEO page links to ~12 neighbors (page-count and trim-size variants) + canonical home + format hub pages. Drives crawl depth.

### 2.5 Calculator UI

Inputs (all client-side, debounced 100ms):
1. **Format** — segmented control: Paperback / Hardcover
2. **Paper type** — radio cards: White / Cream / Standard Color / Premium Color  *(disabled options auto-shown for invalid format combos)*
3. **Trim size** — combobox; 16 paperback / 8 hardcover presets + "Custom" with width/height inputs
4. **Page count** — number input + slider, 24–828 (paperback) / 75–550 (hardcover); validates against trim-specific max

Output:
- Spine width (in & mm, 4 decimal places)
- Full cover dims
- Spine-text eligibility badge
- Live SVG diagram (front / spine / back, bleed lines, safe zones, barcode box) — rendered inline, scales to container
- Warning chips for any constraint violations
- Action row: **Copy values** · **Copy share link** · **Download SVG template** · **Embed snippet**

State lives in a Zustand store; URL hash is the source of truth (`#s=<base64url(json)>`) so the page is shareable on every keystroke.

### 2.6 Share Link

- State encoded in `location.hash` as `#s=<base64url>` of `{f,p,pg,tw,th}`.
- "Copy share link" button calls `navigator.clipboard.writeText(location.href)`.
- `/share/[code]` route is a friendlier alias: server parses the code, renders a static result page with Open Graph tags + computed dims, and a CTA "Open in calculator".
- Hash-based state never leaves the browser; the `/share/` alias mirrors state into the path for crawlers and OG images.

### 2.7 Iframe Embed

- `/embed` page: minimal chrome, no header/footer, no ads.
- Customizable via query params: `?theme=light|dark&defaultFormat=paperback&compact=1&accent=%239CAF88`.
- Sends `postMessage({type:'kdpcover:height', height})` to the parent on every `ResizeObserver` tick so host pages can auto-fit the iframe.
- Per-route headers in `next.config.ts`:
  - `/embed`: `Content-Security-Policy: frame-ancestors *` (intentional — embed virality)
  - everywhere else: `frame-ancestors 'self'`
- Snippet generator on `/about` and below the calculator outputs:
  ```html
  <iframe src="https://kdpcover.pro/embed?theme=light" width="100%" height="640"
    style="border:0" loading="lazy" title="KDP Cover Calculator"></iframe>
  <script>/* auto-resize listener — copy-pasteable */</script>
  ```

### 2.8 Dynamic Open Graph Images

- `app/api/og/route.ts` runs on Edge using `ImageResponse` from `next/og`.
- Reads query params `?f=&p=&pg=&tw=&th=` (mirrored from share state).
- Renders 1200×630 card: book mockup with computed spine width, headline "Spine: 0.6756 in · 17.16 mm", brand mark.
- Cached at the CDN by URL → effectively free after first hit.

### 2.9 PWA / Chrome Installable

- `app/manifest.ts` exports a typed `MetadataRoute.Manifest` (name, icons 192/512/maskable, theme color, display `standalone`, start_url `/?utm_source=pwa`).
- `public/sw.js`: ~40 lines.
  - `CacheFirst` for `/_next/static/*`, `/icons/*`, fonts.
  - `NetworkFirst` for HTML.
  - Versioned cache key (`kdp-v1`); old caches purged on `activate`.
- Registered from a tiny client component in `app/layout.tsx` behind `if ('serviceWorker' in navigator)`.
- Install prompt deferred — capture `beforeinstallprompt`, show a soft "Install" chip in the header after 2nd visit.
- **Offline behavior:** calculator works fully offline once cached (it's pure compute).

### 2.10 GEO — Generative Engine Optimization

The site is structured for citation by AI search (Perplexity, ChatGPT search, Gemini, Claude search). Tactics:

1. **`/llms.txt`** (per [llmstxt.org](https://llmstxt.org)): markdown summary of the site, key formulas, and links to `/llms-full.txt`. Static file in `/public/`.
2. **`/llms-full.txt`**: the entire spec (multipliers table, formulas, page limits, all FAQ answers) in plain text — single-shot ingestion for LLMs that don't crawl multi-page sites.
3. **FAQPage schema** on `/` with 8–10 verbatim Q/A pairs ("What is the KDP white paper spine multiplier?", "What's the difference between paperback and hardcover bleed?").
4. **HowTo schema** on every pSEO page.
5. **Canonical phrasing**: leading sentence of every section is a complete factual statement that LLMs can quote (e.g., "The KDP white-paper paperback spine width formula is 0.002252 inches per page.").
6. **Citations to KDP help URLs** in `<a rel="cite">` — signals authority to crawlers.

### 2.11 Classic SEO

- **Schemas (JSON-LD):**
  - `SoftwareApplication` on `/`
  - `HowTo` on each pSEO page
  - `FAQPage` on `/` and `/about`
  - `BreadcrumbList` on every pSEO page
  - `Organization` site-wide
- **Sitemap:** `app/sitemap.ts` with `generateSitemaps` shard function returning multiple sitemaps under a sitemap index. Single sitemap for now (~3.5k URLs ≪ 50k limit); shard threshold is 45k.
- **`robots.ts`:** allow all, disallow `/api/og` and `/share/*` (low-value duplicate content), reference sitemap.
- **Meta:** unique `<title>` and `<meta description>` per pSEO page templated from `{format} {paper} {pages} pages` data.
- **Core Web Vitals targets:** LCP < 2.0s, CLS < 0.1, INP < 200ms (Mediavine Journey re-audits these quarterly).
- **Bundle budget:** initial JS < 100 KB gzipped on the calculator route.

### 2.12 Analytics

- **Vercel Analytics** + **Vercel Speed Insights** — first-party, privacy-friendly, no consent banner needed in most jurisdictions.
- **Microsoft Clarity** — heatmaps + session replay, free unlimited. Loaded via `next/script` with `strategy="afterInteractive"`.
- **Custom events** (Vercel Analytics `track()`):
  - `calculate` (with format, paper, page-bucket — never raw counts that could fingerprint)
  - `share_link_copied`
  - `embed_snippet_copied`
  - `template_downloaded`
  - `pwa_installed`
- **No GA4** — duplicates Vercel/Clarity coverage and adds bundle weight.

### 2.13 Monetization (Mediavine)

- **Tier:** Mediavine Journey at launch (entry-level; replaces older 50k-session threshold). Targets 10k+ monthly sessions.
- **Slots** (all with reserved `min-height` containers — CLS = 0):
  1. **In-content / below-results** (`min-h-[280px]`) — primary slot, fires only after a calculation
  2. **Mid-content** between SVG diagram and explainer text (`min-h-[250px]`)
  3. **Sidebar** on `lg:` and up (`min-h-[600px] sticky top-24`)
- **No above-fold ads** on `/` — calculator is the LCP element and we protect it.
- **No ads on `/embed`** — embed is an acquisition surface; ads run on the host.
- **Pre-Mediavine fallback:** Ezoic or AdSense from day 1 to monetize the ramp; swap to Mediavine on approval.

### 2.14 Privacy & Compliance

- No PII collected. All state client-side.
- Cookie banner only when Mediavine/AdSense load (their consent management platform handles GDPR/CCPA).
- Privacy policy linked in footer; auto-generated from a template, lists Vercel, Clarity, Mediavine as data processors.

### 2.15 Performance Budget

| Metric | Target | Hard fail |
|---|---|---|
| LCP | < 1.8s | > 2.5s |
| CLS | 0 | > 0.1 |
| INP | < 150ms | > 200ms |
| Initial JS (calc route) | < 100 KB gz | > 150 KB |
| Time-to-interactive | < 1.0s | > 2.0s |

Enforced via Lighthouse CI in GitHub Actions on every PR.

### 2.16 Testing

- **Unit:** Vitest on `lib/kdp/calc.ts`. Test matrix: every paper × format combo at min/max/typical pages, vs values copied directly from KDP's official template generator (golden file `tests/fixtures/kdp-truth.json`).
- **Integration:** Playwright. Smoke flow: pick format → paper → pages → see correct dims → copy share link → reopen link → state restored.
- **Visual regression:** Playwright snapshot on the SVG diagram for 8 representative configs.
- **Lighthouse CI:** budget assertions in PR.

---

## 3. Roadmap & Verification

### 3.1 Phased Roadmap

**Phase 0 — Scaffold (day 1)**
Next.js 15 init, Tailwind v4, Vercel link, GitHub repo, Husky, ESLint/Prettier, base layout + brand tokens.

**Phase 1 — Calculator MVP (days 2–4)**
`lib/kdp/calc.ts` + unit tests against KDP truth fixture · main `/` page with form + SVG diagram · URL-hash state · copy-values action.

**Phase 2 — Share + OG + Embed (days 5–7)**
`/share/[code]` route · `/api/og` Edge endpoint · `/embed` route + per-route CSP · postMessage height resize · embed snippet generator.

**Phase 3 — pSEO + SEO infra (days 8–11)**
`/calculator/[slug]` with `generateStaticParams` for curated 3.2k routes + on-demand fallback · `sitemap.ts` with `generateSitemaps` · all JSON-LD schemas · `/about` · `robots.ts`.

**Phase 4 — GEO + PWA (days 12–13)**
`/llms.txt` + `/llms-full.txt` · `manifest.ts` · `sw.js` · install-prompt UX.

**Phase 5 — Analytics + Ads (days 14–15)**
Vercel Analytics + Speed Insights · Clarity script · AdSense/Ezoic placeholders with reserved containers · privacy policy.

**Phase 6 — Launch hardening (days 16–17)**
Lighthouse CI · Playwright smoke + visual regression · embed-snippet kit for 5 design blogs.

**Post-launch:** apply to Mediavine Journey at first 10k-session month; swap ad provider.

### 3.2 Verification

End-to-end manual verification before each phase merges:

1. **Calc accuracy:** for 12 spot-check configs, computed `spineWidthIn` matches KDP's official template generator output to 4 decimal places. Run `pnpm test` — unit suite must be green.
2. **pSEO:** `curl https://<preview>.vercel.app/calculator/paperback-white-300-pages` returns HTML with the correct spine width in the H1 and a JSON-LD `HowTo` block. Spot-check 5 long-tail slugs that aren't in `generateStaticParams` — they must still render correctly.
3. **Share link:** compute a result, copy share link, paste into incognito → state restored, OG image renders correctly when URL is pasted into a Slack/Discord preview.
4. **Embed:** open `https://<preview>/embed` inside an iframe on a scratch HTML page → auto-resizes via postMessage, no CSP violation in console.
5. **PWA:** Chrome devtools "Application" tab shows manifest valid, SW registered, "Install" available. Toggle offline → calculator still functional.
6. **Analytics:** Vercel Analytics dashboard shows pageviews; Clarity dashboard shows session replays; custom events fire for `calculate` and `share_link_copied`.
7. **Performance:** Lighthouse run on `/` and a pSEO page → all CWV green, performance ≥ 95.
8. **GEO:** `curl https://<preview>/llms.txt` and `/llms-full.txt` return correct `Content-Type: text/plain`. Open Perplexity, search "KDP white paper spine multiplier" — site should appear as a citation within 2 weeks of launch.

### 3.3 Critical Files

- [lib/kdp/calc.ts](lib/kdp/calc.ts) — pure formula engine
- [lib/kdp/limits.ts](lib/kdp/limits.ts) — page/trim constraints
- [app/page.tsx](app/page.tsx) — calculator home
- [app/calculator/[slug]/page.tsx](app/calculator/[slug]/page.tsx) — pSEO routes
- [app/embed/page.tsx](app/embed/page.tsx) — iframe surface
- [app/api/og/route.ts](app/api/og/route.ts) — Edge OG image
- [app/sitemap.ts](app/sitemap.ts) — shardable sitemap
- [app/manifest.ts](app/manifest.ts) — PWA manifest
- [public/sw.js](public/sw.js) — service worker
- [public/llms.txt](public/llms.txt) + [public/llms-full.txt](public/llms-full.txt)
- [next.config.ts](next.config.ts) — per-route CSP for `/embed`
- [tests/fixtures/kdp-truth.json](tests/fixtures/kdp-truth.json) — golden values from KDP's generator

### 3.4 Sources (KDP authoritative)

- KDP Paperback Cover Creation — https://kdp.amazon.com/en_US/help/topic/G201953020
- KDP Hardcover Cover Creation — https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6
- KDP Trim Size, Bleed & Margins — https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6
- KDP Barcode Requirements — https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW
- KDP Print Options — https://kdp.amazon.com/en_US/help/topic/G201834180
- KDP Cover Calculator (template generator) — https://kdp.amazon.com/cover-calculator

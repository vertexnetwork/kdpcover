# Visibility Audit Report: kdpcover.pro

> **Target:** kdpcover.pro — "Pass KDP's review on the first try." (KDP cover & spine-width calculator)
> **Stack:** Next.js 15 (App Router) · React 19 · Tailwind v4 · Vercel · part of the Vertex Network spoke fleet
> **Audit date:** 2026-06-06 · **Auditor:** Search & AI Visibility Architect
> **Method:** Static analysis of the repository (routes, metadata, JSON-LD, discovery files, headers). DNS-only signals (email auth, host redirects) are flagged **VERIFY-IN-DNS** because they cannot be confirmed from source.

**Overall grade: A− (strong).** This is a structurally mature, AI-native site. The keystone `siteConfig` pattern fans brand/SEO data out cleanly; JSON-LD coverage is broad and route-appropriate; `llms.txt` / `llms-full.txt` are first-class generated routes; AI crawlers are explicitly allow-listed. The gaps are at the edges: Knowledge-Graph identity (`Organization.sameAs`), off-domain discovery, a missing `favicon.ico`, and a handful of cheap-but-absent trust/discovery files.

---

## 1. SEO (Search Engine Optimization)

### Ranking signals & semantics (BERT/PageRank)
- **Strong.** Title/description are intent-matched and front-loaded — homepage `<title>` is `Free KDP Cover Calculator — Spine Width & Cover Size` ([app/(site)/page.tsx:23](<../app/(site)/page.tsx#L23>)). Body copy is dense with the natural-language entities the model needs ("spine width", "full-cover dimensions", "case-laminate hardcover", trim sizes, paper multipliers).
- Internal linking is deliberate: the homepage seeds the pSEO cluster via `POPULAR` spoke links and per-book-type CTAs into `/calculator/[slug]`, wiring the hub into ~3.2k programmatic pages for crawl flow.
- Per-page canonicals are correct everywhere checked — homepage, `/calculator/[slug]` ([app/(site)/calculator/[slug]/page.tsx:31](<../app/(site)/calculator/[slug]/page.tsx#L31>)), and `/templates/[slug]` each set `alternates.canonical`.

### Core Web Vitals (INP-first)
- **Fonts are not render-blocking.** `next/font` (`Inter`, `Instrument_Serif`) self-hosts at build with `display: "swap"` ([app/layout.tsx:11-24](../app/layout.tsx#L11)). `/fonts/*` carries `immutable` 1-year cache in [vercel.json](../vercel.json). Good.
- **INP risk is concentrated in the calculator.** It's a Zustand-backed client component that re-renders an SVG diagram on every input change. This is the single most interactive surface and the most likely INP offender on mid-tier mobile. No evidence of input debouncing or `useDeferredValue` around the recompute.
- **Layout stability (CLS):** the hero is text-first with no above-the-fold raster images (the site uses zero `<img>`/`next/image` — all visuals are inline SVG/CSS), so image-driven CLS is effectively nil. The cookie-consent banner and any future ad slot are the realistic CLS sources — reserve their space.

### Technical foundation
- **Crawlability:** `robots.ts` allows `/` and disallows only `/api/` and `/share/` ([app/robots.ts](../app/robots.ts)) — correct (share codes are throwaway, API is non-indexable). Sitemap is advertised and `host` is set.
- **AI crawler blocking — PASS (notable).** The most common self-inflicted GEO wound is absent here: GPTBot, ClaudeBot, Google-Extended, PerplexityBot, CCBot, Applebot-Extended are explicitly **allowed** via [public/ai-bots.json](../public/ai-bots.json) → `robots.ts`. Nothing is unintentionally blocked.
- **JS rendering:** pages are Server Components emitting real HTML + JSON-LD; the interactive calculator hydrates on top. Crawlers get fully-rendered content without executing the widget. Good.
- **Host/canonical redirects:** `www.kdpcover.pro → kdpcover.pro` 308 is in [vercel.json](../vercel.json) and uses a valid path-to-regexp `source` (`/(.*)`), not a regex construct. HSTS is set with `preload`. **VERIFY-IN-DNS:** confirm the apex is actually submitted to the HSTS preload list and that `http→https` is enforced at the Vercel domain level (it is by default, but confirm no stray `www` A/CNAME serves a 200).

> **Critical Action Item (Dev):** Profile real-device **INP** on the calculator. Wrap the recompute/diagram render in `useDeferredValue` (or debounce numeric inputs ~120ms) so keystrokes don't block paint. This is the only CWV metric with a plausible "needs improvement" rating on the site.

---

## 2. AEO (Answer Engine Optimization)

### Schema.org coverage — excellent
Centralized in [lib/seo/jsonld.ts](../lib/seo/jsonld.ts) and injected per route:

| Type | Where | Status |
|---|---|---|
| `WebSite` (+ `SearchAction`) | homepage | ✅ |
| `Organization` | homepage | ⚠️ thin (see below) |
| `SoftwareApplication` (+ `Offer` price 0) | homepage | ✅ |
| `FAQPage` | homepage, `/guide` | ✅ |
| `HowTo` | homepage, `/calculator/[slug]` | ✅ |
| `BreadcrumbList` | `/calculator/[slug]`, `/templates/[slug]` | ✅ |
| `Product` (+ `Offer`/availability) | `/templates/[slug]` | ✅ |
| `CollectionPage` | `/network` | ✅ |

### Gaps
- **`Organization.sameAs` only points at sister Vertex sites** ([lib/seo/jsonld.ts](../lib/seo/jsonld.ts) `organizationJsonLd`). For Knowledge-Graph reconciliation, `sameAs` should include real external identity (GitHub org, X/LinkedIn, Crunchbase, or a Wikidata/Wikipedia entry once it exists). Cross-linking five tools you also own is a weak entity-resolution signal on its own.
- **No `aggregateRating`/`review`** on `SoftwareApplication` or `Product`. Until you have genuine reviews, leave it out (fabricating it risks a manual action) — but this is the gating gap for review-rich-result eligibility.
- **Featured-snippet formatting is strong.** The FAQ entries in [lib/content/site-facts.ts](../lib/content/site-facts.ts) are model-perfect "nuggets": each answer leads with the literal value ("0.002252 inches per page", "79 pages", "0.4504 in spine (200 × 0.002252)"). This is exactly what Position Zero and direct-answer extraction reward.

> **Critical Action Item (Marketing):** Populate `Organization.sameAs` with at least two **external, authoritative** profiles (GitHub org + one social/biz directory). Add a lightweight `logo` `ImageObject` and `foundingDate`/`founder` if attributable. This is the cheapest Knowledge-Graph win available.

---

## 3. GEO (Generative Engine Optimization)

### Citation potential — best-in-class for a tool site
- **`/llms.txt` and `/llms-full.txt` are real generated routes**, not static stubs ([app/llms.txt/route.ts](../app/llms.txt/route.ts), [app/llms-full.txt/route.ts](../app/llms-full.txt/route.ts)), cached 24h via [vercel.json](../vercel.json). `llms-full.txt` is exceptional: it ships **24 worked examples computed by the same `calcCover` engine the UI uses**, plus formulas, multipliers, safe-zones, file specs, and an authoritative-sources list. This is precisely the structured, verifiable, front-loaded content Perplexity/Gemini/SGE prefer to cite.
- Statistics are concrete and quotable (multipliers to 6 decimals, page limits, barcode dimensions). Listicle/table structures (`## Spine multipliers`, `## Formulas`) parse cleanly into LLM context.

### Gaps
- **No expert attribution / named author.** GEO engines increasingly weight a cited human/organizational authority. `humans.txt` lists `Maintainer: ThatMovieGuy` — a pseudonym with no credential. There's no `/about` author entity tying the math to a verifiable source-of-authority.
- **`llms.txt` "Citations" depend on `siteFacts.citations`** — confirm those point at *Amazon KDP's own help docs* (primary source), not third-party blogs. Primary-source citations materially raise the odds an LLM treats your page as the canonical secondary source.
- The homepage and `llms-full.txt` lean on Amazon KDP's published formulas — good — but there is no dated "last verified against KDP template generator on YYYY-MM-DD" stamp in the LLM files. Generative engines reward freshness signals.

> **Critical Action Item (Content):** Add a single line to `llms.txt`/`llms-full.txt` and `/about`: *"Verified against Amazon KDP's official cover-template generator on 2026-05-15; multipliers sourced from KDP Help."* A dated, primary-source provenance line is the highest-leverage GEO trust signal you can add in one commit.

---

## 4. LEO (LLM Engine Optimization)

### Entity & semantic clarity
- **Single source of truth for facts** ([lib/content/site-facts.ts](../lib/content/site-facts.ts)) feeds llms.txt, FAQ JSON-LD, and human copy simultaneously — so the entity model the LLM ingests is internally consistent across HTML, schema, and the plain-text feeds. This consistency is itself a quality signal.
- Entity relationships are clean: `SoftwareApplication` → `publisher` Organization; `CollectionPage` (`/network`) → `hasPart` sister WebSites. The KDP domain entities (trim, paper, spine, hinge, wrap, bleed, barcode) are all defined with units.

### E-E-A-T independent of backlinks
- **Trust scaffolding present:** trademark disclaimer ("Independent tool, not affiliated with Amazon/KDP") repeated in config and footer; `security.txt`, privacy/terms pages, zero-data architecture claim. These are real E-E-A-T signals.
- **Experience/Expertise is the weak axis.** No author bio, no methodology page with a named expert, no changelog framed as "we track KDP spec changes" authority (the changelog exists but isn't positioned as evidence of ongoing domain stewardship).

### Conversational fan-out coverage
- **Very good.** The FAQ set already answers the sub-queries an LLM decomposes for "how big should my KDP cover be": per-paper multipliers, hardcover-vs-paperback bleed, spine-text minimum, barcode placement, file format, page-count range, rejection reasons. That is the fan-out tree for this topic, largely covered.
- **Missing fan-out branches:** Kindle/eBook vs print (partially covered), IngramSpark/other-platform comparison, "convert mm↔in", and CMYK/color-profile gotchas at depth. Each is a sub-query LLMs run that you could own.

> **Critical Action Item (Content):** Publish a named-author methodology section on `/about` (real person or "the Vertex Network publishing-tools team") and frame `/changelog` as "KDP spec-change tracking." Experience/Expertise is the only E-E-A-T axis currently under-evidenced.

---

## 5. VEO (Voice Engine Optimization)

- **Readability/chunking is good.** FAQ answers are 1–3 sentences, declarative, and lead with the answer — readable aloud without restructuring. Most fall in the 20–45-word range a voice assistant can speak as a single response.
- **Long-tail conversational triggers** are well-matched by question-form FAQ keys ("How do I calculate my KDP book cover size?", "Why did KDP reject my cover?").
- **Gap:** a few answers exceed ~50 words and pack multiple numbers (the rejection-reasons and barcode answers), which a voice surface will truncate. Consider a leading one-sentence summary before the detail for the longest three.
- **Gap:** `speakable` schema (`SpeakableSpecification`) is not used. It's niche and Google-experimental, but for an FAQ-heavy tool it's a low-cost addition on the homepage FAQ block.

> **Critical Action Item (Content):** For the three longest FAQ answers, front-load a ≤25-word spoken-answer sentence, then keep the detail. Optionally add `speakable` CSS-selector schema to the FAQ region.

---

## 6. SXO (Search Experience Optimization)

- **BLUF is well-executed.** The homepage opens with `<h1>Free KDP Cover Calculator` immediately followed by a `<strong>`-anchored one-paragraph answer, then the live tool — minimal scroll-to-value, low pogo-stick risk ([app/(site)/page.tsx](<../app/(site)/page.tsx>)).
- **Post-click journey:** clear H2 ladder (Worked examples → By book type → Popular calculations → FAQ), each with internal links deeper into the cluster. Strong dwell-time structure.
- **Accessibility fundamentals:** skip-link + focusable `<main id="main" tabIndex={-1}>` present in [app/(site)/layout.tsx](<../app/(site)/layout.tsx>). `lang="en"` set. Good baseline for EAA.
- **Alt-text:** N/A for raster (the site uses **zero** `<img>`/`next/image`). **But** the calculator's safe-zone **SVG diagram** is the core content image — confirm it carries `role="img"` + `aria-label`/`<title>` so screen readers and crawlers get a text equivalent. This is the one accessibility/AEO hole the "0 alt attributes" result actually points at.

> **Critical Action Item (Dev):** Give the calculator's safe-zone SVG an accessible name (`<title>`/`aria-label` describing the computed dimensions). It's both an EAA gap and a missed extractable-content signal.

---

## 7. PEO (Personalization Engine Optimization)

- **Largely N/A by design — and that's defensible.** This is a privacy-first, zero-data, statically-rendered tool (`interest-cohort=()` in Permissions-Policy, consent-gated analytics, no calculator-set cookies). 1-to-1 algorithmic personalization is intentionally absent and shouldn't be forced.
- **Realistic personalization lever = input-derived, not identity-derived.** The calculator already knows format/trim/paper/page-count. The Next-Best-Action is contextual, not cohort-based: after a hardcover computation, surface the hardcover template SKU; after a high-page-count paperback, surface the spine-text guidance. This is "personalization" without tracking.
- **Cohort segmentation:** the only first-party cohort is the email lead-magnet audience ("KDP spec change alerts"). That's the right, consent-based segment — no expansion needed.

> **Critical Action Item (Marketing/Dev):** Map a result-state → Next-Best-Action table (computed format/page-count → most-relevant template SKU or guide section) and render a dynamic CTA below the result. Contextual, cookieless, and on-brand for a zero-data tool.

---

## 8. SEO Everywhere (Cross-Platform Discovery)

- **This is the biggest strategic gap.** Discovery is currently web-only. There is no evidence of presence or structured signals on YouTube, TikTok, Reddit, or marketplace surfaces where self-publishers actually congregate.
- **No `VideoObject` schema / no video assets.** A 60-second "calculate your KDP spine in 10 seconds" clip with chapters + closed captions would be embeddable (you already have an `/embed/widget`) and rank in video surfaces. None exists.
- **Reddit/community intent** (r/selfpublish, r/KDP) is where the long-tail "why did KDP reject my cover" queries are answered socially — the FAQ content is tailor-made to be repurposed there, with attribution back to the dated, verified source.
- **The `/embed/widget` is an underused distribution channel.** It's correctly iframe-able (frame-ancestors CSP carved out in both [vercel.json](../vercel.json) and [next.config.ts](../next.config.ts)). Embeds on author blogs/forums are off-domain discovery + backlink surface; there's no "add this calculator to your site" outreach motion evident.

> **Critical Action Item (Marketing):** Stand up one off-domain surface this quarter — a captioned YouTube short of the calculator with `VideoObject`+chapters, embedded on the homepage — and run an embed-distribution push to KDP author blogs. The product is web-complete; distribution is the unfilled half.

---

## Discovery-file & infrastructure inventory

### Present & correct ✅
`robots.ts` (AI bots allow-listed) · `sitemap.ts` (single file, ~3.2k URLs, well under 50k, documented sharding plan) · `/llms.txt` + `/llms-full.txt` (generated, cached) · `manifest.ts` (full icon set incl. maskable 192/512) · `app/icon.svg` (served at `/icon.svg`) · `app/apple-icon.tsx` + `apple-touch-icon-180.png` · `/.well-known/security.txt` (Canonical + Expires set) · `humans.txt` · `ads.txt` + `app-ads.txt` (intentional "no sellers") · `public/network.json` (Vertex fleet) · `sw.js` (offline calc) · OG/Twitter dynamic images · CSP/HSTS/XFO/Referrer/Permissions headers.

### Absent — prioritized
| File | Priority | Note |
|---|---|---|
| `favicon.ico` | **High** | `scripts/generate-favicon.ts` explicitly says it should be checked in (sharp can't emit `.ico` cleanly) but it's **missing**. Legacy crawlers/browsers probe `/favicon.ico` → 404. Add a static `public/favicon.ico`. |
| `Organization.sameAs` externals | **High** | (See AEO/LEO) — not a file but the top identity gap. |
| RSS/Atom or `feed.json` for `/changelog` | Medium | You have a changelog but no machine-readable feed — a missed freshness/syndication signal. |
| `/.well-known/ai-plugin.json` + `/.well-known/openapi.json` | Medium | You already expose a read engine (`/api/og`, calc). A minimal OpenAPI + agent manifest would make the calculator agent-callable — strong 2026 GEO/agentic play given the brand is a *calculator*. |
| `IndexNow` key file (`/{key}.txt`) | Medium | Instant Bing/Yandex indexing on deploy; cheap on Vercel. |
| `trust.txt` / `ai.txt` | Low | Cheap trust + AI-usage-policy signals; complements existing `security.txt`/`ads.txt`. |
| `/.well-known/gpc.json` | Low | You already honor privacy (`interest-cohort=()`); GPC is a consistent, low-cost addition. |
| `/.well-known/tdmrep.json` | Low | TDM reservation — declare your AI/TDM stance explicitly (you currently *allow*, so this would formalize it). |
| `opensearch.xml` | Low | Adds browser address-bar search for the calculator. |
| `browserconfig.xml`, `crossdomain.xml`, `clientaccesspolicy.xml`, `p3p.xml`, `dnt-policy.txt` | **Confirm-absent (correct)** | Obsolete — do **not** add. |
| `assetlinks.json` / `apple-app-site-association` | N/A | No native app; correctly absent (Chrome extension ≠ deep-linked app). |

### VERIFY-IN-DNS (not visible in repo)
- **Email auth:** SPF (apex + any sender subdomain), DKIM selector(s), `_dmarc` (policy + `rua`), MTA-STS (`mta-sts.` subdomain + `_mta-sts` TXT), TLS-RPT (`_smtp._tls`), MX. You send via Resend (lead magnet) → DKIM/SPF/DMARC alignment matters for deliverability and brand-trust signals. **Confirm DMARC is at least `p=quarantine` with reporting.**
- **HSTS preload** list submission for the apex.
- **Search Console / Bing verification** are wired via env (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION` in [lib/site-config.ts](../lib/site-config.ts)) — confirm both are populated in Vercel env and the properties are verified.

---

## Top 5 actions, ranked by leverage

1. **Add `public/favicon.ico`** — fixes a live 404 the build script already expects you to fix. *(1 commit)*
2. **Populate `Organization.sameAs` with 2+ external authoritative profiles** + add a dated "verified against KDP on 2026-05-15" provenance line to `llms.txt`/`/about`. *(Knowledge-Graph + GEO trust, 1 commit)*
3. **Profile & fix calculator INP** (`useDeferredValue`/debounce) and give the safe-zone SVG an accessible name. *(only real CWV + EAA hole)*
4. **Ship one off-domain surface** — captioned YouTube short with `VideoObject`+chapters, embedded on homepage; begin embed-widget distribution. *(closes the SEO-Everywhere gap)*
5. **Expose an agent/read API** (`ai-plugin.json` + minimal `openapi.json`) so the calculator is callable by agents — high-upside 2026 bet for a tool whose entire value is a computation. *(plus IndexNow + changelog feed as fast-follows)*

---

*Generated from static repository analysis. DNS, live-CWV field data, and third-party sentiment require runtime/external verification before these grades are treated as final.*

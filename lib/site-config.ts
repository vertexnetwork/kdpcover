/**
 * The keystone. Every brand string, theme color, nav link, feature flag, and
 * monetization handle in the codebase reads from this object.
 *
 * Spec: vertexnetwork/hub/docs/_scaffold-spec.md §4
 *
 * Edit here and the change fans out to: <html metadata>, OG image, manifest,
 * favicon, robots, sitemap, JSON-LD, the footer's Vertex Network attribution,
 * the legal pages' provider list, and every CTA on the site.
 */

export const siteConfig = {
  // identity
  name: "kdpcover.pro",
  shortName: "kdpcover",
  domain: "kdpcover.pro",
  url: "https://kdpcover.pro",
  tagline: "Pass KDP's review on the first try.",
  description:
    "Precision spine width, full-cover dimensions, and safe-zone diagrams for Amazon KDP paperback and case-laminate hardcover books — instant, in-browser, verified against KDP's official template.",
  keywords: [
    "KDP cover calculator",
    "Amazon KDP spine width",
    "paperback cover dimensions",
    "case laminate hardcover",
    "kdp template generator alternative",
  ],

  // contact / legal
  supportEmail: "hello@kdpcover.pro",
  trademarkDisclaimer:
    "Independent tool, not affiliated with Amazon, Kindle Direct Publishing, or any KDP-related trademark.",

  // theme — JS-side source of truth for tokens. CSS-side mirror lives in
  // app/globals.css under @theme. Keep them in sync.
  theme: {
    colors: {
      bg: "#FBF7EB", // ivory
      surface: "#FFFFFF",
      accent: "#C97B5C", // warm
      onBg: "#1F2421", // ink
      onAccent: "#FFFFFF",
      muted: "#82986D", // sage-500
      border: "#CDD9B8", // sage-200
      success: "#4F5D40", // sage-700
      danger: "#B15D3D", // warm-500
    },
    fontDisplay: "Instrument Serif",
    fontBody: "Inter",
    radiusCard: "0.75rem",
  },

  brand: {
    markColor: "#9CAF88", // sage-400 — book covers
    markBgColor: "#1F2421", // ink — backplate
    markAccentColor: "#C97B5C", // warm — spine
  },

  nav: {
    primary: [
      { href: "/", label: "Calculator" },
      { href: "/cover-pass-check", label: "Pass-Check" },
      { href: "/guide", label: "Guide" },
      { href: "/embed", label: "Embed" },
      { href: "/about", label: "About" },
    ],
    footer: {
      product: [
        { href: "/", label: "Calculator" },
        { href: "/cover-pass-check", label: "Cover Pass-Check" },
        { href: "/templates", label: "Bonus templates" },
        { href: "/embed", label: "Embed widget" },
        { href: "/extension", label: "Chrome extension" },
      ],
      company: [
        { href: "/about", label: "About" },
        { href: "/changelog", label: "Changelog" },
        { href: "/contact", label: "Contact" },
      ],
      legal: [
        { href: "/terms", label: "Terms" },
        { href: "/privacy", label: "Privacy" },
      ],
    },
    disclaimer:
      "Independent tool, not affiliated with Amazon or KDP.",
  },

  jsonLd: {
    type: "SoftwareApplication" as const,
    operatingSystem: "Any (web)",
    applicationCategory: "DesignApplication",
    price: 0,
  },

  repoUrl: "https://github.com/vertexnetwork/kdpcover",

  features: {
    embed: { enabled: true, route: "/embed/widget", landing: "/embed", params: ["theme", "compact", "accent", "defaultFormat"] },
    extension: {
      enabled: true,
      chromeWebStoreUrl: process.env.NEXT_PUBLIC_CHROME_WEB_STORE_URL ?? "",
    },
    proEnabled: false,
    // Cover Pass-Check — the paid, license-gated preflight tool. The public
    // landing (/cover-pass-check) always renders so SEO compounds; the gated
    // tool routes (/pass-check, /pass-check/unlock) 404 until this flag is on.
    preflight: {
      enabled: (process.env.NEXT_PUBLIC_PREFLIGHT_ENABLED ?? "0") === "1",
      route: "/pass-check",
      landing: "/cover-pass-check",
    },
    email: {
      // Lead-magnet: KDP-spec-change alerts. No transactional email is sent on
      // submission; subscribers are added to a Resend audience for bulk
      // "KDP changed X" notices only.
      enabled: true,
      leadMagnetName: "KDP spec change alerts",
      audienceId: process.env.RESEND_AUDIENCE_ID ?? "",
    },
    ads: {
      provider: (process.env.NEXT_PUBLIC_AD_PROVIDER ?? "none") as
        | "none"
        | "adsense"
        | "mediavine"
        | "carbon",
    },
    affiliate: {
      enabled: (process.env.NEXT_PUBLIC_AFFILIATE_ENABLED ?? "0") === "1",
      url: process.env.NEXT_PUBLIC_AFFILIATE_URL ?? "",
      label: process.env.NEXT_PUBLIC_AFFILIATE_LABEL ?? "",
      provider: process.env.NEXT_PUBLIC_AFFILIATE_PROVIDER ?? "",
    },
    consent: { required: true },
    themeToggle: false,
  },

  monetization: {
    // Cover Pass-Check, sold through Gumroad (Merchant of Record — handles
    // global sales tax / EU VAT) as one product with two versions: Author and
    // Studio. The live product permalink is baked in as the default so CTAs
    // never link to a dead/blank URL; NEXT_PUBLIC_GUMROAD_PRODUCT_URL overrides
    // it (e.g. once the get.kdpcover.pro custom domain is live). Going live is
    // gated solely on NEXT_PUBLIC_GUMROAD_ENABLED=1 — 0 keeps every CTA in
    // "notify me" state so SEO can compound before launch.
    gumroad: {
      productUrl:
        process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL ??
        "https://thevertexnetwork.gumroad.com/l/cover-pass-check",
      // Direct link to the Studio version, for the "Upgrade to Studio" card.
      // Empty falls back to productUrl (lands on Author); set the ?option=<id>
      // deep link once known to pre-select Studio at checkout.
      studioUrl: process.env.NEXT_PUBLIC_GUMROAD_STUDIO_URL ?? "",
      enabled: (process.env.NEXT_PUBLIC_GUMROAD_ENABLED ?? "0") === "1",
      price: Number(process.env.NEXT_PUBLIC_GUMROAD_PRICE ?? "19"),
      studioPrice: Number(process.env.NEXT_PUBLIC_GUMROAD_STUDIO_PRICE ?? "49"),
      // Cold-start "founder" discount: a capped Gumroad coupon (Author tier only)
      // shown with the live remaining count pulled from the Gumroad API. Honest
      // scarcity — a real cap, the true number left. Auto-hides at 0 since the UI
      // is driven by the live count. percentOff is the marketing display (rule of
      // 100: 37% reads bigger than $7 on a $19 product); price is the net.
      founder: {
        enabled: (process.env.NEXT_PUBLIC_FOUNDER_ENABLED ?? "0") === "1",
        code: process.env.NEXT_PUBLIC_FOUNDER_CODE ?? "FOUNDER",
        price: Number(process.env.NEXT_PUBLIC_FOUNDER_PRICE ?? "12"),
        percentOff: Number(process.env.NEXT_PUBLIC_FOUNDER_PERCENT ?? "37"),
      },
    },
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  },

  security: {
    contact: "mailto:security@kdpcover.pro",
    expires: "2027-05-12T00:00:00Z",
  },
} as const;

export type SiteConfig = typeof siteConfig;

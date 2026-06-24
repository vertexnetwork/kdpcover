/**
 * Provider-aware CSP builder. Compose only the directives we need based on
 * which third-party scripts are actually enabled. Avoids shipping the union
 * allowlist when only one provider is in use.
 *
 * Spec: vertexnetwork/hub/docs/_scaffold-spec.md §11
 */

export type CspProviders = {
  vercelAnalytics?: boolean;
  clarity?: boolean;
  adsense?: boolean;
  mediavine?: boolean;
  carbon?: boolean;
  plausible?: boolean;
  ga?: boolean;
  gumroad?: boolean;
  /**
   * Origin of NEXT_PUBLIC_GUMROAD_PRODUCT_URL. The overlay checkout opens the
   * product URL in an iframe at its own origin (e.g. thevertexnetwork.gumroad
   * .com, or a custom domain later), which needs its own frame-src entry.
   */
  gumroadOrigin?: string;
};

export function buildCSP(providers: CspProviders = {}): string {
  // 'wasm-unsafe-eval' lets the Cover Pass-Check engine instantiate the
  // mupdf-wasm module client-side; it permits WebAssembly compilation only, not
  // arbitrary eval.
  const scriptSrc: string[] = ["'self'", "'unsafe-inline'", "'wasm-unsafe-eval'"];
  const connectSrc: string[] = ["'self'", "https://vitals.vercel-insights.com"];
  const imgSrc: string[] = ["'self'", "data:", "blob:"];
  const styleSrc: string[] = ["'self'", "'unsafe-inline'"];
  const frameSrc: string[] = ["'self'"];
  const fontSrc: string[] = ["'self'", "data:"];

  if (providers.vercelAnalytics) {
    scriptSrc.push("https://va.vercel-scripts.com");
    connectSrc.push("https://va.vercel-scripts.com");
  }
  if (providers.clarity) {
    scriptSrc.push("https://www.clarity.ms");
    connectSrc.push("https://*.clarity.ms", "https://c.bing.com");
    imgSrc.push("https://*.clarity.ms");
  }
  if (providers.adsense) {
    scriptSrc.push("https://pagead2.googlesyndication.com", "https://*.googlesyndication.com");
    frameSrc.push("https://googleads.g.doubleclick.net", "https://*.doubleclick.net");
    imgSrc.push("https://*.googlesyndication.com", "https://*.doubleclick.net");
  }
  if (providers.mediavine) {
    scriptSrc.push("https://scripts.mediavine.com", "https://*.mediavine.com");
    connectSrc.push("https://*.mediavine.com");
    imgSrc.push("https://*.mediavine.com");
  }
  if (providers.carbon) {
    scriptSrc.push("https://cdn.carbonads.com", "https://srv.carbonads.net");
    imgSrc.push("https://srv.carbonads.net", "https://ad.doubleclick.net");
  }
  if (providers.plausible) {
    scriptSrc.push("https://plausible.io");
    connectSrc.push("https://plausible.io");
  }
  if (providers.ga) {
    scriptSrc.push("https://www.googletagmanager.com", "https://www.google-analytics.com");
    connectSrc.push("https://www.google-analytics.com", "https://*.analytics.google.com");
    imgSrc.push("https://www.google-analytics.com");
  }
  if (providers.gumroad) {
    // gumroad.js is just a loader: it injects the real overlay bundle + CSS from
    // assets.gumroad.com, so BOTH hosts must be allowed or the overlay silently
    // fails to initialize and the button falls back to a full-page checkout
    // redirect. The checkout itself runs in an iframe at the product URL origin.
    // frame-src, once set, stops inheriting default-src, so keep 'self' (already
    // present) for the /embed same-origin preview.
    scriptSrc.push("https://gumroad.com", "https://assets.gumroad.com");
    styleSrc.push("https://assets.gumroad.com");
    imgSrc.push("https://gumroad.com", "https://assets.gumroad.com", "https://*.gumroad.com");
    connectSrc.push("https://gumroad.com", "https://assets.gumroad.com", "https://*.gumroad.com");
    frameSrc.push("https://gumroad.com", "https://*.gumroad.com");
    if (providers.gumroadOrigin) {
      frameSrc.push(providers.gumroadOrigin);
      connectSrc.push(providers.gumroadOrigin);
    }
  }

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `img-src ${imgSrc.join(" ")}`,
    `font-src ${fontSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    // mupdf-wasm may run inside a blob-sourced worker depending on the bundle.
    `worker-src 'self' blob:`,
    `frame-src ${frameSrc.join(" ")}`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join("; ");
}

export const EMBED_FRAME_ANCESTORS_CSP = "frame-ancestors *";

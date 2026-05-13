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
};

export function buildCSP(providers: CspProviders = {}): string {
  const scriptSrc: string[] = ["'self'", "'unsafe-inline'"];
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
    connectSrc.push("https://www.google-analytics.com");
    imgSrc.push("https://www.google-analytics.com");
  }

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `img-src ${imgSrc.join(" ")}`,
    `font-src ${fontSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    `frame-src ${frameSrc.join(" ")}`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join("; ");
}

export const EMBED_FRAME_ANCESTORS_CSP = "frame-ancestors *";

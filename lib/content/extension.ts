import { siteConfig } from "@/lib/site-config";

export const extensionMeta = {
  enabled: siteConfig.features.extension.enabled,
  chromeWebStoreUrl: siteConfig.features.extension.chromeWebStoreUrl,
  name: "KDP Cover Calculator",
  short: "Spine width and KDP cover dimensions in a one-click popup.",
  features: [
    `Same precision multipliers as ${siteConfig.name}`,
    "Works fully offline — no permissions, no host access",
    "Shareable URLs back to the live site",
  ],
};

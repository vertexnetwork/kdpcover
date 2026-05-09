/**
 * Single source of truth for ad provider.
 * Flip PROVIDER and redeploy — both <AdSlot> and /ads.txt re-emit accordingly.
 */

export type AdProvider = "adsense" | "mediavine" | "none";

export const PROVIDER: AdProvider =
  (process.env.NEXT_PUBLIC_AD_PROVIDER as AdProvider | undefined) ?? "adsense";

export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
export const ADSENSE_SLOTS = {
  "below-results": process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW_RESULTS ?? "",
  "mid-content": process.env.NEXT_PUBLIC_ADSENSE_SLOT_MID_CONTENT ?? "",
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
} as const;

export type SlotName = keyof typeof ADSENSE_SLOTS;

/**
 * ads.txt lines for the active provider.
 * Format: <domain>, <publisher_id>, <relationship>, <certification_authority_id>
 */
export function adsTxtLines(): string[] {
  if (PROVIDER === "adsense") {
    if (!ADSENSE_CLIENT_ID) {
      return ["# AdSense client ID not set. Set NEXT_PUBLIC_ADSENSE_CLIENT_ID before launch."];
    }
    const pubId = ADSENSE_CLIENT_ID.replace(/^ca-/, "");
    return [`google.com, ${pubId}, DIRECT, f08c47fec0942fa0`];
  }
  if (PROVIDER === "mediavine") {
    return [
      "# Mediavine ad partners",
      "google.com, pub-9591567416879856, RESELLER, f08c47fec0942fa0",
      "# Add Mediavine-issued ads.txt entries here on approval.",
    ];
  }
  return ["# No ad provider active."];
}

/** Reserved heights to keep CLS = 0. */
export const SLOT_MIN_HEIGHT: Record<SlotName, string> = {
  "below-results": "min-h-[280px]",
  "mid-content": "min-h-[250px]",
  sidebar: "min-h-[600px]",
};

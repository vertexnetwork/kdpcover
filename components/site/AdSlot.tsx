import { ADSENSE_CLIENT_ID, ADSENSE_SLOTS, PROVIDER, SLOT_MIN_HEIGHT, type SlotName } from "@/lib/ads/config";
import { clsx } from "clsx";

type Props = {
  slot: SlotName;
  className?: string;
  /** Set true to suppress rendering on this surface (e.g. /embed). */
  disabled?: boolean;
};

export function AdSlot({ slot, className, disabled }: Props) {
  if (disabled) return null;
  const height = SLOT_MIN_HEIGHT[slot];

  if (PROVIDER === "adsense" && ADSENSE_CLIENT_ID && ADSENSE_SLOTS[slot]) {
    return (
      <div className={clsx("w-full", height, className)} data-ad-slot={slot}>
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={ADSENSE_SLOTS[slot]}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Reserved placeholder — keeps CLS = 0 even before ads load. Renders as
  // an empty box (no "Sponsored" chrome) so the slot doesn't set a tone
  // before a real impression is available.
  return (
    <div
      aria-hidden
      className={clsx("w-full", height, className)}
      data-ad-slot={slot}
    />
  );
}

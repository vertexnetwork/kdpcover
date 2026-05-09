"use client";

import { useEffect, useState } from "react";
import { AdSlot } from "./AdSlot";
import { SLOT_MIN_HEIGHT, type SlotName } from "@/lib/ads/config";
import { clsx } from "clsx";

type Props = {
  slot: SlotName;
  className?: string;
};

/**
 * Reserves the slot's min-height for CLS, but does not mount the actual
 * AdSlot until the calculator dispatches `kdpcover:calculated`.
 * Spec §2.13: "fires only after a calculation."
 */
export function DeferredAdSlot({ slot, className }: Props) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const handler = () => setArmed(true);
    window.addEventListener("kdpcover:calculated", handler);
    return () => window.removeEventListener("kdpcover:calculated", handler);
  }, []);

  if (armed) return <AdSlot slot={slot} className={className} />;

  return (
    <div
      aria-hidden
      className={clsx("w-full", SLOT_MIN_HEIGHT[slot], className)}
      data-ad-slot={slot}
      data-ad-state="deferred"
    />
  );
}

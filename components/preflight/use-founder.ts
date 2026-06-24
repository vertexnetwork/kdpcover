"use client";

import { useEffect, useState } from "react";

export type FounderStatus = {
  active: boolean;
  remaining: number | null; // null = uncapped / hide the count
  percentOff: number;
  price: number;
  code: string;
};

// Module-level cache so every CTA + the banner share ONE /api/founder request
// per page load instead of each firing its own.
let cached: FounderStatus | null | undefined; // undefined = not yet fetched
let inflight: Promise<FounderStatus | null> | null = null;

function load(): Promise<FounderStatus | null> {
  if (inflight) return inflight;
  inflight = fetch("/api/founder", { cache: "no-store" })
    .then((r) => r.json())
    .then((d: FounderStatus) => {
      cached = d && d.active ? d : null;
      return cached;
    })
    .catch(() => {
      cached = null;
      return null;
    });
  return inflight;
}

/** Returns the active founder offer, or null when there isn't one (disabled,
 *  sold out, or the lookup failed). Safe to call from many components at once. */
export function useFounder(): FounderStatus | null {
  const [data, setData] = useState<FounderStatus | null>(cached ?? null);
  useEffect(() => {
    if (cached !== undefined) {
      // Already resolved by a sibling component — adopt the shared result.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(cached);
      return;
    }
    let on = true;
    load().then((d) => {
      if (on) setData(d);
    });
    return () => {
      on = false;
    };
  }, []);
  return data;
}

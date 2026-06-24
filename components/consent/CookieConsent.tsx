"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConsent } from "./ConsentProvider";

export function CookieConsent() {
  const { state, grant, deny } = useConsent();
  const [framed, setFramed] = useState(false);
  // Suppress the banner when we're loaded inside an iframe (the /embed surface
  // is the obvious case — the host page is responsible for its own consent UI).
  useEffect(() => {
    try {
      setFramed(window.self !== window.top);
    } catch {
      setFramed(true);
    }
  }, []);
  if (framed) return null;
  if (state !== "unknown") return null;
  return (
    // Pinned bottom-left on desktop (and narrowed) so it never sits over the
    // calculator's live cover preview or the footer email form on the right.
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="rounded-card fixed inset-x-3 bottom-3 z-50 mx-auto max-w-sm border border-(--color-border)/80 bg-(--color-surface) p-4 shadow-(--shadow-card) sm:inset-x-auto sm:bottom-4 sm:left-4 sm:mx-0"
    >
      <p className="text-sm text-(--color-on-bg)">
        We use anonymous analytics (Vercel) and, with your consent, Microsoft Clarity for usability
        heatmaps. No advertising cookies.{" "}
        <Link href="/privacy" className="underline hover:text-(--color-accent)">
          Privacy policy
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={grant}
          className="inline-flex min-h-(--spacing-touch) items-center rounded-md bg-(--color-on-bg) px-4 py-2 text-sm font-medium text-(--color-on-accent) hover:opacity-90"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={deny}
          className="hover:bg-sage-100 inline-flex min-h-(--spacing-touch) items-center rounded-md border border-(--color-border) bg-transparent px-4 py-2 text-sm font-medium text-(--color-on-bg)"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

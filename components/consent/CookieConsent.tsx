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
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-card border border-(--color-border)/80 bg-(--color-surface) p-4 shadow-(--shadow-card) sm:inset-x-auto sm:right-4 sm:bottom-4"
    >
      <p className="text-sm text-(--color-on-bg)">
        We use anonymous analytics (Vercel) and, with your consent, Microsoft Clarity for
        usability heatmaps. No advertising cookies.{" "}
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
          className="inline-flex min-h-(--spacing-touch) items-center rounded-md border border-(--color-border) bg-transparent px-4 py-2 text-sm font-medium text-(--color-on-bg) hover:bg-sage-100"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

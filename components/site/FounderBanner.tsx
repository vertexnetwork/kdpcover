"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useFounder } from "@/components/preflight/use-founder";

// Site-wide cold-start strip. Renders nothing until the founder offer is
// confirmed active (and vanishes the moment it sells out), so there's never a
// stale or fake banner. ?src=banner attributes the eventual purchase to it.
export function FounderBanner() {
  const founder = useFounder();
  if (!founder?.active) return null;

  return (
    <Link
      href="/cover-pass-check?src=banner"
      className="block bg-(--color-on-bg) px-4 py-2 text-center text-xs text-(--color-on-accent) transition-colors hover:bg-(--color-accent) sm:text-sm"
    >
      <strong>Founder pricing</strong> — {founder.percentOff}% off Cover Pass-Check
      {founder.remaining != null ? ` · only ${founder.remaining} left` : ""}
      <ArrowRight className="ml-1 inline h-3.5 w-3.5 align-text-bottom" aria-hidden />
    </Link>
  );
}

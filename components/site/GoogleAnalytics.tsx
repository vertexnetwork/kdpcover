"use client";

import Script from "next/script";
import { useConsent } from "@/components/consent/ConsentProvider";

// GA4, mounted only after the visitor grants consent (same gate as Clarity).
// Loading the script defines window.gtag, which lib/analytics/track.ts then
// forwards every custom event to — so GA4 receives the same funnel events as
// Vercel Analytics, plus automatic pageviews. Set NEXT_PUBLIC_GA_MEASUREMENT_ID
// to a "G-XXXXXXXXXX" id to enable; absent → renders nothing.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const { allowed } = useConsent();
  if (!GA_ID || !allowed) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}

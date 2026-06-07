import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import { Analytics } from "@/components/site/Analytics";
import { Clarity } from "@/components/site/Clarity";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { SwRegister } from "@/components/site/SwRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.tagline} — ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  keywords: [...siteConfig.keywords],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.tagline,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.tagline,
    description: siteConfig.description,
  },
  verification: {
    google: siteConfig.verification.google,
    other: siteConfig.verification.bing
      ? { "msvalidate.01": siteConfig.verification.bing }
      : undefined,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.brand.markColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      {/* rel=search has no Metadata-API field; React 19 hoists it to <head>. */}
      <link
        rel="search"
        type="application/opensearchdescription+xml"
        href="/opensearch.xml"
        title={siteConfig.name}
      />
      <body className="flex min-h-dvh flex-col bg-(--color-bg) text-(--color-on-bg)">
        <ConsentProvider required={siteConfig.features.consent.required}>
          {children}
          <Analytics />
          <Clarity />
          <CookieConsent />
          <SwRegister />
        </ConsentProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Analytics } from "@/components/site/Analytics";
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
  metadataBase: new URL("https://kdpcover.pro"),
  title: {
    default: "KDP Cover & Spine Width Calculator — kdpcover.pro",
    template: "%s · kdpcover.pro",
  },
  description:
    "Pass KDP's review on the first try. Precision spine width, full-cover dimensions, and safe-zone diagrams for Amazon paperback and case-laminate hardcover books.",
  applicationName: "KDP Cover Calculator",
  authors: [{ name: "Spine Hero", url: "https://kdpcover.pro" }],
  keywords: [
    "KDP cover calculator",
    "Amazon KDP spine width",
    "paperback cover dimensions",
    "case laminate hardcover",
    "kdp template generator alternative",
  ],
  openGraph: {
    type: "website",
    siteName: "kdpcover.pro",
    title: "KDP Cover & Spine Width Calculator",
    description:
      "Instant, precise KDP spine width and full-cover dimensions for paperback and hardcover.",
    url: "https://kdpcover.pro",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@spinehero",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#9CAF88",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="flex min-h-dvh flex-col bg-[var(--color-ivory)] text-[var(--color-ink)]">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SwRegister />
      </body>
    </html>
  );
}

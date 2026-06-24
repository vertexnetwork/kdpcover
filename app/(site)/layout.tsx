import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FounderBanner } from "@/components/site/FounderBanner";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <FounderBanner />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}

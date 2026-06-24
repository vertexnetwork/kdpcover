import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const nav = siteConfig.nav.primary;
  // The persistent "Get Pass-Check" CTA below already links to the landing, so
  // drop the duplicate plain "Pass-Check" nav link from both menus.
  const landing = siteConfig.features.preflight.landing;
  const navLinks = nav.filter((link) => link.href !== landing);
  return (
    <header className="sticky top-0 z-40 border-b border-(--color-border)/60 bg-(--color-bg)/85 backdrop-blur supports-[backdrop-filter]:bg-(--color-bg)/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl"
          aria-label={siteConfig.name}
        >
          <span aria-hidden className="block h-3 w-3 rounded-sm bg-(--color-accent)" />
          <span>{siteConfig.shortName}</span>
          <span className="text-sage-600">
            {siteConfig.domain.slice(siteConfig.shortName.length) || ".pro"}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            {navLinks.slice(1).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sage-800 transition-colors hover:text-(--color-accent)"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* Persistent accent CTA → the landing carries ?src=header so a buy
                there is still attributed to the header, not "landing". */}
            <li>
              <Link
                href="/cover-pass-check?src=header"
                className="inline-flex items-center gap-1.5 rounded-md bg-(--color-on-bg) px-3.5 py-2 text-sm font-medium text-(--color-on-accent) transition-colors hover:bg-(--color-accent)"
              >
                Get Pass-Check
              </Link>
            </li>
          </ul>
        </nav>

        <MobileMenu links={navLinks} />
      </div>
    </header>
  );
}

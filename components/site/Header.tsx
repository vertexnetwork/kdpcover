import Link from "next/link";
import { MobileMenu } from "./MobileMenu";

export const NAV_LINKS = [
  { href: "/", label: "Calculator" },
  { href: "/guide", label: "Guide" },
  { href: "/recommended", label: "Recommended" },
  { href: "/about", label: "About" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-sage-200/60 bg-[var(--color-ivory)]/85 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-ivory)]/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl">
          <span aria-hidden className="block h-3 w-3 rounded-sm bg-warm-400" />
          <span>kdpcover</span>
          <span className="text-sage-600">.pro</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            {NAV_LINKS.slice(1).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sage-800 transition-colors hover:text-warm-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileMenu links={NAV_LINKS} />
      </div>
    </header>
  );
}

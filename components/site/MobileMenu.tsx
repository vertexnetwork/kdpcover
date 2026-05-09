"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

type NavLink = { readonly href: string; readonly label: string };

export function MobileMenu({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-sage-800 hover:bg-sage-100 md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          ref={dialogRef}
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-menu"
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-[var(--color-ivory)] shadow-xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-sage-200/60 px-4">
              <span className="font-display text-lg">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-sage-100"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-4">
              <ul className="flex flex-col gap-1">
                {links.map((link, i) => (
                  <li key={link.href}>
                    <Link
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={link.href}
                      className="block rounded-md px-3 py-3 text-base text-sage-800 hover:bg-sage-100 hover:text-warm-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

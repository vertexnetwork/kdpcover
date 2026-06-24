"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

type NavLink = { readonly href: string; readonly label: string };

export function MobileMenu({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    // Close the menu on route change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      // Restore focus to the trigger when transitioning from open → closed.
      if (wasOpen.current) triggerRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
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
        ref={triggerRef}
        type="button"
        className="text-sage-800 hover:bg-sage-100 inline-flex h-11 w-11 items-center justify-center rounded-md md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            ref={dialogRef}
          >
            <button
              type="button"
              className="bg-ink/50 absolute inset-0"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div
              id="mobile-menu"
              className="absolute top-0 right-0 flex h-full w-full max-w-sm flex-col bg-[var(--color-ivory)] shadow-xl"
            >
              <div className="border-sage-200/60 flex h-16 items-center justify-between border-b px-4">
                <span className="font-display text-lg">Menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="hover:bg-sage-100 inline-flex h-11 w-11 items-center justify-center rounded-md"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-4">
                <Link
                  ref={firstLinkRef}
                  href="/cover-pass-check?src=header"
                  className="mb-3 flex items-center justify-center rounded-md bg-(--color-on-bg) px-4 py-3 text-base font-medium text-(--color-on-accent) hover:bg-(--color-accent)"
                >
                  Get Pass-Check
                </Link>
                <ul className="flex flex-col gap-1">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sage-800 hover:bg-sage-100 hover:text-warm-500 block rounded-md px-3 py-3 text-base"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

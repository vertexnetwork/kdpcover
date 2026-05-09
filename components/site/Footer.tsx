import Link from "next/link";

const PRODUCT_LINKS = [
  { href: "/", label: "Calculator" },
  { href: "/embed", label: "Iframe widget" },
  { href: "/extension", label: "Chrome extension" },
  { href: "/recommended", label: "Recommended tools" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/changelog", label: "Changelog" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-sage-200/60 bg-sage-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <FooterCol title="Product" links={PRODUCT_LINKS} />
          <FooterCol title="Company" links={COMPANY_LINKS} />
          <FooterCol title="Legal" links={LEGAL_LINKS} />
          <div>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-sage-700">
              Network
            </h2>
            <Link
              href="/network"
              className="text-sm text-sage-800 hover:text-warm-500"
            >
              Part of the Vertex Network →
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-sage-200/60 pt-6 text-xs text-sage-700 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} kdpcover.pro · Independent tool, not affiliated with Amazon or KDP.</p>
          <p>
            <a
              href="https://x.com/spinehero"
              target="_blank"
              rel="noreferrer"
              className="hover:text-warm-500"
            >
              @spinehero
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-sage-700">
        {title}
      </h2>
      <ul className="flex flex-col gap-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sage-800 hover:text-warm-500">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

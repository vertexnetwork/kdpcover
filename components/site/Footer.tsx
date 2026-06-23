import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { VertexFooterLink } from "./VertexFooterLink";
import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";

export function Footer() {
  const { product, company, legal } = siteConfig.nav.footer;
  return (
    <footer className="mt-16 border-t border-(--color-border)/60 bg-sage-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterCol title="Product" links={[...product]} />
            <FooterCol title="Company" links={[...company]} />
            <FooterCol title="Legal" links={[...legal]} />
            <div>
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-sage-700">
                Network
              </h2>
              <VertexFooterLink />
            </div>
          </div>
          {/* Always-on lead magnet for the non-buyers (the bulk of traffic). */}
          <EmailCaptureForm source="footer" />
        </div>

        <div className="mt-10 border-t border-(--color-border)/60 pt-6 text-xs text-sage-700">
          <p>
            © {new Date().getFullYear()} {siteConfig.name} · {siteConfig.nav.disclaimer}
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
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-sage-700">{title}</h2>
      <ul className="flex flex-col gap-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sage-800 hover:text-(--color-accent)">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

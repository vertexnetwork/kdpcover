import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6 sm:py-28">
      <p className="text-xs uppercase tracking-[0.18em] text-(--color-muted)">404</p>
      <h1 className="mt-2 text-4xl">Page not found</h1>
      <p className="mt-3 text-(--color-on-bg)/80">
        The page you&rsquo;re looking for moved or never existed. {siteConfig.name} only ever
        has a few pages — try the calculator.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-(--spacing-touch) items-center rounded-md bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent) hover:opacity-90"
      >
        Open the calculator →
      </Link>
    </section>
  );
}

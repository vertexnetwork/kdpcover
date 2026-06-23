"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { ShoppingBag, Bell, ArrowRight, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { siteConfig } from "@/lib/site-config";
import { track, type PassCheckSource } from "@/lib/analytics/track";
import { useImpression } from "@/lib/analytics/use-impression";

const gumroad = siteConfig.monetization.gumroad;
const TOOL_ROUTE = siteConfig.features.preflight.route;
const UNLOCK_ROUTE = `${TOOL_ROUTE}/unlock`;

// Gumroad's overlay script: an <a class="gumroad-button"> opens checkout as an
// on-site modal instead of navigating away.
const GUMROAD_JS = "https://gumroad.com/js/gumroad.js";

// Auto-unlock plumbing.
const CLAIM_STORAGE_KEY = "kc_pass_claim";
const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 4 * 60 * 1000;
const RESUME_WINDOW_MS = 30 * 60 * 1000;

type Tier = "author" | "studio";
type ClaimStatus = "idle" | "waiting" | "unlocked" | "timeout";

// Valid attribution surfaces, for the ?src= passthrough below. A navigational
// CTA (e.g. the header button) links to /cover-pass-check?src=header so the buy
// that eventually happens on the landing is still attributed to its true origin.
const ALLOWED_SOURCES: readonly PassCheckSource[] = [
  "landing",
  "unlock",
  "calculator-cta",
  "pseo",
  "home",
  "templates",
  "header",
  "guide",
];

function readSrcOverride(): PassCheckSource | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("src");
    return raw && (ALLOWED_SOURCES as readonly string[]).includes(raw)
      ? (raw as PassCheckSource)
      : null;
  } catch {
    return null;
  }
}

function newNonce(): string {
  try {
    return crypto.randomUUID().replace(/-/g, "");
  } catch {
    return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
}

/** Build the Gumroad checkout URL. ?wanted=true makes the overlay jump straight
 *  to the payment form; ?claim=<nonce> rides through to the Ping webhook so we
 *  can auto-unlock *this* browser once the sale settles. Null when the store
 *  isn't live yet (pre-launch "Notify me" state). */
function buildCheckoutUrl(tier: Tier, source: PassCheckSource, nonce: string): string | null {
  if (!gumroad.enabled || !gumroad.productUrl) return null;
  const base = tier === "studio" && gumroad.studioUrl ? gumroad.studioUrl : gumroad.productUrl;
  try {
    const url = new URL(base);
    url.searchParams.set("wanted", "true");
    if (nonce) url.searchParams.set("claim", nonce);
    url.searchParams.set("utm_source", "kdpcover");
    url.searchParams.set("utm_medium", "site");
    url.searchParams.set("utm_content", source);
    return url.toString();
  } catch {
    return null;
  }
}

/** Owns the unlock nonce + polling lifecycle. Generates the nonce client-side
 *  (so it never causes a hydration mismatch), resumes a pending purchase across
 *  reloads, and polls /api/preflight/claim until the cookie is set. */
function useAutoUnlock() {
  const router = useRouter();
  const [status, setStatus] = useState<ClaimStatus>("idle");
  const [nonce, setNonce] = useState("");
  const pollNonce = useRef("");
  // Buy source for the in-flight purchase, surfaced on the success event so a
  // completed sale is attributable to the surface that drove it.
  const pollSource = useRef<PassCheckSource | "unknown">("unknown");

  // Fresh nonce for the next purchase. Must be generated post-hydration (not in
  // a lazy initializer) or the client nonce would mismatch the SSR'd href.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNonce(newNonce()), []);

  // Resume polling if a recent purchase was still in flight when the buyer
  // reloaded or reopened the tab.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAIM_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { nonce?: string; ts?: number; source?: PassCheckSource };
      if (saved.nonce && saved.ts && Date.now() - saved.ts < RESUME_WINDOW_MS) {
        pollNonce.current = saved.nonce;
        pollSource.current = saved.source ?? "unknown";
        // localStorage is client-only, so this resume can't run any earlier.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus("waiting");
      } else {
        localStorage.removeItem(CLAIM_STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (status !== "waiting" || !pollNonce.current) return;
    let active = true;
    const startedAt = Date.now();
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (!active) return;
      try {
        const res = await fetch(
          `/api/preflight/claim?nonce=${encodeURIComponent(pollNonce.current)}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = (await res.json()) as { ok?: boolean; tier?: Tier };
          if (data.ok) {
            active = false;
            try {
              localStorage.removeItem(CLAIM_STORAGE_KEY);
            } catch {
              /* ignore */
            }
            track({
              name: "passcheck_autounlock_success",
              props: { tier: data.tier ?? "author", source: pollSource.current },
            });
            setStatus("unlocked");
            router.push(TOOL_ROUTE);
            router.refresh();
            return;
          }
        }
      } catch {
        /* transient — keep polling */
      }
      if (!active) return;
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        active = false;
        try {
          localStorage.removeItem(CLAIM_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        track({ name: "passcheck_autounlock_timeout", props: {} });
        setStatus("timeout");
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [status, router]);

  const begin = (source: PassCheckSource) => {
    const n = nonce || newNonce();
    pollNonce.current = n;
    pollSource.current = source;
    try {
      localStorage.setItem(CLAIM_STORAGE_KEY, JSON.stringify({ nonce: n, ts: Date.now(), source }));
    } catch {
      /* ignore */
    }
    setStatus("waiting");
  };

  return { status, nonce, begin };
}

type Props = {
  source: PassCheckSource;
  tier?: Tier;
  variant?: "button" | "card";
  size?: "default" | "lg";
  className?: string;
};

export function PassCheckCta({
  source,
  tier = "author",
  variant = "button",
  size = "default",
  className,
}: Props) {
  const [notified, setNotified] = useState(false);
  const [srcOverride, setSrcOverride] = useState<PassCheckSource | null>(null);
  const { status, nonce, begin } = useAutoUnlock();

  // If the visitor arrived from a navigational CTA (?src=…), attribute to that
  // origin instead of this component's static prop. Client-only → set in effect.
  useEffect(() => {
    const override = readSrcOverride();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (override) setSrcOverride(override);
  }, []);

  const effectiveSource = srcOverride ?? source;
  const url = buildCheckoutUrl(tier, effectiveSource, nonce);
  const price = tier === "studio" ? gumroad.studioPrice : gumroad.price;

  // Impression: fire once when the CTA scrolls into view (the click denominator).
  const viewRef = useImpression<HTMLDivElement>(() => {
    if (url) track({ name: "passcheck_cta_view", props: { source: effectiveSource } });
  });

  const onBuy = () => {
    track({ name: "passcheck_buy_click", props: { source: effectiveSource, price } });
    track({ name: "passcheck_autounlock_start", props: { source: effectiveSource } });
    begin(effectiveSource);
  };

  // Inline status under the button while the purchase settles → auto-unlock.
  const statusNote =
    status === "waiting" ? (
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-sage-700" aria-live="polite">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Finishing checkout? Keep this tab open — Pass-Check unlocks here automatically.
      </p>
    ) : status === "unlocked" ? (
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-sage-700" aria-live="polite">
        <CheckCircle2 className="h-3.5 w-3.5 text-sage-600" aria-hidden />
        Unlocked — taking you to Pass-Check…
      </p>
    ) : status === "timeout" ? (
      <p className="mt-2 text-xs text-sage-700" aria-live="polite">
        All set after checkout?{" "}
        <a href={UNLOCK_ROUTE} className="text-(--color-accent) underline hover:opacity-80">
          Enter your license key to unlock →
        </a>
      </p>
    ) : null;

  const buyOrNotify = url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      // `gumroad-button` is what gumroad.js hooks to open the on-site overlay;
      // if the script is blocked, the anchor still opens checkout in a new tab
      // and this tab keeps polling — auto-unlock survives either way.
      className={clsx(
        "gumroad-button group inline-flex items-center justify-center gap-2 rounded-md bg-(--color-on-bg) font-medium text-(--color-on-accent) shadow-sm transition-colors hover:bg-(--color-accent) focus:outline-none focus:ring-2 focus:ring-warm-300",
        size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm",
        className,
      )}
      onClick={onBuy}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden />
      <span>
        Get Pass-Check{tier === "studio" ? " Studio" : ""} ${price}
      </span>
      <ArrowRight
        className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </a>
  ) : (
    <button
      type="button"
      disabled={notified}
      onClick={() => {
        track({ name: "passcheck_notify_click", props: { source } });
        setNotified(true);
      }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md border border-warm-300 bg-warm-50 font-medium text-warm-700 transition-colors hover:border-warm-400 disabled:cursor-default disabled:opacity-70",
        size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm",
        className,
      )}
      aria-live="polite"
    >
      <Bell className="h-4 w-4" aria-hidden />
      {notified ? "Got it — we'll email you" : "Notify me when this drops"}
    </button>
  );

  // Load the overlay script once the store is live (next/script dedupes by src).
  const overlayScript = url ? <Script src={GUMROAD_JS} strategy="afterInteractive" /> : null;

  if (variant === "button") {
    return (
      <div ref={viewRef} className="inline-flex flex-col items-start">
        {overlayScript}
        {buyOrNotify}
        {statusNote}
      </div>
    );
  }

  return (
    <div ref={viewRef} className="rounded-card border border-sage-200 bg-white p-5">
      {overlayScript}
      <p className="text-xs uppercase tracking-wide text-(--color-accent)">Cover Pass-Check</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-3xl">${price}</span>
        <span className="text-sm text-sage-700">
          one-time · {tier === "studio" ? "Studio (batch)" : "Author"}
        </span>
      </div>
      <p className="mt-2 text-sm text-sage-800">
        Upload your finished cover and get an instant pass/fail report against KDP&rsquo;s spec and
        your exact book. Includes the 2,500-template bonus pack.
      </p>
      <div className="mt-4">{buyOrNotify}</div>
      {statusNote}
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-sage-700">
        <Lock className="h-3 w-3" aria-hidden />
        Secure checkout via Gumroad · 7-day refund · instant access.
      </p>
    </div>
  );
}

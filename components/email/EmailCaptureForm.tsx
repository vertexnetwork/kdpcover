"use client";

import { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics/track";
import { useImpression } from "@/lib/analytics/use-impression";

type Status = "idle" | "submitting" | "ok" | "error";

type Props = {
  /** Where this form sits in the UI — fires through to analytics for funnel tagging. */
  source: "about" | "guide" | "calculator" | "extension" | "templates" | "footer";
  className?: string;
};

/**
 * Lead-magnet form for "KDP spec change alerts".
 *
 * Promise to the user: we email you ONLY when Amazon changes a KDP spec
 * (spine multiplier, bleed, hinge, barcode, etc.). No newsletters, no
 * marketing, no auto-reply.
 *
 * Mechanism: POST to /api/subscribe → Resend Audience. No DB, no login.
 */
export function EmailCaptureForm({ source, className }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Impression: fires once when the form scrolls into view — the denominator
  // for subscribe rate per surface.
  const viewRef = useImpression<HTMLFormElement>(() => {
    track({ name: "subscribe_view", props: { source } });
  });

  if (!siteConfig.features.email.enabled) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting" || status === "ok") return;
    setStatus("submitting");
    setMessage(null);
    track({ name: "subscribe_submit", props: { source } });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (res.ok) {
        setStatus("ok");
        track({ name: "subscribe_success", props: { source } });
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus("error");
        setMessage(
          data.error === "invalid_email"
            ? "That email doesn't look valid."
            : "Couldn't add you right now — try again in a minute.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("Network hiccup — try again in a minute.");
    }
  }

  if (status === "ok") {
    return (
      <div
        className={
          "flex items-center gap-2 rounded-card border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-(--color-on-bg) " +
          (className ?? "")
        }
      >
        <CheckCircle2 className="h-4 w-4 text-sage-600" aria-hidden />
        You&rsquo;re on the list. We&rsquo;ll only email when KDP changes a spec.
      </div>
    );
  }

  return (
    <form
      ref={viewRef}
      onSubmit={onSubmit}
      className={
        "rounded-card border border-(--color-border)/80 bg-(--color-surface) p-4 sm:p-5 " +
        (className ?? "")
      }
      aria-label={siteConfig.features.email.leadMagnetName}
    >
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-(--color-accent)" aria-hidden />
        <h3 className="text-base font-medium">Get notified when KDP changes a spec</h3>
      </div>
      <p className="mt-1 text-sm text-sage-700">
        Email-only alerts when Amazon updates a multiplier, bleed, hinge, or barcode rule. No
        newsletter, no marketing — typically 1–3 emails a year.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`email-${source}`}>
          Email address
        </label>
        <input
          id={`email-${source}`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          className="min-h-(--spacing-touch) flex-1 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-on-bg) placeholder:text-sage-600 focus:border-(--color-accent) focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex min-h-(--spacing-touch) items-center justify-center rounded-md bg-(--color-on-bg) px-4 py-2 text-sm font-medium text-(--color-on-accent) hover:opacity-90 disabled:opacity-60"
        >
          {status === "submitting" ? "Adding…" : "Notify me"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 text-xs ${status === "error" ? "text-(--color-danger)" : "text-sage-700"}`}
          role={status === "error" ? "alert" : undefined}
        >
          {message}
        </p>
      )}
      <p className="mt-3 text-xs text-sage-700">
        Your email is stored in our email provider (Resend) and used only for KDP-spec
        notifications. Unsubscribe in one click from any email we send.
      </p>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics/track";

// License-key entry. POSTs to /api/preflight/verify, which sets the signed
// httpOnly unlock cookie and returns the resolved tier. On success we push to
// the tool; the server component re-reads the cookie.

const REASONS: Record<string, string> = {
  invalid: "That license key wasn't found. Copy it exactly from your Gumroad receipt.",
  refunded: "This purchase was refunded, so access is closed.",
  chargebacked: "This purchase was charged back, so access is closed.",
  disputed: "This purchase is under dispute, so access is paused.",
  uses_exceeded:
    "This key has been activated on too many devices. If that's not you, contact support.",
  rate_limited: "Too many attempts. Wait a few minutes and try again.",
  not_configured: "Pass-Check isn't available right now. Please try again later.",
  verify_unavailable: "Couldn't reach Gumroad to verify. Try again in a moment.",
  bad_request: "Something went wrong sending the key. Please try again.",
  missing_key: "Enter your license key first.",
};

export function UnlockForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || loading) return;
    setLoading(true);
    setError("");
    track({ name: "passcheck_unlock_attempt", props: {} });
    try {
      const res = await fetch("/api/preflight/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: key.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; tier?: "author" | "studio" };
      if (res.ok && data.ok) {
        track({ name: "passcheck_unlock_success", props: { tier: data.tier ?? "author" } });
        router.push(siteConfig.features.preflight.route);
        router.refresh();
        return;
      }
      setError(REASONS[data.error ?? ""] ?? "Couldn't verify that key. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-ink">Gumroad license key</span>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
          className="mt-1.5 block min-h-11 w-full rounded-md border border-sage-200 bg-white px-3 py-2 font-mono text-sm focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-200"
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={loading || !key.trim()}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-(--color-on-bg) px-4 py-2 text-sm font-medium text-(--color-on-accent) transition-colors hover:bg-(--color-accent) disabled:opacity-50"
      >
        {loading ? "Verifying…" : "Unlock Cover Pass-Check"}
      </button>
      <p className="text-xs text-sage-700">
        Your key is on your Gumroad receipt and confirmation email. One purchase unlocks your own
        devices — no account or password.
      </p>
    </form>
  );
}

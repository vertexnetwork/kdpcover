/**
 * Resend audience subscribe helper. Server-side only.
 *
 * - No database
 * - No transactional reply email to the subscriber
 * - 409 from Resend = "already in audience" — treat as success (idempotent)
 */

const RESEND_API_BASE = "https://api.resend.com";

export type SubscribeResult =
  | { ok: true; status: "added" | "already_subscribed" }
  | { ok: false; status: "invalid_email" | "not_configured" | "upstream_error"; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(input: unknown): input is string {
  return typeof input === "string" && input.length <= 254 && EMAIL_RE.test(input);
}

export async function addToAudience(email: string): Promise<SubscribeResult> {
  if (!isValidEmail(email)) return { ok: false, status: "invalid_email" };

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) return { ok: false, status: "not_configured" };

  const res = await fetch(`${RESEND_API_BASE}/audiences/${audienceId}/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, unsubscribed: false }),
  });

  if (res.status === 409) return { ok: true, status: "already_subscribed" };
  if (res.ok) return { ok: true, status: "added" };

  const text = await res.text().catch(() => "");
  return { ok: false, status: "upstream_error", error: text.slice(0, 200) };
}

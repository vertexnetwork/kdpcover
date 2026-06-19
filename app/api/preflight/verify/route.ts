import { NextResponse, type NextRequest } from "next/server";
import { isPreflightConfigured, serverConfig } from "@/lib/server-config";
import { evaluateLicense, extractTier, verifyLicenseWithGumroad } from "@/lib/gumroad-license";
import { PREFLIGHT_COOKIE, signToken, TOKEN_TTL_MS } from "@/lib/preflight-token";

// POST /api/preflight/verify  { licenseKey: string }
// Verifies a Gumroad license and, on success, sets the httpOnly unlock cookie
// the /pass-check server component checks. This is the one public attack
// surface, so it fails closed and rate-limits per IP. The resolved tier
// (author | studio) is signed into the cookie and echoed in the response.

export const runtime = "nodejs"; // node:crypto in signToken
export const dynamic = "force-dynamic";

// Best-effort in-memory fixed-window limiter. Per serverless instance (resets
// on cold start), so it throttles a single hot box rather than guaranteeing a
// global cap — enough to blunt brute-forcing without standing up a store.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 12;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string, now: number): boolean {
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  if (!isPreflightConfigured()) {
    // Misconfigured deploy — refuse rather than silently granting access.
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip, Date.now())) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let licenseKey = "";
  try {
    const body = (await req.json()) as { licenseKey?: unknown };
    licenseKey = typeof body.licenseKey === "string" ? body.licenseKey.trim() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  if (!licenseKey) {
    return NextResponse.json({ ok: false, error: "missing_key" }, { status: 400 });
  }

  const data = await verifyLicenseWithGumroad(licenseKey, serverConfig.gumroadProductId);
  if (data === null) {
    return NextResponse.json({ ok: false, error: "verify_unavailable" }, { status: 502 });
  }

  const verdict = evaluateLicense(data, serverConfig.preflightUsesCap);
  if (!verdict.ok) {
    return NextResponse.json({ ok: false, error: verdict.reason }, { status: 403 });
  }

  const tier = extractTier(data, serverConfig.studioVariantNames);

  const res = NextResponse.json({ ok: true, tier });
  res.cookies.set(PREFLIGHT_COOKIE, signToken(licenseKey, tier), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(TOKEN_TTL_MS / 1000),
  });
  return res;
}

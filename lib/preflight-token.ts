import crypto from "node:crypto";
import { serverConfig } from "./server-config";
import type { PreflightTier } from "./gumroad-license";

// Stateless unlock token for the gated Cover Pass-Check tool. After a license
// verifies, we mint `payload.signature` (both base64url) and set it as an
// httpOnly cookie. No DB, no session store — verification is a single HMAC
// check, so the gate adds no infrastructure. This is proportionate by design:
// the dimension math (lib/kdp/calc) already ships free in the calculator, so
// the token guards the productized file-check experience, not a secret formula.
//
// The buyer's tier (author | studio) is carried INSIDE the signed payload, so
// it can't be tampered with client-side to unlock batch mode for free.

export const TOKEN_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
export const PREFLIGHT_COOKIE = "kc_pass";

type TokenPayload = {
  v: 1;
  // Short hash of the license key — ties the token to a specific purchase
  // (useful for future revocation) without storing the raw key in the cookie.
  lk: string;
  // Author (single-file) or Studio (batch). Signed, so it's authoritative.
  tier: PreflightTier;
  exp: number; // epoch ms
};

export type ReadTokenResult = { valid: false } | { valid: true; tier: PreflightTier };

const b64url = (buf: Buffer) => buf.toString("base64url");

const licenseRef = (licenseKey: string) =>
  crypto.createHash("sha256").update(licenseKey).digest("base64url").slice(0, 16);

function sign(payloadB64: string, secret: string): string {
  return b64url(crypto.createHmac("sha256", secret).update(payloadB64).digest());
}

// Mint a signed token for a verified license + resolved tier. `now`/`secret`
// are injectable so tests don't depend on wall-clock or env.
export function signToken(
  licenseKey: string,
  tier: PreflightTier,
  now: number = Date.now(),
  secret: string = serverConfig.preflightTokenSecret,
): string {
  const payload: TokenPayload = {
    v: 1,
    lk: licenseRef(licenseKey),
    tier,
    exp: now + TOKEN_TTL_MS,
  };
  const payloadB64 = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

// Parse + verify a token, returning its tier. Any failure (missing, malformed,
// tampered, expired, no secret configured) returns { valid: false } — the gate
// fails closed.
export function readToken(
  token: string | undefined | null,
  now: number = Date.now(),
  secret: string = serverConfig.preflightTokenSecret,
): ReadTokenResult {
  if (!token || !secret) return { valid: false };
  const dot = token.indexOf(".");
  if (dot <= 0) return { valid: false };
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(payloadB64, secret);
  const sigBuf = Buffer.from(sig, "base64url");
  const expBuf = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false };
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as TokenPayload;
    if (payload.v !== 1 || typeof payload.exp !== "number" || payload.exp <= now) {
      return { valid: false };
    }
    return { valid: true, tier: payload.tier === "studio" ? "studio" : "author" };
  } catch {
    return { valid: false };
  }
}

// Convenience boolean for call sites that only gate on validity, not tier.
export function verifyToken(
  token: string | undefined | null,
  now: number = Date.now(),
  secret: string = serverConfig.preflightTokenSecret,
): boolean {
  return readToken(token, now, secret).valid;
}

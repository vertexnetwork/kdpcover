import { NextResponse, type NextRequest } from "next/server";
import { PREFLIGHT_COOKIE, readToken, TOKEN_TTL_MS } from "@/lib/preflight-token";
import { takeClaim } from "@/lib/claim-store";

// Browser poll endpoint for instant unlock after an overlay purchase. Given the
// nonce the buyer's browser generated at checkout, hand back the unlock token
// the Ping webhook stashed (once it has arrived) and set the same httpOnly gate
// cookie the manual /verify flow sets. The nonce is high-entropy and single-use,
// so a hit is itself proof that a matching, verified sale fired. Until then we
// answer { pending } and the client keeps polling.

export const runtime = "nodejs"; // node:crypto in readToken
export const dynamic = "force-dynamic";

const NONCE_RE = /^[A-Za-z0-9_-]{8,128}$/;

export async function GET(req: NextRequest) {
  const nonce = (req.nextUrl.searchParams.get("nonce") ?? "").trim();
  if (!NONCE_RE.test(nonce)) {
    return NextResponse.json({ ok: false, error: "bad_nonce" }, { status: 400 });
  }

  const token = await takeClaim(nonce);
  if (!token) {
    // Ping hasn't landed yet (or never will) — tell the client to keep waiting.
    return NextResponse.json({ ok: false, pending: true });
  }

  // The stored value is a token we minted ourselves, but re-verify its signature
  // before trusting it — a tampered store entry must not unlock anything.
  const result = readToken(token);
  if (!result.valid) {
    return NextResponse.json({ ok: false, pending: true });
  }

  const res = NextResponse.json({ ok: true, tier: result.tier });
  res.cookies.set(PREFLIGHT_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(TOKEN_TTL_MS / 1000),
  });
  return res;
}

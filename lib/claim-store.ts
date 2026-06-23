// Short-lived correlation store that turns "a sale just happened" into "this
// browser may unlock". The Gumroad Ping webhook runs server-to-server, so it
// can't touch the buyer's cookies; instead it drops a ready-to-use unlock token
// here, keyed by a random nonce the buyer's browser generated and passed through
// checkout. The browser then polls /api/preflight/claim to pick it up. Backed by
// any Upstash-compatible Redis REST endpoint (Vercel KV included), so there's no
// SDK dependency and no long-lived state — entries expire in minutes. If no
// store is configured the whole feature degrades silently to manual key entry.

const REST_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const REST_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

const KEY_PREFIX = "kc_claim:";
export const CLAIM_TTL_SECONDS = 15 * 60;

export function isClaimStoreConfigured(): boolean {
  return REST_URL.length > 0 && REST_TOKEN.length > 0;
}

// Upstash's REST API accepts a Redis command as a JSON array and returns
// { result } (or { error }). One round-trip per command.
async function redis(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`claim store responded ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result ?? null;
}

// Store the minted unlock token under the buyer's nonce. Best-effort: a store
// outage must never break the webhook (Gumroad would just retry), so failures
// are swallowed and the buyer falls back to manual key entry.
export async function putClaim(nonce: string, token: string): Promise<void> {
  if (!isClaimStoreConfigured()) return;
  try {
    await redis(["SET", KEY_PREFIX + nonce, token, "EX", CLAIM_TTL_SECONDS]);
  } catch {
    /* fall back to manual unlock */
  }
}

// Atomically fetch-and-delete the token for a nonce (single use), so a leaked
// nonce can't be replayed and the store self-cleans.
export async function takeClaim(nonce: string): Promise<string | null> {
  if (!isClaimStoreConfigured()) return null;
  try {
    const result = await redis(["GETDEL", KEY_PREFIX + nonce]);
    return typeof result === "string" && result.length > 0 ? result : null;
  } catch {
    return null;
  }
}

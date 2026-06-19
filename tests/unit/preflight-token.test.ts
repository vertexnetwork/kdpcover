import { describe, expect, it } from "vitest";
import { signToken, readToken, verifyToken, TOKEN_TTL_MS } from "@/lib/preflight-token";

const SECRET = "test-secret-please-ignore-0123456789";
const KEY = "ABCDEFGH-12345678-IJKLMNOP-87654321";
const NOW = 1_700_000_000_000;

describe("preflight-token", () => {
  it("signs and reads back a valid author token", () => {
    const token = signToken(KEY, "author", NOW, SECRET);
    const res = readToken(token, NOW + 1000, SECRET);
    expect(res).toEqual({ valid: true, tier: "author" });
    expect(verifyToken(token, NOW + 1000, SECRET)).toBe(true);
  });

  it("round-trips the studio tier", () => {
    const token = signToken(KEY, "studio", NOW, SECRET);
    expect(readToken(token, NOW + 1000, SECRET)).toEqual({ valid: true, tier: "studio" });
  });

  it("rejects a tampered signature", () => {
    const token = signToken(KEY, "studio", NOW, SECRET);
    const tampered = token.slice(0, -2) + (token.endsWith("a") ? "bb" : "aa");
    expect(readToken(tampered, NOW + 1000, SECRET).valid).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    const token = signToken(KEY, "author", NOW, SECRET);
    expect(readToken(token, NOW + 1000, "another-secret").valid).toBe(false);
  });

  it("rejects an expired token", () => {
    const token = signToken(KEY, "author", NOW, SECRET);
    expect(readToken(token, NOW + TOKEN_TTL_MS + 1, SECRET).valid).toBe(false);
  });

  it("fails closed when no secret is configured", () => {
    const token = signToken(KEY, "author", NOW, SECRET);
    expect(readToken(token, NOW + 1000, "").valid).toBe(false);
  });

  it("rejects malformed tokens", () => {
    expect(readToken("", NOW, SECRET).valid).toBe(false);
    expect(readToken(undefined, NOW, SECRET).valid).toBe(false);
    expect(readToken("no-dot-here", NOW, SECRET).valid).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { buildSlug, parseSlug, curatedPseoSlugs } from "@kdp/slug";

describe("slug round-trip", () => {
  it("default trim omitted", () => {
    const s = buildSlug({
      format: "paperback",
      paper: "white",
      pageCount: 300,
      trimWidthIn: 6,
      trimHeightIn: 9,
    });
    expect(s).toBe("paperback-white-300-pages");
    const parsed = parseSlug(s);
    expect(parsed).toEqual({
      format: "paperback",
      paper: "white",
      pageCount: 300,
      trimWidthIn: 6,
      trimHeightIn: 9,
    });
  });

  it("non-default trim emitted and parsed", () => {
    const s = buildSlug({
      format: "paperback",
      paper: "color-premium",
      pageCount: 220,
      trimWidthIn: 8.5,
      trimHeightIn: 11,
    });
    expect(s).toBe("paperback-premium-color-220-pages-8.5x11");
    expect(parseSlug(s)).toEqual({
      format: "paperback",
      paper: "color-premium",
      pageCount: 220,
      trimWidthIn: 8.5,
      trimHeightIn: 11,
    });
  });

  it("hardcover cream slug round-trip", () => {
    const s = "hardcover-cream-150-pages-6x9";
    const parsed = parseSlug(s);
    expect(parsed?.format).toBe("hardcover");
    expect(parsed?.paper).toBe("cream");
    expect(parsed?.pageCount).toBe(150);
  });

  it("rejects out-of-range page count", () => {
    expect(parseSlug("paperback-white-829-pages")).toBeNull();
    expect(parseSlug("hardcover-white-74-pages")).toBeNull();
  });

  it("rejects malformed slugs", () => {
    expect(parseSlug("garbage")).toBeNull();
    expect(parseSlug("paperback-purple-100-pages")).toBeNull();
  });
});

describe("curated pSEO slugs", () => {
  it("returns a non-trivial set without duplicates", () => {
    const slugs = curatedPseoSlugs();
    expect(slugs.length).toBeGreaterThan(2000);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every curated slug parses successfully", () => {
    const slugs = curatedPseoSlugs();
    for (const s of slugs.slice(0, 200)) {
      expect(parseSlug(s)).not.toBeNull();
    }
  });
});

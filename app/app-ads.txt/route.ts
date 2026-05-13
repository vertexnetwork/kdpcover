import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

const FILE = path.join(process.cwd(), "public", "app-ads.txt");

export async function GET() {
  let body = "";
  try {
    body = fs.readFileSync(FILE, "utf8");
  } catch {
    body = "# app-ads.txt unavailable\n";
  }
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

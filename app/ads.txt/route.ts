import { adsTxtLines } from "@/lib/ads/config";

export const dynamic = "force-static";

export async function GET() {
  return new Response(adsTxtLines().join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

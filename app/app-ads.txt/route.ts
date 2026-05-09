export const dynamic = "force-static";

const BODY = [
  "# kdpcover.pro — no authorised in-app ad sellers at this time.",
  "# This file is reserved for future re-introduction of ad inventory.",
].join("\n") + "\n";

export async function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

"use client";

import Link from "next/link";
import { track } from "@/lib/analytics/track";

export function VertexFooterLink() {
  return (
    <Link
      href="/network"
      onClick={() => track({ name: "vertex_footer_opened", props: {} })}
      className="text-sm text-sage-800 hover:text-(--color-accent)"
    >
      Part of the Vertex Network →
    </Link>
  );
}

"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { encodeState } from "@kdp/share";
import type { CoverInput } from "@kdp/calc";
import { track } from "@/lib/analytics/track";

export function ShareButton({ state }: { state: CoverInput }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    const code = encodeState(state);
    const url = `${window.location.origin}/share/${code}`;
    await navigator.clipboard.writeText(url);
    track({ name: "share_link_copied", props: {} });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-sage-200 bg-white px-3 py-2 text-sm hover:border-warm-400"
    >
      <Link2 className="h-4 w-4" aria-hidden /> {copied ? "Copied!" : "Copy share link"}
    </button>
  );
}

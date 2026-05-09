"use client";

import { useEffect, useRef, useState } from "react";
import { Code } from "lucide-react";
import { track } from "@/lib/analytics/track";

const SNIPPET = `<iframe src="https://kdpcover.pro/embed?theme=light"
  width="100%" height="640" style="border:0; border-radius:12px"
  loading="lazy" title="KDP Cover Calculator"></iframe>
<script>window.addEventListener("message",function(e){
  if(e.data && e.data.type==="kdpcover:height"){
    var f=document.querySelector('iframe[src*="kdpcover.pro/embed"]');
    if(f) f.style.height=e.data.height+"px";
  }
});</script>`;

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EmbedSnippet({ open, onOpenChange }: Props) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDetailsElement>(null);
  const controlled = open !== undefined;

  useEffect(() => {
    if (!controlled || !ref.current) return;
    if (ref.current.open !== open) ref.current.open = !!open;
  }, [open, controlled]);

  const onCopy = async () => {
    await navigator.clipboard.writeText(SNIPPET);
    track({ name: "embed_snippet_copied", props: {} });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <details
      ref={ref}
      id="embed-snippet-panel"
      className="rounded-card border border-sage-200 bg-white"
      onToggle={(e) => {
        const next = (e.currentTarget as HTMLDetailsElement).open;
        if (controlled && next !== open) onOpenChange?.(next);
      }}
    >
      <summary className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm font-medium text-sage-800">
        <Code className="h-4 w-4" aria-hidden /> Embed this calculator on your site
      </summary>
      <div className="border-t border-sage-200 p-5">
        <pre className="overflow-x-auto rounded-md bg-sage-900 p-3 text-xs text-sage-100">
          <code>{SNIPPET}</code>
        </pre>
        <button
          type="button"
          onClick={onCopy}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-md border border-sage-200 bg-white px-3 py-2 text-sm hover:border-warm-400"
        >
          {copied ? "Copied!" : "Copy snippet"}
        </button>
      </div>
    </details>
  );
}

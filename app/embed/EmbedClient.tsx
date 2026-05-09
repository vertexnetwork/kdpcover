"use client";

import { useEffect, useRef } from "react";
import { Calculator } from "@/components/calculator/Calculator";
import type { Format } from "@kdp/calc";

type Props = {
  theme: "light" | "dark";
  compact: boolean;
  accent?: string;
  defaultFormat: Format;
};

export function EmbedClient({ theme, compact, accent, defaultFormat }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let last = 0;
    const post = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      if (h !== last) {
        last = h;
        window.parent.postMessage({ type: "kdpcover:height", height: h }, "*");
      }
    };
    post();
    const ro = new ResizeObserver(post);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const styleVar: React.CSSProperties | undefined = accent
    ? ({ ["--color-warm-400" as string]: accent } as React.CSSProperties)
    : undefined;

  return (
    <div
      ref={ref}
      data-theme={theme}
      style={styleVar}
      className={
        theme === "dark"
          ? "min-h-dvh bg-ink p-4 text-ivory"
          : "min-h-dvh bg-[var(--color-ivory)] p-4"
      }
    >
      <Calculator initial={{ format: defaultFormat }} compact={compact} silent />
      <p className="mt-4 text-center text-xs text-sage-700">
        Powered by <a href="https://kdpcover.pro" target="_blank" rel="noreferrer" className="underline">kdpcover.pro</a>
      </p>
    </div>
  );
}

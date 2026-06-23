"use client";

import { useMemo, useState } from "react";
import { Mail, Send } from "lucide-react";
import type { CoverInput, CoverCalcOutput } from "@kdp/calc";
import { encodeState } from "@kdp/share";
import { FORMAT_LABEL, PAPER_LABEL } from "@kdp/limits";
import { track } from "@/lib/analytics/track";

type Props = {
  input: CoverInput;
  output: CoverCalcOutput;
};

const SITE = "https://kdpcover.pro";

export function HandoffBlock({ input, output }: Props) {
  const [copied, setCopied] = useState(false);

  const message = useMemo(() => {
    const code = encodeState(input);
    return [
      `Hi — for my book I need a KDP cover at these specs:`,
      ``,
      `Format: ${FORMAT_LABEL[input.format]}`,
      `Paper: ${PAPER_LABEL[input.paper]}`,
      `Page count: ${input.pageCount}`,
      `Trim: ${input.trimWidthIn} × ${input.trimHeightIn} in`,
      ``,
      `Spine width: ${output.spineWidthIn.toFixed(4)} in (${output.spineWidthMm.toFixed(2)} mm)`,
      `Full cover: ${output.fullCoverWidthIn.toFixed(4)} × ${output.fullCoverHeightIn.toFixed(4)} in`,
      `Full cover (mm): ${output.fullCoverWidthMm.toFixed(2)} × ${output.fullCoverHeightMm.toFixed(2)} mm`,
      `Spine text: ${output.spineTextEligible ? "OK (≥79 pages)" : "not eligible (<79 pages)"}`,
      ``,
      `Source / live diagram: ${SITE}/share/${code}`,
    ].join("\n");
  }, [input, output]);

  const onCopy = async () => {
    await navigator.clipboard.writeText(message);
    track({ name: "share_link_copied", props: { kind: "handoff" } });
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent(
    `KDP cover spec — spine ${output.spineWidthIn.toFixed(4)}″`,
  )}&body=${encodeURIComponent(message)}`;

  return (
    <details className="group rounded-card border border-sage-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-sage-800">
        <span className="flex items-center gap-2">
          <Send className="h-4 w-4 text-sage-600" aria-hidden />
          Send these specs to your designer
        </span>
        <span className="text-xs text-sage-700 group-open:hidden">Open</span>
        <span className="hidden text-xs text-sage-700 group-open:inline">Close</span>
      </summary>
      <div className="border-t border-sage-200 p-5">
        <p className="text-xs text-sage-700">
          Pre-filled message you can paste into email, Slack, or a designer brief. Includes a link back to this exact spec.
        </p>
        <textarea
          readOnly
          value={message}
          rows={11}
          className="tabular mt-3 w-full resize-y rounded-md border border-sage-200 bg-sage-50/60 p-3 text-xs text-ink focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-200"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-sage-200 bg-white px-3 py-2 text-sm hover:border-warm-400"
          >
            {copied ? "Copied!" : "Copy message"}
          </button>
          <a
            href={mailtoHref}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-sage-200 bg-white px-3 py-2 text-sm hover:border-warm-400"
          >
            <Mail className="h-4 w-4" aria-hidden /> Open in email
          </a>
        </div>
      </div>
    </details>
  );
}

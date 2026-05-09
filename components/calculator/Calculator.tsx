"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calcCover, type CoverInput, type Format, type Paper } from "@kdp/calc";
import {
  FORMAT_LABEL,
  PAPER_LABEL,
  pageCountBounds,
  paperOptionsForFormat,
  trimsForFormat,
} from "@kdp/limits";
import { decodeState, encodeState } from "@kdp/share";
import { CoverDiagram } from "./CoverDiagram";
import { EmbedSnippet } from "./EmbedSnippet";
import { ShareButton } from "./ShareButton";
import { pageBucket, track } from "@/lib/analytics/track";
import { Copy, Download } from "lucide-react";
import { clsx } from "clsx";

type Props = {
  initial?: Partial<CoverInput>;
  /** Compact = no copy/embed/share row + tighter spacing (used in /embed and extension). */
  compact?: boolean;
  /** Suppress URL hash sync (used inside iframe / extension). */
  silent?: boolean;
};

const DEFAULT: CoverInput = {
  format: "paperback",
  paper: "white",
  pageCount: 200,
  trimWidthIn: 6,
  trimHeightIn: 9,
};

export function Calculator({ initial, compact, silent }: Props) {
  const [state, setState] = useState<CoverInput>(() => ({ ...DEFAULT, ...initial }));
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from URL hash once on mount.
  useEffect(() => {
    if (silent) {
      setHydrated(true);
      return;
    }
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const code = params.get("s");
    if (code) {
      const decoded = decodeState(code);
      if (decoded) setState(decoded);
    }
    setHydrated(true);
  }, [silent]);

  // Debounced hash sync.
  const hashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated || silent) return;
    if (hashTimer.current) clearTimeout(hashTimer.current);
    hashTimer.current = setTimeout(() => {
      const code = encodeState(state);
      const newHash = `#s=${code}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${newHash}`);
      }
    }, 100);
    return () => {
      if (hashTimer.current) clearTimeout(hashTimer.current);
    };
  }, [state, hydrated, silent]);

  const out = useMemo(() => calcCover(state), [state]);
  const calcFiredRef = useRef(false);
  useEffect(() => {
    if (!hydrated || calcFiredRef.current) return;
    calcFiredRef.current = true;
    track({
      name: "calculate",
      props: {
        format: state.format,
        paper: state.paper,
        pageBucket: pageBucket(state.pageCount),
      },
    });
  }, [hydrated, state.format, state.paper, state.pageCount]);

  const trims = trimsForFormat(state.format);
  const papers = paperOptionsForFormat(state.format);
  const bounds = pageCountBounds(state.format);

  const setFormat = (format: Format) => {
    setState((s) => {
      const next = { ...s, format };
      const allowedTrims = trimsForFormat(format);
      if (!allowedTrims.some((t) => t.widthIn === s.trimWidthIn && t.heightIn === s.trimHeightIn)) {
        next.trimWidthIn = allowedTrims[0].widthIn;
        next.trimHeightIn = allowedTrims[0].heightIn;
      }
      const b = pageCountBounds(format);
      next.pageCount = Math.min(b.max, Math.max(b.min, s.pageCount));
      return next;
    });
  };

  const setPaper = (paper: Paper) => setState((s) => ({ ...s, paper }));
  const setPages = (n: number) =>
    setState((s) => ({
      ...s,
      pageCount: Math.min(bounds.max, Math.max(bounds.min, Math.round(n))),
    }));
  const setTrim = (slug: string) => {
    if (slug === "custom") return;
    const found = trims.find((t) => t.slug === slug);
    if (found)
      setState((s) => ({
        ...s,
        trimWidthIn: found.widthIn,
        trimHeightIn: found.heightIn,
      }));
  };

  const currentTrimSlug =
    trims.find((t) => t.widthIn === state.trimWidthIn && t.heightIn === state.trimHeightIn)?.slug ?? "custom";

  const copyValues = async () => {
    const text = `Spine width: ${out.spineWidthIn}″ (${out.spineWidthMm} mm)\nFull cover: ${out.fullCoverWidthIn}″ × ${out.fullCoverHeightIn}″ (${out.fullCoverWidthMm} mm × ${out.fullCoverHeightMm} mm)`;
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className={clsx("grid gap-6", compact ? "" : "lg:grid-cols-[1.1fr_1fr]")}>
      <div className={clsx("rounded-card border border-sage-200 bg-white p-5 sm:p-6", compact && "p-4")}>
        <Fieldset legend="Format">
          <SegmentedControl
            value={state.format}
            onChange={setFormat}
            options={[
              { value: "paperback", label: FORMAT_LABEL.paperback },
              { value: "hardcover", label: FORMAT_LABEL.hardcover },
            ]}
          />
        </Fieldset>

        <Fieldset legend="Paper">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {papers.map((p) => (
              <RadioCard
                key={p}
                checked={state.paper === p}
                label={PAPER_LABEL[p]}
                onChange={() => setPaper(p)}
              />
            ))}
          </div>
        </Fieldset>

        <Fieldset legend="Trim size">
          <select
            value={currentTrimSlug}
            onChange={(e) => setTrim(e.target.value)}
            className="w-full rounded-md border border-sage-200 bg-white px-3 py-2 text-sm focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-200"
          >
            {trims.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
            <option value="custom">Custom…</option>
          </select>
          {currentTrimSlug === "custom" && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <NumberInput
                label="Width (in)"
                value={state.trimWidthIn}
                step={0.01}
                min={3}
                max={12}
                onChange={(v) => setState((s) => ({ ...s, trimWidthIn: v }))}
              />
              <NumberInput
                label="Height (in)"
                value={state.trimHeightIn}
                step={0.01}
                min={3}
                max={14}
                onChange={(v) => setState((s) => ({ ...s, trimHeightIn: v }))}
              />
            </div>
          )}
        </Fieldset>

        <Fieldset legend={`Page count (${bounds.min}–${bounds.max})`}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={bounds.min}
              max={bounds.max}
              value={state.pageCount}
              onChange={(e) => setPages(Number(e.target.value))}
              className="flex-1 accent-warm-400"
            />
            <input
              type="number"
              min={bounds.min}
              max={bounds.max}
              value={state.pageCount}
              onChange={(e) => setPages(Number(e.target.value))}
              className="tabular w-24 rounded-md border border-sage-200 bg-white px-3 py-2 text-right text-sm focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-200"
            />
          </div>
        </Fieldset>
      </div>

      <div className={clsx("flex flex-col gap-4")}>
        <div className="rounded-card border border-sage-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-sage-700">Spine width</div>
              <div className="tabular font-display text-4xl">
                {out.spineWidthIn.toFixed(4)}
                <span className="ml-1 text-base text-sage-700">in</span>
              </div>
              <div className="tabular text-sm text-sage-700">{out.spineWidthMm.toFixed(2)} mm</div>
            </div>
            <SpineTextBadge eligible={out.spineTextEligible} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-sage-700">Full cover (in)</dt>
            <dd className="tabular text-right">
              {out.fullCoverWidthIn.toFixed(4)} × {out.fullCoverHeightIn.toFixed(4)}
            </dd>
            <dt className="text-sage-700">Full cover (mm)</dt>
            <dd className="tabular text-right">
              {out.fullCoverWidthMm.toFixed(2)} × {out.fullCoverHeightMm.toFixed(2)}
            </dd>
          </dl>

          <CoverDiagram input={state} output={out} className="mt-5" />

          {!compact && (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyValues}
                className="inline-flex items-center gap-1.5 rounded-md border border-sage-200 bg-white px-3 py-2 text-sm hover:border-warm-400"
              >
                <Copy className="h-4 w-4" aria-hidden /> Copy values
              </button>
              <ShareButton state={state} />
              <DownloadSvgButton input={state} />
            </div>
          )}
        </div>

        {!compact && <EmbedSnippet />}
      </div>
    </div>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="mb-4">
      <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-sage-700">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div role="radiogroup" className="inline-flex rounded-md bg-sage-100 p-1">
      {options.map((o) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === o.value}
          key={o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            value === o.value ? "bg-white shadow-sm" : "text-sage-800 hover:text-warm-500",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function RadioCard({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={clsx(
        "cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors",
        checked
          ? "border-warm-400 bg-warm-50 text-ink"
          : "border-sage-200 bg-white hover:border-sage-300",
      )}
    >
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}

function NumberInput({
  label,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="text-xs">
      <span className="block text-sage-700">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="tabular mt-1 w-full rounded-md border border-sage-200 bg-white px-3 py-2 text-sm focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-200"
      />
    </label>
  );
}

function SpineTextBadge({ eligible }: { eligible: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        eligible
          ? "bg-sage-100 text-sage-800"
          : "bg-warm-50 text-warm-700",
      )}
    >
      {eligible ? "Spine text OK" : "Spine too narrow for text"}
    </span>
  );
}

function DownloadSvgButton({ input }: { input: CoverInput }) {
  const onClick = () => {
    track({ name: "template_downloaded", props: { format: input.format } });
    const out = calcCover(input);
    const svg = templateSvg({ input, out });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kdp-${input.format}-${input.paper}-${input.pageCount}p.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-sage-200 bg-white px-3 py-2 text-sm hover:border-warm-400"
    >
      <Download className="h-4 w-4" aria-hidden /> Download SVG template
    </button>
  );
}

function templateSvg({
  input,
  out,
}: {
  input: CoverInput;
  out: ReturnType<typeof calcCover>;
}): string {
  const w = out.fullCoverWidthIn * 72;
  const h = out.fullCoverHeightIn * 72;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <title>KDP ${input.format} ${input.paper} ${input.pageCount}p ${input.trimWidthIn}x${input.trimHeightIn} template</title>
  <rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="black" stroke-width="1"/>
</svg>`;
}

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
import { buildTemplateSvg } from "@kdp/svg-template";
import { CoverDiagram } from "./CoverDiagram";
import { EmbedSnippet } from "./EmbedSnippet";
import { HandoffBlock } from "./HandoffBlock";
import { ShareButton } from "./ShareButton";
import { TemplateUpsell } from "./TemplateUpsell";
import { pageBucket, track } from "@/lib/analytics/track";
import { AlertTriangle, Code, Copy, Download, Minus, Plus, RotateCcw } from "lucide-react";
import { clsx } from "clsx";

type Unit = "in" | "mm";

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

const NOTICE_MS = 3500;
const CALCULATE_DEBOUNCE_MS = 500;

export function Calculator({ initial, compact, silent }: Props) {
  const [state, setState] = useState<CoverInput>(() => ({ ...DEFAULT, ...initial }));
  const [hydrated, setHydrated] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [unit, setUnit] = useState<Unit>("in");
  const [copiedValues, setCopiedValues] = useState(false);

  // Tracks whether the user has interacted with any input (or arrived with
  // a populated share hash). Hash sync is gated on this so a fresh visit
  // to "/" stays clean — no auto-generated `#s=...` polluting the URL.
  const userTouched = useRef(false);

  // Hydrate from URL hash once on mount.
  useEffect(() => {
    if (silent) {
      setHydrated(true);
      return;
    }
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const params = new URLSearchParams(hash);
      const code = params.get("s");
      if (code) {
        const decoded = decodeState(code);
        if (decoded) {
          setState(decoded);
          // Existing hash → keep it in sync as the user makes changes.
          userTouched.current = true;
        }
      }
    }
    setHydrated(true);
  }, [silent]);

  // After hydration, sync customMode if the loaded trim isn't a preset.
  useEffect(() => {
    if (!hydrated) return;
    const isPreset = trimsForFormat(state.format).some(
      (t) => t.widthIn === state.trimWidthIn && t.heightIn === state.trimHeightIn,
    );
    if (!isPreset) setCustomMode(true);
    // Intentionally only re-run when hydration flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Debounced hash sync — only runs after the user has actually touched
  // an input (or arrived with a hash). A fresh "/" load stays clean.
  const hashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated || silent) return;
    if (!userTouched.current) return;
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

  // Auto-clear notices.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(t);
  }, [notice]);

  // Debounced `calculate` event — fires per settled change so funnels stay measurable.
  const calcEventTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstCalcDispatched = useRef(false);
  useEffect(() => {
    if (!hydrated) return;
    if (calcEventTimer.current) clearTimeout(calcEventTimer.current);
    calcEventTimer.current = setTimeout(() => {
      track({
        name: "calculate",
        props: {
          format: state.format,
          paper: state.paper,
          pageBucket: pageBucket(state.pageCount),
        },
      });
      if (!firstCalcDispatched.current) {
        firstCalcDispatched.current = true;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("kdpcover:calculated"));
        }
      }
    }, CALCULATE_DEBOUNCE_MS);
    return () => {
      if (calcEventTimer.current) clearTimeout(calcEventTimer.current);
    };
  }, [hydrated, state.format, state.paper, state.pageCount, state.trimWidthIn, state.trimHeightIn]);

  const trims = trimsForFormat(state.format);
  const papers = paperOptionsForFormat(state.format);
  const bounds = pageCountBounds(state.format);

  const setFormat = (format: Format) => {
    if (format === state.format) return;
    userTouched.current = true;
    setState((s) => {
      const next = { ...s, format };
      const allowedTrims = trimsForFormat(format);
      const trimStillValid = allowedTrims.some(
        (t) => t.widthIn === s.trimWidthIn && t.heightIn === s.trimHeightIn,
      );
      if (!trimStillValid && !customMode) {
        next.trimWidthIn = allowedTrims[0].widthIn;
        next.trimHeightIn = allowedTrims[0].heightIn;
        setNotice(
          `${s.trimWidthIn}″ × ${s.trimHeightIn}″ isn't supported on ${FORMAT_LABEL[format].toLowerCase()} — switched to ${allowedTrims[0].label}.`,
        );
      }
      const b = pageCountBounds(format);
      const clampedPages = Math.min(b.max, Math.max(b.min, s.pageCount));
      if (clampedPages !== s.pageCount) {
        next.pageCount = clampedPages;
        setNotice(
          `${FORMAT_LABEL[format]} supports ${b.min}–${b.max} pages — adjusted to ${clampedPages}.`,
        );
      }
      return next;
    });
    track({ name: "format_changed", props: { format } });
  };

  const setPaper = (paper: Paper) => {
    if (paper === state.paper) return;
    userTouched.current = true;
    setState((s) => ({ ...s, paper }));
    track({ name: "paper_changed", props: { paper } });
  };

  const setPages = (raw: number) => {
    if (!Number.isFinite(raw)) return;
    const rounded = Math.round(raw);
    const clamped = Math.min(bounds.max, Math.max(bounds.min, rounded));
    if (clamped !== rounded) {
      setNotice(
        `${FORMAT_LABEL[state.format]} supports ${bounds.min}–${bounds.max} pages — clamped to ${clamped}.`,
      );
    }
    if (clamped === state.pageCount) return;
    userTouched.current = true;
    setState((s) => ({ ...s, pageCount: clamped }));
  };

  const setTrim = (slug: string) => {
    if (slug === "custom") {
      setCustomMode(true);
      return;
    }
    setCustomMode(false);
    const found = trims.find((t) => t.slug === slug);
    if (found) {
      userTouched.current = true;
      setState((s) => ({
        ...s,
        trimWidthIn: found.widthIn,
        trimHeightIn: found.heightIn,
      }));
    }
  };

  const matchedPreset = trims.find(
    (t) => t.widthIn === state.trimWidthIn && t.heightIn === state.trimHeightIn,
  );
  const currentTrimSlug = customMode || !matchedPreset ? "custom" : matchedPreset.slug;

  const copyValues = async () => {
    const text = `Spine width: ${out.spineWidthIn}″ (${out.spineWidthMm} mm)\nFull cover: ${out.fullCoverWidthIn}″ × ${out.fullCoverHeightIn}″ (${out.fullCoverWidthMm} mm × ${out.fullCoverHeightMm} mm)`;
    await navigator.clipboard.writeText(text);
    setCopiedValues(true);
    setTimeout(() => setCopiedValues(false), 1800);
  };

  const resetDefaults = () => {
    userTouched.current = true;
    setState({ ...DEFAULT, ...initial });
    setCustomMode(false);
    setNotice("Reset to defaults.");
  };

  const adjustPages = (delta: number) => setPages(state.pageCount + delta);

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
            ariaLabel="Format"
          />
        </Fieldset>

        <Fieldset legend="Paper">
          <div role="radiogroup" aria-label="Paper" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                onChange={(v) => {
                  userTouched.current = true;
                  setState((s) => ({ ...s, trimWidthIn: v }));
                }}
              />
              <NumberInput
                label="Height (in)"
                value={state.trimHeightIn}
                step={0.01}
                min={3}
                max={14}
                onChange={(v) => {
                  userTouched.current = true;
                  setState((s) => ({ ...s, trimHeightIn: v }));
                }}
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
              aria-label="Page count slider"
            />
            <div className="flex items-stretch overflow-hidden rounded-md border border-sage-200 bg-white">
              <button
                type="button"
                onClick={() => adjustPages(-1)}
                disabled={state.pageCount <= bounds.min}
                aria-label="Decrease page count by 1"
                className="flex h-11 w-11 items-center justify-center text-sage-700 hover:bg-sage-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <input
                type="number"
                min={bounds.min}
                max={bounds.max}
                value={state.pageCount}
                onChange={(e) => setPages(Number(e.target.value))}
                className="tabular w-20 border-x border-sage-200 bg-white px-2 text-center text-sm focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-200"
                aria-label="Page count"
              />
              <button
                type="button"
                onClick={() => adjustPages(1)}
                disabled={state.pageCount >= bounds.max}
                aria-label="Increase page count by 1"
                className="flex h-11 w-11 items-center justify-center text-sage-700 hover:bg-sage-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </Fieldset>

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="mt-2 flex items-start gap-2 rounded-md border border-warm-200 bg-warm-100 px-3 py-2 text-xs text-warm-700"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{notice}</span>
          </div>
        )}
      </div>

      <div className={clsx("flex flex-col gap-4")}>
        <div className="rounded-card border border-sage-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="text-xs uppercase tracking-wide text-sage-700">Spine width</div>
                <UnitToggle unit={unit} onChange={setUnit} />
              </div>
              <div className="tabular font-display text-4xl">
                {unit === "in" ? out.spineWidthIn.toFixed(4) : out.spineWidthMm.toFixed(2)}
                <span className="ml-1 text-base text-sage-700">{unit}</span>
              </div>
              <div className="tabular text-sm text-sage-700">
                {unit === "in"
                  ? `${out.spineWidthMm.toFixed(2)} mm`
                  : `${out.spineWidthIn.toFixed(4)} in`}
              </div>
            </div>
            <SpineTextBadge eligible={out.spineTextEligible} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-sage-700">Full cover</dt>
            <dd className="tabular text-right">
              {unit === "in"
                ? `${out.fullCoverWidthIn.toFixed(4)} × ${out.fullCoverHeightIn.toFixed(4)} in`
                : `${out.fullCoverWidthMm.toFixed(2)} × ${out.fullCoverHeightMm.toFixed(2)} mm`}
            </dd>
            <dt className="text-sage-700">Other unit</dt>
            <dd className="tabular text-right text-sage-700">
              {unit === "in"
                ? `${out.fullCoverWidthMm.toFixed(2)} × ${out.fullCoverHeightMm.toFixed(2)} mm`
                : `${out.fullCoverWidthIn.toFixed(4)} × ${out.fullCoverHeightIn.toFixed(4)} in`}
            </dd>
          </dl>

          <CoverDiagram input={state} output={out} className="mt-5" />

          {out.warnings.length > 0 && (
            <ul className="mt-4 space-y-1.5" aria-label="Calculator warnings">
              {out.warnings.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md border border-warm-200 bg-warm-50/60 px-3 py-2 text-xs text-warm-700"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}

          {!compact && (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyValues}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-sage-200 bg-white px-3 py-2 text-sm hover:border-warm-400"
              >
                <Copy className="h-4 w-4" aria-hidden />
                {copiedValues ? "Copied!" : "Copy values"}
              </button>
              <ShareButton state={state} />
              <DownloadSvgButton input={state} />
              <button
                type="button"
                onClick={() => setEmbedOpen((o) => !o)}
                aria-expanded={embedOpen}
                aria-controls="embed-snippet-panel"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-sage-200 bg-white px-3 py-2 text-sm hover:border-warm-400"
              >
                <Code className="h-4 w-4" aria-hidden /> Embed
              </button>
              <button
                type="button"
                onClick={resetDefaults}
                className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-2 text-sm text-sage-700 hover:text-warm-500"
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> Reset
              </button>
            </div>
          )}
        </div>

        {!compact && <TemplateUpsell input={state} output={out} />}
        {!compact && <HandoffBlock input={state} output={out} />}
        {!compact && <EmbedSnippet open={embedOpen} onOpenChange={setEmbedOpen} />}
      </div>
    </div>
  );
}

function UnitToggle({ unit, onChange }: { unit: Unit; onChange: (u: Unit) => void }) {
  return (
    <div role="radiogroup" aria-label="Display unit" className="inline-flex rounded-md bg-sage-100 p-0.5 text-xs">
      {(["in", "mm"] as const).map((u) => {
        const selected = unit === u;
        return (
          <button
            key={u}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(u)}
            className={clsx(
              "rounded-md px-2 py-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-200",
              selected ? "bg-white text-ink shadow-sm" : "text-sage-700 hover:text-warm-500",
            )}
          >
            {u}
          </button>
        );
      })}
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
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    let nextIdx = idx;
    if (e.key === "ArrowLeft") nextIdx = (idx - 1 + options.length) % options.length;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % options.length;
    if (e.key === "Home") nextIdx = 0;
    if (e.key === "End") nextIdx = options.length - 1;
    onChange(options[nextIdx].value);
    refs.current[nextIdx]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-md bg-sage-100 p-1">
      {options.map((o, i) => {
        const selected = value === o.value;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-200",
              selected ? "bg-white shadow-sm" : "text-sage-800 hover:text-warm-500",
            )}
          >
            {o.label}
          </button>
        );
      })}
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
          ? "border-sage-400 bg-sage-50 text-ink"
          : "border-sage-200 bg-white hover:border-sage-300",
      )}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        aria-label={label}
      />
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={clsx(
            "inline-block h-2.5 w-2.5 rounded-full border",
            checked ? "border-sage-500 bg-sage-500" : "border-sage-300 bg-white",
          )}
        />
        {label}
      </span>
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
  if (eligible) {
    return (
      <span className="inline-flex items-center rounded-full bg-sage-100 px-2.5 py-1 text-xs font-medium text-sage-800">
        Spine text OK
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warm-100 px-2.5 py-1 text-xs font-medium text-warm-700">
      <AlertTriangle className="h-3 w-3" aria-hidden />
      Spine too narrow — needs ≥79 pages
    </span>
  );
}

function DownloadSvgButton({ input }: { input: CoverInput }) {
  const onClick = () => {
    track({ name: "template_downloaded", props: { format: input.format } });
    const svg = buildTemplateSvg(input);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kdp-${input.format}-${input.paper}-${input.pageCount}p-${input.trimWidthIn}x${input.trimHeightIn}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-sage-200 bg-white px-3 py-2 text-sm hover:border-warm-400"
    >
      <Download className="h-4 w-4" aria-hidden /> Download SVG template
    </button>
  );
}

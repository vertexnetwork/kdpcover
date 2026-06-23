"use client";

import { clsx } from "clsx";
import type { CoverInput, Format, Paper } from "@kdp/calc";
import {
  FORMAT_LABEL,
  PAPER_LABEL,
  pageCountBounds,
  paperOptionsForFormat,
  trimsForFormat,
} from "@kdp/limits";

// Standalone book-spec controls for the Pass-Check tool (format / paper / trim /
// page count). Deliberately self-contained rather than shared with
// Calculator.tsx — the calculator's controls are private inner components and
// refactoring the highest-traffic file under this feature wasn't worth the
// regression risk. Logic is intentionally simple: clamp on format change, no
// toast notices. One source of truth for the *values* (lib/kdp/limits) is kept.

type Props = {
  value: CoverInput;
  onChange: (next: CoverInput) => void;
};

export function BookSpecInputs({ value, onChange }: Props) {
  const trims = trimsForFormat(value.format);
  const papers = paperOptionsForFormat(value.format);
  const bounds = pageCountBounds(value.format);

  const matchedPreset = trims.find(
    (t) => t.widthIn === value.trimWidthIn && t.heightIn === value.trimHeightIn,
  );
  const currentTrimSlug = matchedPreset ? matchedPreset.slug : "custom";

  const setFormat = (format: Format) => {
    if (format === value.format) return;
    const next: CoverInput = { ...value, format };
    const allowed = trimsForFormat(format);
    const trimOk = allowed.some(
      (t) => t.widthIn === value.trimWidthIn && t.heightIn === value.trimHeightIn,
    );
    if (!trimOk) {
      next.trimWidthIn = allowed[0].widthIn;
      next.trimHeightIn = allowed[0].heightIn;
    }
    const b = pageCountBounds(format);
    next.pageCount = Math.min(b.max, Math.max(b.min, value.pageCount));
    onChange(next);
  };

  const setPaper = (paper: Paper) => onChange({ ...value, paper });

  const setPages = (raw: number) => {
    if (!Number.isFinite(raw)) return;
    const clamped = Math.min(bounds.max, Math.max(bounds.min, Math.round(raw)));
    onChange({ ...value, pageCount: clamped });
  };

  const setTrim = (slug: string) => {
    if (slug === "custom") return;
    const found = trims.find((t) => t.slug === slug);
    if (found) onChange({ ...value, trimWidthIn: found.widthIn, trimHeightIn: found.heightIn });
  };

  return (
    <div className="space-y-4">
      <Field legend="Format">
        <div role="radiogroup" aria-label="Format" className="inline-flex rounded-md bg-sage-100 p-1">
          {(["paperback", "hardcover"] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={value.format === f}
              onClick={() => setFormat(f)}
              className={clsx(
                "rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-200",
                value.format === f ? "bg-white shadow-sm" : "text-sage-800 hover:text-warm-500",
              )}
            >
              {FORMAT_LABEL[f]}
            </button>
          ))}
        </div>
      </Field>

      <Field legend="Paper">
        <div role="radiogroup" aria-label="Paper" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {papers.map((p) => (
            <label
              key={p}
              className={clsx(
                "cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors",
                value.paper === p
                  ? "border-sage-400 bg-sage-50 text-ink"
                  : "border-sage-200 bg-white hover:border-sage-300",
              )}
            >
              <input
                type="radio"
                checked={value.paper === p}
                onChange={() => setPaper(p)}
                className="sr-only"
                aria-label={PAPER_LABEL[p]}
              />
              {PAPER_LABEL[p]}
            </label>
          ))}
        </div>
      </Field>

      <Field legend="Trim size">
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
            <NumberField
              label="Width (in)"
              value={value.trimWidthIn}
              step={0.01}
              onChange={(v) => onChange({ ...value, trimWidthIn: v })}
            />
            <NumberField
              label="Height (in)"
              value={value.trimHeightIn}
              step={0.01}
              onChange={(v) => onChange({ ...value, trimHeightIn: v })}
            />
          </div>
        )}
      </Field>

      <Field legend={`Page count (${bounds.min}–${bounds.max})`}>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            value={value.pageCount}
            onChange={(e) => setPages(Number(e.target.value))}
            className="flex-1 accent-warm-400"
            aria-label="Page count slider"
          />
          <input
            type="number"
            min={bounds.min}
            max={bounds.max}
            value={value.pageCount}
            onChange={(e) => setPages(Number(e.target.value))}
            className="tabular w-20 rounded-md border border-sage-200 bg-white px-2 py-1.5 text-center text-sm focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-200"
            aria-label="Page count"
          />
        </div>
      </Field>
    </div>
  );
}

function Field({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-sage-700">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function NumberField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="text-xs">
      <span className="block text-sage-700">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="tabular mt-1 w-full rounded-md border border-sage-200 bg-white px-3 py-2 text-sm focus:border-warm-400 focus:outline-none focus:ring-2 focus:ring-warm-200"
      />
    </label>
  );
}

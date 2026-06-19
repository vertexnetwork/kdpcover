"use client";

import { useMemo, useState } from "react";
import { calcCover, type CoverInput } from "@kdp/calc";
import { CheckCircle2, AlertTriangle, XCircle, Download, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { analyzeFile } from "@/lib/preflight/analyze";
import { evaluatePreflight } from "@/lib/preflight/evaluate";
import type { CheckStatus, FileAnalysis, PreflightReport } from "@/lib/preflight/types";
import { track } from "@/lib/analytics/track";
import { BookSpecInputs } from "./BookSpecInputs";
import { FileDropzone } from "./FileDropzone";
import { ReportCard } from "./ReportCard";

const DEFAULT: CoverInput = {
  format: "paperback",
  paper: "white",
  pageCount: 200,
  trimWidthIn: 6,
  trimHeightIn: 9,
};

type Item = { name: string; analysis: FileAnalysis };

const ICON = { pass: CheckCircle2, warn: AlertTriangle, fail: XCircle } as const;
const TONE: Record<CheckStatus, string> = {
  pass: "text-sage-700",
  warn: "text-warm-600",
  fail: "text-danger",
};

function counts(report: PreflightReport) {
  const c = { pass: 0, warn: 0, fail: 0 };
  for (const chk of report.checks) if (!chk.advisory) c[chk.status] += 1;
  return c;
}

export function BatchTable() {
  const [input, setInput] = useState<CoverInput>(DEFAULT);
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const rows = useMemo(
    () =>
      items.map((it) => ({
        name: it.name,
        report: evaluatePreflight(it.analysis, calcCover(input), input),
      })),
    [items, input],
  );

  const handleFiles = async (files: File[]) => {
    setBusy(true);
    try {
      const analyzed: Item[] = [];
      for (const file of files) {
        analyzed.push({ name: file.name, analysis: await analyzeFile(file) });
      }
      setItems((prev) => [...prev, ...analyzed]);
      // One rollup event per drop — worst verdict across the batch.
      const worst = analyzed
        .map((it) => evaluatePreflight(it.analysis, calcCover(input), input).overall)
        .reduce<CheckStatus>(
          (acc, o) => (acc === "fail" || o === "fail" ? "fail" : o === "warn" ? "warn" : acc),
          "pass",
        );
      track({ name: "passcheck_run", props: { kind: "batch", overall: worst, tier: "studio" } });
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const header = ["file", "overall", "pass", "warn", "fail"];
    const lines = [header.join(",")];
    for (const r of rows) {
      const c = counts(r.report);
      lines.push(
        [`"${r.name.replace(/"/g, '""')}"`, r.report.overall, c.pass, c.warn, c.fail].join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pass-check-batch.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-sage-200 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg">Batch spec</h2>
        <p className="mb-4 mt-1 text-sm text-sage-700">
          Every file in a batch is checked against this spec — run one batch per trim/paper if your
          titles differ.
        </p>
        <BookSpecInputs value={input} onChange={setInput} />
      </div>

      <FileDropzone onFiles={handleFiles} multiple disabled={busy} />
      {busy && <p className="text-sm text-sage-700">Checking files…</p>}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-card border border-sage-200 bg-white">
          <div className="flex items-center justify-between border-b border-sage-100 px-4 py-3">
            <p className="text-sm font-medium">
              {rows.length} file{rows.length === 1 ? "" : "s"} ·{" "}
              {rows.filter((r) => r.report.overall === "fail").length} failing
            </p>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-md border border-sage-200 px-3 py-1.5 text-xs hover:border-warm-400"
            >
              <Download className="h-3.5 w-3.5" aria-hidden /> Export CSV
            </button>
          </div>
          <ul className="divide-y divide-sage-100">
            {rows
              .map((r, i) => ({ r, i }))
              .sort((a, b) => weight(b.r.report.overall) - weight(a.r.report.overall))
              .map(({ r, i }) => {
                const Icon = ICON[r.report.overall];
                const c = counts(r.report);
                const isOpen = open.has(i);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sage-50/50"
                    >
                      <Icon className={clsx("h-4 w-4 shrink-0", TONE[r.report.overall])} aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-sm">{r.name}</span>
                      <span className="hidden text-xs text-sage-700 sm:inline">
                        {c.fail} fail · {c.warn} warn · {c.pass} pass
                      </span>
                      <ChevronDown
                        className={clsx("h-4 w-4 text-sage-600 transition-transform", isOpen && "rotate-180")}
                        aria-hidden
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        <ReportCard report={r.report} fileName={r.name} />
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}

function weight(s: CheckStatus): number {
  return s === "fail" ? 2 : s === "warn" ? 1 : 0;
}

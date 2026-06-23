"use client";

import { useEffect, useMemo, useState } from "react";
import { calcCover, type CoverInput } from "@kdp/calc";
import { analyzeFile } from "@/lib/preflight/analyze";
import { evaluatePreflight } from "@/lib/preflight/evaluate";
import type { FileAnalysis } from "@/lib/preflight/types";
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

const STORAGE_KEY = "kc:pf:v1";

export function PreflightTool() {
  const [input, setInput] = useState<CoverInput>(DEFAULT);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);

  // Restore the last book spec.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInput({ ...DEFAULT, ...(JSON.parse(raw) as Partial<CoverInput>) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    } catch {
      /* ignore */
    }
  }, [input]);

  // The report re-derives whenever the file analysis OR the book spec changes.
  const report = useMemo(
    () => (analysis ? evaluatePreflight(analysis, calcCover(input), input) : null),
    [analysis, input],
  );

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setFileName(file.name);
    try {
      const a = await analyzeFile(file);
      setAnalysis(a);
      const r = evaluatePreflight(a, calcCover(input), input);
      track({ name: "passcheck_run", props: { kind: a.kind, overall: r.overall, tier: "author" } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-card border border-sage-200 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg">1. Your book</h2>
        <p className="mb-4 mt-1 text-sm text-sage-700">
          Set these to match your KDP listing — the check compares your file to this exact spec.
        </p>
        <BookSpecInputs value={input} onChange={setInput} />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="mb-3 font-display text-lg">2. Your finished cover</h2>
          <FileDropzone onFiles={handleFiles} disabled={busy} />
        </div>
        {busy && <p className="text-sm text-sage-700">Checking your file…</p>}
        {report && !busy && <ReportCard report={report} fileName={fileName} />}
      </div>
    </div>
  );
}

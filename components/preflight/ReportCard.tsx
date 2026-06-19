import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { clsx } from "clsx";
import type { CheckStatus, PreflightCheck, PreflightReport } from "@/lib/preflight/types";

// Pure presentational report. No client hooks, so it doubles as the static
// sample on the public landing page.

const STATUS_ICON = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
} as const;

const STATUS_TONE: Record<CheckStatus, string> = {
  pass: "text-sage-700",
  warn: "text-warm-600",
  fail: "text-danger",
};

const OVERALL: Record<CheckStatus, { title: string; sub: string; band: string }> = {
  pass: {
    title: "Looks ready to upload",
    sub: "Every automated check passed. Review the advisory notes below, then submit to KDP.",
    band: "border-sage-300 bg-sage-50 text-sage-800",
  },
  warn: {
    title: "A few things to fix first",
    sub: "Not an automatic rejection, but worth correcting before you upload.",
    band: "border-warm-300 bg-warm-50 text-warm-700",
  },
  fail: {
    title: "KDP will likely reject this",
    sub: "At least one hard requirement isn't met. Fix the items below and re-check.",
    band: "border-danger/40 bg-warm-50 text-danger",
  },
};

function CheckRow({ check }: { check: PreflightCheck }) {
  const Icon = STATUS_ICON[check.status];
  return (
    <li className="flex items-start gap-3 py-2.5">
      <Icon className={clsx("mt-0.5 h-4 w-4 shrink-0", STATUS_TONE[check.status])} aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{check.label}</p>
        <p className="text-sm text-sage-800">{check.detail}</p>
        {check.fix && check.status !== "pass" && (
          <p className="mt-0.5 text-xs text-warm-700">Fix: {check.fix}</p>
        )}
      </div>
    </li>
  );
}

export function ReportCard({ report, fileName }: { report: PreflightReport; fileName?: string }) {
  const auto = report.checks.filter((c) => !c.advisory);
  const advisory = report.checks.filter((c) => c.advisory);
  const o = OVERALL[report.overall];

  return (
    <div className="overflow-hidden rounded-card border border-sage-200 bg-white">
      <div className={clsx("border-b px-5 py-4", o.band)}>
        <div className="flex items-center gap-2">
          {(() => {
            const Icon = STATUS_ICON[report.overall];
            return <Icon className="h-5 w-5 shrink-0" aria-hidden />;
          })()}
          <p className="font-display text-lg">{o.title}</p>
        </div>
        <p className="mt-1 text-sm opacity-90">{o.sub}</p>
        {fileName && <p className="mt-1 truncate text-xs opacity-70">{fileName}</p>}
      </div>

      <ul className="divide-y divide-sage-100 px-5">
        {auto.map((c) => (
          <CheckRow key={c.id} check={c} />
        ))}
      </ul>

      {advisory.length > 0 && (
        <div className="border-t border-sage-100 bg-sage-50/40 px-5 py-3">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-sage-700">
            <Info className="h-3.5 w-3.5" aria-hidden />
            Can&rsquo;t auto-verify — confirm these yourself
          </p>
          <ul className="mt-1 divide-y divide-sage-100">
            {advisory.map((c) => (
              <CheckRow key={c.id} check={c} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

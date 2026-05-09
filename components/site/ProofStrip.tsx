import { siteFacts } from "@/lib/content/site-facts";
import { ShieldCheck, Lock, FileCode } from "lucide-react";

const ICONS = [ShieldCheck, Lock, FileCode] as const;

export function ProofStrip() {
  return (
    <section
      aria-label="Why this calculator is trustworthy"
      className="mt-10 grid gap-4 sm:grid-cols-3"
    >
      {siteFacts.proof.map((item, i) => {
        const Icon = ICONS[i] ?? ShieldCheck;
        return (
          <div
            key={item.label}
            className="rounded-card border border-sage-200 bg-white p-5"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-sage-600" aria-hidden />
              <h3 className="text-sm font-medium uppercase tracking-wide text-sage-700">
                {item.label}
              </h3>
            </div>
            <p className="mt-2 text-sm text-sage-800">{item.detail}</p>
          </div>
        );
      })}
    </section>
  );
}

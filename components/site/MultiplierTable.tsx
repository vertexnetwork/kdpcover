import { siteFacts } from "@/lib/content/site-facts";

export function MultiplierTable() {
  return (
    <section aria-labelledby="multiplier-heading" className="mt-2">
      <h2 id="multiplier-heading" className="text-2xl">
        KDP spine multiplier reference
      </h2>
      <p className="mt-2 text-sm text-sage-800">
        Multiply your interior page count by the multiplier for your format and paper. Every value is verified against KDP&rsquo;s official cover-template generator.
      </p>
      <div className="mt-4 overflow-x-auto rounded-card border border-sage-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-sage-700">
              <th className="px-4 py-2 font-medium">Format</th>
              <th className="px-4 py-2 font-medium">Paper</th>
              <th className="px-4 py-2 text-right font-medium">Multiplier (in/page)</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {siteFacts.multipliers.map((m, i) => (
              <tr
                key={`${m.format}-${m.paper}`}
                className={i % 2 === 0 ? "bg-sage-50/40" : ""}
              >
                <td className="px-4 py-2 text-ink">{m.format}</td>
                <td className="px-4 py-2 text-sage-800">{m.paper}</td>
                <td className="px-4 py-2 text-right font-medium">{m.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import type { Dossier } from "@interdependency/shared";

function fmtUsd(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtBand(
  low: number,
  mode: number,
  high: number,
  unit: string
): string {
  if (unit === "USD") {
    return `${fmtUsd(low)} / ${fmtUsd(mode)} / ${fmtUsd(high)}`;
  }
  return `${low} / ${mode} / ${high} ${unit}`;
}

export function MetricsPanel({
  dossier,
  onUpdateAssumption,
}: {
  dossier: Dossier;
  onUpdateAssumption: (
    scenarioId: string,
    assumptionId: string,
    value: number
  ) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="border-b border-emerald-400/10 px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-400/60">
          Metrics · FAIR-shaped
        </p>
        <div className="mt-2 flex items-end gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Interdependency tier
            </div>
            <div className="text-3xl font-semibold tracking-tight text-emerald-300">
              {dossier.tier}
            </div>
          </div>
          <p className="mb-1 flex-1 text-[11px] leading-relaxed text-slate-400">
            {dossier.tierRationale}
          </p>
        </div>
        <p className="mt-2 font-mono text-[9px] text-slate-600">
          Mode: {dossier.mode} · Generated {new Date(dossier.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="space-y-3 px-4 py-3">
        {dossier.scenarios.map((sc) => (
          <article
            key={sc.id}
            className="border border-emerald-400/15 bg-black/35 px-3 py-3"
          >
            <h3 className="text-sm font-semibold text-white">{sc.name}</h3>
            <p className="mt-1 text-[11px] text-slate-400">
              <span className="text-emerald-300/80">Threat:</span> {sc.threat}
            </p>
            <p className="text-[11px] text-slate-400">
              <span className="text-emerald-300/80">Asset:</span> {sc.asset}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded border border-emerald-400/10 bg-[#04100c] px-2 py-2">
                <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  LEF (low / mode / high)
                </div>
                <div className="mt-1 font-mono text-xs text-emerald-200">
                  {fmtBand(sc.lef.low, sc.lef.mode, sc.lef.high, sc.lef.unit)}
                </div>
              </div>
              <div className="rounded border border-emerald-400/10 bg-[#04100c] px-2 py-2">
                <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  Loss mag (low / mode / high)
                </div>
                <div className="mt-1 font-mono text-xs text-amber-200">
                  {fmtBand(
                    sc.lossMag.low,
                    sc.lossMag.mode,
                    sc.lossMag.high,
                    sc.lossMag.unit
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                Assumptions
              </div>
              <ul className="mt-1 space-y-2">
                {sc.assumptions.map((a) => (
                  <li key={a.id} className="text-[11px]">
                    <div className="flex items-center justify-between gap-2 text-slate-300">
                      <span>{a.label}</span>
                      <span className="font-mono text-emerald-200/90">
                        {a.value} {a.unit}
                      </span>
                    </div>
                    {a.editable && (
                      <input
                        type="range"
                        min={0}
                        max={Math.max(a.value * 3, 100)}
                        step={a.unit.includes("%") ? 1 : Math.max(1, Math.round(a.value / 20) || 1)}
                        value={a.value}
                        onChange={(e) =>
                          onUpdateAssumption(
                            sc.id,
                            a.id,
                            Number(e.target.value)
                          )
                        }
                        className="mt-1 w-full accent-emerald-400"
                      />
                    )}
                    {a.note && (
                      <p className="mt-0.5 text-[10px] italic text-slate-500">
                        {a.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {sc.drivers.map((d) => (
                <span
                  key={d}
                  className="border border-emerald-400/20 px-1.5 py-0.5 font-mono text-[9px] text-emerald-300/80"
                >
                  {d}
                </span>
              ))}
            </div>
            {sc.residualNotes && (
              <p className="mt-2 text-[11px] text-slate-500">{sc.residualNotes}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

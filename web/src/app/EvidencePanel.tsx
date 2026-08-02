import type { Dossier } from "@interdependency/shared";

const confidenceTone: Record<string, string> = {
  high: "text-emerald-300",
  medium: "text-amber-300",
  low: "text-slate-400",
  inferred: "text-orange-300",
};

export function EvidencePanel({ dossier }: { dossier: Dossier }) {
  const sourceMap = new Map(dossier.sources.map((s) => [s.id, s]));

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="border-b border-emerald-400/10 px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-400/60">
          Context / evidence
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">
          {dossier.company.name}
        </h2>
        <p className="mt-1 font-mono text-[11px] text-slate-400">
          {[dossier.company.ticker, dossier.company.cik && `CIK ${dossier.company.cik}`, dossier.company.industry]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {dossier.company.summary && (
          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            {dossier.company.summary}
          </p>
        )}
        {dossier.tagline && (
          <p className="mt-2 text-[11px] italic text-emerald-200/70">
            {dossier.tagline}
          </p>
        )}
      </div>

      <section className="border-b border-emerald-400/10 px-4 py-3">
        <h3 className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
          Third parties ({dossier.nodes.length})
        </h3>
        <ul className="mt-2 space-y-2">
          {dossier.nodes.length === 0 && (
            <li className="text-xs text-slate-500">
              No dependencies extracted — disclosure gap.
            </li>
          )}
          {dossier.nodes.map((n) => (
            <li
              key={n.id}
              className="border border-emerald-400/10 bg-black/30 px-3 py-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium text-white">{n.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {n.class}
                  </div>
                </div>
                <span
                  className={`font-mono text-[10px] uppercase ${confidenceTone[n.confidence] || "text-slate-400"}`}
                >
                  {n.confidence}
                </span>
              </div>
              {n.notes && (
                <p className="mt-1 text-[11px] text-slate-400">{n.notes}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {n.sources.map((sid) => {
                  const s = sourceMap.get(sid);
                  return (
                    <span
                      key={sid}
                      className="rounded-sm border border-emerald-400/15 px-1.5 py-0.5 font-mono text-[9px] text-emerald-300/70"
                      title={s?.excerpt}
                    >
                      {s?.type || "src"}
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {dossier.incidents.length > 0 && (
        <section className="border-b border-emerald-400/10 px-4 py-3">
          <h3 className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
            Linked incidents
          </h3>
          <ul className="mt-2 space-y-2">
            {dossier.incidents.map((inc) => (
              <li key={inc.id} className="text-xs text-slate-300">
                <span className="font-mono text-emerald-400/80">{inc.year}</span>{" "}
                <span className="font-medium text-white">{inc.title}</span>
                <p className="mt-1 text-[11px] text-slate-400">{inc.summary}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-amber-300/70">
                  {inc.relevance}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {dossier.filings.length > 0 && (
        <section className="border-b border-emerald-400/10 px-4 py-3">
          <h3 className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
            Filing excerpts
          </h3>
          <ul className="mt-2 space-y-3">
            {dossier.filings.map((f) => (
              <li key={f.accessionNumber} className="text-[11px] text-slate-400">
                <div className="font-mono text-emerald-300/80">
                  {f.form} · {f.section}
                  {f.url && (
                    <>
                      {" "}
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-200 underline-offset-2 hover:underline"
                      >
                        open
                      </a>
                    </>
                  )}
                </div>
                <p className="mt-1 line-clamp-6 leading-relaxed text-slate-300">
                  {f.excerpt}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="px-4 py-3">
        <h3 className="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-400/70">
          Limitations
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-slate-500">
          {dossier.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

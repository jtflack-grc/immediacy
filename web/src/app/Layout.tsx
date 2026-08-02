import { useState } from "react";
import type { Dossier } from "@interdependency/shared";
import { DependencyGlobe } from "./DependencyGlobe";
import { EvidencePanel } from "./EvidencePanel";
import { MetricsPanel } from "./MetricsPanel";

interface RailsCase {
  id: string;
  title: string;
  tagline?: string;
}

export function Layout({
  dossier,
  loading,
  error,
  query,
  setQuery,
  rails,
  liveReady,
  onSearch,
  onSelectRails,
  onUpdateAssumption,
  onOpenWelcome,
}: {
  dossier: Dossier | null;
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (q: string) => void;
  rails: RailsCase[];
  liveReady: boolean | null;
  onSearch: () => void;
  onSelectRails: (id: string) => void;
  onUpdateAssumption: (
    scenarioId: string,
    assumptionId: string,
    value: number
  ) => void;
  onOpenWelcome: () => void;
}) {
  const [mobilePane, setMobilePane] = useState<"evidence" | "metrics" | "visuals">(
    "evidence"
  );
  const [preferGraph, setPreferGraph] = useState(false);

  return (
    <div className="app-shell relative flex h-screen flex-col overflow-hidden bg-[#020806] text-white">
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-emerald-400/15 bg-[#020806]/95 px-4 py-3 backdrop-blur-xl md:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="hidden h-8 w-px bg-emerald-300/40 sm:block"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-[0.24em] text-white md:text-xl">
              INTERDEPENDENCY
            </h1>
            <p className="mt-0.5 hidden font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-300/60 sm:block">
              Map who you depend on · Price what breaks
            </p>
          </div>
        </div>

        <form
          className="mx-3 hidden max-w-md flex-1 items-center gap-2 md:flex"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ticker or name (HAYW)"
            className="min-h-9 w-full border border-emerald-400/20 bg-black/40 px-3 font-mono text-xs text-white outline-none focus:border-emerald-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-9 shrink-0 bg-emerald-300 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#02110c] disabled:opacity-50"
          >
            {loading ? "…" : "Analyze"}
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span
            className={`hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider lg:inline-flex ${
              liveReady === true
                ? "text-emerald-300"
                : liveReady === false
                  ? "text-amber-300"
                  : "text-slate-500"
            }`}
            title={
              liveReady
                ? "Live EDGAR search API is reachable"
                : "Live API offline — bundled packs still work"
            }
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                liveReady === true
                  ? "bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.8)]"
                  : liveReady === false
                    ? "bg-amber-300"
                    : "bg-slate-500"
              }`}
            />
            {liveReady === true ? "Live" : liveReady === false ? "Offline" : "…"}
          </span>
          <select
            className="hidden max-w-[10rem] border border-emerald-400/20 bg-black/40 px-2 py-1.5 font-mono text-[10px] text-slate-300 lg:block"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) onSelectRails(e.target.value);
            }}
            aria-label="Rails cases"
          >
            <option value="" disabled>
              Rails cases
            </option>
            {rails.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPreferGraph((v) => !v)}
            className="hidden border border-emerald-400/20 px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-400 hover:text-emerald-200 lg:inline"
          >
            {preferGraph ? "Globe" : "Graph"}
          </button>
          <button
            type="button"
            onClick={onOpenWelcome}
            className="border border-emerald-400/20 px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-400 hover:text-emerald-200"
          >
            About
          </button>
        </div>
      </header>

      {error && (
        <div className="relative z-10 border-b border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs text-amber-100">
          {error}
        </div>
      )}

      <nav
        className="relative z-10 grid shrink-0 grid-cols-3 border-b border-emerald-400/15 bg-[#020806] md:hidden"
        aria-label="Mobile workspace"
      >
        {(["evidence", "metrics", "visuals"] as const).map((pane) => (
          <button
            key={pane}
            type="button"
            onClick={() => setMobilePane(pane)}
            className={`min-h-11 font-mono text-[10px] uppercase tracking-[0.16em] transition ${
              mobilePane === pane
                ? "bg-emerald-300 text-[#02110c]"
                : "text-slate-500 hover:bg-emerald-300/10 hover:text-emerald-200"
            }`}
          >
            {pane}
          </button>
        ))}
      </nav>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <section
          className={`${
            mobilePane === "evidence" ? "flex" : "hidden"
          } min-h-0 w-full flex-1 flex-col border-r border-emerald-400/10 bg-[#030a08]/95 md:flex md:w-[340px] md:flex-none lg:w-[380px]`}
        >
          {dossier ? (
            <EvidencePanel dossier={dossier} />
          ) : (
            <Empty label="Evidence appears after you load a case or analyze a company." />
          )}
        </section>

        <section
          className={`${
            mobilePane === "metrics" ? "flex" : "hidden"
          } min-h-0 w-full flex-1 flex-col border-r border-emerald-400/10 bg-[#020806] md:flex md:w-[360px] md:flex-none lg:w-[400px]`}
        >
          {dossier ? (
            <MetricsPanel
              dossier={dossier}
              onUpdateAssumption={onUpdateAssumption}
            />
          ) : (
            <Empty label="FAIR-shaped scenarios and tiering render here." />
          )}
        </section>

        <section
          className={`${
            mobilePane === "visuals" ? "flex" : "hidden"
          } min-h-0 w-full flex-1 flex-col bg-[#020806] md:flex`}
        >
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 text-sm text-emerald-200">
              Assembling dossier…
            </div>
          )}
          <DependencyGlobe dossier={dossier} preferGraph={preferGraph} />
        </section>
      </main>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

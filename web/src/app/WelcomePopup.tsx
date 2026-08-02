interface RailsCase {
  id: string;
  title: string;
  tagline?: string;
}

export function WelcomePopup({
  rails,
  onSelectRails,
  onSearch,
  onDismiss,
}: {
  rails: RailsCase[];
  onSelectRails: (id: string) => void;
  onSearch: (q: string) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="signal-frame relative w-full max-w-2xl overflow-hidden border border-emerald-400/30 bg-[#06100e] shadow-[0_32px_100px_rgba(0,0,0,.75)]">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center text-emerald-100/55 transition hover:bg-emerald-300/10 hover:text-white"
          aria-label="Close welcome"
        >
          ×
        </button>
        <div className="p-8 sm:p-10">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/70">
            Open-source TPRM · FAIR-informed · Public data
          </p>
          <h1 className="max-w-xl text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl">
            INTERDEPENDENCY
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
            Map who you depend on. Price what breaks. Educational freeware cribbed
            from the public-assessment loop of commercial TPRM — not a Safe
            Security product, not advice.
          </p>

          <div className="mt-8">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400/70">
              Start on rails
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {rails.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectRails(c.id)}
                  className="border border-emerald-400/20 bg-black/40 px-3 py-3 text-left transition hover:border-emerald-300/50 hover:bg-emerald-300/5"
                >
                  <div className="text-sm font-semibold text-white">{c.title}</div>
                  <div className="mt-1 text-[11px] text-slate-400">{c.tagline}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400/70">
              Or analyze a bundled public company
            </p>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const q = String(fd.get("q") || "");
                onSearch(q);
              }}
            >
              <input
                name="q"
                defaultValue="HAYW"
                placeholder="Ticker or name (e.g. HAYW)"
                className="min-h-12 flex-1 border border-emerald-400/25 bg-black/50 px-4 font-mono text-sm text-white outline-none focus:border-emerald-300"
              />
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center bg-emerald-300 px-6 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#02110c] transition hover:bg-emerald-200"
              >
                Analyze
              </button>
            </form>
            <p className="mt-2 text-[11px] text-slate-500">
              Runs entirely in your browser on GitHub Pages — try HAYW. Rails
              cases need no network beyond the page load.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

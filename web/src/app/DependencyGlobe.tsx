import { lazy, Suspense, useMemo } from "react";
import type { Dossier } from "@interdependency/shared";

const Globe = lazy(() => import("react-globe.gl").then((m) => ({ default: m.default })));

interface Point {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
  kind: "company" | "dependency" | "incident";
}

interface Arc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string[];
}

function Fallback() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      Loading globe…
    </div>
  );
}

/** Lightweight SVG fallback when WebGL globe is heavy or points sparse. */
function GraphFallback({ dossier }: { dossier: Dossier }) {
  const company = dossier.company;
  const nodes = dossier.nodes;
  return (
    <div className="flex h-full flex-col p-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-400/60">
        Dependency graph
      </p>
      <div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
        <div className="rounded-full border-2 border-emerald-300/60 bg-emerald-300/10 px-4 py-3 text-center">
          <div className="text-xs font-semibold text-white">
            {company.ticker || company.name}
          </div>
        </div>
        <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
          {nodes.map((n) => {
            const hot = dossier.incidents.some((i) => i.nodeId === n.id);
            return (
              <div
                key={n.id}
                className={`border px-3 py-2 text-[11px] ${
                  hot
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-100"
                    : "border-emerald-400/25 bg-black/40 text-slate-200"
                }`}
              >
                <div className="font-medium">{n.name}</div>
                <div className="font-mono text-[9px] uppercase text-slate-500">
                  {n.class}
                  {hot ? " · incident" : ""}
                </div>
              </div>
            );
          })}
          {nodes.length === 0 && (
            <p className="col-span-2 text-center text-xs text-slate-500">
              No nodes to plot — search a company or load a rails case.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GlobeView({ dossier }: { dossier: Dossier }) {
  const { points, arcs } = useMemo(() => {
    const pts: Point[] = [];
    const arcsOut: Arc[] = [];
    const cLat = dossier.company.lat ?? 39.8283;
    const cLng = dossier.company.lng ?? -98.5795;

    pts.push({
      lat: cLat,
      lng: cLng,
      size: 0.55,
      color: "#6ee7b7",
      label: dossier.company.name,
      kind: "company",
    });

    for (const n of dossier.nodes) {
      const lat = n.lat ?? cLat + (Math.random() - 0.5) * 20;
      const lng = n.lng ?? cLng + (Math.random() - 0.5) * 40;
      const hot = dossier.incidents.some((i) => i.nodeId === n.id);
      pts.push({
        lat,
        lng,
        size: hot ? 0.45 : 0.3,
        color: hot ? "#f2b84b" : "#34d399",
        label: n.name,
        kind: hot ? "incident" : "dependency",
      });
      arcsOut.push({
        startLat: cLat,
        startLng: cLng,
        endLat: lat,
        endLng: lng,
        color: hot ? ["#6ee7b7", "#f2b84b"] : ["#064e3b", "#34d399"],
      });
    }
    return { points: pts, arcs: arcsOut };
  }, [dossier]);

  return (
    <div className="globe-field relative h-full w-full min-h-[320px]">
      <Suspense fallback={<Fallback />}>
        <Globe
          height={undefined}
          width={undefined}
          backgroundColor="rgba(2,6,23,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.01}
          pointRadius="size"
          pointColor="color"
          pointLabel={(d: object) => (d as Point).label}
          arcsData={arcs}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={4000}
          arcStroke={0.4}
          atmosphereColor="#6ee7b7"
          atmosphereAltitude={0.12}
        />
      </Suspense>
      <div className="pointer-events-none absolute bottom-3 left-3 space-y-1 font-mono text-[9px] uppercase tracking-wider text-slate-400">
        <div>
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" /> Company
        </div>
        <div>
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Dependency
        </div>
        <div>
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Linked incident
        </div>
      </div>
    </div>
  );
}

export function DependencyGlobe({
  dossier,
  preferGraph = false,
}: {
  dossier: Dossier | null;
  preferGraph?: boolean;
}) {
  if (!dossier) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
        Load a rails case or analyze a ticker to render the interdependency map.
      </div>
    );
  }

  if (preferGraph || dossier.nodes.length === 0) {
    return <GraphFallback dossier={dossier} />;
  }

  return <GlobeView dossier={dossier} />;
}

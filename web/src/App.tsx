import { useCallback, useEffect, useState } from "react";
import type { Dossier, FairAssumption } from "@interdependency/shared";
import { analyzeQuery, fetchRailsDossier, fetchRailsList } from "./api";
import { Layout } from "./app/Layout";
import { WelcomePopup } from "./app/WelcomePopup";

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [rails, setRails] = useState<
    Array<{ id: string; title: string; tagline?: string }>
  >([]);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchRailsList().then(setRails).catch(() => undefined);
  }, []);

  const loadRails = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchRailsDossier(id);
      setDossier(d);
      setShowWelcome(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load rails case");
    } finally {
      setLoading(false);
    }
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const d = await analyzeQuery(q);
      setDossier(d);
      setShowWelcome(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Analyze failed — try HAYW or a rails case."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAssumption = useCallback(
    (scenarioId: string, assumptionId: string, value: number) => {
      setDossier((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          scenarios: prev.scenarios.map((s) => {
            if (s.id !== scenarioId) return s;
            const assumptions = s.assumptions.map((a: FairAssumption) =>
              a.id === assumptionId ? { ...a, value } : a
            );
            return { ...s, assumptions };
          }),
        };
      });
    },
    []
  );

  return (
    <>
      {showWelcome && (
        <WelcomePopup
          rails={rails}
          onSelectRails={loadRails}
          onSearch={(q) => {
            setQuery(q);
            void runSearch(q);
          }}
          onDismiss={() => setShowWelcome(false)}
        />
      )}
      <Layout
        dossier={dossier}
        loading={loading}
        error={error}
        query={query}
        setQuery={setQuery}
        rails={rails}
        onSearch={() => void runSearch(query)}
        onSelectRails={loadRails}
        onUpdateAssumption={updateAssumption}
        onOpenWelcome={() => setShowWelcome(true)}
      />
    </>
  );
}

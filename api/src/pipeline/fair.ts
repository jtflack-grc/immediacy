import type {
  DependencyEdge,
  DependencyNode,
  FairScenario,
  IncidentLink,
  InterdependencyTier,
} from "@interdependency/shared";

function hasClass(nodes: DependencyNode[], cls: string): boolean {
  return nodes.some((n) => n.class === cls);
}

export function buildScenarios(
  companyName: string,
  nodes: DependencyNode[],
  incidents: IncidentLink[]
): FairScenario[] {
  const scenarios: FairScenario[] = [];
  const soft = nodes.find((n) => n.class === "software");
  const proc = nodes.find((n) => n.class === "processor" || n.class === "payment");
  const msp = nodes.find((n) => n.class === "msp");
  const cloud = nodes.find((n) => n.class === "cloud");
  const erp = nodes.find((n) => n.class === "erp");

  if (soft || incidents.some((i) => i.title.toLowerCase().includes("crowdstrike"))) {
    scenarios.push({
      id: "sc-software-update",
      name: "Critical software vendor failure / bad update",
      threat: `Faulty or disrupted update from ${soft?.name || "a critical software vendor"}`,
      asset: `${companyName} endpoint / control-plane operations`,
      lef: { low: 0.02, mode: 0.08, high: 0.2, unit: "events/year" },
      lossMag: { low: 2_000_000, mode: 20_000_000, high: 150_000_000, unit: "USD" },
      assumptions: [
        {
          id: "a-soft-1",
          label: "Estate coverage by vendor",
          value: 70,
          unit: "%",
          editable: true,
        },
        {
          id: "a-soft-2",
          label: "Hours of material disruption",
          value: 18,
          unit: "hours",
          editable: true,
        },
      ],
      drivers: ["Update-channel trust", "Privileged agent/software footprint", "Vendor concentration"],
      residualNotes: "Staged channels and offline recovery reduce coupling.",
    });
  }

  if (proc || hasClass(nodes, "payment")) {
    scenarios.push({
      id: "sc-processor",
      name: "Concentrated processor / clearinghouse outage",
      threat: `Prolonged outage at ${proc?.name || "a payment/claims processor"}`,
      asset: "Revenue cycle / transaction clearing",
      lef: { low: 0.03, mode: 0.1, high: 0.25, unit: "events/year" },
      lossMag: { low: 5_000_000, mode: 40_000_000, high: 250_000_000, unit: "USD" },
      assumptions: [
        {
          id: "a-proc-1",
          label: "Share of volume via intermediary",
          value: 50,
          unit: "%",
          editable: true,
        },
        {
          id: "a-proc-2",
          label: "Days of disrupted clearing",
          value: 10,
          unit: "days",
          editable: true,
        },
      ],
      drivers: ["Intermediary concentration", "Limited alternate rails", "Working-capital lag"],
    });
  }

  if (msp || incidents.some((i) => i.year === 2023 && i.title.toLowerCase().includes("clorox"))) {
    scenarios.push({
      id: "sc-msp",
      name: "Service-provider foothold → operational cascade",
      threat: "Social engineering or compromise of IT support / identity pathway",
      asset: "Manufacturing, logistics, or core ops systems",
      lef: { low: 0.05, mode: 0.12, high: 0.3, unit: "events/year" },
      lossMag: { low: 8_000_000, mode: 60_000_000, high: 300_000_000, unit: "USD" },
      assumptions: [
        {
          id: "a-msp-1",
          label: "Weeks of constrained operations",
          value: 4,
          unit: "weeks",
          editable: true,
        },
      ],
      drivers: ["Support-channel trust", "Identity reset privileges", "OT/IT coupling"],
    });
  }

  if (cloud || erp) {
    const name = cloud?.name || erp?.name || "SaaS/ERP platform";
    scenarios.push({
      id: "sc-cloud-saas",
      name: "Cloud/SaaS or ERP data exposure via named dependency",
      threat: `Compromise or prolonged outage of ${name}`,
      asset: "Customer data / financial system of record",
      lef: { low: 0.04, mode: 0.11, high: 0.28, unit: "events/year" },
      lossMag: { low: 3_000_000, mode: 25_000_000, high: 180_000_000, unit: "USD" },
      assumptions: [
        {
          id: "a-cloud-1",
          label: "Sensitive records in platform",
          value: 250000,
          unit: "records",
          editable: true,
        },
      ],
      drivers: ["Shared responsibility gaps", "Identity federation", "Backup/restore lag"],
    });
  }

  // Always include concentration scenario when any deps exist
  if (nodes.length) {
    scenarios.push({
      id: "sc-concentration",
      name: "Single-supplier / platform concentration",
      threat: "Simultaneous failure of a high-criticality dependency class",
      asset: "Business continuity for core processes",
      lef: { low: 0.04, mode: 0.1, high: 0.22, unit: "events/year" },
      lossMag: { low: 2_000_000, mode: 18_000_000, high: 120_000_000, unit: "USD" },
      assumptions: [
        {
          id: "a-conc-1",
          label: "Critical dependencies without alternate",
          value: Math.min(nodes.length, 5),
          unit: "vendors",
          editable: true,
        },
      ],
      drivers: ["Disclosure-limited visibility", "Switching costs", "Contractual lock-in"],
      residualNotes:
        "When 10-K language cites supplier concentration, raise loss magnitude assumptions.",
    });
  }

  // Ensure at least one teaching scenario
  if (!scenarios.length) {
    scenarios.push({
      id: "sc-unknown",
      name: "Undisclosed third-party surface",
      threat: "Material third-party failure not visible in public filings",
      asset: "Unknown critical dependency",
      lef: { low: 0.05, mode: 0.15, high: 0.35, unit: "events/year" },
      lossMag: { low: 1_000_000, mode: 10_000_000, high: 80_000_000, unit: "USD" },
      assumptions: [
        {
          id: "a-unk-1",
          label: "Unknown critical vendors (estimate)",
          value: 5,
          unit: "vendors",
          editable: true,
          note: "Assumption — filings often omit tech stack detail",
        },
      ],
      drivers: ["Disclosure gap", "No questionnaire truth in freeware mode"],
      residualNotes: "Run questionnaires / trust-center review before treating as residual risk.",
    });
  }

  return scenarios.slice(0, 5);
}

export function computeTier(
  nodes: DependencyNode[],
  edges: DependencyEdge[],
  incidents: IncidentLink[]
): { tier: InterdependencyTier; rationale: string } {
  const criticalEdges = edges.filter(
    (e) => e.criticalityHint === "critical" || e.criticalityHint === "high"
  ).length;
  const hasProcessor = nodes.some((n) => n.class === "processor" || n.class === "payment");
  const hasPrivilegedSoft = nodes.some(
    (n) => n.class === "software" || n.class === "identity" || n.class === "erp"
  );
  const linkedIncidents = incidents.length;

  let score = 0;
  score += criticalEdges * 2;
  score += hasProcessor ? 3 : 0;
  score += hasPrivilegedSoft ? 2 : 0;
  score += Math.min(linkedIncidents, 3);
  score += nodes.filter((n) => n.confidence === "high" || n.confidence === "medium").length;

  if (score >= 8) {
    return {
      tier: "T1",
      rationale:
        "High materiality proxies: critical dependency classes and/or linked historical third-party failure patterns.",
    };
  }
  if (score >= 5) {
    return {
      tier: "T2",
      rationale:
        "Elevated coupling via cloud/ERP/software dependencies with partial evidence strength.",
    };
  }
  if (score >= 2) {
    return {
      tier: "T3",
      rationale: "Some public dependency signals; limited criticality confirmation.",
    };
  }
  return {
    tier: "T4",
    rationale:
      "Sparse public disclosure — tier reflects visibility gap more than proven low risk.",
  };
}

export function buildEdges(
  companyId: string,
  nodes: DependencyNode[],
  sourceIds: string[]
): DependencyEdge[] {
  const criticalityFor = (cls: string) => {
    if (["processor", "payment", "identity", "erp"].includes(cls)) return "critical" as const;
    if (["software", "cloud", "msp"].includes(cls)) return "high" as const;
    if (cls === "logistics") return "high" as const;
    return "medium" as const;
  };

  return nodes.map((n, i) => ({
    id: `e-live-${n.id}-${i}`,
    fromCompanyId: companyId,
    toNodeId: n.id,
    relationship: `${n.class} dependency (public evidence)`,
    criticalityHint: criticalityFor(n.class),
    sources: n.sources.length ? n.sources : sourceIds.slice(0, 1),
  }));
}

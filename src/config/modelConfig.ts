import { SRS2_DOMAINS, WISC_DOMAINS, ABAS3_DOMAINS, SRS2_SEVERITIES, WISC_SEVERITIES, ABAS3_SEVERITIES } from "../data/testData";
import type { Config, InstrumentBandMap } from "../types";

export const DEFAULT_CONFIG: Config = {
  prior: 0,
  riskTolerance: "balanced",
  domainWeights: {
    // ↓ toned down weights so mild bands don't explode probability
    A1: 1.0,
    A2: 0.95,
    A3: 0.95,
    B1: 0.80,
    B2: 0.80,
    B3: 0.80,
    B4: 0.70,
    onsetEarly: 0.6,
    impairment: 0.8,
    masking: 0.3,
    langDisorder: -0.1,
    intellectualDisability: -0.1,
    altTrauma: -0.5,
    altADHD: -0.3,
    altAnxiety: -0.2,
    altOther: -0.2,
  },
  minDataset: { minInstruments: 2, requireASDInstrument: true, requireAdaptive: true, requireHistory: true, requireObservation: true },
  defaultInstruments: [
    { name: "ADOS-2", scoreField: "standard", thresholds: [] },
    { name: "MIGDAS-2", scoreField: "standard", thresholds: [] },
    { name: "GARS", scoreField: "standard", thresholds: [] },
    { name: "SRS-2", scoreField: "t", thresholds: [] },
    { name: "Vineland-3", scoreField: "composite", thresholds: [] },
    { name: "ABAS-3", scoreField: "composite", thresholds: [] },
    { name: "WISC/WAIS/WPPSI", scoreField: "index", thresholds: [] },
    { name: "Sensory Profile 2", scoreField: "standard", thresholds: [] },
    { name: "CELF-5", scoreField: "index", thresholds: [] },
    { name: "AQ", scoreField: "raw", thresholds: [] },
  ],
  // SRS-2 domains
  // Strategy: "Average" = negative, "Mild" = small negative (neutral-to-low signal),
  //           "Moderate" = moderate positive, "Severe" = strong positive.
  srs2Domains: SRS2_DOMAINS.map((d) => {
    const m: Record<string, InstrumentBandMap> = {};
    if (d.key === "srs_awareness") {
      m.Average = { A1: -0.20 };
      m.Mild = { A1: -0.05 };
      m.Moderate = { A1: 0.60 };
      m.Severe = { A1: 1.10 };
    } else if (d.key === "srs_cognition") {
      m.Average = { A2: -0.20 };
      m.Mild = { A2: -0.05 };
      m.Moderate = { A2: 0.60 };
      m.Severe = { A2: 1.10 };
    } else if (d.key === "srs_communication") {
      m.Average = { A3: -0.20 };
      m.Mild = { A3: -0.05 };
      m.Moderate = { A3: 0.60 };
      m.Severe = { A3: 1.10 };
    } else if (d.key === "srs_motivation") {
      m.Average = { A1: -0.05, A3: -0.05 };
      m.Mild = { A1: -0.02, A3: -0.02 };
      m.Moderate = { A1: 0.25, A3: 0.25 };
      m.Severe = { A1: 0.50, A3: 0.50 };
    } else if (d.key === "srs_rrb") {
      m.Average = { B2: -0.15, B3: -0.15 };
      m.Mild = { B2: -0.05, B3: -0.05 };
      m.Moderate = { B2: 0.50, B3: 0.50 };
      m.Severe = { B2: 0.90, B3: 0.90 };
    }
    return { key: d.key, label: d.label, severities: [...SRS2_SEVERITIES], mapBySeverity: m };
  }),
  wiscDomains: WISC_DOMAINS.map((d) => ({ key: d.key, label: d.label, severities: [...WISC_SEVERITIES], mapBySeverity: {} })),
  // ABAS: Average and above decrease risk
  abasDomains: ABAS3_DOMAINS.map((d) => ({
    key: d.key,
    label: d.label,
    severities: [...ABAS3_SEVERITIES],
    mapBySeverity: {
      "Extremely Low": { impairment: 1.0 },
      "Very Low": { impairment: 0.8 },
      "Low Average": { impairment: 0.3 },
      Average: { impairment: -0.2 },
      "High Average": { impairment: -0.4 },
      "Very High": { impairment: -0.6 },
      "Extremely High": { impairment: -0.8 },
    },
  })),
};

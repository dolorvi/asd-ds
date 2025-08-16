// src/config/modelConfig.ts
import { SRS2_DOMAINS, ASRS_DOMAINS, WISC_DOMAINS, ABAS3_DOMAINS, VINELAND_DOMAINS, SRS2_SEVERITIES, ASRS_SEVERITIES, WISC_SEVERITIES, ABAS3_SEVERITIES } from "../data/testData";
import type { Config, InstrumentBandMap } from "../types";

// ---- Age-band priors (log-odds) ----
export type AgeBandKey = "au_5_14" | "au_15_24" | "au_25_39" | "au_overall" | "generic_2";

export const PRIOR_BY_AGE: Record<AgeBandKey, { label: string; prevalence: number; logit: number }> = {
  au_5_14:   { label: "AU • 5–14y (4.3%)",  prevalence: 0.043, logit: -3.103 },
  au_15_24:  { label: "AU • 15–24y (3.0%)", prevalence: 0.030, logit: -3.476 },
  au_25_39:  { label: "AU • 25–39y (0.6%)", prevalence: 0.006, logit: -5.110 },
  au_overall:{ label: "AU • Overall (1.1%)", prevalence: 0.011, logit: -4.499 },
  generic_2: { label: "Generic (2.0%)",     prevalence: 0.020, logit: -3.892 },
};

// Default for Australian school-age clinic workflows
export const DEFAULT_AGE_BAND: AgeBandKey = "au_5_14";

// Vineland severity labels (used for the single "Composite" selector in the UI)
export const VINELAND_SEVERITIES = ["Low", "Moderately Low", "Average", "Moderately High", "High"] as const;

// Used in useAsdEngine to convert the Vineland composite band into an impairment delta
export const VINELAND_IMPAIRMENT_MAP: Record<(typeof VINELAND_SEVERITIES)[number], number> = {
  Low: 1.0,
  "Moderately Low": 0.5,
  Average: -0.2,
  "Moderately High": -0.5,
  High: -0.8,
};

export const DEFAULT_CONFIG: Config = {
  prior: 0,
  certaintyThreshold: 0.5,
  domainWeights: {
    A1: 0.5,
    A2: 0.48,
    A3: 0.48,
    B1: 0.4,
    B2: 0.4,
    B3: 0.4,
    B4: 0.35,
    onsetEarly: 0.2,
    impairment: 0.2,
    masking: 0.05,
    langDisorder: -0.03,
    intellectualDisability: -0.03,
    altTrauma: -0.05,
    altADHD: -0.05,
    altAnxiety: -0.03,
    altOther: -0.03,
  },
  minDataset: {
    minInstruments: 4,
    requireASDInstrument: true,
    requireAdaptive: true,
    requireHistory: true,
    requireObservation: true,
  },
  defaultInstruments: [
    { name: "ADOS-2", scoreField: "standard", thresholds: [] },
    { name: "MIGDAS-2", scoreField: "standard", thresholds: [] },
    {
      name: "ADI-R",
      scoreField: "band",
      thresholds: [],
      bandLabel: "Social Interaction Band (ADI-R)",
      bandOptions: ["1", "2", "3", "4"],
    },
    { name: "ASRS",  scoreField: "score", thresholds: [] },
    { name: "SRS-2", scoreField: "t", thresholds: [] },
    {
      name: "Vineland-3",
      scoreField: "composite",
      thresholds: [],
      bandLabel: "Composite Band (Vineland-3)",
      bandOptions: [...VINELAND_SEVERITIES],
    }, // <-- MUST exist
    { name: "ABAS-3", scoreField: "composite", thresholds: [] },
    { name: "WISC/WAIS/WPPSI", scoreField: "index", thresholds: [] },
    { name: "BRIEF-2", scoreField: "t", thresholds: [] },
    { name: "BRIEF-2 (v2)", scoreField: "t", thresholds: [] },
    { name: "BDEFS", scoreField: "t", thresholds: [] },
    { name: "Sensory Profile 2", scoreField: "standard", thresholds: [] },
    { name: "CELF-5", scoreField: "index", thresholds: [] },
    { name: "AQ", scoreField: "raw", thresholds: [] },
    { name: "Conners-4", scoreField: "t", thresholds: [] },
    { name: "Conners-EC", scoreField: "t", thresholds: [] },
    { name: "Conners CBRS", scoreField: "t", thresholds: [] },
    { name: "Vanderbilt ADHD Rating Scales", scoreField: "score", thresholds: [] },
    { name: "WIAT-III", scoreField: "standard", thresholds: [] },
    { name: "BOT-3", scoreField: "standard", thresholds: [] },
  ],

  // ----- SRS-2 domains (label-only -> evidence deltas) -----
  srs2Domains: SRS2_DOMAINS.map((d) => {
    const m: Record<string, InstrumentBandMap> = {};
    if (d.key === "srs_awareness") {
      m["Average"] = { A1: -0.20 };
      m.Mild = { A1: -0.05 };
      m.Moderate = { A1: 0.60 };
      m.Severe = { A1: 1.10 };
    } else if (d.key === "srs_cognition") {
      m["Average"] = { A2: -0.20 };
      m.Mild = { A2: -0.05 };
      m.Moderate = { A2: 0.60 };
      m.Severe = { A2: 1.10 };
    } else if (d.key === "srs_communication") {
      m["Average"] = { A3: -0.20 };
      m.Mild = { A3: -0.05 };
      m.Moderate = { A3: 0.60 };
      m.Severe = { A3: 1.10 };
    } else if (d.key === "srs_motivation") {
      m["Average"] = { A1: -0.05, A3: -0.05 };
      m.Mild = { A1: -0.02, A3: -0.02 };
      m.Moderate = { A1: 0.25, A3: 0.25 };
      m.Severe = { A1: 0.50, A3: 0.50 };
    } else if (d.key === "srs_rrb") {
      m["Average"] = { B2: -0.15, B3: -0.15 };
      m.Mild = { B2: -0.05, B3: -0.05 };
      m.Moderate = { B2: 0.50, B3: 0.50 };
      m.Severe = { B2: 0.90, B3: 0.90 };
    }
    return { key: d.key, label: d.label, severities: [...SRS2_SEVERITIES], mapBySeverity: m };
  }),

  // ----- ASRS domains (label-only) -----
  asrsDomains: ASRS_DOMAINS.map((d) => ({
    key: d.key,
    label: d.label,
    severities: [...ASRS_SEVERITIES],
    mapBySeverity: {},
  })),

  // ----- WISC/WAIS/etc domains (context only) -----
  wiscDomains: WISC_DOMAINS.map((d) => ({
    key: d.key, label: d.label, severities: [...WISC_SEVERITIES], mapBySeverity: {}
  })),

  // ----- ABAS-3 domains -> impairment -----
  abasDomains: ABAS3_DOMAINS.map((d) => ({
    key: d.key,
    label: d.label,
    severities: [...ABAS3_SEVERITIES],
    mapBySeverity: {
      "Extremely Low": { impairment: 0.75 },
      "Very Low": { impairment: 0.5 },
      "Low Average": { impairment: 0.2 },
      "Average": { impairment: -0.25 },
      "High Average": { impairment: -0.35 },
      "Very High": { impairment: -0.45 },
      "Extremely High": { impairment: -0.6 },
    },
  })),

  vinelandDomains: VINELAND_DOMAINS.map((d) => ({
    key: d.key,
    label: d.label,
    severities: [...VINELAND_SEVERITIES],
    mapBySeverity: {}, // domain impacts handled separately
  })),
};

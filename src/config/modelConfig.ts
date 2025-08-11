import { SRS2_DOMAINS, WISC_DOMAINS, ABAS3_DOMAINS,
         SRS2_SEVERITIES, WISC_SEVERITIES, ABAS3_SEVERITIES } from "../data/testData";
import type { Config, InstrumentBandMap } from "../types";

export const DEFAULT_CONFIG: Config = {
  prior: 0,
  riskTolerance: "balanced",
  domainWeights: {
    A1:1.2, A2:1.1, A3:1.0, B1:1.0, B2:1.0, B3:1.0, B4:0.9,
    onsetEarly:0.6, impairment:0.8, masking:0.3,
    langDisorder:-0.1, intellectualDisability:-0.1,
    altTrauma:-0.5, altADHD:-0.3, altAnxiety:-0.2, altOther:-0.2,
  },
  minDataset: { minInstruments:2, requireASDInstrument:true, requireAdaptive:true, requireHistory:true, requireObservation:true },
  defaultInstruments: [
    { name:"ADOS-2", scoreField:"standard", thresholds:[] },
    { name:"MIGDAS-2", scoreField:"standard", thresholds:[] },
    { name:"GARS", scoreField:"standard", thresholds:[] },
    { name:"SRS-2", scoreField:"t", thresholds:[] },
    { name:"Vineland-3", scoreField:"composite", thresholds:[] },
    { name:"ABAS-3", scoreField:"composite", thresholds:[] },
    { name:"WISC/WAIS/WPPSI", scoreField:"index", thresholds:[] },
    { name:"Sensory Profile 2", scoreField:"standard", thresholds:[] },
    { name:"CELF-5", scoreField:"index", thresholds:[] },
    { name:"AQ", scoreField:"raw", thresholds:[] },
  ],
  // SRS-2 domains (includes Average = negative)
  srs2Domains: SRS2_DOMAINS.map(d => {
    const m: Record<string, InstrumentBandMap> = {};
    if (d.key==="srs_awareness")   { m.Average={A1:-0.2}; m.Mild={A1:0.5}; m.Moderate={A1:1.0}; m.Severe={A1:1.3}; }
    else if (d.key==="srs_cognition"){ m.Average={A2:-0.2}; m.Mild={A2:0.5}; m.Moderate={A2:1.0}; m.Severe={A2:1.3}; }
    else if (d.key==="srs_communication"){ m.Average={A3:-0.2}; m.Mild={A3:0.5}; m.Moderate={A3:1.0}; m.Severe={A3:1.3}; }
    else if (d.key==="srs_motivation"){ m.Average={A1:-0.1,A3:-0.1}; m.Mild={A1:0.3,A3:0.2}; m.Moderate={A1:0.6,A3:0.4}; m.Severe={A1:0.9,A3:0.7}; }
    else if (d.key==="srs_rrb")     { m.Average={B2:-0.15,B3:-0.15}; m.Mild={B2:0.4,B3:0.4}; m.Moderate={B2:0.8,B3:0.8}; m.Severe={B2:1.1,B3:1.1}; }
    return { key:d.key, label:d.label, severities:[...SRS2_SEVERITIES], mapBySeverity:m };
  }),
  wiscDomains: WISC_DOMAINS.map(d => ({ key:d.key, label:d.label, severities:[...WISC_SEVERITIES], mapBySeverity:{} })),
  // ABAS: Average and above decrease impairment (pull risk down)
  abasDomains: ABAS3_DOMAINS.map(d => ({
    key:d.key, label:d.label, severities:[...ABAS3_SEVERITIES],
    mapBySeverity: {
      "Extremely Low": { impairment:  1.0 },
      "Very Low":       { impairment:  0.8 },
      "Low Average":    { impairment:  0.3 },
      "Average":        { impairment: -0.2 },
      "High Average":   { impairment: -0.4 },
      "Very High":      { impairment: -0.6 },
      "Extremely High": { impairment: -0.8 },
    },
  })),
};

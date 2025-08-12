// types.ts

export type CriterionKey = "A1"|"A2"|"A3"|"B1"|"B2"|"B3"|"B4";

export type AltKey =
  | "onsetEarly" | "impairment" | "masking"
  | "langDisorder" | "intellectualDisability"
  | "altTrauma" | "altADHD" | "altAnxiety" | "altOther";

export type InstrumentBandMap = Partial<Record<CriterionKey, number>> & {
  onsetEarly?: number;
  impairment?: number;
};

export type DomainConfig = {
  key: string;
  label: string;
  severities: string[];
  mapBySeverity: Record<string, InstrumentBandMap>;
};

export type MinDatasetRules = {
  minInstruments: number;
  requireASDInstrument: boolean;
  requireAdaptive: boolean;
  requireHistory: boolean;
  requireObservation: boolean;
};

export type InstrumentConfig = { name: string; scoreField: string; thresholds: any[] };

/** Runtime entry for free-form instruments (supports score OR label-only band, e.g., Vineland composite band) */
export type InstrumentEntry = {
  name: string;
  value?: number;
  band?: string;
};

export type Config = {
  prior: number;
  riskTolerance: "sensitive" | "balanced" | "specific";
  domainWeights: Record<CriterionKey | AltKey, number>;
  minDataset: MinDatasetRules;
  defaultInstruments: InstrumentConfig[];

  // Domain sets
  srs2Domains: DomainConfig[];
  wiscDomains: DomainConfig[];
  abasDomains: DomainConfig[];
  vinelandDomains: DomainConfig[]; // ← add this
};

export type SeverityState = Record<string, { score?: number; severity?: string }>;

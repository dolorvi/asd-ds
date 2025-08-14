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

export type InstrumentConfig = {
  name: string;
  scoreField: string;
  thresholds: any[];
  /** Optional label for the band field */
  bandLabel?: string;
  /** Optional set of allowed band values; renders a dropdown when provided */
  bandOptions?: string[];
};

/** Runtime entry for free-form instruments (supports score OR label-only band, e.g., Vineland composite band) */
export type InstrumentEntry = {
  name: string;
  value?: number;
  band?: string;
  primary?: boolean;
};

export type Config = {
  prior: number;
  certaintyThreshold: 0.8 | 0.9 | 0.99;
  domainWeights: Record<CriterionKey | AltKey, number>;
  minDataset: MinDatasetRules;
  defaultInstruments: InstrumentConfig[];

  // Domain sets
  srs2Domains: DomainConfig[];
  asrsDomains: DomainConfig[];
  wiscDomains: DomainConfig[];
  abasDomains: DomainConfig[];
  vinelandDomains: DomainConfig[]; // ← add this
};

export type SeverityState = Record<string, { score?: number; severity?: string }>;

export type Condition = "ASD" | "ADHD" | "ID" | "FASD";

export type AssessmentSelection = {
  domain: string;
  options: string[];
  selected?: string;
  primary?: boolean;
};

export type ClientProfile = {
  name: string;
  age: string;
};
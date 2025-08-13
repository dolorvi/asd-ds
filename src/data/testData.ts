/**
 * Test Data (labels-only) for ASD Decision Support MVP
 * -----------------------------------------------------
 * Purpose: centralise *domain labels* and *severity/range descriptors* so the
 * UI/logic file stays lean. No numeric ranges or copyrighted item content.
 *
 * Exports
 *  - SRS2_SEVERITIES, SRS2_DOMAINS
 *  - WISC_SEVERITIES, WISC_DOMAINS
 *  - ABAS3_SEVERITIES, ABAS3_DOMAINS
 *  - MIGDAS_CONSISTENCY, MIGDAS_NOTE_TEMPLATES
 *  - CANONICAL_CASES (synthetic label-only scenarios for later tests)
 */

// ----------------------------- Shared types -----------------------------
export type RangeLabel = string;

export interface DomainLabelConfig {
  key: string;            // machine key used by the app
  label: string;          // clinician-facing label
  severities: readonly RangeLabel[]; // allowed labels only (no numbers)
}

// ----------------------------- Autism Questionnaires -----------------------------
export const SRS2_SEVERITIES = [
  "Average",
  "Mild",
  "Moderate",
  "Severe",
] as const;

export const SRS2_DOMAINS: DomainLabelConfig[] = [
  { key: "srs_awareness",     label: "Social Awareness",                                  severities: SRS2_SEVERITIES },
  { key: "srs_cognition",     label: "Social Cognition",                                  severities: SRS2_SEVERITIES },
  { key: "srs_communication", label: "Social Communication",                              severities: SRS2_SEVERITIES },
  { key: "srs_motivation",    label: "Social Motivation",                                 severities: SRS2_SEVERITIES },
  { key: "srs_rrb",           label: "Restricted Interests and Repetitive Behaviour",     severities: SRS2_SEVERITIES },
];

export const ASRS_SEVERITIES = [
  "Average",
  "Slightly Elevated",
  "Elevated",
  "Very Elevated",
] as const;

export const ASRS_DOMAINS: DomainLabelConfig[] = [
  { key: "asrs_social_communication",      label: "Social/Communication",                     severities: ASRS_SEVERITIES },
  { key: "asrs_unusual_behaviours",        label: "Unusual Behaviours",                      severities: ASRS_SEVERITIES },
  { key: "asrs_self_regulation",          label: "Self-Regulation",                         severities: ASRS_SEVERITIES },
  { key: "asrs_peer_socialization",       label: "Peer Socialization",                      severities: ASRS_SEVERITIES },
  { key: "asrs_adult_socialization",      label: "Adult Socialization",                     severities: ASRS_SEVERITIES },
  { key: "asrs_social_emotional_reciprocity", label: "Social/Emotional Reciprocity",        severities: ASRS_SEVERITIES },
  { key: "asrs_atypical_language",        label: "Atypical Language",                       severities: ASRS_SEVERITIES },
  { key: "asrs_stereotypy",               label: "Stereotypy",                              severities: ASRS_SEVERITIES },
  { key: "asrs_behavioural_rigidity",     label: "Behavioural Rigidity",                    severities: ASRS_SEVERITIES },
  { key: "asrs_sensory_sensitivity",      label: "Sensory Sensitivity",                     severities: ASRS_SEVERITIES },
  { key: "asrs_attention_self_regulation",label: "Attention/Self-Regulation (Age 2–5)",      severities: ASRS_SEVERITIES },
  { key: "asrs_attention",                label: "Attention (Age 6–18)",                     severities: ASRS_SEVERITIES },
];

// ----------------------------- WISC (VCI/VSI/WMI/PSI/FSIQ) -----------------------------
export const WISC_SEVERITIES = [
  "Extremely Low",
  "Very Low",
  "Low Average",
  "Average",
  "High Average",
  "Very High",
  "Extremely High",
] as const;

export const WISC_DOMAINS: DomainLabelConfig[] = [
  { key: "wisc_vci",  label: "Verbal Comprehension", severities: WISC_SEVERITIES },
  { key: "wisc_vsi",  label: "Visual Spatial",       severities: WISC_SEVERITIES },
  { key: "wisc_wmi",  label: "Working Memory",       severities: WISC_SEVERITIES },
  { key: "wisc_psi",  label: "Processing Speed",     severities: WISC_SEVERITIES },
  { key: "wisc_fsiq", label: "Full Scale IQ",        severities: WISC_SEVERITIES },
];

// ----------------------------- Adaptive Behaviour (Conceptual/Social/Practical) -----------------------------
export const ABAS3_SEVERITIES = WISC_SEVERITIES; // same label set by convention

export const ABAS3_DOMAINS: DomainLabelConfig[] = [
  { key: "abas_conceptual", label: "Conceptual", severities: ABAS3_SEVERITIES },
  { key: "abas_social",     label: "Social",     severities: ABAS3_SEVERITIES },
  { key: "abas_practical",  label: "Practical",  severities: ABAS3_SEVERITIES },
];

export const VINELAND_SEVERITIES = [
  "Low",
  "Moderately Low",
  "Average",
  "Moderately High",
  "High",
] as const;

export const VINELAND_DOMAINS: DomainLabelConfig[] = [
  { key: "vineland_communication", label: "Communication", severities: VINELAND_SEVERITIES },
  { key: "vineland_socialization",     label: "Socialization",     severities: VINELAND_SEVERITIES },
  { key: "vineland_dls",  label: "Daily Living Skills",  severities: VINELAND_SEVERITIES },
  { key: "vineland_motor",  label: "Motor Skills",  severities: VINELAND_SEVERITIES },
];

// ----------------------------- MIGDAS (Qualitative) -----------------------------
export const MIGDAS_CONSISTENCY = [
  "unclear",              // default/insufficient info
  "consistent",           // "Consistent with autism" in the UI
  "inconsistent",         // "Inconsistent with autism" in the UI
] as const;

export const MIGDAS_NOTE_TEMPLATES: string[] = [
  "Uses specialised interests to scaffold conversation",
  "Gestural communication limited; relies on scripts",
  "Monotropic focus observed in free play",
  "Sensory-seeking with auditory input; covers ears intermittently",
  "Reciprocal turn-taking improves with structured prompts",
];

// ----------------------------- Canonical label-only cases -----------------------------
// These are SYNTHETIC fixtures for manual testing and later unit tests.
// They use only *labels* and optional boolean flags (no scores).
export interface CanonicalCase {
  id: string;                     // e.g., "J-01"
  title: string;                  // short descriptor
  ageBand: "preschool" | "child" | "adolescent" | "adult";
  srs2?: Record<string, RangeLabel>;   // key → severity label
  wisc?: Record<string, RangeLabel>;
  abas3?: Record<string, RangeLabel>;
  migdas?: { consistency: typeof MIGDAS_CONSISTENCY[number]; notes: string[] };
  flags?: {
    earlyOnset?: boolean;
    crossContextImpairment?: boolean;
    masking?: boolean;
    comorbidity?: ("ADHD" | "DLD" | "ID" | "Anxiety" | "Depression" | "TraumaPTSD" | "FASD" | "Tics" | string)[];
  };
  expected?: {
    // Optional high-level intent for later assertions; bands are not probabilities.
    band?: "high" | "medium" | "low";
    decision?: "above" | "below" | "blocked"; // relative to current balanced cutpoint & min dataset
  };
}

export const CANONICAL_CASES: CanonicalCase[] = [
  {
    id: "J-01",
    title: "Child — clear autistic profile",
    ageBand: "child",
    srs2: {
      srs_awareness: "Severe",
      srs_cognition: "Severe",
      srs_communication: "Severe",
      srs_motivation: "Moderate",
      srs_rrb: "Severe",
    },
    abas3: {
      abas_conceptual: "Very Low",
      abas_social: "Very Low",
      abas_practical: "Low Average",
    },
    migdas: { consistency: "consistent", notes: ["Reduced reciprocity in unstructured context", "Monotropic interest sustainment"] },
    flags: { earlyOnset: true, crossContextImpairment: true },
    expected: { band: "high", decision: "above" },
  },
  {
    id: "K-02",
    title: "Adolescent — high masking, female profile",
    ageBand: "adolescent",
    srs2: {
      srs_awareness: "Moderate",
      srs_cognition: "Moderate",
      srs_communication: "Moderate",
      srs_motivation: "Mild",
      srs_rrb: "Mild",
    },
    abas3: {
      abas_conceptual: "Average",
      abas_social: "Low Average",
      abas_practical: "Average",
    },
    migdas: { consistency: "consistent", notes: ["Compensatory strategies evident", "Scripts used in peers"] },
    flags: { earlyOnset: true, crossContextImpairment: true, masking: true },
    expected: { band: "medium", decision: "above" },
  },
  {
    id: "L-03",
    title: "Adult — ADHD differential",
    ageBand: "adult",
    srs2: {
      srs_awareness: "Mild",
      srs_cognition: "Mild",
      srs_communication: "Mild",
      srs_motivation: "Mild",
      srs_rrb: "Mild",
    },
    abas3: {
      abas_conceptual: "Average",
      abas_social: "Average",
      abas_practical: "Average",
    },
    migdas: { consistency: "inconsistent", notes: ["Executive disorganisation dominates", "RRB minimal"] },
    flags: { comorbidity: ["ADHD"] },
    expected: { band: "low", decision: "below" },
  },
  {
    id: "M-04",
    title: "Preschooler — DLD confound",
    ageBand: "preschool",
    srs2: {
      srs_awareness: "Moderate",
      srs_cognition: "Mild",
      srs_communication: "Moderate",
      srs_motivation: "Mild",
      srs_rrb: "Mild",
    },
    abas3: {
      abas_conceptual: "Low Average",
      abas_social: "Low Average",
      abas_practical: "Average",
    },
    migdas: { consistency: "unclear", notes: ["Structural language limits reciprocity"] },
    flags: { earlyOnset: true, comorbidity: ["DLD"] },
    expected: { band: "low", decision: "below" },
  },
  {
    id: "N-05",
    title: "Child — ASD + ID presentation",
    ageBand: "child",
    srs2: {
      srs_awareness: "Severe",
      srs_cognition: "Moderate",
      srs_communication: "Severe",
      srs_motivation: "Moderate",
      srs_rrb: "Severe",
    },
    wisc: { wisc_fsiq: "Very Low" },
    abas3: {
      abas_conceptual: "Very Low",
      abas_social: "Very Low",
      abas_practical: "Very Low",
    },
    migdas: { consistency: "consistent", notes: ["Marked RRBs", "Limited gesture"] },
    flags: { earlyOnset: true, crossContextImpairment: true, comorbidity: ["ID"] },
    expected: { band: "high", decision: "above" },
  },
  {
    id: "P-06",
    title: "Adolescent — non-ASD control",
    ageBand: "adolescent",
    srs2: {
      srs_awareness: "Mild",
      srs_cognition: "Mild",
      srs_communication: "Mild",
      srs_motivation: "Mild",
      srs_rrb: "Mild",
    },
    abas3: {
      abas_conceptual: "Average",
      abas_social: "Average",
      abas_practical: "Average",
    },
    migdas: { consistency: "inconsistent", notes: ["Peer relations intact", "No sensory avoidance noted"] },
    flags: { earlyOnset: false, crossContextImpairment: false },
    expected: { band: "low", decision: "below" },
  },
];

// ----------------------------- Lightweight self-checks -----------------------------
// These are *data* integrity checks (not Jest). Consumers can import and run them in dev.
export function validateTestData(): string[] {
  const problems: string[] = [];
  const srsKeys = new Set(SRS2_DOMAINS.map(d => d.key));
  const wiscKeys = new Set(WISC_DOMAINS.map(d => d.key));
  const abasKeys = new Set(ABAS3_DOMAINS.map(d => d.key));

  for (const c of CANONICAL_CASES) {
    if (c.srs2) for (const k of Object.keys(c.srs2)) if (!srsKeys.has(k)) problems.push(`${c.id}: unknown SRS-2 key ${k}`);
    if (c.wisc) for (const k of Object.keys(c.wisc)) if (!wiscKeys.has(k)) problems.push(`${c.id}: unknown WISC key ${k}`);
    if (c.abas3) for (const k of Object.keys(c.abas3)) if (!abasKeys.has(k)) problems.push(`${c.id}: unknown ABAS-3 key ${k}`);
  }

  return problems;
}
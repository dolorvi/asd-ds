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
  { key: "asrs_social_communication", label: "Social/Communication", severities: ASRS_SEVERITIES },
  { key: "asrs_unusual_behaviours",  label: "Unusual Behaviors",    severities: ASRS_SEVERITIES },
  { key: "asrs_self_regulation",    label: "Self-Regulation",       severities: ASRS_SEVERITIES },
];

// Generic severities for instruments without published bands
export const GENERIC_SEVERITIES = ["Average", "Mild", "Moderate", "Severe"] as const;

// ----------------------------- WISC (VCI/VSI/FRI/WMI/PSI) -----------------------------
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
  { key: "wisc_fri",  label: "Fluid Reasoning",      severities: WISC_SEVERITIES },
  { key: "wisc_wmi",  label: "Working Memory",       severities: WISC_SEVERITIES },
  { key: "wisc_psi",  label: "Processing Speed",     severities: WISC_SEVERITIES },
];

// ----------------------------- Adaptive Behaviour (Conceptual/Social/Practical) -----------------------------
export const ABAS3_SEVERITIES = WISC_SEVERITIES; // same label set by convention

export const ABAS3_DOMAINS: DomainLabelConfig[] = [
  { key: "abas_conceptual", label: "Conceptual", severities: ABAS3_SEVERITIES },
  { key: "abas_social",     label: "Social",     severities: ABAS3_SEVERITIES },
  { key: "abas_practical",  label: "Practical",  severities: ABAS3_SEVERITIES },
  { key: "abas_gac",        label: "General Adaptive Composite", severities: ABAS3_SEVERITIES },
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

// ----------------------------- Additional Autism Questionnaires -----------------------------
export const GARS3_DOMAINS: DomainLabelConfig[] = [
  { key: "gars_rrb",         label: "Restrictive/Repetitive Behaviors", severities: GENERIC_SEVERITIES },
  { key: "gars_social",      label: "Social Interaction",               severities: GENERIC_SEVERITIES },
  { key: "gars_communication", label: "Communication",                  severities: GENERIC_SEVERITIES },
  { key: "gars_emotional",   label: "Emotional Responses",              severities: GENERIC_SEVERITIES },
  { key: "gars_cognitive",   label: "Cognitive Style",                  severities: GENERIC_SEVERITIES },
  { key: "gars_speech",      label: "Maladaptive Speech",               severities: GENERIC_SEVERITIES },
];

export const CARS2_DOMAINS: DomainLabelConfig[] = [
  { key: "cars_relating",      label: "Relating to People",      severities: GENERIC_SEVERITIES },
  { key: "cars_emotion",       label: "Emotional Response",      severities: GENERIC_SEVERITIES },
  { key: "cars_body_use",      label: "Body Use",                severities: GENERIC_SEVERITIES },
  { key: "cars_object_use",    label: "Object Use",              severities: GENERIC_SEVERITIES },
  { key: "cars_adaptation",    label: "Adaptation to Change",    severities: GENERIC_SEVERITIES },
  { key: "cars_listening",     label: "Listening Response",      severities: GENERIC_SEVERITIES },
  { key: "cars_visual",        label: "Visual Response",         severities: GENERIC_SEVERITIES },
  { key: "cars_taste_smell",   label: "Taste/Smell/Touch",       severities: GENERIC_SEVERITIES },
  { key: "cars_fear",          label: "Fear/Nervousness",        severities: GENERIC_SEVERITIES },
  { key: "cars_verbal",        label: "Verbal Communication",    severities: GENERIC_SEVERITIES },
  { key: "cars_nonverbal",     label: "Nonverbal Communication", severities: GENERIC_SEVERITIES },
  { key: "cars_activity",      label: "Activity Level",          severities: GENERIC_SEVERITIES },
  { key: "cars_intellectual",  label: "Intellectual Response",   severities: GENERIC_SEVERITIES },
  { key: "cars_general",       label: "General Impressions",     severities: GENERIC_SEVERITIES },
];

export const AQ_DOMAINS: DomainLabelConfig[] = [
  { key: "aq_social",     label: "Social Skill",         severities: GENERIC_SEVERITIES },
  { key: "aq_switching",  label: "Attention Switching",  severities: GENERIC_SEVERITIES },
  { key: "aq_detail",     label: "Attention to Detail",  severities: GENERIC_SEVERITIES },
  { key: "aq_communication", label: "Communication",     severities: GENERIC_SEVERITIES },
  { key: "aq_imagination", label: "Imagination",         severities: GENERIC_SEVERITIES },
];

// ----------------------------- Autism Observations -----------------------------
export const ADOS2_DOMAINS: DomainLabelConfig[] = [
  { key: "ados_social", label: "Social Affect",                 severities: GENERIC_SEVERITIES },
  { key: "ados_rrb",    label: "Restricted/Repetitive Behaviors", severities: GENERIC_SEVERITIES },
];

export const MIGDAS_DOMAINS: DomainLabelConfig[] = [
  { key: "migdas_sensory",      label: "Sensory Interests",     severities: GENERIC_SEVERITIES },
  { key: "migdas_special",      label: "Special Interests",     severities: GENERIC_SEVERITIES },
  { key: "migdas_reciprocity",  label: "Social Reciprocity",    severities: GENERIC_SEVERITIES },
  { key: "migdas_communication",label: "Communication Style",   severities: GENERIC_SEVERITIES },
];

// ----------------------------- Autism Interviews -----------------------------
export const ADIR_DOMAINS: DomainLabelConfig[] = [
  { key: "adir_social",        label: "Social Interaction",            severities: GENERIC_SEVERITIES },
  { key: "adir_communication", label: "Communication",                 severities: GENERIC_SEVERITIES },
  { key: "adir_rrb",          label: "Restricted/Repetitive Behaviors", severities: GENERIC_SEVERITIES },
  { key: "adir_history",      label: "Developmental History",          severities: GENERIC_SEVERITIES },
];

// ----------------------------- Executive Functioning -----------------------------
export const BRIEF2_DOMAINS: DomainLabelConfig[] = [
  { key: "brief_inhibition",      label: "Inhibition",             severities: GENERIC_SEVERITIES },
  { key: "brief_self_monitor",    label: "Self-Monitoring",        severities: GENERIC_SEVERITIES },
  { key: "brief_shift",          label: "Shift",                  severities: GENERIC_SEVERITIES },
  { key: "brief_emotional",      label: "Emotional Control",      severities: GENERIC_SEVERITIES },
  { key: "brief_initiate",       label: "Initiate",               severities: GENERIC_SEVERITIES },
  { key: "brief_working_memory", label: "Working Memory",          severities: GENERIC_SEVERITIES },
  { key: "brief_plan_organize",  label: "Plan/Organize",           severities: GENERIC_SEVERITIES },
  { key: "brief_task_monitor",   label: "Task-Monitor",            severities: GENERIC_SEVERITIES },
  { key: "brief_materials",      label: "Organization of Materials", severities: GENERIC_SEVERITIES },
];

// ----------------------------- Language -----------------------------
export const CELF5_DOMAINS: DomainLabelConfig[] = [
  { key: "celf_core",       label: "Core Language",       severities: WISC_SEVERITIES },
  { key: "celf_receptive",  label: "Receptive",           severities: WISC_SEVERITIES },
  { key: "celf_expressive", label: "Expressive",          severities: WISC_SEVERITIES },
  { key: "celf_content",    label: "Language Content",    severities: WISC_SEVERITIES },
  { key: "celf_structure",  label: "Language Structure",  severities: WISC_SEVERITIES },
];

// ----------------------------- Sensory -----------------------------
export const SENSORY_PROFILE_SEVERITIES = [
  "Much Less Than Others",
  "Less Than Others",
  "Just Like the Majority",
  "More Than Others",
  "Much More Than Others",
] as const;

export const SENSORY_PROFILE_DOMAINS: DomainLabelConfig[] = [
  { key: "sensory_auditory_seeking",      label: "Auditory Seeking",      severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_auditory_avoiding",     label: "Auditory Avoiding",     severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_auditory_sensitivity",  label: "Auditory Sensitivity",  severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_auditory_registration", label: "Auditory Registration", severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_visual_seeking",        label: "Visual Seeking",        severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_visual_avoiding",       label: "Visual Avoiding",       severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_visual_sensitivity",    label: "Visual Sensitivity",    severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_visual_registration",   label: "Visual Registration",   severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_tactile_seeking",       label: "Tactile Seeking",       severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_tactile_avoiding",      label: "Tactile Avoiding",      severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_tactile_sensitivity",   label: "Tactile Sensitivity",   severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_tactile_registration",  label: "Tactile Registration",  severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_vestibular_seeking",    label: "Vestibular Seeking",    severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_vestibular_avoiding",   label: "Vestibular Avoiding",   severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_vestibular_sensitivity",label: "Vestibular Sensitivity", severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_vestibular_registration",label: "Vestibular Registration", severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_oral_seeking",          label: "Oral Seeking",          severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_oral_avoiding",         label: "Oral Avoiding",         severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_oral_sensitivity",      label: "Oral Sensitivity",      severities: SENSORY_PROFILE_SEVERITIES },
  { key: "sensory_oral_registration",     label: "Oral Registration",     severities: SENSORY_PROFILE_SEVERITIES },
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
    wisc: { wisc_fri: "Very Low" },
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

  // Build maps of domain key -> allowed severity labels for each instrument.
  const srsDomainMap = new Map(
    SRS2_DOMAINS.map(d => [d.key, new Set(d.severities)])
  );
  const wiscDomainMap = new Map(
    WISC_DOMAINS.map(d => [d.key, new Set(d.severities)])
  );
  const abasDomainMap = new Map(
    ABAS3_DOMAINS.map(d => [d.key, new Set(d.severities)])
  );

  for (const c of CANONICAL_CASES) {
    if (c.srs2) {
      for (const [k, severity] of Object.entries(c.srs2)) {
        const allowed = srsDomainMap.get(k);
        if (!allowed) {
          problems.push(`${c.id}: unknown SRS-2 key ${k}`);
        } else if (!allowed.has(severity)) {
          problems.push(`${c.id}: invalid severity for ${k}: ${severity}`);
        }
      }
    }

    if (c.wisc) {
      for (const [k, severity] of Object.entries(c.wisc)) {
        const allowed = wiscDomainMap.get(k);
        if (!allowed) {
          problems.push(`${c.id}: unknown WISC key ${k}`);
        } else if (!allowed.has(severity)) {
          problems.push(`${c.id}: invalid severity for ${k}: ${severity}`);
        }
      }
    }

    if (c.abas3) {
      for (const [k, severity] of Object.entries(c.abas3)) {
        const allowed = abasDomainMap.get(k);
        if (!allowed) {
          problems.push(`${c.id}: unknown ABAS-3 key ${k}`);
        } else if (!allowed.has(severity)) {
          problems.push(`${c.id}: invalid severity for ${k}: ${severity}`);
        }
      }
    }
  }

  return problems;
}
// ----------------------------- FASD Neurobehavioral -----------------------------
export const FASD_NEURO_SEVERITIES = ["Severe", "Moderate", "Typical"] as const;

export const FASD_NEURO_DOMAINS: DomainLabelConfig[] = [
  { key: "fasd_executive_function", label: "Executive Function", severities: FASD_NEURO_SEVERITIES },
  { key: "fasd_attention", label: "Attention", severities: FASD_NEURO_SEVERITIES },
  { key: "fasd_learning_academic", label: "Learning/Academic", severities: FASD_NEURO_SEVERITIES },
  { key: "fasd_memory", label: "Memory", severities: FASD_NEURO_SEVERITIES },
  { key: "fasd_language", label: "Language", severities: FASD_NEURO_SEVERITIES },
  { key: "fasd_visuospatial", label: "Visuospatial", severities: FASD_NEURO_SEVERITIES },
  { key: "fasd_motor", label: "Motor", severities: FASD_NEURO_SEVERITIES },
  { key: "fasd_social_emotional", label: "Social/Emotional Regulation", severities: FASD_NEURO_SEVERITIES },
];

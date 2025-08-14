export const MASKING_EVIDENCE_OPTIONS = [
  "Self-report",
  "Caregiver report",
  "Clinician observation",
  "Inconsistent presentation",
] as const;

export const MASKING_CONTEXT_OPTIONS = [
  "School/Work",
  "Home",
  "Community",
  "Online",
] as const;

export const VERBAL_FLUENCY_OPTIONS = [
  "Non-speaking",
  "Minimally verbal",
  "Verbally fluent",
  "Variable",
] as const;

export const PREFERRED_COMMUNICATION_OPTIONS = [
  "Speech",
  "AAC device",
  "Sign",
  "Written",
  "Gestures",
  "Other",
] as const;

export const SOCIAL_STYLE_OPTIONS = [
  "Direct/forthright",
  "Quiet/low-initiation",
  "High-energy/rapid speech",
  "Monotone/flat affect",
  "Idiosyncratic phrasing",
  "Echolalia/Scripting",
] as const;

export const INFO_PROCESSING_STYLE_OPTIONS = [
  "Visual-first",
  "Verbal-first",
  "Needs extra processing time",
  "Detail-focused",
  "Big-picture-focused",
] as const;

// ---- Strengths ----
export const COGNITIVE_STRENGTH_OPTIONS = [
  "Memory",
  "Pattern recognition",
  "Systems thinking",
  "Creativity",
  "Problem-solving",
] as const;

export const SENSORY_STRENGTH_OPTIONS = [
  "Pitch/frequency detection",
  "Visual detail",
  "Tactile craft",
  "Movement/coordination",
  "Other",
] as const;

export const SUPPORTIVE_STRATEGY_OPTIONS = [
  "Noise-reduction",
  "Breaks",
  "Routines",
  "Visual schedules",
  "Stimming",
  "Weighted/pressure input",
  "Other",
] as const;

// ---- Sensory ----
export const SENSORY_TRIGGER_OPTIONS = [
  "Noise",
  "Visual clutter",
  "Touch/textures",
  "Smell",
  "Taste",
  "Movement",
  "Temperature",
  "Crowds",
] as const;

export const REGULATION_PREFERENCE_OPTIONS = [
  "Quiet space",
  "Headphones",
  "Sunglasses/hat",
  "Fidget",
  "Movement breaks",
  "Compression/weight",
  "Chewlry",
] as const;

export const ASSESSMENT_ENVIRONMENT_QUALITY_OPTIONS = [
  "Optimal",
  "Mixed",
  "Adverse",
] as const;

// ---- History ----
export const AGE_OF_FIRST_CONCERNS_OPTIONS = [
  "<3y",
  "3–5y",
  ">5y",
  "Unsure",
] as const;

export const EARLY_SOCIAL_SIGNS_OPTIONS = [
  "Limited joint attention",
  "Limited response to name",
  "Reduced pointing/gestures",
  "Limited peer interest",
] as const;

export const EARLY_RRB_SIGNS_OPTIONS = [
  "Lining/ordering",
  "Intense interests",
  "Repetitive motor",
  "Sensory fascination",
] as const;

export const LANGUAGE_TRAJECTORY_OPTIONS = [
  "Typical",
  "Delayed",
  "Atypical pattern",
  "Regression",
] as const;

export const CROSS_SETTING_CONSISTENCY_OPTIONS = [
  "Consistent across settings",
  "Varies by setting",
] as const;

// ---- Adaptive ----
export const SUPPORT_NEEDS_CONTEXTS = ["Home", "School/Work", "Community"] as const;
export const SUPPORT_NEEDS_LEVELS = ["Minimal", "Intermittent", "Substantial"] as const;

// ---- Generic helper types ----
export type FlagWithNotes = {
  value: boolean;
  notes?: string;
};

export interface SupportNeedsByContext {
  context: typeof SUPPORT_NEEDS_CONTEXTS[number];
  level: typeof SUPPORT_NEEDS_LEVELS[number];
}

export interface AutismProfile {
  masking_suspected: boolean;
  masking_evidence: typeof MASKING_EVIDENCE_OPTIONS[number][];
  masking_contexts: typeof MASKING_CONTEXT_OPTIONS[number][];
  verbal_fluency: typeof VERBAL_FLUENCY_OPTIONS[number];
  preferred_communication: typeof PREFERRED_COMMUNICATION_OPTIONS[number][];
  social_style: typeof SOCIAL_STYLE_OPTIONS[number][];
  info_processing_style: typeof INFO_PROCESSING_STYLE_OPTIONS[number][];
}

export interface StrengthProfile {
  special_interests: string[];
  cognitive_strengths: typeof COGNITIVE_STRENGTH_OPTIONS[number][];
  sensory_strengths: typeof SENSORY_STRENGTH_OPTIONS[number][];
  supportive_strategies_already_working: typeof SUPPORTIVE_STRATEGY_OPTIONS[number][];
  supportive_strategy_notes?: string;
}

export interface SensoryProfile {
  sensory_triggers: typeof SENSORY_TRIGGER_OPTIONS[number][];
  regulation_preferences: typeof REGULATION_PREFERENCE_OPTIONS[number][];
  assessment_environment_quality: typeof ASSESSMENT_ENVIRONMENT_QUALITY_OPTIONS[number];
  environment_notes?: string;
}

export interface HistoryProfile {
  age_of_first_concerns: typeof AGE_OF_FIRST_CONCERNS_OPTIONS[number];
  early_social_signs: typeof EARLY_SOCIAL_SIGNS_OPTIONS[number][];
  early_rrb_signs: typeof EARLY_RRB_SIGNS_OPTIONS[number][];
  language_trajectory: typeof LANGUAGE_TRAJECTORY_OPTIONS[number];
  skill_regression: FlagWithNotes;
  cross_setting_consistency: typeof CROSS_SETTING_CONSISTENCY_OPTIONS[number];
  family_history_neurodivergence: FlagWithNotes;
  cultural_linguistic_factors?: string;
  self_identifies_autistic: boolean;
}

export interface ComorbidityProfile {
  adhd_features_prominent: FlagWithNotes;
  language_disorder_structural: FlagWithNotes;
  intellectual_disability_global: FlagWithNotes;
  anxiety_primary_driver: FlagWithNotes;
  ocd_features: FlagWithNotes;
  trauma_significant: FlagWithNotes;
  epilepsy_or_genetic_syndrome: FlagWithNotes;
}

export interface AdaptiveProfile {
  support_needs_by_context: SupportNeedsByContext[];
  independence_goals?: string;
}

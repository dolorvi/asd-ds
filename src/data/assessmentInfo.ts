export interface AssessmentInfo {
  name: string;
  domains: string[];
  notes: string;
}

export const ASSESSMENT_INFO: Record<string, AssessmentInfo> = {
  asrs: {
    name: "ASRS (Autism Spectrum Rating Scales)",
    domains: ["Social/Communication", "Unusual Behaviors", "Self-Regulation"],
    notes:
      "T-scores typically range from 40–90. Includes DSM-5-compatible scales and Treatment Scales. Higher T-scores (\u226565) suggest clinically significant symptoms. Separate forms exist for ages 2–5 and 6–18.",
  },
  srs2: {
    name: "SRS-2 (Social Responsiveness Scale, Second Edition)",
    domains: [
      "Social Awareness",
      "Social Cognition",
      "Social Communication",
      "Social Motivation",
      "Restricted Interests and Repetitive Behavior",
    ],
    notes:
      "Provides Total Score and DSM-5 Social Communication and Interaction vs. RRB subscales. Higher T-scores indicate greater severity.",
  },
  gars3: {
    name: "GARS-3 (Gilliam Autism Rating Scale, 3rd Edition)",
    domains: [
      "Restrictive, Repetitive Behaviors",
      "Social Interaction",
      "Social Communication",
      "Emotional Responses",
      "Cognitive Style",
      "Maladaptive Speech",
    ],
    notes:
      "Yields an Autism Index and probability classification (unlikely, possible, very likely).",
  },
  cars2: {
    name: "CARS-2 (Childhood Autism Rating Scale, Second Edition)",
    domains: [
      "Relating to People",
      "Emotional Response",
      "Body Use",
      "Object Use",
      "Adaptation to Change",
      "Visual Response",
      "Listening Response",
      "Taste, Smell, Touch",
      "Verbal and Nonverbal Communication",
      "Activity Level and Consistency",
    ],
    notes:
      "Items rated 1–4; total scores 15–60 with classification: minimal-to-no symptoms (<30), mild-to-moderate (30–36.5), severe (\u226537).",
  },
  aq: {
    name: "AQ (Autism-Spectrum Quotient)",
    domains: [
      "Social Skill",
      "Attention Switching",
      "Attention to Detail",
      "Communication",
      "Imagination",
    ],
    notes:
      "Total scores range 0–50; scores \u226532 often indicate significant autistic traits.",
  },
  migdas2: {
    name: "MIGDAS-2 (Monarch Interactive Guided Developmental Assessment Scale)",
    domains: [
      "Sensory Use and Responses",
      "Verbal Communication",
      "Nonverbal Communication",
      "Emotional Responses",
      "Social Relationships",
    ],
    notes:
      "Qualitative rubric-based assessment. No numerical scoring; clinician uses descriptive language samples and interpretation to generate a diagnostic profile.",
  },
  ados2: {
    name: "ADOS-2 (Autism Diagnostic Observation Schedule, Second Edition)",
    domains: ["Communication", "Reciprocal Social Interaction", "Restricted and Repetitive Behaviors"],
    notes:
      "Modules selected by age and language level. Calibrated Severity Scores range 1–10; overall classification of autism, autism spectrum, or nonspectrum.",
  },
  adir: {
    name: "ADI-R (Autism Diagnostic Interview – Revised)",
    domains: [
      "Reciprocal Social Interaction",
      "Communication and Language",
      "Restricted, Repetitive Behaviors",
    ],
    notes:
      "Requires developmental history. Classification based on algorithm cutoffs in each domain.",
  },
  abas3: {
    name: "ABAS-3 (Adaptive Behavior Assessment System, 3rd Edition)",
    domains: ["Conceptual", "Social", "Practical"],
    notes:
      "Scaled scores 1–19 and composite scores (mean = 100, SD = 15) yield a General Adaptive Composite.",
  },
  vineland3: {
    name: "Vineland-3 (Vineland Adaptive Behavior Scales, 3rd Edition)",
    domains: [
      "Communication",
      "Daily Living Skills",
      "Socialization",
      "Motor Skills",
      "Maladaptive Behavior Index",
    ],
    notes:
      "V-scale scores 20–160 (mean = 100). Provides Adaptive Behavior Composite and domain-level scores.",
  },
  brief2: {
    name: "BRIEF-2 (Behavior Rating Inventory of Executive Function, 2nd Edition)",
    domains: [
      "Behavioral Regulation Index",
      "Emotional Regulation Index",
      "Cognitive Regulation Index",
    ],
    notes:
      "T-scores have mean = 50 (SD = 10) and yield a Global Executive Composite; scores \u226565 indicate clinical concern.",
  },
  bdefs: {
    name: "BDEFS (Barkley Deficits in Executive Functioning Scale)",
    domains: [
      "Self-Management to Time",
      "Self-Organization/Problem Solving",
      "Self-Restraint",
      "Self-Motivation",
      "Self-Regulation of Emotion",
    ],
    notes:
      "Raw scores convert to standard T-scores; used in adult ADHD diagnosis and executive function profiling.",
  },
  wiscv: {
    name: "WISC-V (Wechsler Intelligence Scale for Children, Fifth Edition)",
    domains: [
      "Verbal Comprehension",
      "Visual Spatial",
      "Fluid Reasoning",
      "Working Memory",
      "Processing Speed",
    ],
    notes: "Provides Full Scale IQ and General Ability Index.",
  },
  wppsiiv: {
    name: "WPPSI-IV (Wechsler Preschool and Primary Scale of Intelligence, Fourth Edition)",
    domains: [
      "Verbal Comprehension",
      "Visual Spatial",
      "Fluid Reasoning",
      "Working Memory",
      "Processing Speed",
    ],
    notes: "Structure mirrors the WISC-V, adapted for ages 2.6–7.7.",
  },
  waisiv: {
    name: "WAIS-IV (Wechsler Adult Intelligence Scale, Fourth Edition)",
    domains: [
      "Verbal Comprehension",
      "Visual Spatial",
      "Fluid Reasoning",
      "Working Memory",
      "Processing Speed",
    ],
    notes:
      "Adult version for ages 16–90 with the same core indices as WISC-V.",
  },
  celf5: {
    name: "CELF-5 (Clinical Evaluation of Language Fundamentals, Fifth Edition)",
    domains: [
      "Core Language Score",
      "Receptive Language Index",
      "Expressive Language Index",
      "Language Content Index",
      "Language Memory Index",
    ],
    notes:
      "Composite standard scores (mean = 100). Includes age-dependent subtests such as Sentence Comprehension and Word Classes.",
  },
  sensoryprofile2: {
    name: "Sensory Profile 2",
    domains: ["Seeking", "Avoiding", "Sensitivity", "Registration"],
    notes:
      "Standard scores per quadrant classify into Typical, Probable, or Definite Difference and cover school, home, and short forms.",
  },
};

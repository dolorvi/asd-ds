import type { Condition } from "../types";

export const SRS2_CONDITION_WEIGHTS: Record<Condition, Record<string, Record<string, number>>> = {
  ASD: {
    srs_awareness: { Average: 0, Mild: 1, Moderate: 2, Severe: 3 },
    srs_cognition: { Average: 0, Mild: 1, Moderate: 2, Severe: 3 },
    srs_communication: { Average: 0, Mild: 1, Moderate: 2, Severe: 3 },
    srs_motivation: { Average: 0, Mild: 1, Moderate: 2, Severe: 3 },
    srs_rrb: { Average: 0, Mild: 1, Moderate: 2, Severe: 3 },
  },
  FASD: {
    srs_awareness: { Average: -1, Mild: 1, Moderate: 2, Severe: 3 },
    srs_cognition: { Average: -1, Mild: 1, Moderate: 2, Severe: 3 },
    srs_communication: { Average: -1, Mild: 1, Moderate: 2, Severe: 3 },
    srs_motivation: { Average: -1, Mild: 1, Moderate: 2, Severe: 3 },
    srs_rrb: { Average: -1, Mild: 0, Moderate: 1, Severe: 3 },
  },
  ADHD: {
    srs_awareness: { Average: 0, Mild: 0, Moderate: 1, Severe: 2 },
    srs_cognition: { Average: 0, Mild: 1, Moderate: 2, Severe: 3 },
    srs_communication: { Average: 0, Mild: 1, Moderate: 2, Severe: 3 },
    srs_motivation: { Average: 0, Mild: 0, Moderate: 0, Severe: 0 },
    srs_rrb: { Average: 0, Mild: 1, Moderate: 2, Severe: 3 },
  },
  ID: {
    srs_awareness: { Average: 0, Mild: 0, Moderate: 0, Severe: 0 },
    srs_cognition: { Average: 0, Mild: 0, Moderate: 0, Severe: 0 },
    srs_communication: { Average: 0, Mild: 0, Moderate: 0, Severe: 0 },
    srs_motivation: { Average: 0, Mild: 0, Moderate: 0, Severe: 0 },
    srs_rrb: { Average: 0, Mild: 0, Moderate: 0, Severe: 0 },
  },
};

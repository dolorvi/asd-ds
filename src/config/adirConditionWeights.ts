import type { Condition } from "../types";

// ADI-R domain weights by condition and severity
// severity labels correspond to ADIR_SEVERITIES
export const ADIR_CONDITION_WEIGHTS: Record<Condition, Record<string, Record<string, number>>> = {
  ASD: {
    adir_social: { "Below algorithm": -5, Borderline: 0, "Meets algorithm": 10 },
    adir_communication: { "Below algorithm": -3, Borderline: 0, "Meets algorithm": 6 },
    adir_rrb: { "Below algorithm": -3, Borderline: 0, "Meets algorithm": 6 },
    adir_history: { "Below algorithm": -3, Borderline: 0, "Meets algorithm": 6 },
  },
  FASD: {
    adir_social: { "Below algorithm": -2, Borderline: 0, "Meets algorithm": 3 },
    adir_communication: { "Below algorithm": -2, Borderline: 0, "Meets algorithm": 4 },
    adir_rrb: { "Below algorithm": -2, Borderline: 0, "Meets algorithm": 4 },
    adir_history: { "Below algorithm": -3, Borderline: 0, "Meets algorithm": 6 },
  },
  ADHD: {
    adir_social: { "Below algorithm": 0, Borderline: 0, "Meets algorithm": 0 },
    adir_communication: { "Below algorithm": 0, Borderline: 0, "Meets algorithm": 0 },
    adir_rrb: { "Below algorithm": 1, Borderline: 0, "Meets algorithm": 0 },
    adir_history: { "Below algorithm": 0, Borderline: 0, "Meets algorithm": 0 },
  },
  ID: {
    adir_social: { "Below algorithm": -1, Borderline: 0, "Meets algorithm": 0 },
    adir_communication: { "Below algorithm": -1, Borderline: 0, "Meets algorithm": 0 },
    adir_rrb: { "Below algorithm": -1, Borderline: 0, "Meets algorithm": 0 },
    adir_history: { "Below algorithm": -1, Borderline: 0, "Meets algorithm": 0 },
  },
};

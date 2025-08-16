import type { Condition } from "../types";

export const VINELAND_CONDITION_WEIGHTS: Record<Condition, Record<string, Record<string, number>>> = {
  ASD: {
    vineland_socialization: { Low: 4, "Moderately Low": 3, Average: 1, "Moderately High": -2, High: -3 },
    vineland_communication: { Low: 3, "Moderately Low": 2, Average: 0, "Moderately High": -1, High: -2 },
    vineland_dls: { Low: 3, "Moderately Low": 2, Average: 0, "Moderately High": -1, High: -2 },
    vineland_motor: { Low: 3, "Moderately Low": 1, Average: 0, "Moderately High": -1, High: -2 },
  },
  FASD: {
    vineland_socialization: { Low: 3, "Moderately Low": 2, Average: 1, "Moderately High": 0, High: -1 },
    vineland_communication: { Low: 3, "Moderately Low": 2, Average: 0, "Moderately High": -1, High: -2 },
    vineland_dls: { Low: 3, "Moderately Low": 2, Average: 0, "Moderately High": -1, High: -2 },
    vineland_motor: { Low: 4, "Moderately Low": 3, Average: 2, "Moderately High": 1, High: 0 },
  },
  ADHD: {
    vineland_socialization: { Low: 3, "Moderately Low": 2, Average: 1, "Moderately High": 0, High: -1 },
    vineland_communication: { Low: 3, "Moderately Low": 2, Average: 0, "Moderately High": -1, High: -2 },
    vineland_dls: { Low: 3, "Moderately Low": 1, Average: 0, "Moderately High": -1, High: -2 },
    vineland_motor: { Low: 2, "Moderately Low": 1, Average: 0, "Moderately High": -1, High: -2 },
  },
  ID: {
    vineland_socialization: { Low: 7, "Moderately Low": 6, Average: 0, "Moderately High": -4, High: -5 },
    vineland_communication: { Low: 6, "Moderately Low": 5, Average: 0, "Moderately High": -3, High: -4 },
    vineland_dls: { Low: 6, "Moderately Low": 5, Average: 0, "Moderately High": -4, High: -5 },
    vineland_motor: { Low: 5, "Moderately Low": 4, Average: 0, "Moderately High": -3, High: -4 },
  },
};

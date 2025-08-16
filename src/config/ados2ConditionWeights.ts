import type { Condition } from "../types";

export const ADOS2_CONDITION_WEIGHTS: Record<Condition, Record<string, Record<string, number>>> = {
  ASD: {
    ados_social: { "Non-spectrum": -10, Autism: 20 },
    ados_rrb: { "Non-spectrum": 10, Autism: 15 },
  },
  FASD: {
    ados_social: { "Non-spectrum": 0, Autism: 5 },
    ados_rrb: { "Non-spectrum": 0, Autism: 4 },
  },
  ADHD: {
    ados_social: { "Non-spectrum": 0, Autism: 10 },
    ados_rrb: { "Non-spectrum": 0, Autism: 20 },
  },
  ID: {
    ados_social: { "Non-spectrum": 0, Autism: 0 },
    ados_rrb: { "Non-spectrum": 0, Autism: 0 },
  },
};

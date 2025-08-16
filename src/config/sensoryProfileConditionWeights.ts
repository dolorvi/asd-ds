import type { Condition } from "../types";

type Severity =
  | "Much Less Than Others"
  | "Less Than Others"
  | "Just Like the Majority"
  | "More Than Others"
  | "Much More Than Others";

type Quadrant = "sensitivity" | "avoiding" | "seeking" | "registration";

const senses = ["auditory", "visual", "tactile", "vestibular", "oral"] as const;

const quadrantWeights: Record<Condition, Record<Quadrant, Record<Severity, number>>> = {
  ASD: {
    sensitivity: {
      "Much Less Than Others": -0.5,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 0,
      "Much More Than Others": 2,
    },
    avoiding: {
      "Much Less Than Others": 0,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 0,
      "Much More Than Others": 0,
    },
    seeking: {
      "Much Less Than Others": 0,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 0,
      "Much More Than Others": 2,
    },
    registration: {
      "Much Less Than Others": 0,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 0,
      "Much More Than Others": 0,
    },
  },
  FASD: {
    sensitivity: {
      "Much Less Than Others": 0,
      "Less Than Others": -1,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
    avoiding: {
      "Much Less Than Others": 0,
      "Less Than Others": -1,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
    seeking: {
      "Much Less Than Others": 0,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
    registration: {
      "Much Less Than Others": 0,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
  },
  ADHD: {
    sensitivity: {
      "Much Less Than Others": -1,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
    avoiding: {
      "Much Less Than Others": 0,
      "Less Than Others": -1,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
    seeking: {
      "Much Less Than Others": -1,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
    registration: {
      "Much Less Than Others": 0,
      "Less Than Others": -1,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
  },
  ID: {
    sensitivity: {
      "Much Less Than Others": 0,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
    avoiding: {
      "Much Less Than Others": 0,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
    seeking: {
      "Much Less Than Others": 0,
      "Less Than Others": 0,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
    registration: {
      "Much Less Than Others": 0,
      "Less Than Others": -1,
      "Just Like the Majority": 0,
      "More Than Others": 1,
      "Much More Than Others": 0,
    },
  },
};

export const SENSORY_PROFILE_CONDITION_WEIGHTS: Record<Condition, Record<string, Record<Severity, number>>> = (() => {
  const result: Record<Condition, Record<string, Record<Severity, number>>> = {
    ASD: {},
    FASD: {},
    ADHD: {},
    ID: {},
  };
  (Object.keys(result) as Condition[]).forEach((cond) => {
    senses.forEach((sense) => {
      const prefix = `sensory_${sense}_`;
      result[cond][`${prefix}sensitivity`] = quadrantWeights[cond].sensitivity;
      result[cond][`${prefix}avoiding`] = quadrantWeights[cond].avoiding;
      result[cond][`${prefix}seeking`] = quadrantWeights[cond].seeking;
      result[cond][`${prefix}registration`] = quadrantWeights[cond].registration;
    });
  });
  return result;
})();

default export SENSORY_PROFILE_CONDITION_WEIGHTS;


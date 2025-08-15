import type { ASDWeightConfig } from "../types";

export const ASD_WEIGHTS_V1: ASDWeightConfig = {
  global: {
    max_positive_from_instruments_pct: 70,
    max_positive_from_history_context_pct: 20,
    max_negative_from_differentials_pct: 25,
  },
  instruments: {
    "ADOS-2": {
      cap_pct: 30,
      subscales: [
        {
          name: "Social Affect (SA)",
          direction: "high",
          delta_pct: { severe: 18, moderate: 10, typical: -9 },
        },
        {
          name: "Restricted/Repetitive Behaviors (RRB)",
          direction: "high",
          delta_pct: { severe: 12, moderate: 6, typical: -6 },
        },
      ],
    },
    "MIGDAS-2": {
      cap_pct: 20,
      subscales: [
        {
          name: "Social reciprocity differences",
          direction: "high",
          delta_pct: { severe: 7, moderate: 4, typical: -4 },
        },
        {
          name: "Communication style (idiosyncratic/pragmatic)",
          direction: "high",
          delta_pct: { severe: 5, moderate: 3, typical: -3 },
        },
        {
          name: "Sensory interests/differences",
          direction: "high",
          delta_pct: { severe: 4, moderate: 2, typical: -2 },
        },
        {
          name: "Special interests / narrow focus",
          direction: "high",
          delta_pct: { severe: 4, moderate: 2, typical: -2 },
        },
      ],
    },
    "ADI-R": {
      cap_pct: 20,
      subscales: [
        {
          name: "A. Social interaction",
          direction: "high",
          delta_pct: { severe: 10, moderate: 6, typical: -5 },
        },
        {
          name: "B. Communication",
          direction: "high",
          delta_pct: { severe: 6, moderate: 4, typical: -3 },
        },
        {
          name: "C. RRB",
          direction: "high",
          delta_pct: { severe: 6, moderate: 3, typical: -3 },
        },
      ],
    },
    "CARS-2": {
      cap_pct: 20,
      subscales: [
        {
          name: "Relating to people / Emotional response",
          direction: "high",
          delta_pct: { severe: 8, moderate: 5, typical: -5 },
        },
        {
          name: "Communication (verbal & nonverbal)",
          direction: "high",
          delta_pct: { severe: 6, moderate: 4, typical: -3 },
        },
        {
          name: "RRB / Sensory cluster",
          direction: "high",
          delta_pct: { severe: 6, moderate: 3, typical: -3 },
        },
      ],
    },
    "SRS-2": {
      cap_pct: 15,
      subscales: [
        {
          name: "Social Awareness",
          direction: "high",
          delta_pct: { severe: 3, moderate: 2, typical: -2 },
        },
        {
          name: "Social Cognition",
          direction: "high",
          delta_pct: { severe: 3, moderate: 2, typical: -2 },
        },
        {
          name: "Social Communication",
          direction: "high",
          delta_pct: { severe: 3, moderate: 2, typical: -2 },
        },
        {
          name: "Social Motivation",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Restricted Interests & Repetitive Behavior",
          direction: "high",
          delta_pct: { severe: 4, moderate: 2, typical: -2 },
        },
      ],
    },
    ASRS: {
      cap_pct: 8,
      subscales: [
        {
          name: "Social / Communication",
          direction: "high",
          delta_pct: { severe: 3, moderate: 2, typical: -2 },
        },
        {
          name: "Unusual Behaviors",
          direction: "high",
          delta_pct: { severe: 3, moderate: 2, typical: -2 },
        },
        {
          name: "Self-Regulation",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
      ],
    },
    "GARS-3": {
      cap_pct: 5,
      subscales: [
        {
          name: "Restrictive/Repetitive Behaviors",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Social Interaction",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Communication",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Emotional Responses",
          direction: "high",
          delta_pct: { severe: 1, moderate: 1, typical: -0.5 },
        },
        {
          name: "Cognitive Style",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
        {
          name: "Maladaptive Speech",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
      ],
    },
    AQ: {
      cap_pct: 5,
      subscales: [
        {
          name: "Social Skill",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Attention Switching",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Communication",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Imagination",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Attention to Detail",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
      ],
    },
    "Vineland-3": {
      cap_pct: 10,
      subscales: [
        {
          name: "Socialization (low score)",
          direction: "low",
          delta_pct: { severe: 5, moderate: 3, typical: -3 },
        },
        {
          name: "Communication (low score)",
          direction: "low",
          delta_pct: { severe: 4, moderate: 2, typical: -2 },
        },
        {
          name: "Daily Living Skills (low score)",
          direction: "low",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Motor (low score, if applicable)",
          direction: "low",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
      ],
    },
    "ABAS-3": {
      cap_pct: 8,
      subscales: [
        {
          name: "Social (low)",
          direction: "low",
          delta_pct: { severe: 4, moderate: 2, typical: -2 },
        },
        {
          name: "Communication (low)",
          direction: "low",
          delta_pct: { severe: 3, moderate: 2, typical: -2 },
        },
        {
          name: "Self-Direction (low)",
          direction: "low",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Daily Living / Practical (low)",
          direction: "low",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
      ],
    },
    "BRIEF-2": {
      cap_pct: 5,
      subscales: [
        {
          name: "Shift (cognitive flexibility)",
          direction: "high",
          delta_pct: { severe: 3, moderate: 2, typical: -2 },
        },
        {
          name: "Working Memory",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
        {
          name: "Plan / Organize",
          direction: "high",
          delta_pct: { severe: 1, moderate: 1, typical: -0.5 },
        },
        {
          name: "Initiate",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: -1 },
        },
        {
          name: "Self-Monitor / Task-Monitor",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
        {
          name: "Inhibit / Emotional Control / Organization of Materials",
          direction: "high",
          delta_pct: { severe: 0.5, moderate: 0.5, typical: -0.25 },
        },
      ],
    },
    BDEFS: {
      cap_pct: 4,
      subscales: [
        {
          name: "Organization & Problem-Solving",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
        {
          name: "Time Management",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
        {
          name: "Self-Motivation",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
        {
          name: "Emotion Regulation",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
        {
          name: "Self-Restraint",
          direction: "high",
          delta_pct: { severe: 0.5, moderate: 0.25, typical: -0.25 },
        },
      ],
    },
    "WISC-V_WPPSI-IV_WAIS-IV": {
      cap_pct: 5,
      rules: [
        {
          name: "Processing Speed Index low",
          direction: "low",
          delta_pct: { severe: 3, moderate: 2, typical: -1 },
        },
        {
          name: "Working Memory Index low",
          direction: "low",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
        {
          name: "Visual Spatial / Fluid Reasoning low",
          direction: "low",
          delta_pct: { severe: 0.5, moderate: 0.25, typical: -0.25 },
        },
        {
          name: "Comprehension low",
          direction: "low",
          delta_pct: { severe: 2, moderate: 1, typical: -0.5 },
        },
        {
          name: "Discrepancy: VS/FR ≫ VCI (≥15 pts)",
          direction: "high",
          delta_pct: { severe: 2, moderate: 1, typical: 0 },
        },
      ],
    },
    "CELF-5": {
      cap_pct: 5,
      subscales: [
        {
          name: "Pragmatics / Observational",
          direction: "low",
          delta_pct: { severe: 3, moderate: 2, typical: -1 },
        },
        {
          name: "Understanding Spoken Paragraphs",
          direction: "low",
          delta_pct: { severe: 2, moderate: 1, typical: -0.5 },
        },
        {
          name: "Following Directions",
          direction: "low",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
        {
          name: "Formulated / Recalling Sentences / Word Classes",
          direction: "low",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
      ],
    },
    "Sensory Profile 2": {
      cap_pct: 6,
      quadrants: [
        {
          name: "Sensitivity (quadrant)",
          direction: "high",
          delta_pct: { severe: 1.5, moderate: 1, typical: -0.5 },
        },
        {
          name: "Avoiding (quadrant)",
          direction: "high",
          delta_pct: { severe: 1.5, moderate: 1, typical: -0.5 },
        },
        {
          name: "Seeking (quadrant)",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
        {
          name: "Registration (quadrant)",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
      ],
      modalities: [
        {
          name: "Modalities (Auditory/Visual/Tactile/Vestibular/Oral)",
          direction: "high",
          delta_pct: { severe: 1, moderate: 0.5, typical: -0.5 },
        },
      ],
    },
  },
};

import type { Condition } from "../types";

export const ASRS_CONDITION_WEIGHTS_2_5: Record<Condition, Record<string, Record<string, number>>> = {
  ASD: {
    asrs_social_communication: { Average: 0, "Slightly Elevated": 1, Elevated: 2, "Very Elevated": 3 },
    asrs_unusual_behaviours: { Average: 0, "Slightly Elevated": 1, Elevated: 2, "Very Elevated": 3 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
  },
  FASD: {
    asrs_social_communication: { Average: -1, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 0 },
    asrs_unusual_behaviours: { Average: -1, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
  },
  ADHD: {
    asrs_social_communication: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_unusual_behaviours: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
  },
  ID: {
    asrs_social_communication: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 1 },
    asrs_unusual_behaviours: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
  },
};

export const ASRS_CONDITION_WEIGHTS_6_18: Record<Condition, Record<string, Record<string, number>>> = {
  ASD: {
    asrs_social_communication: { Average: 0, "Slightly Elevated": 1, Elevated: 2, "Very Elevated": 3 },
    asrs_unusual_behaviours: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 0 },
  },
  FASD: {
    asrs_social_communication: { Average: -1, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 0 },
    asrs_unusual_behaviours: { Average: -1, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 1 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
  },
  ADHD: {
    asrs_social_communication: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 1 },
    asrs_unusual_behaviours: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
  },
  ID: {
    asrs_social_communication: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_unusual_behaviours: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
  },
};

import type { Condition } from "../types";

const base = {
  ASD: {
    asrs_social_communication: { Average: 0, "Slightly Elevated": 1, Elevated: 2, "Very Elevated": 3 },
    asrs_unusual_behaviours: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 0 },
    asrs_peer_socialization: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_adult_socialization: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_social_emotional_reciprocity: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_atypical_language: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_stereotypy: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_behavioral_rigidity: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_sensory_sensitivity: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_attention_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_attention: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
  },
  FASD: {
    asrs_social_communication: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_unusual_behaviours: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_peer_socialization: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_adult_socialization: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_social_emotional_reciprocity: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_atypical_language: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_stereotypy: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_behavioral_rigidity: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_sensory_sensitivity: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_attention_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
    asrs_attention: { Average: 0, "Slightly Elevated": 0, Elevated: 1, "Very Elevated": 2 },
  },
  ADHD: {
    asrs_social_communication: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_unusual_behaviours: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_peer_socialization: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_adult_socialization: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_social_emotional_reciprocity: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_atypical_language: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_stereotypy: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_behavioral_rigidity: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_sensory_sensitivity: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_attention_self_regulation: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
    asrs_attention: { Average: 0, "Slightly Elevated": 1, Elevated: 1, "Very Elevated": 1 },
  },
  ID: {
    asrs_social_communication: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_unusual_behaviours: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_peer_socialization: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_adult_socialization: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_social_emotional_reciprocity: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_atypical_language: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_stereotypy: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_behavioral_rigidity: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_sensory_sensitivity: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_attention_self_regulation: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
    asrs_attention: { Average: 0, "Slightly Elevated": 0, Elevated: 0, "Very Elevated": 1 },
  },
} as const;

export const ASRS_CONDITION_WEIGHTS_2_5: Record<Condition, Record<string, Record<string, number>>> = base;
export const ASRS_CONDITION_WEIGHTS_6_18: Record<Condition, Record<string, Record<string, number>>> = base;


// Canonical buckets shared across ABAS & Vineland
export type CanonicalBand = "EL" | "VL" | "LA" | "AVG" | "HA" | "VH" | "EH";

// Exact phrase → canonical bucket (compare AFTER normalization)
const PHRASE_TO_CANONICAL: Record<string, CanonicalBand> = {
  // Low end
  "extremely low": "EL",
  "low": "EL",                 // Vineland "Low"
  "very low": "VL",
  "moderately low": "VL",      // Vineland

  // Mid
  "low average": "LA",
  "below average": "LA",
  "average": "AVG",
  "adequate": "AVG",           // Vineland
  "typical": "AVG",
  "age appropriate": "AVG",
  "within normal limits": "AVG",

  // High end
  "high average": "HA",
  "above average": "HA",
  "very high": "VH",
  "moderately high": "VH",     // Vineland
  "extremely high": "EH",
  "high": "EH",                // Vineland "High"
};

export function normalizeBandTerm(label: string): CanonicalBand | undefined {
  const key = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z ]/g, "")   // strip punctuation
    .replace(/\s+/g, " ");     // collapse whitespace
  return PHRASE_TO_CANONICAL[key];
}

// Single source of truth for colors
export function getBandColor(label: string): string {
  switch (normalizeBandTerm(label)) {
    case "EL":  return "#ef4444"; // red-500
    case "VL":  return "#f97316"; // orange-500
    case "LA":  return "#f59e0b"; // amber-500
    case "AVG": return "#64748b"; // slate-500 (neutral)
    case "HA":  return "#14b8a6"; // teal-500
    case "VH":  return "#22c55e"; // green-500
    case "EH":  return "#16a34a"; // green-600
    default:    return "#475569"; // fallback
  }
}

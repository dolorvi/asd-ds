export const SEVERITY_ORDER = [
  "Extremely Low","Very Low","Low Average","Average","High Average","Very High","Extremely High"
] as const;

export const SEVERITY_COLOR: Record<(typeof SEVERITY_ORDER)[number], string> = {
  "Extremely Low":  "#ef4444", // red-500
  "Very Low":       "#f97316", // orange-500
  "Low Average":    "#f59e0b", // amber-500
  "Average":        "#64748b", // slate-500 (neutral)
  "High Average":   "#14b8a6", // teal-500
  "Very High":      "#22c55e", // green-500
  "Extremely High": "#16a34a", // green-600
};

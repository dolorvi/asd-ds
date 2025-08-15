import React, { useMemo } from "react";

export type ConditionGlyphProps = {
  label: string;
  color: string;
  posteriorPct: number; // 0..1
  completenessPct: number; // 0..1
  confidence: string;
  badges?: string[];
};

export function ConditionGlyph({
  label,
  color,
  posteriorPct,
  completenessPct,
  confidence,
  badges = [],
}: ConditionGlyphProps) {
  const innerCirc = useMemo(() => 2 * Math.PI * 20, []); // r=20
  const outerCirc = useMemo(() => 2 * Math.PI * 24, []); // r=24
  const posteriorOffset = innerCirc * (1 - posteriorPct);
  const completeOffset = outerCirc * (1 - completenessPct);

  return (
    <div className="condition-glyph" style={{ width: 72 }}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r="20"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="28"
          cy="28"
          r="20"
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={innerCirc}
          strokeDashoffset={posteriorOffset}
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeDasharray={outerCirc}
          strokeDashoffset={completeOffset}
          style={{ transition: "stroke-dashoffset 0.5s", opacity: 0.4 }}
        />
      </svg>
      <div className="glyph-label" title={`${label} ${(posteriorPct * 100).toFixed(0)}%`}>
        {label} {(posteriorPct * 100).toFixed(0)}%
      </div>
      {badges.length > 0 && (
        <div className="glyph-badges">
          {badges.map((b) => (
            <span className="badge" key={b}>
              {b}
            </span>
          ))}
        </div>
      )}
      <div className="sr-only">{confidence} confidence</div>
    </div>
  );
}

export default ConditionGlyph;

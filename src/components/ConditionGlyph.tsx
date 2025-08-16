import React from "react";

export type ConditionGlyphProps = {
  label: string;
  color: string;
  posteriorPct: number; // 0..1
  badges?: string[];
};

export function ConditionGlyph({
  label,
  color,
  posteriorPct,
  badges = [],
}: ConditionGlyphProps) {
  if (posteriorPct <= 0) return null;

  const r = 24 * Math.sqrt(posteriorPct);
  const cx = 28;
  const cy = 28;

  return (
    <div className="condition-glyph" style={{ width: 72 }}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={color}
          opacity={0.3}
          stroke={color}
          strokeWidth="2"
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill="black"
        >
          {(posteriorPct * 100).toFixed(0)}%
        </text>
      </svg>
      <div className="glyph-label" title={`${label} ${(posteriorPct * 100).toFixed(0)}%`}>
        {label}
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
    </div>
  );
}

export default ConditionGlyph;

import React, { useMemo, useState } from "react";
import type { Condition } from "../types";

type EvidenceRadarProps = {
  domainScores: Record<string, number>; // 0..1
  pathwayScores?: Record<Condition, Record<string, number>>;
};

function polygonPath(scores: Record<string, number>, radius: number) {
  const keys = Object.keys(scores);
  const step = (Math.PI * 2) / keys.length;
  return keys
    .map((k, i) => {
      const r = (scores[k] ?? 0) * radius;
      const angle = i * step - Math.PI / 2;
      const x = radius + r * Math.cos(angle);
      const y = radius + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");
}

export function EvidenceRadar({ domainScores, pathwayScores }: EvidenceRadarProps) {
  const [showPathways, setShowPathways] = useState(false);
  const size = 120;
  const radius = size / 2;
  const basePath = useMemo(() => polygonPath(domainScores, radius), [domainScores, radius]);

  return (
    <div className="evidence-radar" style={{ width: size, textAlign: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon points={basePath} fill="rgba(37,99,235,0.2)" stroke="#2563eb" />
        {showPathways &&
          pathwayScores &&
          Object.entries(pathwayScores).map(([name, scores]) => (
            <polygon
              key={name}
              points={polygonPath(scores, radius)}
              fill="none"
              strokeWidth={2}
              stroke={
                name === "ASD"
                  ? "#2563eb"
                  : name === "ADHD"
                  ? "#f59e0b"
                  : name === "FASD"
                  ? "#8b5cf6"
                  : "#14b8a6"
              }
              opacity={0.6}
            />
          ))}
      </svg>
      <label className="small row row--center" style={{ justifyContent: "center", gap: 4 }}>
        <input
          type="checkbox"
          checked={showPathways}
          onChange={() => setShowPathways((v) => !v)}
        />
        <span>Per-pathway</span>
      </label>
    </div>
  );
}

export default EvidenceRadar;

import React from "react";

type TernaryMapProps = {
  asd: number;
  adhd: number;
  fasd: number;
};

export function TernaryMap({ asd, adhd, fasd }: TernaryMapProps) {
  const size = 120;
  const height = (Math.sqrt(3) / 2) * size;
  const sum = asd + adhd + fasd || 1;
  const a = asd / sum;
  const b = adhd / sum;
  const c = fasd / sum;
  const x = a * size * 0.5 + b * 0 + c * size;
  const y = a * 0 + (b + c) * height;

  return (
    <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`} className="ternary-map">
      <polygon
        points={`${size / 2},0 0,${height} ${size},${height}`}
        fill="none"
        stroke="#e5e7eb"
      />
      <circle cx={x} cy={y} r={4} fill="#2563eb" />
      <text x={size / 2} y={-4} textAnchor="middle" className="small">ASD</text>
      <text x={0} y={height + 12} className="small">ADHD</text>
      <text x={size} y={height + 12} textAnchor="end" className="small">FASD</text>
    </svg>
  );
}

export default TernaryMap;

import React from "react";

export function MinDatasetProgress({ count, total }: { count: number; total: number }) {
  const pct = total ? Math.min(100, (count / total) * 100) : 0;
  return (
    <div className="stack stack--sm">
      <div className="row row--between">
        <div>Minimum dataset: {count}/{total} met</div>
      </div>
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

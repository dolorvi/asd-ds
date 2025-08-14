import React from "react";
import { Card } from "../components/primitives";

export function DiffPanel({
  diff,
  setDiff,
}: {
  diff: Record<string, any>;
  setDiff: (fn: (d: any) => any) => void;
}) {
  const update = (k: string, v: any) => setDiff((d: any) => ({ ...d, [k]: v }));

  const items: { key: string; label: string; tip: string }[] = [
    { key: "adhdFeatures", label: "ADHD features", tip: "ADHD traits may overlap" },
    { key: "languageDisorder", label: "Language disorder (structural)", tip: "Structural language issues" },
    { key: "globalID", label: "Global ID", tip: "Global intellectual disability" },
    { key: "anxietyPrimary", label: "Anxiety primary", tip: "Anxiety appears primary driver" },
    { key: "ocdFeatures", label: "OCD features", tip: "Obsessive-compulsive traits" },
    { key: "trauma", label: "Trauma", tip: "Significant trauma history" },
  ];

  return (
    <Card title="Comorbidity">
      <div className="stack stack--sm">
        {items.map((item) => (
          <label key={item.key} className="row" style={{ alignItems: "center", gap: 4 }}>
            <input
              type="checkbox"
              checked={!!diff[item.key]}
              onChange={(e) => update(item.key, e.target.checked)}
            />
            {item.label}
            <span title={item.tip} style={{ marginLeft: 4 }}>?</span>
          </label>
        ))}
      </div>
    </Card>
  );
}

export default DiffPanel;

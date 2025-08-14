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

  const items: [string, string][] = [
    ["ADHD", "ADHD indicators"],
    ["DLD", "Language disorder"],
    ["ID", "Intellectual disability"],
    ["Anxiety", "Anxiety/OCD"],
    ["Depression", "Depression"],
    ["TraumaPTSD", "Trauma/PTSD"],
    ["FASD", "FASD"],
    ["Tics", "Tics"],
  ];

  return (
    <Card title="Comorbidity / Differential">
      <div className="stack stack--sm">
        {items.map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={!!diff[key]}
              onChange={(e) => update(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
        <label>
          Other
          <input
            type="text"
            value={diff.Other || ""}
            onChange={(e) => update("Other", e.target.value)}
          />
        </label>
      </div>
    </Card>
  );
}

export default DiffPanel;

import React from "react";
import type { SeverityState } from "../types";
import { Card } from "../components/primitives";

export function DomainPanel({
  title,
  domains,
  valueMap,
  setValueMap,
  highlightMap,
}: {
  title: string;
  domains: { key: string; label: string; severities: string[] }[];
  valueMap: SeverityState;
  setValueMap: (fn: (s: SeverityState) => SeverityState) => void;
  highlightMap?: Record<string, Record<string, number>>;
}) {
  return (
    <Card title={title}>
      <div className="grid grid--sm">
        {domains.map((d) => (
          <section key={d.key} className="card">
            <div className="stack stack--sm">
                <label title={d.label}>
                  <div className="card-title" title={d.label}>{d.label}</div>
                <select
                  value={valueMap[d.key]?.severity || ""}
                  className={
                    highlightMap && Math.abs(highlightMap[d.key]?.[valueMap[d.key]?.severity || ""] || 0) >= 3
                      ? "tone-danger"
                      : undefined
                  }
                  onChange={(e) =>
                    setValueMap((s) => ({
                      ...s,
                      [d.key]: { ...s[d.key], severity: e.target.value },
                    }))
                  }
                >
                  <option value="">Select</option>
                  {d.severities.map((sev) => (
                    <option key={sev} value={sev}>
                      {sev}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        ))}
      </div>
    </Card>
  );
}

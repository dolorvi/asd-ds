import React from "react";
import type { SeverityState } from "../types";
import { Card } from "../components/primitives";

export function DomainPanel({
  title,
  domains,
  valueMap,
  setValueMap,
}: {
  title: string;
  domains: { key: string; label: string; severities: string[] }[];
  valueMap: SeverityState;
  setValueMap: (fn: (s: SeverityState) => SeverityState) => void;
}) {
  return (
    <Card title={title}>
      <div className="grid grid--sm">
        {domains.map((d) => (
          <section key={d.key} className="card">
            <div className="stack stack--sm">
              <label>
                <div className="card-title">{d.label}</div>
                <select
                  value={valueMap[d.key]?.severity || ""}
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

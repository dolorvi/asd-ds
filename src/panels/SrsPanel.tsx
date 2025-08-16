import React from "react";
import type { SeverityState } from "../types";
import { Card } from "../components/primitives";

export function SrsPanel({
  title,
  domains,
  srs2,
  setSRS2,
  highlightMap,
}:{
  title: string;
  domains:{key:string;label:string;severities:string[]}[];
  srs2:SeverityState;
  setSRS2:(fn:(s:SeverityState)=>SeverityState)=>void;
  highlightMap?: Record<string, Record<string, number>>;
}) {
  return (
    <Card title={title}>
      <div className="grid grid--sm">
        {domains.map((d) => {
          const sel = srs2[d.key]?.severity || "";
          const danger =
            highlightMap && Math.abs(highlightMap[d.key]?.[sel] || 0) >= 3;
          return (
            <section key={d.key} className="card">
              <div className="stack stack--sm">
                <div className="card-title" title={d.label}>{d.label}</div>
                <label>
                  <select
                    value={sel}
                    className={(sel ? "" : "invalid") + (danger ? " tone-danger" : "")}
                    title={sel ? "" : "Select severity"}
                    onChange={(e) =>
                      setSRS2((s) => ({
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
          );
        })}
      </div>
    </Card>
  );
}
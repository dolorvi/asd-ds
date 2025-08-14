import React from "react";
import type { SeverityState } from "../types";
import { Card } from "../components/primitives";

export function SrsPanel({
  title,
  domains,
  srs2,
  setSRS2,
}:{
  title: string;
  domains:{key:string;label:string;severities:string[]}[];
  srs2:SeverityState;
  setSRS2:(fn:(s:SeverityState)=>SeverityState)=>void;
}) {
  return (
    <Card title={title}>
      <div className="grid grid--sm">
        {domains.map((d) => {
          const sel = srs2[d.key]?.severity || "";
          return (
            <section key={d.key} className="card">
              <div className="stack stack--sm">
                <div className="card-title">{d.label}</div>
                <label>
                  <select
                    value={sel}
                    className={sel ? "" : "invalid"}
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
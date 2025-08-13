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
        {domains.map((d) => (
          <section key={d.key} className="card">
            <details>
              <summary className="section-title">
                {d.label}
                {srs2[d.key]?.severity ? ` – ${srs2[d.key]?.severity}` : ""}
              </summary>
              <div className="stack stack--sm">
                <label>
                  <select
                    value={srs2[d.key]?.severity || ""}
                    className={srs2[d.key]?.severity ? "" : "invalid"}
                    title={srs2[d.key]?.severity ? "" : "Select severity"}
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
            </details>
          </section>
        ))}
      </div>
    </Card>
  );
}
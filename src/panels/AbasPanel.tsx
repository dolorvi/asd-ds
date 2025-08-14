import React from "react";
import type { SeverityState } from "../types";
import { Card } from "../components/primitives";

export function AbasPanel({
  title,
  domains,
  options,
  valueMap,
  setValueMap,
}:{
  title: string;
  domains: { key: string; label: string }[];
  options: string[];
  valueMap: SeverityState;
  setValueMap: (fn: (s: SeverityState) => SeverityState) => void;
}) {
  return (
    <Card title={title}>
      <div className="grid grid--sm">
        {domains.map(d=>{
          const sel = valueMap[d.key]?.severity || "";
          return (
            <section key={d.key} className="card">
              <div className="stack stack--sm">
                <label>
                  <div className="card-title">{d.label}</div>
                  <select
                    value={sel}
                    onChange={(e)=>setValueMap(s=>({ ...s, [d.key]: { ...s[d.key], severity: e.target.value }}))}
                  >
                    <option value="">Select</option>
                    {options.map((sev)=>(
                      <option key={sev} value={sev}>{sev}</option>
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

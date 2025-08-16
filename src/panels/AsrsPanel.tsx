import React from "react";
import type { SeverityState } from "../types";
import { Card } from "../components/primitives";

export function AsrsPanel({
  title,
  domains,
  asrs,
  setASRS,
  highlightMap,
}:{
  title: string;
  domains:{key:string;label:string;severities:string[]}[];
  asrs:SeverityState;
  setASRS:(fn:(s:SeverityState)=>SeverityState)=>void;
  highlightMap?: Record<string, Record<string, number>>;
}) {
  return (
    <Card title={title}>
      <div className="grid grid--sm">
        {domains.map(d=>{
          const sel = asrs[d.key]?.severity || "";
          const wt = highlightMap?.[d.key]?.[sel] ?? 0;
          const tone =
            wt >= 5
              ? "tone-warn"
              : sel === "Very Elevated" || wt >= 3 || wt <= -5
              ? "tone-danger"
              : undefined;
          return (
            <section key={d.key} className="card">
              <div className="stack stack--sm">
                <label title={d.label}>
                  <div className="card-title" title={d.label}>{d.label}</div>
                  <select
                    value={sel}
                    className={tone}
                    onChange={(e)=>setASRS(s=>({ ...s, [d.key]: { ...s[d.key], severity: e.target.value }}))}
                  >
                    <option value="">Select</option>
                    {d.severities.map(sev => <option key={sev} value={sev}>{sev}</option>)}
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

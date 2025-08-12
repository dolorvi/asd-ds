import React from "react";
import type { SeverityState } from "../types";
import { Card } from "../components/primitives";
import { ChipGroup } from "../components/ui";
import { getBandColor } from "../components/severity";

export function AbasPanel({
  domains, abas, setABAS
}:{
  domains:{key:string;label:string;severities:string[]}[];
  abas:SeverityState;
  setABAS:(fn:(s:SeverityState)=>SeverityState)=>void;
}) {
  return (
    <Card title="ABAS-3 — Domain Entries">
      <div className="grid">
        {domains.map(d=>{
          const sel = abas[d.key]?.severity || "";
          return (
            <section key={d.key} className="card">
              <div className="stack stack--sm">
                <div className="row row--between row--center">
                  <div className="section-title">{d.label}</div>
                  {sel && <span className="chip" style={{ background:getBandColor(sel, "goodHigh"), color:"#0b1220" }}>{sel}</span>}
                </div>
                <ChipGroup
                  options={d.severities}
                  value={sel}
                  onChange={(sev)=>setABAS(s=>({ ...s, [d.key]: { ...s[d.key], severity: sev }}))}
                  getColor={(label)=>getBandColor(label, "goodHigh")}
                />
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}

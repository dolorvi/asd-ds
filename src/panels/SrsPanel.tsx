import React from "react";
import type { SeverityState } from "../types";
import { Card } from "../components/primitives";
import { ChipGroup } from "../components/ui";
import { getBandColor } from "../components/severity";

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
      <div className="grid">
        {domains.map(d=>(
          <section key={d.key} className="card">
            <div className="stack stack--sm">
              <div className="section-title">{d.label}</div>
              <ChipGroup
                options={d.severities}
                value={srs2[d.key]?.severity || ""}
                onChange={(sev)=>setSRS2(s=>({ ...s, [d.key]: { ...s[d.key], severity: sev }}))}
                getColor={(label)=>{
                  switch(label){
                    case "Average": return getBandColor("Average","goodHigh");
                    case "Mild": return getBandColor("Low Average","goodHigh");
                    case "Moderate": return getBandColor("Moderately Elevated","goodHigh");
                    case "Severe": return getBandColor("Severe","goodHigh");
                    default: return getBandColor(label,"goodHigh");
                  }
                }}
              />
            </div>
          </section>
        ))}
      </div>
    </Card>
  );
}
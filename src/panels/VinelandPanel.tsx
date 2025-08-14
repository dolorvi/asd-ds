import React from "react";
import { Card } from "../components/primitives";
import { ChipGroup } from "../components/ui";
import { getBandColor } from "../components/severity";

export function VinelandPanel({
  title,
  domains,
  options,
  valueMap,
  setValueMap,
}:{
  title: string;
  domains: { key: string; label: string }[];
  options: string[];
  valueMap: Record<string, string>;
  setValueMap: (fn: (s: Record<string, string>) => Record<string, string>) => void;
}) {
  return (
    <Card title={title}>
      <div className="grid grid--sm">
        {domains.map(d=>{
          const sel = valueMap[d.key] || "";
          return (
            <section key={d.key} className="card">
              <div className="stack stack--sm">
                <div className="row row--between row--center">
                  <div className="card-title">{d.label}</div>
                  {sel && <span className="chip" style={{ background:getBandColor(sel, "goodHigh"), color:"#0b1220" }}>{sel}</span>}
                </div>
                <ChipGroup
                  options={options}
                  value={sel}
                  onChange={(sev)=>setValueMap(s=>({ ...s, [d.key]: sev }))}
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

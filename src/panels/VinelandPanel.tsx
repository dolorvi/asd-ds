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
  highlightMap,
}:{
  title: string;
  domains: { key: string; label: string }[];
  options: string[];
  valueMap: Record<string, string>;
  setValueMap: (fn: (s: Record<string, string>) => Record<string, string>) => void;
  highlightMap?: Record<string, Record<string, number>>;
}) {
  return (
    <Card title={title}>
      <div className="grid grid--sm">
        {domains.map(d=>{
          const sel = valueMap[d.key] || "";
          const wt = highlightMap?.[d.key]?.[sel] ?? 0;
          const tone =
            wt >= 5
              ? "tone-warn"
              : wt >= 3 || wt <= -5
              ? "tone-danger"
              : "";
          return (
            <section key={d.key} className={"card" + (tone ? ` ${tone}` : "") }>
              <div className="stack stack--sm">
                <div className="row row--between row--center">
                  <div className="card-title" title={d.label}>{d.label}</div>
                  {sel && <span className="chip" style={{ background:getBandColor(sel, "goodHigh"), color:"#0b1220" }} title={sel}>{sel}</span>}
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

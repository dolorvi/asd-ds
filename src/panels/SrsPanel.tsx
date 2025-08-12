import React from "react";
import { Card, Chip, Stack } from "./primitives";
import type { SeverityState } from "./src/types";

export function SrsPanel({
  domains, srs2, setSRS2
}:{ domains: {key:string; label:string; severities:string[]}[];
   srs2: SeverityState; setSRS2: (fn:(s:SeverityState)=>SeverityState)=>void }) {
  return (
    <Card title="SRS-2 — Domain Entries" right={null}>
      <div className="grid">
        {domains.map(d=>(
          <section key={d.key} className="card">
            <Stack gap="sm">
              <div className="section-title">{d.label}</div>
              <div className="row row--wrap">
                {d.severities.map(sev=>(
                  <Chip key={sev} active={srs2[d.key]?.severity===sev}
                        onClick={()=>setSRS2(s=>({ ...s, [d.key]: { ...s[d.key], severity: sev }}))}>
                    {sev}
                  </Chip>
                ))}
              </div>
            </Stack>
          </section>
        ))}
      </div>
    </Card>
  );
}
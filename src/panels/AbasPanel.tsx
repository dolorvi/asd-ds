import React from "react";
import { Card, Chip, Row, Stack } from "@/ui/primitives";
import { getBandColor } from "@/components/severity";
import type { SeverityState } from "@/types";

export function AbasPanel({
  domains, abas, setABAS
}:{ domains:{key:string;label:string;severities:string[]}[];
   abas:SeverityState; setABAS:(fn:(s:SeverityState)=>SeverityState)=>void }) {
  return (
    <Card title="ABAS-3 — Domain Entries">
      <div className="grid">
        {domains.map(d=>{
          const sel = abas[d.key]?.severity || "";
          return (
            <section key={d.key} className="card">
              <Stack gap="sm">
                <Row justify="between" align="center">
                  <div className="section-title">{d.label}</div>
                  {sel && <span className="chip" style={{background:getBandColor(sel), color:"#0b1220"}}>{sel}</span>}
                </Row>
                <Row wrap>
                  {d.severities.map(sev=>(
                    <Chip key={sev} active={sel===sev}
                          onClick={()=>setABAS(s=>({ ...s, [d.key]: { ...s[d.key], severity: sev }}))}>
                      {sev}
                    </Chip>
                  ))}
                </Row>
              </Stack>
            </section>
          );
        })}
      </div>
    </Card>
  );
}
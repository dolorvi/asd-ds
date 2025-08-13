import { Card, Button, Stack } from "../components/primitives";

export function SummaryPanel({
  model, config, supportEstimate, recommendation, exportSummary
}:{ model:any; config:any; supportEstimate:string; recommendation:string[]; exportSummary:()=>void }) {
  return (
    <aside className="summary">
      <Card title="Summary">
        <Stack>
          <div>
            <div style={{fontSize:32,fontWeight:800}}>{(model.p*100).toFixed(1)}%</div>
            <div className="small">Overall ASD likelihood</div>
            <div className="small">Cutpoint: {(model.cut*100).toFixed(0)}% ({config.riskTolerance})</div>
          </div>
          <div>
            Decision: {model.p >= model.cut
              ? <span className="badge badge--ok">Above threshold — proceed</span>
              : <span className="badge badge--warn">Below threshold — consider more data</span>}
          </div>
          <div className="card" style={{textAlign:"center"}}>{supportEstimate}</div>
          <div className="row row--between" style={{gap:8}}>
            <Button onClick={exportSummary}>Export summary</Button>
            <Button kind="primary" onClick={()=>window.print()}>Export full</Button>
          </div>
        </Stack>
      </Card>
    </aside>
  );
}
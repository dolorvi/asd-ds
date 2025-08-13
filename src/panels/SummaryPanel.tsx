import { Card, Stack } from "../components/primitives";

export function SummaryPanel({
  model, config, supportEstimate, recommendation, exportSummary
}:{ model:any; config:any; supportEstimate:string; recommendation:string[]; exportSummary:()=>void }) {
  const handleExport = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "summary") exportSummary();
    if (v === "full") window.print();
    e.target.value = "";
  };
  return (
    <aside className="summary" style={{position:"sticky", top:0}}>
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
          <div className="row" style={{gap:8}}>
            <label style={{flex:1}}>
              <select defaultValue="" onChange={handleExport} title="Export options">
                <option value="" disabled>
                  Export...
                </option>
                <option value="summary" title="Export only the summary view">
                  Summary
                </option>
                <option value="full" title="Export the full report">
                  Full
                </option>
              </select>
            </label>
          </div>
        </Stack>
      </Card>
    </aside>
  );
}
import { Card, Stack } from "../components/primitives";
import type { MinDatasetItem } from "../components/MinDatasetProgress";

export function SummaryPanel({
  model,
  config,
  supportEstimate,
  recommendation,
  exportSummary,
  minDatasetItems,
}:{
  model: any;
  config: any;
  supportEstimate: string;
  recommendation: string[];
  exportSummary: () => void;
  minDatasetItems: MinDatasetItem[];
}) {
  const handleExport = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "summary") exportSummary();
    if (v === "full") window.print();
    e.target.value = "";
  };
  const met = minDatasetItems.filter((i) => i.met).length;
  const unmet = minDatasetItems.filter((i) => !i.met);
  const percent = Math.round((met / minDatasetItems.length) * 100);
  const scrollTo = (id?: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
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
          <div className="stack stack--sm">
            <div className="row row--between small">
              <div>Minimum dataset</div>
              <div>{percent}%</div>
            </div>
            {unmet.length > 0 && (
              <div className="chip-row">
                {unmet.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="chip"
                    onClick={() => scrollTo(item.targetId)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
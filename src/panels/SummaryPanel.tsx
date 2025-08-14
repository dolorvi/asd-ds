import { Card, Stack } from "../components/primitives";
import type { MinDatasetItem } from "../components/MinDatasetProgress";

export function SummaryPanel({
  model,
  config,
  supportEstimate,
  recommendation,
  exportSummary,
  exportFull,
  version,
  timestamp,
  minDatasetItems,
  onThresholdChange,
  history,
}:{
  model: any;
  config: any;
  supportEstimate: string;
  recommendation: string[];
  exportSummary: () => void;
  exportFull: () => void;
  version: string;
  timestamp: string;
  minDatasetItems: MinDatasetItem[];
  onThresholdChange: (v: any) => void;
  history: { maskingIndicators: boolean; verbalFluency: string };
}) {
  const handleExport = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "summary") exportSummary();
    if (v === "full") exportFull();
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

  const drivers = (model.drivers || []).slice(0,3);
  const suggestionFor = (label: string) => {
    if (label === "Adaptive measure") return "Add an Adaptive measure (Vineland/ABAS)";
    if (label === "ASD instrument") return "Add an ASD instrument (e.g., ADOS-2, CARS)";
    if (label === "History") return "Gather developmental history";
    if (label.startsWith("≥")) return "Increase instrument count";
    return `Add ${label}`;
  };
  const suggestions = unmet.slice(0,2).map((i) => suggestionFor(i.label));
  const hasInstrumentMix = minDatasetItems.find((i) => i.label.includes("instrument") && i.met);
  const confidence =
    percent === 100 ? "High" : percent >= 50 && hasInstrumentMix ? "Medium" : "Low";

  const thresholdExplain: Record<number,string> = {
    0.8: "Requires at least 80% likelihood to proceed.",
    0.9: "Requires at least 90% likelihood to proceed.",
    0.99: "Requires near-certainty at 99% likelihood.",
  };
  return (
    <aside className="summary" id="summary-section" style={{position:"sticky", top:0}}>
      <div className="print-only small" style={{marginBottom:8}}>Generated {timestamp} • Version {version}</div>
      <Card title="Summary">
        <Stack>
          <div>
            <div style={{fontSize:32,fontWeight:800}}>{(model.p*100).toFixed(1)}%</div>
            <div className="small">Overall ASD likelihood</div>
            <label className="small row" style={{gap:8,alignItems:"center"}}>
              <span>Threshold:</span>
              <select
                value={config.certaintyThreshold}
                onChange={(e) => onThresholdChange(e.target.value)}
              >
                <option value={0.8}>80%</option>
                <option value={0.9}>90%</option>
                <option value={0.99}>99%</option>
              </select>
            </label>
            <div className="small">{thresholdExplain[config.certaintyThreshold]}</div>
          </div>
          <div>
            Decision: {model.p >= model.cut
              ? <span className="badge badge--ok">Above threshold — proceed</span>
              : <span className="badge badge--warn">Below threshold — consider more data</span>}
          </div>
          <div className="row" style={{gap:8,alignItems:"center"}}>
            <div className="card" style={{textAlign:"center",flex:1}}>{supportEstimate}</div>
            <span className="badge">{confidence} confidence</span>
          </div>
          {(history.maskingIndicators || history.verbalFluency) && (
            <div className="chip-row">
              {history.maskingIndicators && (
                <span className="chip chip--active" role="status" aria-label="Masking">Masking</span>
              )}
              {history.verbalFluency && (
                <span className="chip chip--active" role="status" aria-label={history.verbalFluency}>{history.verbalFluency}</span>
              )}
            </div>
          )}
          {history.maskingIndicators && (
            <div className="small">Weights adjusted for masking</div>
          )}
          {drivers.length > 0 && (
            <div>
              <div className="small">Top contributors</div>
              <ul className="small" style={{paddingLeft:16}} aria-label="Top drivers">
                {drivers.map((d: any) => (
                  <li key={d.name}>{d.name} {d.delta >=0 ? "+" : ""}{d.delta.toFixed(0)}%</li>
                ))}
              </ul>
            </div>
          )}
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
                    aria-label={item.label}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="small">
              <div>What to add next</div>
              <ul style={{paddingLeft:16, marginTop:4}}>
                {suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="row" style={{gap:8}}>
            <label style={{flex:1}}>
              <select defaultValue="" onChange={handleExport} title="Export options">
                <option value="" disabled>
                  Export...
                </option>
                <option value="summary" title="Export key findings and drivers">
                  Summary report (key findings & drivers)
                </option>
                <option value="full" title="Export all inputs and scores">
                  Full report (all inputs & scores)
                </option>
              </select>
            </label>
          </div>
        </Stack>
      </Card>
    </aside>
  );
}
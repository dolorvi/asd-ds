import { Card, Stack } from "../components/primitives";
import type { MinDatasetItem } from "../components/MinDatasetProgress";

export function SummaryPanel({
  model,
  config,
  supportEstimate,
  recommendation,
  exportSummary,
  minDatasetItems,
  onRiskToleranceChange,
}:{
  model: any;
  config: any;
  supportEstimate: string;
  recommendation: string[];
  exportSummary: () => void;
  minDatasetItems: MinDatasetItem[];
  onRiskToleranceChange: (v: any) => void;
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

  const riskExplain: Record<string,string> = {
    balanced: "50% cutpoint balances false positives and negatives.",
    sensitive: "40% cutpoint favors sensitivity to catch more cases.",
    specific: "60% cutpoint favors specificity to avoid false positives.",
  };
  return (
    <aside className="summary" style={{position:"sticky", top:0}}>
      <Card title="Summary">
        <Stack>
          <div>
            <div style={{fontSize:32,fontWeight:800}}>{(model.p*100).toFixed(1)}%</div>
            <div className="small">Overall ASD likelihood</div>
            <label className="small row" style={{gap:8,alignItems:"center"}}>
              <span>Threshold:</span>
              <select
                value={config.riskTolerance}
                onChange={(e) => onRiskToleranceChange(e.target.value)}
              >
                <option value="balanced">Balanced (50%)</option>
                <option value="sensitive">Sensitivity-favored (40%)</option>
                <option value="specific">Specificity-favored (60%)</option>
              </select>
            </label>
            <div className="small">{riskExplain[config.riskTolerance]}</div>
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
          {drivers.length > 0 && (
            <div>
              <div className="small">Top contributors</div>
              <ul className="small" style={{paddingLeft:16}}>
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
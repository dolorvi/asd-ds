import React from "react";
import { Card } from "../components/primitives";

export type FacialGrowthState = {
  sentinel_features_count: number;
  pfl_percentile: string;
  philtrum_rank: string;
  upper_lip_thin_rank: string;
  growth_deficiency: boolean;
};

export function FacialGrowthPanel({ state, setState }:{
  state: FacialGrowthState;
  setState: (fn: (s: FacialGrowthState) => FacialGrowthState) => void;
}) {
  return (
    <Card title="Facial & Growth">
      <div className="stack stack--md">
        <label>
          Sentinel features
          <select
            value={state.sentinel_features_count}
            onChange={(e) =>
              setState((s) => ({ ...s, sentinel_features_count: Number(e.target.value) }))
            }
          >
            {[0,1,2,3].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label>
          PFL percentile
          <input
            type="number"
            value={state.pfl_percentile}
            onChange={(e) => setState((s) => ({ ...s, pfl_percentile: e.target.value }))}
          />
        </label>

        <label>
          Philtrum rank
          <input
            type="number"
            value={state.philtrum_rank}
            onChange={(e) => setState((s) => ({ ...s, philtrum_rank: e.target.value }))}
          />
        </label>

        <label>
          Upper lip thin rank
          <input
            type="number"
            value={state.upper_lip_thin_rank}
            onChange={(e) => setState((s) => ({ ...s, upper_lip_thin_rank: e.target.value }))}
          />
        </label>

        <label className="row" style={{gap:8,alignItems:"center"}}>
          <input
            type="checkbox"
            checked={state.growth_deficiency}
            onChange={(e) => setState((s) => ({ ...s, growth_deficiency: e.target.checked }))}
          />
          <span>Growth deficiency (≤10th %ile)</span>
        </label>
      </div>
    </Card>
  );
}

export default FacialGrowthPanel;

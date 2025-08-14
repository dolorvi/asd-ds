import React from "react";
import { Card } from "../components/primitives";

export type ExposureState = {
  pae_level: string;
  timing: string[];
  source: string[];
};

const TIMING = [
  { key: "trimester1", label: "Trimester 1" },
  { key: "trimester2", label: "Trimester 2" },
  { key: "trimester3", label: "Trimester 3" },
  { key: "binge_patterns", label: "Binge patterns" },
];

const SOURCE = [
  { key: "biological_parent_report", label: "Biological parent report" },
  { key: "collateral", label: "Collateral" },
  { key: "records", label: "Records" },
  { key: "biomarker", label: "Biomarker" },
];

export function ExposurePanel({ state, setState }:{
  state: ExposureState;
  setState: (fn: (s: ExposureState) => ExposureState) => void;
}) {
  const toggle = (arr: string[], key: string) =>
    arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key];

  return (
    <Card title="Exposure">
      <div className="stack stack--md">
        <label>
          Prenatal alcohol exposure
          <select
            value={state.pae_level}
            onChange={(e) => setState((s) => ({ ...s, pae_level: e.target.value }))}
          >
            <option value="">Select</option>
            <option value="confirmed_heavy">Confirmed heavy</option>
            <option value="confirmed_some">Confirmed some</option>
            <option value="unknown">Unknown</option>
            <option value="denied">Denied</option>
          </select>
        </label>

        <fieldset>
          <legend className="small">Timing</legend>
          <div className="row row--wrap" style={{ gap: 8 }}>
            {TIMING.map((t) => (
              <label key={t.key} className="chip" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={state.timing.includes(t.key)}
                  onChange={() => setState((s) => ({ ...s, timing: toggle(s.timing, t.key) }))}
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="small">Source</legend>
          <div className="row row--wrap" style={{ gap: 8 }}>
            {SOURCE.map((t) => (
              <label key={t.key} className="chip" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={state.source.includes(t.key)}
                  onChange={() => setState((s) => ({ ...s, source: toggle(s.source, t.key) }))}
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </Card>
  );
}

export default ExposurePanel;

import React from "react";
import { Card } from "../components/primitives";
import { VERBAL_FLUENCY_OPTIONS } from "../data/autismProfile";

export function HistoryPanel({
  history,
  setHistory,
  observation,
  setObservation,
}: {
  history: {
    developmentalConcerns: string;
    earlyOnset: boolean;
    earlySocial: boolean;
    earlyRRB: boolean;
    regression: boolean;
    crossContextImpairment: boolean;
    familyHistory: boolean;
    maskingIndicators: boolean;
    verbalFluency: string;
  };
  setHistory: (fn: (h: any) => any) => void;
  observation: Record<string, any>;
  setObservation: (fn: (o: any) => any) => void;
}) {
  const updateHistory = (k: string, v: any) => setHistory((h: any) => ({ ...h, [k]: v }));
  const updateObservation = (k: string, v: any) =>
    setObservation((o: any) => ({ ...o, [k]: v }));

  return (
    <div className="stack stack--md">
      <Card title="History quick checklist">
        <div className="stack stack--sm">
          <label>
            <input
              type="checkbox"
              checked={history.earlyOnset}
              onChange={(e) => updateHistory("earlyOnset", e.target.checked)}
            />
            Onset {'<'}3y
          </label>
          <label>
            <input
              type="checkbox"
              checked={history.regression}
              onChange={(e) => updateHistory("regression", e.target.checked)}
            />
            Regression
          </label>
          <label>
            <input
              type="checkbox"
              checked={history.earlySocial}
              onChange={(e) => updateHistory("earlySocial", e.target.checked)}
            />
            Early social signs
          </label>
          <label>
            <input
              type="checkbox"
              checked={history.earlyRRB}
              onChange={(e) => updateHistory("earlyRRB", e.target.checked)}
            />
            Early RRB
          </label>
          <label>
            <input
              type="checkbox"
              checked={history.crossContextImpairment}
              onChange={(e) => updateHistory("crossContextImpairment", e.target.checked)}
            />
            Cross-setting
          </label>
          <label>
            <input
              type="checkbox"
              checked={history.familyHistory}
              onChange={(e) => updateHistory("familyHistory", e.target.checked)}
            />
            Family history
          </label>
        </div>
      </Card>

      <Card title="Developmental History">
        <div className="stack stack--sm">
          <label>
            <div className="section-title">Developmental concerns</div>
            <textarea
              value={history.developmentalConcerns}
              onChange={(e) => updateHistory("developmentalConcerns", e.target.value)}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={history.maskingIndicators}
              onChange={(e) => updateHistory("maskingIndicators", e.target.checked)}
            />
            Masking indicators
          </label>
          <label className="stack stack--xs">
            <div className="section-title">Verbal fluency</div>
            <select
              value={history.verbalFluency}
              onChange={(e) => updateHistory("verbalFluency", e.target.value)}
            >
              <option value=""></option>
              {VERBAL_FLUENCY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card title="Clinician Observation">
        <div className="grid grid--sm" style={{ marginBottom: 16 }}>
          {["A1", "A2", "A3", "B1", "B2", "B3", "B4"].map((k) => (
            <label key={k} className="stack stack--xs">
              <div className="section-title">{k}</div>
              <select
                value={observation[k]}
                onChange={(e) => updateObservation(k, Number(e.target.value))}
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <label className="stack stack--xs">
          <div className="section-title">Notes</div>
          <textarea
            value={observation.notes}
            onChange={(e) => updateObservation("notes", e.target.value)}
          />
        </label>
      </Card>
    </div>
  );
}

export default HistoryPanel;

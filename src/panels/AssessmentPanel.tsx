import React from "react";
import { Card, Row } from "../components/primitives";
import type { AssessmentSelection } from "../types";

export function AssessmentPanel({
  assessments,
  setAssessments,
  domain,
}: {
  assessments: AssessmentSelection[];
  setAssessments: (fn: (arr: AssessmentSelection[]) => AssessmentSelection[]) => void;
  domain: string;
}) {
  const items = assessments
    .map((a, index) => ({ ...a, index }))
    .filter((a) => a.domain === domain);

  const addAssessment = () => {
    const template = items[0];
    if (!template) return;
    setAssessments((arr) => [
      ...arr,
      { domain, options: template.options, selected: "", primary: false },
    ]);
  };

  const removeAssessment = (idx: number) => {
    setAssessments((arr) => arr.filter((_, i) => i !== idx));
  };

  const changeSelection = (idx: number, value: string) => {
    setAssessments((arr) => {
      const next = arr.slice();
      next[idx] = { ...next[idx], selected: value };
      return next;
    });
  };

  const togglePrimary = (idx: number) => {
    setAssessments((arr) => {
      const next = arr.map((a, i) => (i === idx ? { ...a, primary: !a.primary } : a));
      if (!arr[idx].primary && next[idx].primary && next[idx].selected) {
        window.alert(
          `You have selected ${next[idx].selected} as the main assessment for ${domain.toLowerCase()}`,
        );
      }
      return [...next].sort((a, b) => Number(b.primary) - Number(a.primary));
    });
  };

  return (
    <Card title={domain}>
      <div className="stack stack--sm">
        {items.map((a) => (
          <Row key={a.index} justify="between" align="center">
            <label style={{ flex: 1 }}>
              <select
                value={a.selected || ""}
                onChange={(e) => changeSelection(a.index, e.target.value)}
              >
                <option value="">Select</option>
                {a.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label className="row row--center" style={{ gap: 4 }}>
              <input
                type="checkbox"
                checked={a.primary || false}
                onChange={() => togglePrimary(a.index)}
              />
              Main
            </label>
            {items.length > 1 && (
              <button type="button" className="btn" onClick={() => removeAssessment(a.index)}>
                Remove
              </button>
            )}
          </Row>
        ))}
        <button type="button" className="btn" onClick={addAssessment}>
          Add Assessment
        </button>
      </div>
    </Card>
  );
}

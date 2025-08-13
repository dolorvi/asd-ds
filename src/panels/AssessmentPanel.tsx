import React from "react";
import { Card, Row } from "../components/primitives";
import type { AssessmentSelection } from "../types";

export function AssessmentPanel({
  assessments,
  setAssessments,
  domains,
}: {
  assessments: AssessmentSelection[];
  setAssessments: (fn: (arr: AssessmentSelection[]) => AssessmentSelection[]) => void;
  domains?: string[];
}) {
  const togglePrimary = (i: number) => {
    setAssessments((arr) => {
      const next = arr.map((a, idx) => (idx === i ? { ...a, primary: !a.primary } : a));
      // if just turned primary on and a tool is selected, notify
      if (!arr[i].primary && next[i].primary && next[i].selected) {
        window.alert(
          `You have selected ${next[i].selected} as the main assessment for ${next[i].domain.toLowerCase()}`
        );
      }
      // sort primaries first
      return [...next].sort((a, b) => Number(b.primary) - Number(a.primary));
    });
  };

  const changeSelection = (i: number, value: string) => {
    setAssessments((arr) => {
      const next = arr.slice();
      next[i] = { ...next[i], selected: value };
      return next;
    });
  };

  const visible = domains ? assessments.filter((a) => domains.includes(a.domain)) : assessments;

  return (
    <Card title="Assessment Tools">
      <div className="stack">
        {visible.map((a, i) => (
          <Row key={a.domain} justify="between" align="center">
            <label style={{ flex: 1 }}>
              <div className="section-title">{a.domain}</div>
              <select value={a.selected || ""} onChange={(e) => changeSelection(i, e.target.value)}>
                <option value="">Select</option>
                {a.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label className="row row--center" style={{ gap: 4 }}>
              <input type="checkbox" checked={a.primary || false} onChange={() => togglePrimary(i)} />
              Main
            </label>
          </Row>
        ))}
      </div>
    </Card>
  );
}
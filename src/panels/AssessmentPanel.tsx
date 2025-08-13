import React from "react";
import { Card } from "../components/primitives";
import type { AssessmentSelection } from "../types";

export function AssessmentPanel({ assessments, setAssessments }:{
  assessments: AssessmentSelection[];
  setAssessments: (fn:(arr:AssessmentSelection[])=>AssessmentSelection[])=>void;
}){
  const togglePrimary = (i:number) => {
    setAssessments(arr => {
      const next = arr.map((a,idx)=> idx===i ? { ...a, primary: !a.primary } : a);
      return [...next].sort((a,b)=>Number(b.primary)-Number(a.primary));
    });
  };
  const changeSelection = (i:number, value:string) => {
    setAssessments(arr => {
      const next = arr.slice();
      next[i] = { ...next[i], selected: value };
      return next;
    });
  };
  return (
    <>
      {assessments.map((a, i) => (
        <Card
          key={a.domain}
          title={a.domain}
          right={
            <label className="row row--center" style={{ gap: 4 }}>
              <input
                type="checkbox"
                checked={a.primary || false}
                onChange={() => togglePrimary(i)}
              />
              Main
            </label>
          }
        >
          <select
            value={a.selected || ""}
            onChange={(e) => changeSelection(i, e.target.value)}
          >
            <option value="">Select</option>
            {a.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Card>
      ))}
    </>
  );
}

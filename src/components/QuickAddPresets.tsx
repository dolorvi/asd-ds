import React from "react";
import type { AssessmentSelection } from "../types";

const INSTRUMENT_DOMAIN: Record<string, string> = {
  "SRS-2": "Autism questionnaires",
  ASRS: "Autism questionnaires",
  ADOS: "Autism observations",
  MIGDAS: "Autism observations",
  "ADI-R": "Autism interviews",
  Vineland: "Adaptive questionnaires",
  ABAS3: "Adaptive questionnaires",
  "BRIEF-2": "Executive function questionnaires",
  "BRIEF-2 (v2)": "Executive function questionnaires",
};

const PRESETS: Record<string, string[]> = {
  observation: ["ADOS", "MIGDAS"],
};

export function QuickAddPresets({
  assessments,
  setAssessments,
}: {
  assessments: AssessmentSelection[];
  setAssessments: (
    fn: (arr: AssessmentSelection[]) => AssessmentSelection[],
  ) => void;
}) {
  const addInstrument = (name: string) => {
    const domain = INSTRUMENT_DOMAIN[name];
    if (!domain) return;
    setAssessments((arr) => {
      if (arr.some((a) => a.selected === name)) return arr;
      const template = arr.find((a) => a.domain === domain);
      if (!template) return arr;
      return [
        ...arr,
        { domain, options: template.options, selected: name, primary: false },
      ];
    });
  };

  const handlePreset = (key: keyof typeof PRESETS) => {
    PRESETS[key].forEach((name) => addInstrument(name));
  };

  return (
    <div className="chip-row" style={{ marginBottom: "8px" }}>
      <button type="button" className="chip" onClick={() => handlePreset("observation")}>Observation</button>
    </div>
  );
}

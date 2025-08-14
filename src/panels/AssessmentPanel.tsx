import React, { useRef, useState } from "react";
import { Card } from "../components/primitives";
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

  const options = items[0]?.options || [];

  const [pickerValue, setPickerValue] = useState("");
  const [pickerError, setPickerError] = useState("");
  const [pickerSearch, setPickerSearch] = useState("");

  const selectRefs = useRef<Record<number, HTMLSelectElement | null>>({});

  const addAssessment = (value: string) => {
    const template = items[0];
    if (!template) return;
    setAssessments((arr) => [
      ...arr,
      { domain, options: template.options, selected: value, primary: false },
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

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  return (
    <Card title={domain}>
      <div className="stack stack--md">
        <div className="assessment-add-row">
          <input
            type="text"
            placeholder="Search..."
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
          />
          <select
            value={pickerValue}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              const existing = items.find((a) => a.selected === val);
              if (existing) {
                setPickerError("Already added.");
                const ref = selectRefs.current[existing.index];
                if (ref) {
                  ref.focus();
                  ref.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              } else {
                addAssessment(val);
                setPickerError("");
              }
              setPickerValue("");
              setPickerSearch("");
            }}
          >
            <option value="">+ Add assessment...</option>
            {filteredOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <p className={`helper-text${pickerError ? " text-danger" : ""}`}>
          {pickerError || "Choose a tool to add it below."}
        </p>
        <hr className="assessment-divider" />
        {items.length === 0 && (
          <div className="assessment-placeholder">
            No assessments added — select one above.
          </div>
        )}
        {items.map((a) => (
          <div key={a.index} className="assessment-card">
            <div className="assessment-card__header">
              <span className="card-title">{a.selected || "Select"}</span>
              <button
                type="button"
                className={`badge${a.primary ? " badge--ok" : ""}`}
                onClick={() => togglePrimary(a.index)}
                aria-pressed={a.primary}
                aria-label="Toggle main assessment"
              >
                Main
              </button>
            </div>
            <div className="assessment-card__body">
              <label>
                <select
                  ref={(el) => {
                    selectRefs.current[a.index] = el;
                  }}
                  value={a.selected || ""}
                  className={a.selected ? "" : "invalid"}
                  title={a.selected ? "" : "Select assessment"}
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
            </div>
            <div className="assessment-card__footer">
              {items.length > 1 && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => removeAssessment(a.index)}
                >
                  × Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

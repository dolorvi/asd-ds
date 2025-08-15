import React, { useEffect } from "react";
import type { AssessmentSelection } from "../types";
import { AssessmentSelector } from "./AssessmentSelector";

export function AssessmentPalette({
  open,
  onClose,
  assessments,
  setAssessments,
}: {
  open: boolean;
  onClose: () => void;
  assessments: AssessmentSelection[];
  setAssessments: (
    fn: (arr: AssessmentSelection[]) => AssessmentSelection[],
  ) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="overlay__backdrop" onClick={onClose} />
      <div className="overlay__content">
        <AssessmentSelector
          assessments={assessments}
          setAssessments={setAssessments}
          onDone={onClose}
        />
      </div>
    </div>
  );
}

export default AssessmentPalette;

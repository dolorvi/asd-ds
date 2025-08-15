import React from "react";
import type { Condition } from "./types";

export type HeaderProps = {
  title: string;
  subtitle?: string;
  onDevToggle?: () => void;
  onExportSummary?: () => void;
  onExportFull?: () => void;
  condition: Condition;
  onConditionChange: (c: Condition) => void;
};

const CONDITIONS: Condition[] = ["ASD", "ADHD", "ID", "FASD"];

const CONDITION_TITLES: Record<Condition, string> = {
  ASD: "Autism Spectrum Disorder",
  ADHD: "Attention-Deficit/Hyperactivity Disorder",
  ID: "Intellectual Disability",
  FASD: "Fetal Alcohol Spectrum Disorder",
};

export function Header({
  title,
  subtitle,
  onDevToggle,
  onExportSummary,
  onExportFull,
  condition,
  onConditionChange,
}: HeaderProps) {
  return (
    <header className="topbar">
      <div className="row" style={{ alignItems: "center", gap: "var(--space-inset)" }}>
        <h1 className="title" title={title}>{title}</h1>
        {subtitle && <span className="subtitle small" title={subtitle}>{subtitle}</span>}

        <div style={{ flex: 1 }} />

        <div className="row" role="group" aria-label="Condition">
          {CONDITIONS.map((c) => {
            const active = condition === c;
            return (
              <button
                key={c}
                type="button"
                className={`chip${active ? " chip--active" : ""}`}
                aria-pressed={active}
                title={CONDITION_TITLES[c]}
                onClick={() => onConditionChange(c)}
              >
                {c}
              </button>
            );
          })}
        </div>

        <div className="row" style={{ gap: "var(--space-inset)" }}>
          <label>
            <select
              defaultValue=""
              onChange={(e) => {
                const v = e.target.value;
                if (v === "dev") onDevToggle?.();
                if (v === "summary") onExportSummary?.();
                e.target.value = "";
              }}
              title="More actions"
            >
              <option value="" disabled>
                More
              </option>
              <option value="dev">Dev</option>
              <option value="summary">Export summary</option>
            </select>
          </label>
          <button type="button" className="btn" onClick={onExportFull} disabled={!onExportFull}>
            Export (full)
          </button>
        </div>
      </div>
    </header>
  );
}
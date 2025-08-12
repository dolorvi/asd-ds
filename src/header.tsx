import React from "react";
import type { Condition } from "./types";

export type HeaderProps = {
  title: string;
  subtitle?: string;
  onDevToggle?: () => void;
  onExportSummary?: () => void;
  onExportFull?: () => void;
  onThemeToggle?: () => void;
  theme?: "dark" | "light";

  // NEW:
  condition: Condition;
  onConditionChange: (c: Condition) => void;
};

const CONDITIONS: Condition[] = ["ASD", "ADHD", "ID", "FASD"];

export function Header({
  title,
  subtitle,
  onDevToggle,
  onExportSummary,
  onExportFull,
  onThemeToggle,
  theme = "dark",
  condition,
  onConditionChange,
}: HeaderProps) {
  return (
    <header className="topbar">
      <div className="row" style={{ alignItems: "center", gap: 8 }}>
        <h1 className="app-title">{title}</h1>
        {subtitle && <span className="muted small">{subtitle}</span>}
        <div style={{ flex: 1 }} />

        {/* NEW segmented condition control */}
        <div className="seg">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              className={"chip" + (condition === c ? " chip-active" : "")}
              onClick={() => onConditionChange(c)}
              title={
                c === "ASD" ? "Autism" :
                c === "ADHD" ? "Attention-Deficit/Hyperactivity Disorder" :
                c === "ID" ? "Intellectual Disability" :
                "Fetal Alcohol Spectrum Disorder"
              }
            >
              {c}
            </button>
          ))}
        </div>

        <button className="small" onClick={onDevToggle}>Dev</button>
        <button className="small" onClick={onExportSummary}>Export summary</button>
        <button className="small" onClick={onExportFull}>Export (full)</button>
        <button className="small" onClick={onThemeToggle}>{theme === "dark" ? "Day" : "Night"}</button>
      </div>
    </header>
  );
}
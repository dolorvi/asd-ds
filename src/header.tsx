import React from "react";
import type { Condition } from "./types";

type HeaderProps = {
  title: string;
  subtitle?: string;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  onDevToggle: () => void;
  onExportSummary: () => void;
  onExportFull: () => void;

  // NEW
  condition: Condition;
  onConditionChange: (c: Condition) => void;
};

const CONDITIONS: Condition[] = ["ASD", "ADHD", "ID", "FASD"];

export function Header(props: HeaderProps) {
  return (
    <header className="app-header">
      <div className="row" style={{ alignItems: "center", gap: 12 }}>
        <div className="stack">
          <h1 className="app-title">{props.title}</h1>
          {props.subtitle && <div className="small">{props.subtitle}</div>}
        </div>

        {/* Condition toggle */}
        <div className="seg" style={{ marginLeft: 8 }}>
          {CONDITIONS.map((c) => (
            <button
              key={c}
              className={"chip" + (props.condition === c ? " chip-active" : "")}
              onClick={() => props.onConditionChange(c)}
              title={
                c === "ASD"
                  ? "Autism"
                  : c === "ADHD"
                  ? "Attention-Deficit/Hyperactivity Disorder"
                  : c === "ID"
                  ? "Intellectual Disability"
                  : "Fetal Alcohol Spectrum Disorder"
              }
            >
              {c}
            </button>
          ))}
        </div>

        <div className="spacer" />

        <div className="row" style={{ gap: 8 }}>
          <button className="small" onClick={props.onThemeToggle}>
            {props.theme === "dark" ? "Day" : "Night"}
          </button>
          <button className="small" onClick={props.onDevToggle}>Dev</button>
          <button className="small" onClick={props.onExportSummary}>Export summary</button>
          <button className="small" onClick={props.onExportFull}>Export (full)</button>
        </div>
      </div>
    </header>
  );
}
// src/components/ui.tsx
import React from "react";
import type { Condition } from "../types"; // <-- make sure src/types.ts exports this type
import "./ui.css";

// -------------------- Header --------------------

export type HeaderProps = {
  title: string;
  subtitle?: string;
  onDevToggle?: () => void;
  onExportFull?: () => void;
  onExportSummary?: () => void;
  onThemeToggle?: () => void;
  theme?: "dark" | "light";
  // NEW:
  condition?: Condition;
  onConditionChange?: (c: Condition) => void;
};

const CONDITIONS: Condition[] = ["ASD", "ADHD", "ID", "FASD"];

export function Header({
  title,
  subtitle,
  onDevToggle,
  onExportFull,
  onExportSummary,
  onThemeToggle,
  theme = "dark",
  condition,
  onConditionChange,
}: HeaderProps) {
  return (
    <div className="topbar" style={{ position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div className="stack">
          <h1 className="title">{title}</h1>
          {subtitle ? <div className="subtitle">{subtitle}</div> : null}

          {/* Condition toggle (shows only if handler provided) */}
          {onConditionChange && (
            <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  className={"chip" + (condition === c ? " chip-active" : "")}
                  onClick={() => onConditionChange(c)}
                  title={
                    c === "ASD"
                      ? "Autism"
                      : c === "ADHD"
                      ? "Attention-Deficit/Hyperactivity Disorder"
                      : c === "ID"
                      ? "Intellectual Disability"
                      : "Fetal Alcohol Spectrum Disorder"
                  }
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: condition === c ? "#3b82f6" : "transparent",
                    color: condition === c ? "#0b1220" : "inherit",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="toolbar" style={{ gap: 8, display: "flex", alignItems: "center" }}>
          {onThemeToggle && (
            <button onClick={onThemeToggle} title="Toggle theme">
              {theme === "dark" ? "Day" : "Night"}
            </button>
          )}
          {onDevToggle && (
            <button onClick={onDevToggle} title="Developer fixtures">
              Dev
            </button>
          )}
          {onExportSummary && <button onClick={onExportSummary}>Export summary</button>}
          {onExportFull && <button onClick={onExportFull}>Export (full)</button>}
        </div>
      </div>
    </div>
  );
}

// -------------------- Card --------------------

export function Card({ title, right, children }: { title?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card stack">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        {title ? <h2 className="section-title">{title}</h2> : <div />}
        {right}
      </div>
      {children}
    </section>
  );
}

// -------------------- Field --------------------

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="control">
      <label>{label}</label>
      {children}
    </div>
  );
}

// -------------------- TabBar --------------------

export function TabBar({ tabs, active, onSelect }: { tabs: string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <div className="row" style={{ gap: 8, flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 8 }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onSelect(i)}
          className={"tab" + (i === active ? " tab-active" : "")}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            background: i === active ? "#1f2937" : "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "inherit",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// -------------------- ChipGroup --------------------

export function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={"chip" + (value === opt ? " chip-active" : "")}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.15)",
            background: value === opt ? "#3b82f6" : "transparent",
            color: value === opt ? "#0b1220" : "inherit",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// -------------------- Footer --------------------

export function Footer({
  version,
  ruleHash,
  jurisdiction = "AU • Privacy Act (APPs) + relevant State Health Records Acts",
}: {
  version: string;
  ruleHash: string;
  jurisdiction?: string;
}) {
  return (
    <footer className="small" style={{ margin: "40px 0", textAlign: "center", opacity: 0.9 }}>
      <div>© {new Date().getFullYear()} ASD Decision Support MVP — Demonstration only.</div>
      <div style={{ marginTop: 6 }}>
        Decision support only; clinician judgement prevails • Build {version} • Rule set {ruleHash} • {jurisdiction}
      </div>
    </footer>
  );
}
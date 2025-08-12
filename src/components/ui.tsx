import React from "react";

export function Header({
  title,
  subtitle,
  onDevToggle,
  onExportFull,
  onExportSummary,
  onThemeToggle,
  theme = "dark",
}: {
  title: string;
  subtitle?: string;
  onDevToggle?: () => void;
  onExportFull?: () => void;
  onExportSummary?: () => void;
  onThemeToggle?: () => void;
  theme?: "dark" | "light";
}) {
  return (
    <div className="topbar" style={{ position: "sticky", top: 0, zIndex: 10 }}>
      <div>
        <h1 className="title">{title}</h1>
        {subtitle ? <div className="subtitle">{subtitle}</div> : null}
      </div>
      <div className="toolbar" style={{ gap: 8 }}>
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
  );
}

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

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="control">
      <label>{label}</label>
      {children}
    </div>
  );
}

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
      <div>
        © {new Date().getFullYear()} ASD Decision Support MVP — Demonstration only.
      </div>
      <div style={{ marginTop: 6 }}>
        Decision support only; clinician judgement prevails • Build {version} • Rule set {ruleHash} • {jurisdiction}
      </div>
    </footer>
  );
}

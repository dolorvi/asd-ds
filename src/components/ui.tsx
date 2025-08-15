import React from "react";

/* -------------------- Header -------------------- */
export type HeaderProps = {
  title: string;
  subtitle?: string;
  onDevToggle?: () => void;
  onExportFull?: () => void;
  onExportSummary?: () => void;
  onThemeToggle?: () => void;
  theme?: "dark" | "light";
  version: string;
  timestamp: string;
};

export function Header({
  title,
  subtitle,
  onDevToggle,
  onExportFull,
  onExportSummary,
  onThemeToggle,
  theme = "dark",
  version,
  timestamp,
}: HeaderProps) {
  return (
    <header className="topbar">
      <div className="row row--between row--center row--wrap">
        <div className="stack stack--sm">
          <h1 className="title" title={title}>{title}</h1>
          {subtitle ? <div className="subtitle" title={subtitle}>{subtitle}</div> : null}
          <div className="print-only small">Generated {timestamp} • Version {version}</div>
        </div>

        <div className="toolbar">
          {onThemeToggle && (
            <button className="btn btn--sm" onClick={onThemeToggle}>
              {theme === "dark" ? "Day" : "Night"}
            </button>
          )}
          {onDevToggle && (
            <button className="btn btn--sm" onClick={onDevToggle}>Dev</button>
          )}
          {onExportSummary && (
            <button className="btn btn--sm" onClick={onExportSummary}>Export summary</button>
          )}
          {onExportFull && (
            <button className="btn btn--accent" onClick={onExportFull}>Export (full)</button>
          )}
        </div>
      </div>
    </header>
  );
}

/* -------------------- Card -------------------- */
export function Card({ title, right, helper, children }:{
  title?: string; right?: React.ReactNode; helper?: string; children: React.ReactNode;
}) {
  return (
    <section className="card">
      {(title || right) && (
        <div className="card__bar">
          {title ? <h2 className="section-title" title={title}>{title}</h2> : <span/>}
          {right}
        </div>
      )}
      {helper && <p className="helper-text">{helper}</p>}
      {children}
    </section>
  );
}

/* -------------------- Field -------------------- */
export function Field({ label, children }:{ label: string; children: React.ReactNode }) {
  return (
    <div className="control">
      <label className="small" title={label}>{label}</label>
      {children}
    </div>
  );
}

/* -------------------- TabBar -------------------- */
export function TabBar({ tabs, active, onSelect }:{
  tabs: string[]; active: number; onSelect: (i:number)=>void
}) {
  return (
    <div className="tabbar">
      {tabs.map((t,i)=>(
        <button key={t} className={`tab ${i===active?"tab--active":""}`} onClick={()=>onSelect(i)}>{t}</button>
      ))}
    </div>
  );
}

/* -------------------- ChipGroup (color-aware) -------------------- */
export function ChipGroup({
  options, value, onChange, getColor,
}:{
  options: string[]; value: string | undefined; onChange: (v:string)=>void;
  getColor?: (label:string)=>string;
}) {
  return (
    <div className="chip-row">
      {options.map((opt) => {
        const active = value === opt;
        const bg = active && getColor ? getColor(opt) : undefined;
        return (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`chip ${active ? "chip--active" : ""}`}
          style={bg ? { background: bg, color: "var(--text)" } : undefined}
          aria-pressed={active}
          aria-label={opt}
          title={opt}
        >
          {opt}
        </button>
      );
    })}
    </div>
  );
}

/* -------------------- Footer -------------------- */
export function Footer({ version, ruleHash }:{version:string; ruleHash:string}) {
  return (
    <footer className="small" style={{ margin: "40px 0", textAlign: "center", opacity: 0.9 }}>
      <div>© {new Date().getFullYear()} ASD Decision Support MVP — Demonstration only.</div>
      <div style={{ marginTop: 6 }}>
        Decision support only; clinician judgement prevails • Build {version} • Rule set {ruleHash}
      </div>
      <div style={{ marginTop: 6 }}>
        <a href="https://www.autismcrc.com.au" target="_blank" rel="noopener noreferrer">Autism CRC</a> •
        <a href="https://www.autismguidelines.org.au" target="_blank" rel="noopener noreferrer">Autism Guidelines</a>
      </div>
    </footer>
  );
}
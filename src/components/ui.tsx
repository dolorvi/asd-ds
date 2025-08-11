import React from "react";

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

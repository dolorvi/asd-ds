import type { Condition } from "./types";

type HeaderProps = {
  title: string;
  subtitle?: string;
  onDevToggle?: () => void;
  onExportSummary?: () => void;
  onExportFull?: () => void;
  onThemeToggle?: () => void;
  theme?: "dark" | "light";

  // NEW
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
    <header className="app-header">
      <div className="left">
        <h1>{title}</h1>
        {subtitle && <div className="sub">{subtitle}</div>}
      </div>

      {/* NEW: condition selector */}
      <div className="seg">
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
          >
            {c}
          </button>
        ))}
      </div>

      <div className="right">
        {/* your existing header buttons */}
        <button className="small" onClick={onDevToggle}>Dev</button>
        <button className="small" onClick={onExportSummary}>Export summary</button>
        <button className="small" onClick={onExportFull}>Export (full)</button>
        <button className="small" onClick={onThemeToggle}>{theme === "dark" ? "Day" : "Night"}</button>
      </div>
    </header>
  );
}
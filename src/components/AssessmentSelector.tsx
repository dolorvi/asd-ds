import React, { useMemo, useState } from "react";
import type { AssessmentSelection } from "../types";

const CATEGORY_MAP: Record<string, string> = {
  "Autism questionnaires": "Social",
  "Autism observations": "Observation/Interview",
  "Autism interviews": "Observation/Interview",
  "Adaptive questionnaires": "Adaptive",
  "Executive function questionnaires": "EF/Attention",
  "Intellectual assessment": "Cognitive",
  "Language assessment": "Language",
  "Sensory Assessment": "RRB/Sensory",
  "Academic assessment": "Academic",
  "Memory assessment": "Memory",
  "Motor/Visuospatial assessment": "Motor/Visuospatial",
  "History": "History",
  "FASD Core": "FASD Core",
};

const FILTERS = [
  "All",
  "Observation/Interview",
  "Social",
  "RRB/Sensory",
  "Language",
  "EF/Attention",
  "Cognitive",
  "Adaptive",
  "Academic",
  "Memory",
  "Motor/Visuospatial",
  "History",
  "Comorbidity",
  "FASD Core",
] as const;

// Preset groups were removed to simplify instrument selection.

export function AssessmentSelector({
  assessments,
  setAssessments,
  onDone,
}: {
  assessments: AssessmentSelection[];
  setAssessments: (
    fn: (arr: AssessmentSelection[]) => AssessmentSelection[],
  ) => void;
  onDone?: () => void;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showIneligible, setShowIneligible] = useState(false);

  const allOptions = useMemo(() => {
    const opts: { name: string; category: string; domain: string; eligible?: boolean }[] = [];
    // Only include base domain definitions (those without a selected instrument)
    // so that adding an assessment doesn't duplicate options and break filtering.
    assessments
      .filter((a) => !a.selected)
      .forEach((a) => {
        const category = CATEGORY_MAP[a.domain];
        a.options.forEach((opt) => {
          if (category) {
            opts.push({ name: opt, category, domain: a.domain, eligible: true });
          }
        });
      });
    return opts;
  }, [assessments]);

  const filtered = allOptions.filter((o) => {
    const matchesFilter = filter === "All" || o.category === filter;
    const matchesSearch = o.name.toLowerCase().includes(search.toLowerCase());
    const show = showIneligible || o.eligible !== false;
    return matchesFilter && matchesSearch && show;
  });

  const toggle = (name: string, domain: string) => {
    const key = `${domain}__${name}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleAdd = () => {
    const uniqueNames = Array.from(new Set(Array.from(selected).map((k) => k.split("__")[1])));
    uniqueNames.forEach((name) => {
      const meta = allOptions.find((o) => o.name === name);
      if (!meta) return;
      setAssessments((arr) => {
        if (arr.some((a) => a.selected === name)) return arr;
        const template = arr.find((a) => a.domain === meta.domain);
        if (!template) return arr;
        return [
          ...arr,
          { domain: meta.domain, options: template.options, selected: name, primary: false },
        ];
      });
    });
    setSelected(new Set());
    onDone?.();
  };

  return (
    <div className="assessment-selector stack stack--md">
      <input
        type="text"
        placeholder="Search assessments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div className="chip-row">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`chip${filter === f ? " chip--active" : ""}`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f}
          </button>
        ))}
      </div>
      {/* Preset buttons removed per requirements */}
      <div className="assessment-list stack">
        {filtered.map((o) => {
          const alreadyAdded = assessments.some((a) => a.selected === o.name);
          const key = `${o.domain}__${o.name}`;
          return (
            <label key={key} className="row row--between assessment-item" title={o.name}>
              <span style={{ flex: 1 }}>
                {o.name}
                {alreadyAdded && <span className="small"> ✓</span>}
              </span>
              <span className="small" style={{ width: 120 }}>{o.category}</span>
              <input
                type="checkbox"
                checked={selected.has(key)}
                onChange={() => toggle(o.name, o.domain)}
                aria-label={`Select ${o.name}`}
                disabled={alreadyAdded}
              />
            </label>
          );
        })}
      </div>
      <div className="row row--between" style={{ marginTop: "var(--space-gap)" }}>
        <label className="row row--center" style={{ gap: "var(--space-inset)" }} title="Show ineligible">
          <input
            type="checkbox"
            checked={showIneligible}
            onChange={(e) => setShowIneligible(e.target.checked)}
            aria-label="Show ineligible"
          />
          <span className="small">Show ineligible</span>
        </label>
        <div className="row" style={{ gap: "var(--space-inset)" }}>
          <button
            type="button"
            className="btn"
            onClick={() => setSelected(new Set())}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--accent"
            onClick={handleAdd}
            disabled={selected.size === 0}
          >
            Add selected ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssessmentSelector;

import React, { useMemo, useState } from "react";
import type { AssessmentSelection } from "../types";

const CATEGORY_MAP: Record<string, string> = {
  "Autism questionnaires": "Questionnaires",
  "Autism observations": "Observation",
  "Autism interviews": "Interview",
  "Adaptive questionnaires": "Adaptive",
  "Executive function questionnaires": "Executive",
  "Intellectual assessment": "Intellectual",
  "Language assessment": "Language",
  "Sensory Assessment": "Sensory",
};

const FILTERS = [
  "All",
  "Questionnaires",
  "Observation",
  "Interview",
  "Adaptive",
  "Executive",
  "Intellectual",
  "Language",
  "Sensory",
] as const;

const PRESETS: Record<string, string[]> = {
  core: ["SRS-2", "ADOS", "ADI-R", "Vineland"],
  questionnaires: ["SRS-2", "ASRS", "ABAS3", "BRIEF2"],
};

export function AssessmentSelector({
  assessments,
  setAssessments,
}: {
  assessments: AssessmentSelection[];
  setAssessments: (
    fn: (arr: AssessmentSelection[]) => AssessmentSelection[],
  ) => void;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { name: string; category: string; domain: string }[] = [];
    assessments.forEach((a) => {
      const category = CATEGORY_MAP[a.domain];
      a.options.forEach((opt) => {
        if (category && !seen.has(opt)) {
          seen.add(opt);
          opts.push({ name: opt, category, domain: a.domain });
        }
      });
    });
    return opts;
  }, [assessments]);

  const filtered = allOptions.filter((o) => {
    const matchesFilter = filter === "All" || o.category === filter;
    const matchesSearch = o.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleAdd = () => {
    selected.forEach((name) => {
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
  };

  const handlePreset = (key: keyof typeof PRESETS) => {
    setSelected((prev) => {
      const next = new Set(prev);
      PRESETS[key].forEach((name) => next.add(name));
      return next;
    });
  };

  return (
    <div className="assessment-selector stack stack--md">
      <input
        type="text"
        placeholder="Search assessments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="row row--wrap" style={{ gap: 8 }}>
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
      <div className="pill-row" style={{ marginBottom: 8 }}>
        <button
          type="button"
          className="pill"
          onClick={() => handlePreset("core")}
        >
          Core pack
        </button>
        <button
          type="button"
          className="pill"
          onClick={() => handlePreset("questionnaires")}
        >
          Questionnaire pack
        </button>
      </div>
      <div className="assessment-list stack">
        {filtered.map((o) => (
          <label key={o.name} className="row row--between assessment-item">
            <span style={{ flex: 1 }}>{o.name}</span>
            <span className="small" style={{ width: 120 }}>
              {o.category}
            </span>
            <input
              type="checkbox"
              checked={selected.has(o.name)}
              onChange={() => toggle(o.name)}
              aria-label={`Select ${o.name}`}
            />
          </label>
        ))}
      </div>
      <div className="row row--between" style={{ marginTop: 8 }}>
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
  );
}

export default AssessmentSelector;

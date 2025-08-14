import React from "react";

export type MinDatasetItem = {
  label: string;
  met: boolean;
  targetId?: string;
};

export function MinDatasetProgress({ items }: { items: MinDatasetItem[] }) {
  const met = items.filter((i) => i.met).length;
  const scrollTo = (id?: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="stack stack--sm">
      <div className="row row--between">
        <div>
          Minimum dataset ({met}/{items.length})
        </div>
      </div>
      <div className="chip-row">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={"chip" + (item.met ? " chip--active" : "")}
            aria-pressed={item.met}
            onClick={() => scrollTo(item.targetId)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

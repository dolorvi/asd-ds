import React from "react";

export type MinDatasetItem = {
  label: string;
  met: boolean;
  targetId?: string;
};

export function MinDatasetProgress({ items }: { items: MinDatasetItem[] }) {
  const met = items.filter((i) => i.met).length;
  return (
    <div className="stack stack--sm">
      <div className="row row--between">
        <div>
          Minimum dataset ({met}/{items.length})
        </div>
      </div>
    </div>
  );
}

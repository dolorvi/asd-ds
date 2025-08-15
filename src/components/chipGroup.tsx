import React from "react";
import { getBandColor, type Polarity } from "./severity";

type Props = {
  options: readonly string[] | string[];
  value?: string;
  onChange: (v: string) => void;
  className?: string;
  disabled?: boolean;

  /** optional override colorizer */
  getColor?: (label: string) => string | undefined;
  /** semantics: default higher=better; SRS uses "goodLow" */
  polarity?: Polarity; // "goodHigh" | "goodLow" | "neutral"
};

export function ChipGroup({
  options,
  value,
  onChange,
  className,
  disabled,
  getColor,
  polarity = "goodHigh",
}: Props) {
  return (
    <div className={`chip-row ${className ?? ""}`}>
      {options.map((opt) => {
        const selected = value === opt;
        const bg = selected ? (getColor?.(opt) ?? getBandColor(opt, polarity)) : undefined;
        const style = selected && bg ? ({ background: bg, borderColor: bg, color: "#111" } as React.CSSProperties) : undefined;

        return (
          <button
            key={String(opt)}
            type="button"
            disabled={disabled}
            className={"chip" + (selected ? " chip--active" : "")}
            style={style}
            onClick={() => onChange(String(opt))}
            aria-pressed={selected}
            aria-label={String(opt)}
            title={String(opt)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
import React from "react";
import { Card, Row } from "../components/primitives";
import type { InstrumentEntry, InstrumentConfig } from "../types";

export function GenericInstrumentPanel({
  selected,
  instruments,
  setInstruments,
  configs,
}: {
  selected: string[];
  instruments: InstrumentEntry[];
  setInstruments: (fn: (arr: InstrumentEntry[]) => InstrumentEntry[]) => void;
  configs: InstrumentConfig[];
}) {
  const items = instruments.filter((i) => selected.includes(i.name));
  if (!items.length) return null;

  const getConfig = (name: string) => configs.find((c) => c.name === name);
  const getFieldLabel = (name: string) => getConfig(name)?.scoreField || "score";

  const setValue = (name: string, value: number | undefined) => {
    setInstruments((arr) =>
      arr.map((i) => (i.name === name ? { ...i, value } : i))
    );
  };

  const setBand = (name: string, band: string) => {
    setInstruments((arr) =>
      arr.map((i) => (i.name === name ? { ...i, band } : i))
    );
  };

  return (
    <>
      {items.map((i) => (
        <Card key={i.name} title={i.name}>
          <Row justify="between" align="center">
            <label style={{ flex: 1 }}>
              {getFieldLabel(i.name)}:
              <input
                type="number"
                value={i.value ?? ""}
                className={i.value === undefined ? "invalid" : ""}
                title={i.value === undefined ? "Required" : ""}
                onChange={(e) =>
                  setValue(
                    i.name,
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
              />
              {i.value !== undefined && (i.value < 40 || i.value > 90) && (
                <p className="small text-danger">Score must be 40–90 (T-score).</p>
              )}
            </label>
            {(() => {
              const cfg = getConfig(i.name);
              if (!cfg) return null;
              const showBand = cfg.bandLabel || cfg.bandOptions || cfg.scoreField === "band";
              if (!showBand) return null;
              const label = cfg.bandLabel || "Band";
              return (
                <label style={{ flex: 1 }}>
                  {label}:
                  {cfg.bandOptions ? (
                    <select
                      value={i.band ?? ""}
                      className={i.band ? "" : "invalid"}
                      title={i.band ? "" : "Select option"}
                      onChange={(e) => setBand(i.name, e.target.value)}
                    >
                      <option value="">Select</option>
                      {cfg.bandOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={i.band ?? ""}
                      className={i.band ? "" : "invalid"}
                      title={i.band ? "" : "Required"}
                      onChange={(e) => setBand(i.name, e.target.value)}
                    />
                  )}
                </label>
              );
            })()}
          </Row>
        </Card>
      ))}
    </>
  );
}

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

  const getFieldLabel = (name: string) =>
    configs.find((c) => c.name === name)?.scoreField || "score";

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
                onChange={(e) =>
                  setValue(
                    i.name,
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
              />
            </label>
            <label style={{ flex: 1 }}>
              Band:
              <input
                type="text"
                value={i.band ?? ""}
                onChange={(e) => setBand(i.name, e.target.value)}
              />
            </label>
          </Row>
        </Card>
      ))}
    </>
  );
}

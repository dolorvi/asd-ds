import React from "react";
import type { SeverityState } from "../types";
import { DomainPanel } from "./DomainPanel";
import { FASD_NEURO_DOMAINS } from "../data/testData";

export function FasdPanel({
  valueMap,
  setValueMap,
}: {
  valueMap: SeverityState;
  setValueMap: (fn: (s: SeverityState) => SeverityState) => void;
}) {
  return (
    <DomainPanel
      title="Neurobehavioral impairment"
      domains={FASD_NEURO_DOMAINS}
      valueMap={valueMap}
      setValueMap={setValueMap}
    />
  );
}

import React, { useMemo } from "react";
import type { SeverityState, Config, AssessmentSelection } from "../types";
import { Card } from "../components/primitives";

export function ReportPanel({
  model,
  supportEstimate,
  srs2,
  srs2Teacher,
  abas,
  abasTeacher,
  migdas,
  instruments,
  assessments,
  history,
  config,
}:{
  model: { p:number; cut:number };
  supportEstimate: string;
  srs2: SeverityState;
  srs2Teacher: SeverityState;
  abas: SeverityState;
  abasTeacher: SeverityState;
  migdas: { consistency: string };
  instruments: Array<{ name:string; value?:number; band?:string }>;
  assessments: AssessmentSelection[];
  history: { earlyOnset: boolean };
  config: Config;
}){
  const report = useMemo(() => {
    const has = (obj: SeverityState) => Object.values(obj).some(d => !!d.severity);
    const testSet = new Set<string>();
    const srsParent = has(srs2);
    const srsTeach = has(srs2Teacher);
    if (srsParent || srsTeach) {
      const parts: string[] = [];
      if (srsParent) parts.push("parent");
      if (srsTeach) parts.push("teacher");
      testSet.add(`SRS-2${parts.length ? ` (${parts.join(" & ")})` : ""}`);
    }
    const abasParent = has(abas);
    const abasTeach = has(abasTeacher);
    if (abasParent || abasTeach) {
      const parts: string[] = [];
      if (abasParent) parts.push("parent");
      if (abasTeach) parts.push("teacher");
      testSet.add(`ABAS-3${parts.length ? ` (${parts.join(" & ")})` : ""}`);
    }
    if (migdas.consistency !== "unclear") testSet.add("MIGDAS-2");
    instruments.forEach(i => {
      if (i.name === "Vineland-3" && (abasParent || abasTeach)) return;
      if (i.name === "ASRS" && (srsParent || srsTeach)) return;
      if (i.value !== undefined || (i.band && i.band.trim() !== "")) testSet.add(i.name);
    });
    assessments.forEach(a => { if (a.selected) testSet.add(a.selected); });
    const testList = Array.from(testSet).join(", ");
    const presence = model.p >= model.cut
      ? "indicate the presence of Autism symptoms"
      : "do not indicate Autism symptoms";
    let support = "Support needs cannot be determined";
    if (supportEstimate.includes("High")) support = "The need for support is high";
    else if (supportEstimate.includes("Moderate")) support = "The need for support is moderate";
    else if (supportEstimate.includes("Lower")) support = "The need for support is low";
    const impactedKeys = new Set<string>();
    config.abasDomains.forEach(d => {
      const sev = abas[d.key]?.severity || abasTeacher[d.key]?.severity || "";
      if (sev && ["Extremely Low","Very Low","Low Average"].includes(sev)) {
        impactedKeys.add(d.label);
      }
    });
    const impacted = Array.from(impactedKeys).join(", ");
    const impactText = impacted ? ` with impacted functioning in ${impacted}` : "";
    const difficultyText = impacted
      ? ` Individuals with difficulties in ${impacted} may experience challenges in daily activities.`
      : "";
    const early = history.earlyOnset
      ? "The history indicates symptoms were present in early childhood. "
      : "";
    const contextNote =
      " Clinical interpretation should consider developmental history and individual context.";
    return testList
      ? `${early}Multiple tests completed including the ${testList} ${presence}. ${support}${impactText}.${difficultyText}${contextNote}`
      : "Insufficient data for report.";
  }, [model, supportEstimate, srs2, srs2Teacher, abas, abasTeacher, migdas, instruments, assessments, history, config.abasDomains]);

  return (
    <Card title="Report (preview)">
      <p>{report}</p>
    </Card>
  );
}

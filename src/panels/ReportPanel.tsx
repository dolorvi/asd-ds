import React, { useMemo } from "react";
import type { SeverityState, Config, AssessmentSelection, ClientProfile } from "../types";
import { Card } from "../components/primitives";
import { ASSESSMENT_INFO } from "../data/assessmentInfo";

const NAME_MAP: Record<string, string> = {
  ABAS3: "ABAS-3",
  Vineland: "Vineland-3",
  MIGDAS: "MIGDAS-2",
  ADOS: "ADOS-2",
  BRIEF2: "BRIEF-2",
  WISC: "WISC/WAIS/WPPSI",
  WPPSI: "WISC/WAIS/WPPSI",
  WAIS: "WISC/WAIS/WPPSI",
  "Sensory profile 2": "Sensory Profile 2",
  CELF5: "CELF-5",
};

export function ReportPanel({
  model,
  supportEstimate,
  srs2,
  srs2Teacher,
  asrs,
  asrsTeacher,
  abas,
  abasTeacher,
  migdas,
  instruments,
  assessments,
  history,
  config,
  client,
}:{
  model: { p:number; cut:number };
  supportEstimate: string;
  srs2: SeverityState;
  srs2Teacher: SeverityState;
  asrs: SeverityState;
  asrsTeacher: SeverityState;
  abas: SeverityState;
  abasTeacher: SeverityState;
  migdas: { consistency: string };
  instruments: Array<{ name:string; value?:number; band?:string }>;
  assessments: AssessmentSelection[];
  history: { earlyOnset: boolean };
  config: Config;
  client: ClientProfile;
}){
  const report = useMemo(() => {
    const has = (obj: SeverityState) => Object.values(obj).some((d) => !!d.severity);
    const lines: string[] = [];

    const formatDomains = (domains: { key: string; label: string }[], data: SeverityState) =>
      domains
        .map((d) => {
          const entry = data[d.key];
          if (!entry || (!entry.severity && entry.score === undefined)) return null;
          const score = entry.score !== undefined ? ` (${entry.score})` : "";
          return `${d.label}: ${entry.severity}${score}`;
        })
        .filter(Boolean)
        .join(", ");

    const srsParent = has(srs2);
    const srsTeach = has(srs2Teacher);
    if (srsParent || srsTeach) {
      const details: string[] = [];
      if (srsParent) details.push(`Parent - ${formatDomains(config.srs2Domains, srs2)}`);
      if (srsTeach) details.push(`Teacher - ${formatDomains(config.srs2Domains, srs2Teacher)}`);
      lines.push(`${ASSESSMENT_INFO.srs2.name}: ${details.join(" | ")}`);
    }

    const asrsParent = has(asrs);
    const asrsTeach = has(asrsTeacher);
    if (asrsParent || asrsTeach) {
      const details: string[] = [];
      if (asrsParent) details.push(`Parent - ${formatDomains(config.asrsDomains, asrs)}`);
      if (asrsTeach) details.push(`Teacher - ${formatDomains(config.asrsDomains, asrsTeacher)}`);
      lines.push(`${ASSESSMENT_INFO.asrs.name}: ${details.join(" | ")}`);
    }

    const abasParent = has(abas);
    const abasTeach = has(abasTeacher);
    if (abasParent || abasTeach) {
      const details: string[] = [];
      if (abasParent) details.push(`Parent - ${formatDomains(config.abasDomains, abas)}`);
      if (abasTeach) details.push(`Teacher - ${formatDomains(config.abasDomains, abasTeacher)}`);
      lines.push(`${ASSESSMENT_INFO.abas3.name}: ${details.join(" | ")}`);
    }

    if (migdas.consistency !== "unclear")
      lines.push(`${ASSESSMENT_INFO.migdas2.name}: Consistency ${migdas.consistency}`);

    instruments.forEach((i) => {
      const name = NAME_MAP[i.name] || i.name;
      if (name === "Vineland-3" && (abasParent || abasTeach)) return;
      if (name === "ASRS" && (asrsParent || asrsTeach)) return;
      if (i.value !== undefined || (i.band && i.band.trim() !== ""))
        lines.push(`${name}: ${i.value !== undefined ? i.value : i.band}`);
    });

    assessments.forEach((a) => {
      if (a.selected) lines.push(NAME_MAP[a.selected] || a.selected);
    });

    const testList = lines.map((l) => l.split(":")[0]).join(", ");
    const presence =
      model.p >= model.cut
        ? "indicate the presence of Autism symptoms"
        : "do not indicate Autism symptoms";
    let support = "Support needs cannot be determined";
    if (supportEstimate.includes("High")) support = "The need for support is high";
    else if (supportEstimate.includes("Moderate")) support = "The need for support is moderate";
    else if (supportEstimate.includes("Lower")) support = "The need for support is low";
    const impactedKeys = new Set<string>();
    config.abasDomains.forEach((d) => {
      const sev = abas[d.key]?.severity || abasTeacher[d.key]?.severity || "";
      if (sev && ["Extremely Low", "Very Low", "Low Average"].includes(sev)) {
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
    const assessmentsText = lines.length
      ? `Assessments:\n${lines.map((l) => `- ${l}`).join("\n")}\n\n`
      : "";
    const intro = client.name || client.age ? `${client.name || "Client"}, Age ${client.age || "N/A"}\n\n` : "";
    const summary = testList
      ? `${early}Multiple tests completed including ${testList} ${presence}. ${support}${impactText}.${difficultyText}${contextNote}`
      : "Insufficient data for report.";
    return `${intro}${assessmentsText}${summary}`;
  }, [
    model,
    supportEstimate,
    srs2,
    srs2Teacher,
    asrs,
    asrsTeacher,
    abas,
    abasTeacher,
    migdas,
    instruments,
    assessments,
    history,
    config.srs2Domains,
    config.asrsDomains,
    config.abasDomains,
    client,
  ]);

  return (
    <Card title="Report (preview)">
      <pre style={{ whiteSpace: "pre-wrap" }}>{report}</pre>
    </Card>
  );
}

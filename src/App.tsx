// src/App.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { DEFAULT_CONFIG, PRIOR_BY_AGE, DEFAULT_AGE_BAND, type AgeBandKey } from "./config/modelConfig";
import { useAsdEngine } from "./hooks/useAsdEngine";
import { CANONICAL_CASES, MIGDAS_CONSISTENCY, ABAS3_SEVERITIES as ABAS_SEVERITIES, VINELAND_SEVERITIES, VINELAND_DOMAINS } from "./data/testData";
import type { Config, SeverityState, CriterionKey, Condition, AssessmentSelection } from "./types";

import { Header, Footer } from "./components/ui";
import { Container, Tabs, Card, Row } from "./components/primitives";
import { SrsPanel } from "./panels/SrsPanel";
import { AbasPanel } from "./panels/AbasPanel";
import { SummaryPanel } from "./panels/SummaryPanel";
import { VinelandPanel } from "./panels/VinelandPanel";
import { ReportPanel } from "./panels/ReportPanel";
import { AssessmentPanel } from "./panels/AssessmentPanel";

const initSeverityState = (domains: { key: string }[]): SeverityState =>
  Object.fromEntries(domains.map((d) => [d.key, { score: undefined, severity: "" }])) as SeverityState;

export default function App() {
  // ---------- condition ----------
  const [condition, setCondition] = useState<Condition>("ASD");

  // ---------- core state ----------
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const TABS = ["ASD Measures", "Adaptive", "History", "Comorbidity", "Advanced", "Report"];
  const [activeTab, setActiveTab] = useState(0);
  const [devOpen, setDevOpen] = useState(false);

  const [srs2, setSRS2] = useState<SeverityState>(() => initSeverityState(config.srs2Domains));
  const [srs2Teacher, setSRS2Teacher] = useState<SeverityState>(() => initSeverityState(config.srs2Domains));
  const [wisc, setWISC] = useState<SeverityState>(() => initSeverityState(config.wiscDomains));
  const [abas, setABAS] = useState<SeverityState>(() => initSeverityState(config.abasDomains));
  const [abasTeacher, setABASTeacher] = useState<SeverityState>(() => initSeverityState(config.abasDomains));
 
  const [migdas, setMIGDAS] = useState({
    consistency: (MIGDAS_CONSISTENCY[0] as (typeof MIGDAS_CONSISTENCY)[number]) || "unclear",
    notes: [""],
  });

  const [history, setHistory] = useState({
    developmentalConcerns: "",
    earlyOnset: false,
    crossContextImpairment: false,
    maskingIndicators: false,
  });

  const [observation, setObservation] = useState({
    A1: 0, A2: 0, A3: 0, B1: 0, B2: 0, B3: 0, B4: 0, notes: "",
  });

  const [diff, setDiff] = useState({
    ADHD: false, DLD: false, ID: false, Anxiety: false, Depression: false,
    TraumaPTSD: false, FASD: false, Tics: false, Other: "",
  });

  const [clinician, setClinician] = useState({
    name: "", date: new Date().toISOString().slice(0, 10), attested: false,
  });

  const [reportVoice, setReportVoice] = useState<"clinical" | "dual">("dual");

  // ---------- instruments ----------
  const [instruments, setInstruments] = useState(
    DEFAULT_CONFIG.defaultInstruments.map(i => ({ name: i.name, value: undefined as number | undefined, band: "" }))
  );

  // ---------- assessment selections ----------
  const [assessments, setAssessments] = useState<AssessmentSelection[]>([
    { domain: "Autism questionnaires", options: ["ASRS","SRS-2","GARS","CARS","AQ"] },
    { domain: "Autism observations", options: ["MIGDAS","ADOS"] },
    { domain: "Autism interviews", options: ["ADI-R"] },
    { domain: "Adaptive questionnaires", options: ["ABAS3","Vineland"] },
    { domain: "Executive function questionnaires", options: ["BRIEF2","BDEFS"] },
    { domain: "Intellectual assessment", options: ["WISC","WPPSI","WAIS"] },
    { domain: "Language assessment", options: ["CELF5"] },
    { domain: "Sensory Assessment", options: ["Sensory profile 2"] },
  ]);

  const getInstrumentBand = useCallback(
    (name: string) => instruments.find(x => x.name === name)?.band || "",
    [instruments]
  );
  const setInstrumentBand = useCallback(
    (name: string, band: string) => setInstruments(arr => arr.map(x => (x.name === name ? { ...x, band } : x))),
    []
  );

  // ---------- prior via age band ----------
  const [ageBand, setAgeBand] = useState<AgeBandKey>(DEFAULT_AGE_BAND);
  const [autoPrior, setAutoPrior] = useState(true);
  useEffect(() => {
    if (autoPrior) setConfig((c) => ({ ...c, prior: PRIOR_BY_AGE[ageBand].logit }));
  }, [ageBand, autoPrior]);

  const isSchoolAge = ageBand === "au_5_14" || ageBand === "au_15_24";

  useEffect(() => {
    if (!isSchoolAge) {
      setSRS2Teacher(() => initSeverityState(config.srs2Domains));
      setABASTeacher(() => initSeverityState(config.abasDomains));
    }
  }, [isSchoolAge, config.srs2Domains, config.abasDomains]);

  // ---------- density ----------
  const [compact, setCompact] = useState(true);
  useEffect(() => { document.body.classList.toggle("compact", compact); }, [compact]);

  // ---------- engine ----------
  const { datasetStatus, evidence, model, supportEstimate, recommendation } =
    useAsdEngine(config, srs2, srs2Teacher, abas, abasTeacher, wisc, migdas, history, observation as any, diff as any, instruments);

  // ---------- ribbon ----------
  const ribbon = useMemo(() => {
    const need: string[] = [];
    const r = config.minDataset;
    const c = datasetStatus.counts;
    if (r.requireASDInstrument && !c.hasASDInstrument) need.push("≥1 ASD instrument");
    if (r.requireAdaptive && !c.hasAdaptive) need.push("adaptive measure");
    if (r.requireHistory && !c.historyOk) need.push("history");
    if (r.requireObservation && !c.observationOk) need.push("observation");
    if (c.effectiveInstrumentCount < r.minInstruments) need.push(`min instruments ${r.minInstruments}`);
    return datasetStatus.passes
      ? "All requirements met"
      : `${c.effectiveInstrumentCount}/${r.minInstruments} met — need: ${need.join(", ") || "—"}`;
  }, [datasetStatus, config.minDataset]);

  // ---------- summary print ----------
  const exportSummary = () => {
    document.body.classList.add("print-summary");
    setTimeout(() => {
      window.print();
      setTimeout(() => document.body.classList.remove("print-summary"), 0);
    }, 0);
  };

  // ---------- rule signature ----------
  const ruleHash = useMemo(() => {
    const s = JSON.stringify(DEFAULT_CONFIG);
    let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return ("00000000" + (h >>> 0).toString(16)).slice(-8);
  }, []);

  // ---------- render ----------
  return (
    <Container>
      <Header
        title="ASD Decision Support — MVP"
        subtitle="DSM-5-TR aligned • tabs build"
        onDevToggle={() => setDevOpen(v => !v)}
        onExportSummary={exportSummary}
        onExportFull={() => window.print()}
        condition={condition}
        onConditionChange={setCondition}
      />

      <Row justify="end">
        <label className="row small">
          <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
          Compact mode
        </label>
      </Row>

      <Card>
        <span className="small">
          <b>Minimum dataset:</b> {ribbon}
        </span>
      </Card>

      {devOpen && (
        <Card>
          <div className="row">
            <select id="fixtureSelect">
              {CANONICAL_CASES.map((c) => (
                <option key={c.id} value={c.id}>{c.id} — {c.title}</option>
              ))}
            </select>
            <button onClick={() => {
              const selEl = document.getElementById("fixtureSelect") as HTMLSelectElement | null;
              const sel = selEl ? CANONICAL_CASES.find(c => c.id === selEl.value) : undefined;
              if (!sel) return;
              setSRS2((prev) => {
                const next = { ...prev } as SeverityState;
                if (sel.srs2) Object.entries(sel.srs2).forEach(([k, v]) => (next[k] = { ...(next[k] || {}), severity: v as string }));
                return next;
              });
              setABAS((prev) => {
                const next = { ...prev } as SeverityState;
                if (sel.abas3) Object.entries(sel.abas3).forEach(([k, v]) => (next[k] = { ...(next[k] || {}), severity: v as string }));
                return next;
              });
              setWISC((prev) => {
                const next = { ...prev } as SeverityState;
                if (sel.wisc) Object.entries(sel.wisc).forEach(([k, v]) => (next[k] = { ...(next[k] || {}), severity: v as string }));
                return next;
              });
              if (sel.migdas) setMIGDAS({ consistency: sel.migdas.consistency, notes: sel.migdas.notes });
              setHistory((h) => ({
                ...h,
                developmentalConcerns: "Auto-filled for fixture; replace with clinical history.",
                earlyOnset: !!sel.flags?.earlyOnset,
                crossContextImpairment: !!sel.flags?.crossContextImpairment,
                maskingIndicators: !!sel.flags?.masking,
              }));
            }}>
              Load
            </button>
            <div className="small">Dev fixtures for sanity-checks. (Label-only)</div>
          </div>
        </Card>
      )}

      <Tabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      <div className="layout">
        {/* LEFT: panels per tab */}
        <section className="stack">
          {activeTab === 0 && (
            <>
              <SrsPanel title="SRS-2 Parent" domains={config.srs2Domains} srs2={srs2} setSRS2={setSRS2} />
              {isSchoolAge && (
                <SrsPanel title="SRS-2 Teacher" domains={config.srs2Domains} srs2={srs2Teacher} setSRS2={setSRS2Teacher} />
              )}
              {/* TODO: MIGDAS panel (presentational) */}
            </>
          )}
          
          {activeTab === 1 && (
            <>
              <AbasPanel
                title="ABAS-3 Parent"
                domains={config.abasDomains}
                options={ABAS_SEVERITIES}
                valueMap={abas}
                setValueMap={setABAS}
              />
              {isSchoolAge && (
                <AbasPanel
                  title="ABAS-3 Teacher"
                  domains={config.abasDomains}
                  options={ABAS_SEVERITIES}
                  valueMap={abasTeacher}
                  setValueMap={setABASTeacher}
                />
              )}
              <VinelandPanel
                title="Vineland-3 Composite"
                domains={config.vinelandDomains ?? VINELAND_DOMAINS}
                options={VINELAND_SEVERITIES}
                valueMap={{ vineland_composite: getInstrumentBand("Vineland-3") }}
                setValueMap={(fn) => {
                  const next = fn({ vineland_composite: getInstrumentBand("Vineland-3") });
                  setInstrumentBand("Vineland-3", next.vineland_composite || "");
                }}
              />
            </>
          )}

          {activeTab === 2 && (
            <Card title="History / Observation">
              {/* TODO: move history + observation into a HistoryPanel */}
            </Card>
          )}

          {activeTab === 3 && (
            <Card title="Comorbidity / Differential">
              {/* TODO: move diff flags into a DiffPanel */}
            </Card>
          )}

          {activeTab === 4 && (
            <>
              <AssessmentPanel assessments={assessments} setAssessments={setAssessments} />
            </>
          )}

          {activeTab === 5 && (
            <ReportPanel
              model={model}
              supportEstimate={supportEstimate}
              srs2={srs2}
              srs2Teacher={srs2Teacher}
              abas={abas}
              abasTeacher={abasTeacher}
              migdas={migdas}
              instruments={instruments}
              assessments={assessments}
              history={history}
              config={config}
            />
          )}
        </section>

        {/* RIGHT: summary */}
        <SummaryPanel
          model={model}
          config={config}
          supportEstimate={supportEstimate}
          recommendation={recommendation}
          exportSummary={exportSummary}
        />
      </div>

      <Footer version="v0.6" ruleHash={ruleHash} />
    </Container>
  );
}
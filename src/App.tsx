// src/App.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { DEFAULT_CONFIG, PRIOR_BY_AGE, DEFAULT_AGE_BAND, type AgeBandKey } from "./config/modelConfig";
import { useClickSound } from "./hooks/useClickSound";
import { useAsdEngine } from "./hooks/useAsdEngine";
import {
  CANONICAL_CASES,
  MIGDAS_CONSISTENCY,
  ABAS3_SEVERITIES as ABAS_SEVERITIES,
  VINELAND_SEVERITIES,
  VINELAND_DOMAINS,
} from "./data/testData";
import type { Config, SeverityState, Condition, AssessmentSelection } from "./types";

import { Header, Footer } from "./components/ui";
import { Container, Tabs, Card } from "./components/primitives";
import { MinDatasetProgress } from "./components/MinDatasetProgress";
import { SrsPanel } from "./panels/SrsPanel";
import { AsrsPanel } from "./panels/AsrsPanel";
import { AbasPanel } from "./panels/AbasPanel";
import { SummaryPanel } from "./panels/SummaryPanel";
import { VinelandPanel } from "./panels/VinelandPanel";
import { ReportPanel } from "./panels/ReportPanel";
import { AssessmentPanel } from "./panels/AssessmentPanel";
import { GenericInstrumentPanel } from "./panels/GenericInstrumentPanel";
import { AiChat } from "./components/AiChat";

const initSeverityState = (domains: { key: string }[]): SeverityState =>
  Object.fromEntries(domains.map((d) => [d.key, { score: undefined, severity: "" }])) as SeverityState;

export default function App() {
  useClickSound();
  // ---------- condition ----------
  const [condition, setCondition] = useState<Condition>("ASD");

  // ---------- core state ----------
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const TABS = [
    "ASD Measures",
    "Adaptive",
    "Intellectual",
    "Executive Function",
    "Sensory",
    "Language",
    "History",
    "Comorbidity",
    "Report",
  ] as const;
  const [activeTab, setActiveTab] = useState(0);
  const [devOpen, setDevOpen] = useState(false);

  const [srs2, setSRS2] = useState<SeverityState>(() => initSeverityState(config.srs2Domains));
  const [srs2Teacher, setSRS2Teacher] = useState<SeverityState>(() => initSeverityState(config.srs2Domains));
  const [asrs, setASRS] = useState<SeverityState>(() => initSeverityState(config.asrsDomains));
  const [asrsTeacher, setASRSTeacher] = useState<SeverityState>(() => initSeverityState(config.asrsDomains));
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
    A1: 0,
    A2: 0,
    A3: 0,
    B1: 0,
    B2: 0,
    B3: 0,
    B4: 0,
    notes: "",
  });

  const [diff, setDiff] = useState({
    ADHD: false,
    DLD: false,
    ID: false,
    Anxiety: false,
    Depression: false,
    TraumaPTSD: false,
    FASD: false,
    Tics: false,
    Other: "",
  });

  const [clinician, setClinician] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    attested: false,
  });

  const [reportVoice, setReportVoice] = useState<"clinical" | "dual">("dual");

  // ---------- instruments ----------
  const [instruments, setInstruments] = useState(
    DEFAULT_CONFIG.defaultInstruments.map((i) => ({ name: i.name, value: undefined as number | undefined, band: "" })),
  );
  const metInstrumentCount = useMemo(
    () =>
      instruments.filter(
        (i) => i.value !== undefined || (i.band && i.band.trim() !== "")
      ).length,
    [instruments],
  );

  // ---------- assessment selections ----------
  const [assessments, setAssessments] = useState<AssessmentSelection[]>([
    { domain: "Autism questionnaires", options: ["ASRS", "SRS-2", "GARS", "CARS", "AQ"], selected: "SRS-2", primary: true },
    { domain: "Autism observations", options: ["MIGDAS", "ADOS"], selected: "MIGDAS", primary: true },
    { domain: "Autism interviews", options: ["ADI-R"], selected: "ADI-R", primary: true },
    { domain: "Adaptive questionnaires", options: ["ABAS3", "Vineland"], selected: "ABAS3", primary: true },
    { domain: "Executive function questionnaires", options: ["BRIEF2", "BDEFS"], selected: "BRIEF2", primary: true },
    { domain: "Intellectual assessment", options: ["WISC", "WPPSI", "WAIS"], selected: "WISC", primary: true },
    { domain: "Language assessment", options: ["CELF5"], selected: "CELF5", primary: true },
    { domain: "Sensory Assessment", options: ["Sensory profile 2"], selected: "Sensory profile 2", primary: true },
  ]);

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

  const getSelectedNames = useCallback(
    (domain: string) =>
      assessments
        .filter((a) => a.domain === domain && a.selected)
        .map((a) => NAME_MAP[a.selected!] || a.selected!) ,
    [assessments],
  );

  const getInstrumentBand = useCallback(
    (name: string) => instruments.find((x) => x.name === name)?.band || "",
    [instruments],
  );
  const setInstrumentBand = useCallback(
    (name: string, band: string) => setInstruments((arr) => arr.map((x) => (x.name === name ? { ...x, band } : x))),
    [],
  );

  const hasSrs = assessments.some((a) => a.selected === "SRS-2");
  const hasAsrs = assessments.some((a) => a.selected === "ASRS");
  const hasAbas = assessments.some((a) => a.selected === "ABAS3");
  const hasVineland = assessments.some((a) => a.selected?.startsWith("Vineland"));

  const selectedAutismQs = getSelectedNames("Autism questionnaires");
  const selectedAutismObs = getSelectedNames("Autism observations");
  const selectedAutismInterviews = getSelectedNames("Autism interviews");
  const selectedIntellectual = Array.from(new Set(getSelectedNames("Intellectual assessment")));
  const selectedExecutive = getSelectedNames("Executive function questionnaires");
  const selectedSensory = getSelectedNames("Sensory Assessment");
  const selectedLanguage = getSelectedNames("Language assessment");

  // ---------- prior via age band ----------
  const [age, setAge] = useState(10);
  const [ageBand, setAgeBand] = useState<AgeBandKey>(DEFAULT_AGE_BAND);
  const [autoPrior, setAutoPrior] = useState(true);
  useEffect(() => {
    if (autoPrior) setConfig((c) => ({ ...c, prior: PRIOR_BY_AGE[ageBand].logit }));
  }, [ageBand, autoPrior]);

  useEffect(() => {
    if (age < 15) setAgeBand("au_5_14");
    else if (age < 25) setAgeBand("au_15_24");
    else if (age < 40) setAgeBand("au_25_39");
    else setAgeBand("au_overall");
  }, [age]);

  const isSchoolAge = age < 18;

  useEffect(() => {
    if (!isSchoolAge) {
      setSRS2Teacher(() => initSeverityState(config.srs2Domains));
      setASRSTeacher(() => initSeverityState(config.asrsDomains));
      setABASTeacher(() => initSeverityState(config.abasDomains));
    }
  }, [isSchoolAge, config.srs2Domains, config.asrsDomains, config.abasDomains]);


  // ---------- engine ----------
  const { datasetStatus, evidence, model, supportEstimate, recommendation } = useAsdEngine(
    config,
    srs2,
    srs2Teacher,
    asrs,
    asrsTeacher,
    abas,
    abasTeacher,
    wisc,
    migdas,
    history,
    observation as any,
    diff as any,
    instruments,
  );

  const progress = useMemo(() => {
    const r = config.minDataset;
    const c = datasetStatus.counts;
    let count = 0;
    if (c.hasASDInstrument) count += 1;
    if (c.hasAdaptive) count += 1;
    if (c.historyOk) count += 1;
    if (c.observationOk) count += 1;
    count += Math.min(c.effectiveInstrumentCount, r.minInstruments);
    const total = 4 + r.minInstruments;
    return total ? count / total : 0;
  }, [datasetStatus, config.minDataset]);

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
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return ("00000000" + (h >>> 0).toString(16)).slice(-8);
  }, []);

  // ---------- render ----------
  return (
    <Container>
      <Header
        title="ASD Decision Support — MVP"
        subtitle="DSM-5-TR aligned • tabs build"
        onDevToggle={() => setDevOpen((v) => !v)}
        onExportSummary={exportSummary}
        onExportFull={() => window.print()}
        condition={condition}
        onConditionChange={setCondition}
      />

      {condition === "ASD" ? (
        <>
          <div className="stack stack--lg">
            <Card>
              <label className="row row--center" style={{ gap: 8 }}>
                Age
                <input
                  type="number"
                  value={age}
                  min={0}
                  onChange={(e) => setAge(Number(e.target.value))}
                  style={{ width: 60 }}
                />
              </label>
            </Card>

            <Card>
              <span className="small">
                <b>Minimum dataset:</b> {ribbon}
              </span>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{ width: `${progress * 100}%` }} />
              </div>
            </Card>

            {devOpen && (
              <Card>
                <div className="row">
                  <select id="fixtureSelect">
                    {CANONICAL_CASES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} — {c.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const selEl = document.getElementById("fixtureSelect") as HTMLSelectElement | null;
                      const sel = selEl ? CANONICAL_CASES.find((c) => c.id === selEl.value) : undefined;
                      if (!sel) return;

                      setSRS2((prev) => {
                        const next = { ...prev } as SeverityState;
                        if (sel.srs2)
                          Object.entries(sel.srs2).forEach(
                            ([k, v]) => (next[k] = { ...(next[k] || {}), severity: v as string }),
                          );
                        return next;
                      });

                      setABAS((prev) => {
                        const next = { ...prev } as SeverityState;
                        if (sel.abas3)
                          Object.entries(sel.abas3).forEach(
                            ([k, v]) => (next[k] = { ...(next[k] || {}), severity: v as string }),
                          );
                        return next;
                      });

                      setWISC((prev) => {
                        const next = { ...prev } as SeverityState;
                        if (sel.wisc)
                          Object.entries(sel.wisc).forEach(
                            ([k, v]) => (next[k] = { ...(next[k] || {}), severity: v as string }),
                          );
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
                    }}
                  >
                    Load
                  </button>
                  <div className="small">Dev fixtures for sanity-checks. (Label-only)</div>
                </div>
              </Card>
            )}

            <MinDatasetProgress count={metInstrumentCount} total={config.minDataset.minInstruments} />

            <Tabs tabs={TABS as unknown as string[]} active={activeTab} onSelect={setActiveTab} />
          </div>

          <div className="layout">
            {/* LEFT: panels per tab */}
            <section className="stack stack--md">
              {activeTab === 0 && (
                <>
                  <AssessmentPanel domain="Autism questionnaires" assessments={assessments} setAssessments={setAssessments} />
                  <AssessmentPanel domain="Autism observations" assessments={assessments} setAssessments={setAssessments} />
                  <AssessmentPanel domain="Autism interviews" assessments={assessments} setAssessments={setAssessments} />
                  {hasSrs && (
                    <>
                      <SrsPanel title="SRS-2 Parent" domains={config.srs2Domains} srs2={srs2} setSRS2={setSRS2} />
                      {isSchoolAge && (
                        <SrsPanel
                          title="SRS-2 Teacher"
                          domains={config.srs2Domains}
                          srs2={srs2Teacher}
                          setSRS2={setSRS2Teacher}
                        />
                      )}
                    </>
                  )}
                  {hasAsrs && (
                    <>
                      <AsrsPanel title="ASRS Parent" domains={config.asrsDomains} asrs={asrs} setASRS={setASRS} />
                      {isSchoolAge && (
                        <AsrsPanel
                          title="ASRS Teacher"
                          domains={config.asrsDomains}
                          asrs={asrsTeacher}
                          setASRS={setASRSTeacher}
                        />
                      )}
                    </>
                  )}
                  {selectedAutismQs.filter((n) => n !== "SRS-2" && n !== "ASRS").length > 0 && (
                    <GenericInstrumentPanel
                      selected={selectedAutismQs.filter((n) => n !== "SRS-2" && n !== "ASRS")}
                      instruments={instruments}
                      setInstruments={setInstruments}
                      configs={config.defaultInstruments}
                    />
                  )}
                  {selectedAutismObs.filter((n) => n !== "MIGDAS-2").length > 0 && (
                    <GenericInstrumentPanel
                      selected={selectedAutismObs.filter((n) => n !== "MIGDAS-2")}
                      instruments={instruments}
                      setInstruments={setInstruments}
                      configs={config.defaultInstruments}
                    />
                  )}
                  {selectedAutismInterviews.length > 0 && (
                    <GenericInstrumentPanel
                      selected={selectedAutismInterviews}
                      instruments={instruments}
                      setInstruments={setInstruments}
                      configs={config.defaultInstruments}
                    />
                  )}
                  {/* TODO: MIGDAS panel (presentational) */}
                </>
              )}

              {activeTab === 1 && (
                <>
                  <AssessmentPanel domain="Adaptive questionnaires" assessments={assessments} setAssessments={setAssessments} />
                  {hasAbas && (
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
                    </>
                  )}
                  {hasVineland && (
                    <VinelandPanel
                      title="Vineland-3 Composite"
                      domains={config.vinelandDomains ?? VINELAND_DOMAINS}
                      options={VINELAND_SEVERITIES}
                      valueMap={{
                        vineland_composite: getInstrumentBand("Vineland-3"),
                      }}
                      setValueMap={(fn) => {
                        const next = fn({
                          vineland_composite: getInstrumentBand("Vineland-3"),
                        });
                        setInstrumentBand("Vineland-3", next.vineland_composite || "");
                      }}
                    />
                  )}
                </>
              )}

              {activeTab === 2 && (
                <>
                  <AssessmentPanel domain="Intellectual assessment" assessments={assessments} setAssessments={setAssessments} />
                  <GenericInstrumentPanel
                    selected={selectedIntellectual}
                    instruments={instruments}
                    setInstruments={setInstruments}
                    configs={config.defaultInstruments}
                  />
                </>
              )}

              {activeTab === 3 && (
                <>
                  <AssessmentPanel domain="Executive function questionnaires" assessments={assessments} setAssessments={setAssessments} />
                  <GenericInstrumentPanel
                    selected={selectedExecutive}
                    instruments={instruments}
                    setInstruments={setInstruments}
                    configs={config.defaultInstruments}
                  />
                </>
              )}

              {activeTab === 4 && (
                <>
                  <AssessmentPanel domain="Sensory Assessment" assessments={assessments} setAssessments={setAssessments} />
                  <GenericInstrumentPanel
                    selected={selectedSensory}
                    instruments={instruments}
                    setInstruments={setInstruments}
                    configs={config.defaultInstruments}
                  />
                </>
              )}

              {activeTab === 5 && (
                <>
                  <AssessmentPanel domain="Language assessment" assessments={assessments} setAssessments={setAssessments} />
                  <GenericInstrumentPanel
                    selected={selectedLanguage}
                    instruments={instruments}
                    setInstruments={setInstruments}
                    configs={config.defaultInstruments}
                  />
                </>
              )}

              {activeTab === 6 && <Card title="History / Observation">{/* TODO: HistoryPanel */}</Card>}

              {activeTab === 7 && <Card title="Comorbidity / Differential">{/* TODO: DiffPanel */}</Card>}

              {activeTab === 8 && (
                <ReportPanel
                  model={model}
                  supportEstimate={supportEstimate}
                  srs2={srs2}
                  srs2Teacher={srs2Teacher}
                  asrs={asrs}
                  asrsTeacher={asrsTeacher}
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
            <section className="stack stack--md">
                <SummaryPanel
                  model={model}
                  config={config}
                  supportEstimate={supportEstimate}
                  recommendation={recommendation}
                  exportSummary={exportSummary}
                />
              </section>
            </div>
          </>
        ) : (
          <Card title={`${condition} assessments`}>Assessments for {condition} will be added soon.</Card>
        )}

        <Footer version="v0.6" ruleHash={ruleHash} />
        <AiChat />
      </Container>
    );
  }
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
  AQ_DOMAINS,
  ADOS2_DOMAINS,
  MIGDAS_DOMAINS,
  ADIR_DOMAINS,
  BRIEF2_DOMAINS,
  SENSORY_PROFILE_DOMAINS,
  CELF5_DOMAINS,
  FASD_NEURO_DOMAINS,
} from "./data/testData";
import type { Config, SeverityState, AssessmentSelection, ClientProfile, Condition } from "./types";
import { ADOS2_CONDITION_WEIGHTS } from "./config/ados2ConditionWeights";
import { ADIR_CONDITION_WEIGHTS } from "./config/adirConditionWeights";
import { SRS2_CONDITION_WEIGHTS } from "./config/srs2ConditionWeights";
import { VINELAND_CONDITION_WEIGHTS } from "./config/vinelandConditionWeights";
import { BRIEF2_CONDITION_WEIGHTS } from "./config/brief2ConditionWeights";
import { SENSORY_PROFILE_CONDITION_WEIGHTS } from "./config/sensoryProfileConditionWeights";
import {
  ASRS_CONDITION_WEIGHTS_2_5,
  ASRS_CONDITION_WEIGHTS_6_18,
} from "./config/asrsConditionWeights";

import { Header, Footer } from "./components/ui";
import { Container, Tabs, Card } from "./components/primitives";
import { SrsPanel } from "./panels/SrsPanel";
import { AsrsPanel } from "./panels/AsrsPanel";
import { AbasPanel } from "./panels/AbasPanel";
import { SummaryPanel } from "./panels/SummaryPanel";
import { VinelandPanel } from "./panels/VinelandPanel";
import { AssessmentPalette } from "./components/AssessmentPalette";
import { MinDatasetProgress } from "./components/MinDatasetProgress";
import { ReportPanel } from "./panels/ReportPanel";
import { GenericInstrumentPanel } from "./panels/GenericInstrumentPanel";
import { DomainPanel } from "./panels/DomainPanel";
import { HistoryPanel } from "./panels/HistoryPanel";
import { DiffPanel } from "./panels/DiffPanel";
import { AiChat } from "./components/AiChat";
import { FasdPanel } from "./panels/FasdPanel";
import { ExposurePanel, type ExposureState } from "./panels/ExposurePanel";
import { FacialGrowthPanel, type FacialGrowthState } from "./panels/FacialGrowthPanel";

const initSeverityState = (domains: { key: string }[]): SeverityState =>
  Object.fromEntries(domains.map((d) => [d.key, { score: undefined, severity: "" }])) as SeverityState;

export default function App() {
  useClickSound();
  const VERSION = "v0.6";
  const [exportTimestamp, setExportTimestamp] = useState("");

  // ---------- core state ----------
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const TABS = ["Assessment", "History Checklist", "Impression and Summary"] as const;
  const [activeTab, setActiveTab] = useState(0);
  const [devOpen, setDevOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const [srs2, setSRS2] = useState<SeverityState>(() => initSeverityState(config.srs2Domains));
  const [srs2Teacher, setSRS2Teacher] = useState<SeverityState>(() => initSeverityState(config.srs2Domains));
  const [asrs, setASRS] = useState<SeverityState>(() => initSeverityState(config.asrsDomains));
  const [asrsTeacher, setASRSTeacher] = useState<SeverityState>(() => initSeverityState(config.asrsDomains));
  const [wisc, setWISC] = useState<SeverityState>(() => initSeverityState(config.wiscDomains));
  const [abas, setABAS] = useState<SeverityState>(() => initSeverityState(config.abasDomains));
  const [abasTeacher, setABASTeacher] = useState<SeverityState>(() => initSeverityState(config.abasDomains));
  const [vineland, setVineland] = useState<SeverityState>(() => initSeverityState(VINELAND_DOMAINS));
  const [aq, setAQ] = useState<SeverityState>(() => initSeverityState(AQ_DOMAINS));
  const [ados, setADOS] = useState<SeverityState>(() => initSeverityState(ADOS2_DOMAINS));
  const [migdasDomains, setMigdasDomains] = useState<SeverityState>(() => initSeverityState(MIGDAS_DOMAINS));
  const [adir, setADIR] = useState<SeverityState>(() => initSeverityState(ADIR_DOMAINS));
  const [briefParent, setBRIEFParent] = useState<SeverityState>(() => initSeverityState(BRIEF2_DOMAINS));
  const [briefTeacher, setBRIEFTeacher] = useState<SeverityState>(() => initSeverityState(BRIEF2_DOMAINS));
  const [sensory, setSensory] = useState<SeverityState>(() => initSeverityState(SENSORY_PROFILE_DOMAINS));
  const [celf, setCELF] = useState<SeverityState>(() => initSeverityState(CELF5_DOMAINS));
  const [fasdNeuro, setFasdNeuro] = useState<SeverityState>(() => initSeverityState(FASD_NEURO_DOMAINS));
  const [exposure, setExposure] = useState<ExposureState>({ pae_level: "", timing: [], source: [] });
  const [facial, setFacial] = useState<FacialGrowthState>({
    sentinel_features_count: 0,
    pfl_percentile: "",
    philtrum_rank: "",
    upper_lip_thin_rank: "",
    growth_deficiency: false,
  });

  const [migdas, setMIGDAS] = useState({
    consistency: (MIGDAS_CONSISTENCY[0] as (typeof MIGDAS_CONSISTENCY)[number]) || "unclear",
    notes: [""],
  });

  const [history, setHistory] = useState({
    developmentalConcerns: "",
    earlyOnset: false,
    earlySocial: false,
    earlyRRB: false,
    regression: false,
    crossContextImpairment: false,
    regressionLanguage: false,
    regressionSocial: false,
    regressionMotor: false,
    persistentSymptoms: false,
    firstConcernsAge: "",
    presentHome: false,
    presentSchool: false,
    presentPeers: false,
    informantParent: false,
    informantTeacher: false,
    informantSelf: false,
    informantClinician: false,
    evidenceQuality: "",
    jointAttention: false,
    gestureDelay: false,
    socialReciprocity: false,
    atypicalEyeGaze: false,
    pragmaticLanguage: false,
    stereotypedMovements: false,
    insistenceSameness: false,
    restrictedInterests: false,
    sensoryAuditory: false,
    sensoryTactile: false,
    sensoryVisual: false,
    sensoryProprio: false,
    sensoryTaste: false,
    fasdExposure: false,
    fasdGrowth: false,
    adhdInattention: false,
    adhdResponseStructure: false,
    idDelays: false,
    idMilestones: false,
    otherHearingVision: false,
    otherSleep: false,
    otherSeizures: false,
    otherPainGI: false,
    otherTrauma: false,
    otherEAL: false,
    familyASD: false,
    familyADHD: false,
    familyID: false,
    familyPsych: false,
    familyHistory: false,
    functionalAdaptive: false,
    functionalSchool: false,
    functionalServices: false,
    maskingIndicators: false,
    verbalFluency: "",
    notes: "",
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
    adhdFeatures: false,
    languageDisorder: false,
    globalID: false,
    anxietyPrimary: false,
    ocdFeatures: false,
    trauma: false,
  });

  const [clinician, setClinician] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    attested: false,
  });

  const [client, setClient] = useState<ClientProfile>({ name: "", age: "" });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("clientProfile");
      if (stored) setClient(JSON.parse(stored));
    }
  }, []);

  const saveClientProfile = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clientProfile", JSON.stringify(client));
    }
  };

  const [reportVoice, setReportVoice] = useState<"clinical" | "dual">("dual");

  // ---------- instruments ----------
  const [instruments, setInstruments] = useState(
    DEFAULT_CONFIG.defaultInstruments.map((i) => ({ name: i.name, value: undefined as number | undefined, band: "" })),
  );

  const buildHighlightMap = (
    weights: Record<Condition, Record<string, Record<string, number>>>
  ) => {
    const result: Record<string, Record<string, number>> = {};
    Object.values(weights).forEach((domains) => {
      Object.entries(domains).forEach(([domain, sevMap]) => {
        if (!result[domain]) result[domain] = {};
        Object.entries(sevMap).forEach(([sev, wt]) => {
          const current = result[domain][sev];
          if (current === undefined || Math.abs(wt) > Math.abs(current)) {
            result[domain][sev] = wt;
          }
        });
      });
    });
    return result;
  };

  const adosHighlight = useMemo(() => buildHighlightMap(ADOS2_CONDITION_WEIGHTS), []);
  const adirHighlight = useMemo(() => buildHighlightMap(ADIR_CONDITION_WEIGHTS), []);
  const srsHighlight = useMemo(() => buildHighlightMap(SRS2_CONDITION_WEIGHTS), []);
  const vinelandHighlight = useMemo(() => buildHighlightMap(VINELAND_CONDITION_WEIGHTS), []);
  const briefHighlight = useMemo(() => buildHighlightMap(BRIEF2_CONDITION_WEIGHTS), []);
  const sensoryHighlight = useMemo(
    () => buildHighlightMap(SENSORY_PROFILE_CONDITION_WEIGHTS),
    [],
  );

  // ---------- assessment selections ----------
  const [assessments, setAssessments] = useState<AssessmentSelection[]>([
    {
      domain: "Autism questionnaires",
      options: ["ASRS", "SRS-2", "AQ"],
    },
    { domain: "Autism observations", options: ["MIGDAS", "ADOS"] },
    { domain: "Autism interviews", options: ["ADI-R"] },
    { domain: "Adaptive questionnaires", options: ["ABAS3", "Vineland"] },
    {
      domain: "Executive function questionnaires",
      options: [
        "BRIEF-2",
        "BRIEF-2 (v2)",
        "BDEFS",
        "Conners-4",
        "Conners-EC",
        "Conners CBRS",
        "Vanderbilt ADHD Rating Scales",
      ],
    },
    { domain: "Intellectual assessment", options: ["WISC", "WPPSI", "WAIS"] },
    { domain: "Language assessment", options: ["CELF5"] },
    {
      domain: "Sensory Assessment",
      options: [
        "Sensory profile 2",
        "MIGDAS",
      ],
    },
    { domain: "Academic assessment", options: ["WIAT-III"] },
    {
      domain: "Motor/Visuospatial assessment",
      options: [
        "BOT-3",
      ],
    },
    { domain: "History", options: ["History Profile", "ADI-R"] },
    { domain: "FASD Core", options: ["Exposure (PAE)", "Facial/Growth"] },
  ]);

  const NAME_MAP: Record<string, string> = {
    ABAS3: "ABAS-3",
    Vineland: "Vineland-3",
    MIGDAS: "MIGDAS-2",
    ADOS: "ADOS-2",
    "BRIEF-2": "BRIEF-2",
    "BRIEF-2 (v2)": "BRIEF-2 (v2)",
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
  const selectedAdaptive = getSelectedNames("Adaptive questionnaires");
  const selectedIntellectual = Array.from(new Set(getSelectedNames("Intellectual assessment")));
  const selectedExecutive = getSelectedNames("Executive function questionnaires");
  const selectedSensory = getSelectedNames("Sensory Assessment");
  const selectedLanguage = getSelectedNames("Language assessment");
  const briefName = selectedExecutive.find((n) => n.startsWith("BRIEF-2"));

  const pathwayCandidates = useMemo(() => {
    const asd = assessments.some((a) =>
      ["ADOS", "ADI-R", "SRS-2"].includes(a.selected || ""),
    );
    const adhd = assessments.some((a) => {
      const sel = a.selected || "";
      return ["Conners-4", "Conners-EC", "Vanderbilt", "BRIEF-2", "BRIEF-2 (v2)", "BRIEF", "BDEFS"].some(
        (k) => sel.toLowerCase().includes(k.toLowerCase()),
      );
    });
    const fasd =
      !!exposure.pae_level ||
      exposure.timing.length > 0 ||
      exposure.source.length > 0 ||
      facial.sentinel_features_count > 0 ||
      facial.pfl_percentile !== "" ||
      facial.philtrum_rank !== "" ||
      facial.upper_lip_thin_rank !== "" ||
      facial.growth_deficiency;
    const hasAdaptive = assessments.some(
      (a) => a.domain === "Adaptive questionnaires" && a.selected,
    );
    const hasIQ = assessments.some(
      (a) => a.domain === "Intellectual assessment" && a.selected,
    );
    const id = hasAdaptive && hasIQ && !!diff.globalID;
    return { ASD: asd, ADHD: adhd, FASD: fasd, ID: id } as Record<Condition, boolean>;
  }, [assessments, exposure, facial, diff]);

  // ---------- prior via age band ----------
  const age = Number(client.age) || 0;
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

  const asrsWeights = age < 6 ? ASRS_CONDITION_WEIGHTS_2_5 : ASRS_CONDITION_WEIGHTS_6_18;
  const asrsHighlight = useMemo(() => buildHighlightMap(asrsWeights), [asrsWeights]);
  const isBriefAge = age >= 5 && age <= 18;

  useEffect(() => {
    if (!isSchoolAge) {
      setSRS2Teacher(() => initSeverityState(config.srs2Domains));
      setASRSTeacher(() => initSeverityState(config.asrsDomains));
      setABASTeacher(() => initSeverityState(config.abasDomains));
      setBRIEFTeacher(() => initSeverityState(BRIEF2_DOMAINS));
    }
  }, [isSchoolAge, config.srs2Domains, config.asrsDomains, config.abasDomains]);

  useEffect(() => {
    if (!isBriefAge) {
      setBRIEFParent(() => initSeverityState(BRIEF2_DOMAINS));
      setBRIEFTeacher(() => initSeverityState(BRIEF2_DOMAINS));
    }
  }, [isBriefAge]);


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

  // ---------- minimum dataset checklist ----------
  const minDatasetItems = useMemo(() => {
    const r = config.minDataset;
    const c = datasetStatus.counts;
    return [
      { label: "ASD instrument", met: c.hasASDInstrument, targetId: "asd-inst-section" },
      { label: "Adaptive measure", met: c.hasAdaptive, targetId: "adaptive-measure-section" },
      { label: "History", met: c.historyOk, targetId: "history-section" },
      {
        label: `≥${r.minInstruments} instruments`,
        met: c.effectiveInstrumentCount >= r.minInstruments,
        targetId: "asd-inst-section",
      },
    ];
  }, [datasetStatus, config.minDataset]);

  // ---------- summary/full export ----------
  const exportSummary = () => {
    setExportTimestamp(new Date().toLocaleString());
    document.body.classList.add("print-summary");
    setTimeout(() => {
      window.print();
      setTimeout(() => document.body.classList.remove("print-summary"), 0);
    }, 0);
  };
  const exportFull = () => {
    setExportTimestamp(new Date().toLocaleString());
    document.body.classList.remove("print-summary");
    window.print();
  };

  const handleThresholdChange = (v: any) => {
    setConfig((c) => ({ ...c, certaintyThreshold: parseFloat(v) }));
  };

  const conditionPercents = useMemo(() => {
    const totals: Record<Condition, number> = { ASD: 0, ADHD: 0, FASD: 0, ID: 0 };
    (Object.keys(totals) as Condition[]).forEach((cond) => {
      let sum = 0;
      Object.entries(ados).forEach(([domain, { severity }]) => {
        if (!severity) return;
        const weight = ADOS2_CONDITION_WEIGHTS[cond][domain]?.[severity as "Non-spectrum" | "Autism"];
        if (typeof weight === "number") sum += weight;
      });
      Object.entries(adir).forEach(([domain, { severity }]) => {
        if (!severity) return;
        const weight = ADIR_CONDITION_WEIGHTS[cond][domain]?.[
          severity as "Below algorithm" | "Borderline" | "Meets algorithm"
        ];
        if (typeof weight === "number") sum += weight;
      });
      Object.entries(srs2).forEach(([domain, { severity }]) => {
        if (!severity) return;
        const weight = SRS2_CONDITION_WEIGHTS[cond][domain]?.[
          severity as "Average" | "Mild" | "Moderate" | "Severe"
        ];
        if (typeof weight === "number") sum += weight;
      });
      Object.entries(srs2Teacher).forEach(([domain, { severity }]) => {
        if (!severity) return;
        const weight = SRS2_CONDITION_WEIGHTS[cond][domain]?.[
          severity as "Average" | "Mild" | "Moderate" | "Severe"
        ];
        if (typeof weight === "number") sum += weight;
      });
      Object.entries(asrs).forEach(([domain, { severity }]) => {
        if (!severity) return;
        const weight = asrsWeights[cond][domain]?.[
          severity as
            | "Average"
            | "Slightly Elevated"
            | "Elevated"
            | "Very Elevated"
        ];
        if (typeof weight === "number") sum += weight;
      });
      Object.entries(asrsTeacher).forEach(([domain, { severity }]) => {
        if (!severity) return;
        const weight = asrsWeights[cond][domain]?.[
          severity as
            | "Average"
            | "Slightly Elevated"
            | "Elevated"
            | "Very Elevated"
        ];
        if (typeof weight === "number") sum += weight;
      });
      Object.entries(vineland).forEach(([domain, { severity }]) => {
        if (!severity) return;
        const weight = VINELAND_CONDITION_WEIGHTS[cond][domain]?.[
          severity as "Low" | "Moderately Low" | "Average" | "Moderately High" | "High"
        ];
        if (typeof weight === "number") sum += weight;
      });
      Object.entries(briefParent).forEach(([domain, { severity }]) => {
        if (!severity) return;
        const weight = BRIEF2_CONDITION_WEIGHTS[cond][domain]?.[
          severity as
            | "Average"
            | "Mildly Elevated"
            | "Potentially Clinically Elevated"
            | "Clinically Elevated"
        ];
        if (typeof weight === "number") sum += weight;
      });
      Object.entries(briefTeacher).forEach(([domain, { severity }]) => {
        if (!severity) return;
        const weight = BRIEF2_CONDITION_WEIGHTS[cond][domain]?.[
          severity as
            | "Average"
            | "Mildly Elevated"
            | "Potentially Clinically Elevated"
            | "Clinically Elevated"
        ];
        if (typeof weight === "number") sum += weight;
      });
      Object.entries(sensory).forEach(([domain, { severity }]) => {
        if (!severity) return;
        const weight = SENSORY_PROFILE_CONDITION_WEIGHTS[cond][domain]?.[
          severity as
            | "Much Less Than Others"
            | "Less Than Others"
            | "Just Like the Majority"
            | "More Than Others"
            | "Much More Than Others"
        ];
        if (typeof weight === "number") sum += weight;
      });
      totals[cond] = sum;
    });
    return totals;
  }, [ados, adir, srs2, srs2Teacher, asrs, asrsTeacher, vineland, briefParent, briefTeacher, sensory, asrsWeights]);

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
        onExportFull={exportFull}
        version={VERSION}
        timestamp={exportTimestamp}
      />
      <div style={{ position: "sticky", top: 0, background: "var(--bg)", zIndex: 5 }}>
        <MinDatasetProgress items={minDatasetItems} />
      </div>
      <Card title="Client">
        <div className="row row--wrap" style={{ gap: "var(--space-inset)" }}>
          <label style={{ flex: 1 }} title="Name">
            Name
            <input
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
            />
          </label>
          <label style={{ width: 100 }} title="Age">
            Age
            <input
              type="number"
              value={client.age}
              onChange={(e) => setClient({ ...client, age: e.target.value })}
            />
          </label>
          <button type="button" className="btn" onClick={saveClientProfile}>
            Save
          </button>
        </div>
      </Card>

      <div className="stack stack--lg">
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
        <Tabs
          tabs={TABS as unknown as string[]}
          active={activeTab}
          onSelect={setActiveTab}
          right={
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => setPaletteOpen(true)}
            >
              + Add
            </button>
          }
        />
      </div>

      {activeTab === 0 && (
        <section className="stack stack--lg">
              <div id="adaptive-measure-section" />
              {hasSrs && (
                <>
                  <SrsPanel
                    title="SRS-2 Parent"
                    domains={config.srs2Domains}
                    srs2={srs2}
                    setSRS2={setSRS2}
                    highlightMap={srsHighlight}
                  />
                  {isSchoolAge && (
                    <SrsPanel
                      title="SRS-2 Teacher"
                      domains={config.srs2Domains}
                      srs2={srs2Teacher}
                      setSRS2={setSRS2Teacher}
                      highlightMap={srsHighlight}
                    />
                  )}
                </>
              )}
              {hasAsrs && (
                <>
                  <AsrsPanel
                    title="ASRS Parent"
                    domains={config.asrsDomains}
                    asrs={asrs}
                    setASRS={setASRS}
                    highlightMap={asrsHighlight}
                  />
                  {isSchoolAge && (
                    <AsrsPanel
                      title="ASRS Teacher"
                      domains={config.asrsDomains}
                      asrs={asrsTeacher}
                      setASRS={setASRSTeacher}
                      highlightMap={asrsHighlight}
                    />
                  )}
                </>
              )}
              {selectedAutismQs.includes("AQ") && (
                <DomainPanel title="AQ" domains={AQ_DOMAINS} valueMap={aq} setValueMap={setAQ} />
              )}
              {selectedAutismQs.filter((n) => !["SRS-2", "ASRS", "AQ"].includes(n)).length > 0 && (
                <GenericInstrumentPanel
                  selected={selectedAutismQs.filter((n) => !["SRS-2", "ASRS", "AQ"].includes(n))}
                  instruments={instruments}
                  setInstruments={setInstruments}
                  configs={config.defaultInstruments}
                />
              )}
              {selectedAutismObs.includes("ADOS-2") && (
                <DomainPanel
                  title="ADOS-2"
                  domains={ADOS2_DOMAINS}
                  valueMap={ados}
                  setValueMap={setADOS}
                  highlightMap={adosHighlight}
                />
              )}
              {selectedAutismObs.includes("MIGDAS-2") && (
                <DomainPanel title="MIGDAS-2" domains={MIGDAS_DOMAINS} valueMap={migdasDomains} setValueMap={setMigdasDomains} />
              )}
              {selectedAutismObs.filter((n) => !["ADOS-2", "MIGDAS-2"].includes(n)).length > 0 && (
                <GenericInstrumentPanel
                  selected={selectedAutismObs.filter((n) => !["ADOS-2", "MIGDAS-2"].includes(n))}
                  instruments={instruments}
                  setInstruments={setInstruments}
                  configs={config.defaultInstruments}
                />
              )}
              {selectedAutismInterviews.includes("ADI-R") && (
                <DomainPanel
                  title="ADI-R"
                  domains={ADIR_DOMAINS}
                  valueMap={adir}
                  setValueMap={setADIR}
                  highlightMap={adirHighlight}
                />
              )}
              {selectedAutismInterviews.filter((n) => n !== "ADI-R").length > 0 && (
                <GenericInstrumentPanel
                  selected={selectedAutismInterviews.filter((n) => n !== "ADI-R")}
                  instruments={instruments}
                  setInstruments={setInstruments}
                  configs={config.defaultInstruments}
                />
              )}

              {selectedAdaptive.length > 0 && (
                <>
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
                      title="Vineland-3"
                      domains={VINELAND_DOMAINS}
                      options={VINELAND_SEVERITIES}
                      valueMap={vineland}
                      setValueMap={setVineland}
                      highlightMap={vinelandHighlight}
                    />
                  )}
                  {selectedAdaptive.filter((n) => !["ABAS-3", "Vineland-3"].includes(n)).length > 0 && (
                    <GenericInstrumentPanel
                      selected={selectedAdaptive.filter((n) => !["ABAS-3", "Vineland-3"].includes(n))}
                      instruments={instruments}
                      setInstruments={setInstruments}
                      configs={config.defaultInstruments}
                    />
                  )}
                </>
              )}

              {selectedIntellectual.length > 0 && (
                <>
                  {selectedIntellectual.includes("WISC/WAIS/WPPSI") && (
                    <DomainPanel
                      title="WISC-V / WAIS-IV / WPPSI-IV"
                      domains={config.wiscDomains}
                      valueMap={wisc}
                      setValueMap={setWISC}
                    />
                  )}
                  {selectedIntellectual.filter((n) => n !== "WISC/WAIS/WPPSI").length > 0 && (
                    <GenericInstrumentPanel
                      selected={selectedIntellectual.filter((n) => n !== "WISC/WAIS/WPPSI")}
                      instruments={instruments}
                      setInstruments={setInstruments}
                      configs={config.defaultInstruments}
                    />
                  )}
                </>
              )}

              {selectedExecutive.length > 0 && (
                <>
                  {selectedExecutive.some((n) => n.startsWith("BRIEF-2")) &&
                    isBriefAge && (
                      <>
                        <DomainPanel
                          title={`${briefName} Parent`}
                          domains={BRIEF2_DOMAINS}
                          valueMap={briefParent}
                          setValueMap={setBRIEFParent}
                          highlightMap={briefHighlight}
                        />
                        {isSchoolAge && (
                          <DomainPanel
                            title={`${briefName} Teacher`}
                            domains={BRIEF2_DOMAINS}
                            valueMap={briefTeacher}
                            setValueMap={setBRIEFTeacher}
                            highlightMap={briefHighlight}
                          />
                        )}
                      </>
                    )}
                  {selectedExecutive.filter((n) => !n.startsWith("BRIEF-2"))
                    .length > 0 && (
                    <GenericInstrumentPanel
                      selected={selectedExecutive.filter(
                        (n) => !n.startsWith("BRIEF-2"),
                      )}
                      instruments={instruments}
                      setInstruments={setInstruments}
                      configs={config.defaultInstruments}
                    />
                  )}
                </>
              )}

              {selectedSensory.length > 0 && (
                <>
                  {selectedSensory.includes("Sensory Profile 2") && (
                    <DomainPanel
                      title="Sensory Profile 2"
                      domains={SENSORY_PROFILE_DOMAINS}
                      valueMap={sensory}
                      setValueMap={setSensory}
                      highlightMap={sensoryHighlight}
                    />
                  )}
                  {selectedSensory.filter((n) => n !== "Sensory Profile 2").length > 0 && (
                    <GenericInstrumentPanel
                      selected={selectedSensory.filter((n) => n !== "Sensory Profile 2")}
                      instruments={instruments}
                      setInstruments={setInstruments}
                      configs={config.defaultInstruments}
                    />
                  )}
                </>
              )}

              {selectedLanguage.length > 0 && (
                <>
                  {selectedLanguage.includes("CELF-5") && (
                    <DomainPanel title="CELF-5" domains={CELF5_DOMAINS} valueMap={celf} setValueMap={setCELF} />
                  )}
                  {selectedLanguage.filter((n) => n !== "CELF-5").length > 0 && (
                    <GenericInstrumentPanel
                      selected={selectedLanguage.filter((n) => n !== "CELF-5")}
                      instruments={instruments}
                      setInstruments={setInstruments}
                      configs={config.defaultInstruments}
                    />
                  )}
                </>
              )}

              <DiffPanel diff={diff} setDiff={setDiff} />
              <ExposurePanel state={exposure} setState={setExposure} />
              <FacialGrowthPanel state={facial} setState={setFacial} />
              <FasdPanel valueMap={fasdNeuro} setValueMap={setFasdNeuro} />
            </section>
          )}

          {activeTab === 1 && (
            <section className="stack stack--lg" id="history-section">
              <HistoryPanel
                history={history}
                setHistory={setHistory}
                observation={observation}
                setObservation={setObservation}
              />
            </section>
          )}

          {activeTab === 2 && (
            <div className="layout">
              <section className="stack stack--lg">
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
                  client={client}
                />
              </section>
              <section className="stack stack--lg">
                <SummaryPanel
                  model={model}
                  config={config}
                  supportEstimate={supportEstimate}
                  recommendation={recommendation}
                  exportSummary={exportSummary}
                  exportFull={exportFull}
                  version={VERSION}
                  timestamp={exportTimestamp}
                  minDatasetItems={minDatasetItems}
                  onThresholdChange={handleThresholdChange}
                  history={history}
                  pathwayCandidates={pathwayCandidates}
                  evidence={evidence}
                  conditionPercents={conditionPercents}
                />
              </section>
            </div>
          )}

        <Footer version={VERSION} ruleHash={ruleHash} />
        <AiChat />
        <AssessmentPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          assessments={assessments}
          setAssessments={setAssessments}
        />
      </Container>
    );
  }
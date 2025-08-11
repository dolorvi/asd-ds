import React, { useMemo, useState } from "react";
import {
  SRS2_DOMAINS,
  WISC_DOMAINS,
  ABAS3_DOMAINS,
  SRS2_SEVERITIES,
  WISC_SEVERITIES,
  ABAS3_SEVERITIES,
  MIGDAS_CONSISTENCY,
  CANONICAL_CASES,
} from "./data/testData";

/**
 * ASD Decision Support MVP — React prototype (v3)
 * - Fixes: removed duplicate component block; fixed unterminated string; imports label data from src/data/testData.ts
 * - Adds: Dev fixtures loader; counts domain-based instruments toward the minimum dataset; dark/day theme remains.
 */

// ----------------------------- Types -----------------------------

type CriterionKey =
  | "A1" // social-emotional reciprocity
  | "A2" // nonverbal communication
  | "A3" // relationships
  | "B1" // stereotyped/repetitive behaviors
  | "B2" // insistence on sameness
  | "B3" // restricted interests
  | "B4"; // sensory differences

type AltKey =
  | "onsetEarly" // developmental onset in early childhood
  | "impairment" // functional impairment across contexts
  | "masking" // camouflaging indicators
  | "langDisorder" // language disorder present
  | "intellectualDisability" // ID present
  | "altTrauma"
  | "altADHD"
  | "altAnxiety"
  | "altOther";

type InstrumentBandMap = Partial<Record<CriterionKey, number>> & {
  onsetEarly?: number;
  impairment?: number;
};

type InstrumentThreshold = {
  band: string; // label only
  min?: number; // not used (no proprietary ranges)
  max?: number;
  map: InstrumentBandMap; // evidence contributions when this band applies
};

type InstrumentConfig = {
  name: string;
  scoreField: "raw" | "standard" | "t" | "scaled" | "index" | "composite"; // label only
  thresholds: InstrumentThreshold[]; // optional, used by generic score fields
};

type SeverityOption = string; // e.g. "Mild", "Moderate", "Severe"

type DomainConfig = {
  key: string; // e.g., "srs_awareness"
  label: string; // UX label
  severities: Array<SeverityOption>; // allowed severity bands
  // Map by severity to DSM evidence contributions (qualitative → weights)
  mapBySeverity: Record<string, InstrumentBandMap>;
};

type MinDatasetRules = {
  minInstruments: number; // generic count (now includes domain-based instruments)
  requireASDInstrument: boolean; // ≥1 from SRS/ADOS/MIGDAS/GARS
  requireAdaptive: boolean; // ABAS/Vineland
  requireHistory: boolean; // history section
  requireObservation: boolean; // clinician observation section
};

type Config = {
  prior: number; // log-odds intercept
  riskTolerance: "sensitive" | "balanced" | "specific";
  domainWeights: Record<CriterionKey | AltKey, number>;
  minDataset: MinDatasetRules;
  defaultInstruments: InstrumentConfig[]; // generic list (scores only)
  // Domain-level configs for named instruments (qualitative bands)
  srs2Domains: DomainConfig[];
  wiscDomains: DomainConfig[]; // used for reporting; no ASD mapping by default
  abasDomains: DomainConfig[]; // primarily → impairment mapping
};

// ----------------------- Utility Functions -----------------------

function logistic(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

// ----------------------- Default Configuration -----------------------

const DEFAULT_CONFIG: Config = {
  prior: 0.0,
  riskTolerance: "balanced",
  domainWeights: {
    A1: 1.2,
    A2: 1.1,
    A3: 1.0,
    B1: 1.0,
    B2: 1.0,
    B3: 1.0,
    B4: 0.9,
    onsetEarly: 0.6,
    impairment: 0.8,
    masking: 0.3,
    langDisorder: -0.1,
    intellectualDisability: -0.1,
    altTrauma: -0.5,
    altADHD: -0.3,
    altAnxiety: -0.2,
    altOther: -0.2,
  },
  minDataset: {
    minInstruments: 2,
    requireASDInstrument: true,
    requireAdaptive: true,
    requireHistory: true,
    requireObservation: true,
  },
  defaultInstruments: [
    { name: "ADOS-2", scoreField: "standard", thresholds: [] },
    { name: "MIGDAS-2", scoreField: "standard", thresholds: [] },
    { name: "GARS", scoreField: "standard", thresholds: [] },
    { name: "SRS-2", scoreField: "t", thresholds: [] },
    { name: "Vineland-3", scoreField: "composite", thresholds: [] },
    { name: "ABAS-3", scoreField: "composite", thresholds: [] },
    { name: "WISC/WAIS/WPPSI", scoreField: "index", thresholds: [] },
    { name: "Sensory Profile 2", scoreField: "standard", thresholds: [] },
    { name: "CELF-5", scoreField: "index", thresholds: [] },
    { name: "AQ", scoreField: "raw", thresholds: [] },
  ],
  // Build domain configs from imported label lists while preserving evidence mappings
  srs2Domains: SRS2_DOMAINS.map((d) => {
    const mapBySeverity: Record<string, InstrumentBandMap> = {};
    // Map domain → DSM criteria contributions
    if (d.key === "srs_awareness") {
      mapBySeverity.Mild = { A1: 0.5 };
      mapBySeverity.Moderate = { A1: 1.0 };
      mapBySeverity.Severe = { A1: 1.3 };
    } else if (d.key === "srs_cognition") {
      mapBySeverity.Mild = { A2: 0.5 };
      mapBySeverity.Moderate = { A2: 1.0 };
      mapBySeverity.Severe = { A2: 1.3 };
    } else if (d.key === "srs_communication") {
      mapBySeverity.Mild = { A3: 0.5 };
      mapBySeverity.Moderate = { A3: 1.0 };
      mapBySeverity.Severe = { A3: 1.3 };
    } else if (d.key === "srs_motivation") {
      mapBySeverity.Mild = { A1: 0.3, A3: 0.2 };
      mapBySeverity.Moderate = { A1: 0.6, A3: 0.4 };
      mapBySeverity.Severe = { A1: 0.9, A3: 0.7 };
    } else if (d.key === "srs_rrb") {
      mapBySeverity.Mild = { B2: 0.4, B3: 0.4 };
      mapBySeverity.Moderate = { B2: 0.8, B3: 0.8 };
      mapBySeverity.Severe = { B2: 1.1, B3: 1.1 };
    }
    return {
      key: d.key,
      label: d.label,
      severities: [...SRS2_SEVERITIES],
      mapBySeverity,
    } as DomainConfig;
  }),
  // WISC domains used for report context; no ASD mapping applied by default
  wiscDomains: WISC_DOMAINS.map((d) => ({
    key: d.key,
    label: d.label,
    severities: [...WISC_SEVERITIES],
    mapBySeverity: {},
  })),
  // ABAS domains → impairment mapping only
  abasDomains: ABAS3_DOMAINS.map((d) => ({
    key: d.key,
    label: d.label,
    severities: [...ABAS3_SEVERITIES],
    mapBySeverity: {
      "Extremely Low": { impairment: 1.0 },
      "Very Low": { impairment: 0.8 },
      "Low Average": { impairment: 0.4 },
      Average: { impairment: 0.2 },
    },
  })),
};

// ---------------------------- Component ----------------------------

type SeverityState = Record<string, { score?: number; severity?: string }>; // keyed by domain key

export default function ASDDecisionSupportMVP() {
  // THEME
  const [theme, setTheme] = useState<"night" | "day">("night"); // dark-first
  const isNight = theme === "night";

  const pageBg = isNight ? "bg-slate-900" : "bg-slate-50";
  const pageText = isNight ? "text-slate-100" : "text-slate-900";
  const cardBg = isNight ? "bg-slate-800" : "bg-white";
  const borderCol = isNight ? "border-slate-700" : "border-slate-200";
  const mutedText = isNight ? "text-slate-300" : "text-slate-600";
  const inputBg = isNight ? "bg-slate-900" : "bg-white";
  const inputText = isNight ? "text-slate-100" : "text-slate-900";
  const inputBorder = isNight ? "border-slate-700" : "border-slate-300";
  const accent = isNight ? "bg-indigo-500 hover:bg-indigo-600" : "bg-indigo-600 hover:bg-indigo-700";

  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  // Generic Instrument Scores (kept for arbitrary entries)
  const [instruments, setInstruments] = useState(
    DEFAULT_CONFIG.defaultInstruments.map((i) => ({ name: i.name, value: undefined as number | undefined }))
  );

  // Domain-level states
  const [srs2, setSRS2] = useState<SeverityState>(() => Object.fromEntries(
    config.srs2Domains.map((d) => [d.key, { score: undefined, severity: "" }])
  ));
  const [wisc, setWISC] = useState<SeverityState>(() => Object.fromEntries(
    config.wiscDomains.map((d) => [d.key, { score: undefined, severity: "" }])
  ));
  const [abas, setABAS] = useState<SeverityState>(() => Object.fromEntries(
    config.abasDomains.map((d) => [d.key, { score: undefined, severity: "" }])
  ));

  // MIGDAS qualitative
  const [migdas, setMIGDAS] = useState({
    consistency: "unclear" as (typeof MIGDAS_CONSISTENCY)[number],
    notes: [""] as string[],
  });

  // History & observation
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

  // Comorbidity/differential flags
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

  // Clinician & admin
  const [clinician, setClinician] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    attested: false,
  });

  // Report voice
  const [reportVoice, setReportVoice] = useState<"clinical" | "dual">("dual");

  // ---------------- Minimum dataset checks ----------------
  const datasetStatus = useMemo(() => {
    const withValues = instruments.filter((i) => i.value !== undefined);

    const domainSRS2Entered = Object.values(srs2).some((d) => d.severity && d.severity !== "");
    const domainABASEntered = Object.values(abas).some((d) => d.severity && d.severity !== "");
    const migdasEntered = migdas.consistency !== "unclear";

    const effectiveInstrumentCount =
      withValues.length + (domainSRS2Entered ? 1 : 0) + (domainABASEntered ? 1 : 0) + (migdasEntered ? 1 : 0);

    const hasAdaptive = domainABASEntered || instruments.some((i) => ["Vineland-3", "ABAS-3"].includes(i.name) && i.value !== undefined);

    const hasASDInstrument = domainSRS2Entered || migdasEntered || instruments.some((i) => ["SRS-2", "ADOS-2", "MIGDAS-2", "GARS"].includes(i.name) && i.value !== undefined);

    const historyOk = history.developmentalConcerns.trim().length > 10 && (history.earlyOnset || true);
    const observationOk = ["A1", "A2", "A3", "B1", "B2", "B3", "B4"].every(
      (k) => (observation as any)[k] !== undefined
    );

    const rules = config.minDataset;
    const passes =
      effectiveInstrumentCount >= rules.minInstruments &&
      (!rules.requireASDInstrument || hasASDInstrument) &&
      (!rules.requireAdaptive || hasAdaptive) &&
      (!rules.requireHistory || historyOk) &&
      (!rules.requireObservation || observationOk);

    return {
      passes,
      counts: {
        instrumentsEntered: withValues.length,
        effectiveInstrumentCount,
        hasASDInstrument,
        hasAdaptive,
        historyOk,
        observationOk,
      },
    };
  }, [instruments, history, observation, config.minDataset, srs2, migdas, abas]);

  // ---------------- Evidence aggregation ----------------
  const evidence = useMemo(() => {
    const ev: Record<CriterionKey | AltKey, number> = {
      A1: 0,
      A2: 0,
      A3: 0,
      B1: 0,
      B2: 0,
      B3: 0,
      B4: 0,
      onsetEarly: history.earlyOnset ? 1 : 0,
      impairment: history.crossContextImpairment ? 1 : 0,
      masking: history.maskingIndicators ? 1 : 0,
      langDisorder: diff.DLD ? 1 : 0,
      intellectualDisability: diff.ID ? 1 : 0,
      altTrauma: diff.TraumaPTSD ? 1 : 0,
      altADHD: diff.ADHD ? 1 : 0,
      altAnxiety: diff.Anxiety || diff.Depression ? 1 : 0,
      altOther: diff.FASD || diff.Tics || !!diff.Other ? 1 : 0,
    };

    // Clinician observation (0..3)
    (["A1", "A2", "A3", "B1", "B2", "B3", "B4"] as (keyof typeof ev)[]).forEach((k) => {
      const v = Number((observation as any)[k]);
      if (!Number.isNaN(v)) (ev as any)[k] += v;
    });

    // SRS-2 domain severities → evidence
    config.srs2Domains.forEach((d) => {
      const sev = srs2[d.key]?.severity || "";
      if (!sev) return;
      const map = d.mapBySeverity[sev];
      if (!map) return;
      Object.entries(map).forEach(([k, v]) => {
        (ev as any)[k] = ((ev as any)[k] ?? 0) + (v as number);
      });
    });

    // ABAS-3 domain severities → impairment prompt
    config.abasDomains.forEach((d) => {
      const sev = abas[d.key]?.severity || "";
      if (!sev) return;
      const map = d.mapBySeverity[sev];
      if (!map) return;
      Object.entries(map).forEach(([k, v]) => {
        (ev as any)[k] = ((ev as any)[k] ?? 0) + (v as number);
      });
    });

    // MIGDAS qualitative
    if (migdas.consistency === "consistent") {
      ev.A1 += 0.6; ev.A2 += 0.6; ev.A3 += 0.6; ev.B2 += 0.6; ev.B3 += 0.6;
    } else if (migdas.consistency === "inconsistent") {
      ev.A1 += -0.4; ev.A2 += -0.4; ev.A3 += -0.4; ev.B2 += -0.3; ev.B3 += -0.3;
    }

    return ev;
  }, [observation, history, diff, srs2, config.srs2Domains, abas, config.abasDomains, migdas]);

  // ---------------- Likelihood model ----------------
  const model = useMemo(() => {
    const w = config.domainWeights;
    const terms: { key: keyof typeof w; value: number; weight: number; product: number }[] = [];
    (Object.keys(w) as (keyof typeof w)[]).forEach((k) => {
      const v = (evidence as any)[k] ?? 0;
      const prod = v * w[k];
      terms.push({ key: k, value: v, weight: w[k], product: prod });
    });
    const lp = config.prior + terms.reduce((a, b) => a + b.product, 0);
    const p = logistic(lp);

    const A = evidence.A1 + evidence.A2 + evidence.A3;
    const B = evidence.B1 + evidence.B2 + evidence.B3 + evidence.B4;
    const pA = Math.min(1, Math.max(0, A / (3 * 3)));
    const pB = Math.min(1, Math.max(0, B / (4 * 3)));

    const cut = config.riskTolerance === "sensitive" ? 0.35 : config.riskTolerance === "specific" ? 0.7 : 0.5;
    return { p, lp, pA, pB, cut, terms };
  }, [config, evidence]);

  // ---------------- Support needs (provisional) ----------------
  const supportEstimate = useMemo(() => {
    // Use ABAS domain severities; if any domain very low → high support
    const sevs = Object.values(abas).map((d) => d.severity || "");
    if (sevs.some((s) => s === "Extremely Low" || s === "Very Low")) return "High support likely";
    if (sevs.some((s) => s === "Low Average" || s === "Average")) return "Moderate support possible";
    if (sevs.some((s) => s)) return "Lower support likely";
    return "Insufficient data";
  }, [abas]);

  // ---------------- Recommendations ----------------
  const recommendation = useMemo(() => {
    const recs: string[] = [];
    if (!datasetStatus.passes) {
      recs.push("Collect minimum dataset: ≥2 instruments (incl. ≥1 ASD instrument), adaptive measure, developmental history, and clinician observation.");
      return recs;
    }
    if (model.p >= model.cut) {
      recs.push("Proceed with full diagnostic formulation aligned to DSM-5-TR; integrate ADOS-2 (if appropriate), collateral reports, and medical/hearing screens.");
      if (supportEstimate.includes("High")) recs.push("Initiate support planning; coordinate NDIS-relevant documentation where applicable.");
    } else {
      recs.push("Risk below decision threshold. If concern persists, add informant measures/observations across settings; review in 3–6 months.");
    }
    if (diff.ADHD) recs.push("Screen/assess ADHD formally (ASRS, executive functions, developmental history).");
    if (diff.TraumaPTSD) recs.push("Clarify trauma history and temporal relation to autistic features; trauma-informed approach required.");
    if (diff.DLD) recs.push("Language assessment (e.g., CELF) to delineate pragmatic vs structural language differences.");
    if (diff.ID) recs.push("Confirm cognitive profile and adaptive functioning to specify ID severity and supports.");
    return recs;
  }, [datasetStatus, model, diff, supportEstimate]);

  // ---------------- Report ----------------
  const reportMarkdown = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# ASD Decision Support — Structured Summary`);
    lines.push("");
    lines.push(`Clinician: ${clinician.name || "—"}  Date: ${clinician.date}`);
    lines.push("");
    lines.push(`**Overall ASD likelihood:** ${(model.p * 100).toFixed(1)}% (cutpoint ${(model.cut * 100).toFixed(0)}%)`);
    lines.push(`**Criterion A signal:** ${(model.pA * 100).toFixed(0)}%   **Criterion B signal:** ${(model.pB * 100).toFixed(0)}%`);
    lines.push(`**Provisional support needs:** ${supportEstimate}`);
    lines.push("");
    lines.push(`## Domain Summaries`);
    // SRS-2
    lines.push(`### SRS-2`);
    config.srs2Domains.forEach((d) => {
      const st = srs2[d.key];
      if (st?.severity || st?.score !== undefined)
        lines.push(`- ${d.label}: ${st.score ?? "—"} ${st.severity ? `(${st.severity})` : ""}`);
    });
    // WISC
    lines.push(`### WISC`);
    config.wiscDomains.forEach((d) => {
      const st = wisc[d.key];
      if (st?.severity || st?.score !== undefined)
        lines.push(`- ${d.label}: ${st.score ?? "—"} ${st.severity ? `(${st.severity})` : ""}`);
    });
    // ABAS-3
    lines.push(`### ABAS-3`);
    config.abasDomains.forEach((d) => {
      const st = abas[d.key];
      if (st?.severity || st?.score !== undefined)
        lines.push(`- ${d.label}: ${st.score ?? "—"} ${st.severity ? `(${st.severity})` : ""}`);
    });
    // MIGDAS
    lines.push(`### MIGDAS`);
    lines.push(`- Consistency: ${migdas.consistency}`);
    migdas.notes.filter((n) => n.trim()).forEach((n, i) => lines.push(`- Note ${i + 1}: ${n.trim()}`));

    lines.push("");
    lines.push(`## Developmental History & Observation`);
    lines.push(`- Early onset reported: ${history.earlyOnset ? "Yes" : "No/Unclear"}`);
    lines.push(`- Cross-context impairment: ${history.crossContextImpairment ? "Yes" : "No/Unclear"}`);
    lines.push(`- Masking/camouflaging indicators: ${history.maskingIndicators ? "Yes" : "No/Unclear"}`);
    lines.push(`- Clinician observation (0–3): A1 ${observation.A1}, A2 ${observation.A2}, A3 ${observation.A3}, B1 ${observation.B1}, B2 ${observation.B2}, B3 ${observation.B3}, B4 ${observation.B4}`);
    if (observation.notes.trim()) lines.push(`- Notes: ${observation.notes.trim()}`);

    lines.push("");
    lines.push(`## Explainability (weighted contributions)`);
    model.terms
      .sort((a, b) => Math.abs(b.product) - Math.abs(a.product))
      .slice(0, 12)
      .forEach((t) => lines.push(`- ${t.key}: value ${t.value.toFixed(2)} × weight ${t.weight.toFixed(2)} = ${t.product.toFixed(2)}`));

    lines.push("");
    lines.push(`## Recommendations`);
    recommendation.forEach((r) => lines.push(`- ${r}`));

    if (reportVoice === "dual") {
      lines.push("");
      lines.push(`## Family Summary (plain language)`);
      lines.push(`- We combined questionnaire results, observations, and history to estimate the likelihood of autism.`);
      lines.push(`- Current indicators suggest: ${(model.p * 100).toFixed(0)}% likelihood.`);
      lines.push(`- Next steps are listed above. Your clinician will explain these and decide together with you.`);
    }

    lines.push("");
    lines.push(`**Safety & Governance:** Decision support only; clinician judgement prevails. Config v3; audit JSON available.`);
    return lines.join("\n");
  }, [clinician, model, srs2, wisc, abas, migdas, history, observation, recommendation, supportEstimate, reportVoice]);

  // ---------------- Render helpers ----------------
  const Card: React.FC<{ title?: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
    <section className={classNames("mb-6 rounded-2xl border p-4", cardBg, borderCol)}>
      <div className="mb-3 flex items-center justify-between">
        {title ? <h2 className="text-lg font-semibold">{title}</h2> : <div />}
        {right}
      </div>
      {children}
    </section>
  );

  const inputCls = classNames("mt-1 w-full rounded-md border p-2", inputBg, inputText, inputBorder);
  const selectCls = classNames("mt-1 w-full rounded-md border p-2", inputBg, inputText, inputBorder);
  const textAreaCls = classNames("rounded-xl border p-2", inputBg, inputText, inputBorder);
  const chipOk = classNames("rounded px-2 py-0.5 text-xs", isNight ? "bg-emerald-600/30 text-emerald-200" : "bg-emerald-100 text-emerald-700");
  const chipWarn = classNames("rounded px-2 py-0.5 text-xs", isNight ? "bg-amber-600/30 text-amber-200" : "bg-amber-100 text-amber-700");

  // ---------------------------- UI ----------------------------
  return (
    <div className={classNames("min-h-screen", pageBg, pageText)}>
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">ASD Decision Support — MVP (v3)</h1>
            <p className={classNames("text-sm", mutedText)}>
              DSM-5-TR aligned decision support. No proprietary item content. Do not use real patient data in this demo.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className={classNames("rounded-2xl px-4 py-2 text-white shadow", accent)}
              onClick={() => window.print()}
            >
              Export/Print Report
            </button>
            <div className="flex items-center gap-2">
              <span className={classNames("text-xs", mutedText)}>Day</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isNight}
                  onChange={() => setTheme((t) => (t === "night" ? "day" : "night"))}
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-400 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
              </label>
              <span className={classNames("text-xs", mutedText)}>Night</span>
            </div>
          </div>
        </header>

        {/* Dev fixtures loader */}
        <Card title="Dev/Test Fixtures" right={
          <div className="flex items-center gap-2">
            <select className={selectCls} id="fixtureSelect">
              {CANONICAL_CASES.map((c) => (
                <option key={c.id} value={c.id}>{c.id} — {c.title}</option>
              ))}
            </select>
            <button
              className={classNames("rounded-xl px-3 py-1 text-sm text-white", accent)}
              onClick={() => {
                const select = document.getElementById("fixtureSelect") as HTMLSelectElement | null;
                if (!select) return;
                const sel = CANONICAL_CASES.find((c) => c.id === select.value);
                if (!sel) return;
                // Apply SRS-2
                setSRS2((prev) => {
                  const next = { ...prev };
                  if (sel.srs2) Object.entries(sel.srs2).forEach(([k, v]) => { next[k] = { ...(next[k]||{}), severity: v as string }; });
                  return next;
                });
                // Apply ABAS-3
                setABAS((prev) => {
                  const next = { ...prev };
                  if (sel.abas3) Object.entries(sel.abas3).forEach(([k, v]) => { next[k] = { ...(next[k]||{}), severity: v as string }; });
                  return next;
                });
                // Apply WISC
                setWISC((prev) => {
                  const next = { ...prev };
                  if (sel.wisc) Object.entries(sel.wisc).forEach(([k, v]) => { next[k] = { ...(next[k]||{}), severity: v as string }; });
                  return next;
                });
                // MIGDAS
                if (sel.migdas) setMIGDAS({ consistency: sel.migdas.consistency, notes: sel.migdas.notes });
                // Flags → history/diff
                setHistory((h) => ({
                  ...h,
                  developmentalConcerns: "Auto-filled for fixture; replace with clinical history.",
                  earlyOnset: !!sel.flags?.earlyOnset,
                  crossContextImpairment: !!sel.flags?.crossContextImpairment,
                  maskingIndicators: !!sel.flags?.masking,
                }));
                setDiff((d) => ({
                  ...d,
                  ADHD: !!sel.flags?.comorbidity?.includes("ADHD"),
                  DLD: !!sel.flags?.comorbidity?.includes("DLD"),
                  ID: !!sel.flags?.comorbidity?.includes("ID"),
                  Anxiety: !!sel.flags?.comorbidity?.includes("Anxiety"),
                  Depression: !!sel.flags?.comorbidity?.includes("Depression"),
                  TraumaPTSD: !!sel.flags?.comorbidity?.includes("TraumaPTSD"),
                  FASD: !!sel.flags?.comorbidity?.includes("FASD"),
                  Tics: !!sel.flags?.comorbidity?.includes("Tics"),
                }));
              }}
            >Load</button>
          </div>
        }>
          <p className={classNames("text-xs", mutedText)}>Use fixtures to sanity-check thresholds and the minimum-dataset gate. (Fixtures are label-only; no copyrighted content.)</p>
        </Card>

        {/* Clinician */}
        <Card title="Clinician & Governance">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={classNames("text-xs uppercase tracking-wide", mutedText)}>Clinician Name</label>
              <input className={inputCls} value={clinician.name} onChange={(e) => setClinician((s) => ({ ...s, name: e.target.value }))} placeholder="Dr Jane Citizen" />
            </div>
            <div>
              <label className={classNames("text-xs uppercase tracking-wide", mutedText)}>Date</label>
              <input type="date" className={inputCls} value={clinician.date} onChange={(e) => setClinician((s) => ({ ...s, date: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={clinician.attested} onChange={(e) => setClinician((s) => ({ ...s, attested: e.target.checked }))} />
                I attest that clinical judgement prevails.
              </label>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={classNames("text-xs uppercase tracking-wide", mutedText)}>Report Voice</label>
              <select className={selectCls} value={reportVoice} onChange={(e) => setReportVoice(e.target.value as any)}>
                <option value="clinical">Clinical only</option>
                <option value="dual">Clinical + Family summary</option>
              </select>
            </div>
            <div>
              <label className={classNames("text-xs uppercase tracking-wide", mutedText)}>Risk Tolerance</label>
              <select className={selectCls} value={config.riskTolerance} onChange={(e) => setConfig((c) => ({ ...c, riskTolerance: e.target.value as any }))}>
                <option value="sensitive">Sensitive (lower cutpoint)</option>
                <option value="balanced">Balanced</option>
                <option value="specific">Specific (higher cutpoint)</option>
              </select>
            </div>
            <div>
              <label className={classNames("text-xs uppercase tracking-wide", mutedText)}>Prior (log-odds)</label>
              <input type="number" step={0.1} className={inputCls} value={config.prior} onChange={(e) => setConfig((c) => ({ ...c, prior: Number(e.target.value) }))} />
            </div>
          </div>
        </Card>

        {/* Domain-level instruments */}
        <Card title="SRS-2 — Domain Entries">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {config.srs2Domains.map((d) => (
              <div key={d.key} className={classNames("rounded-xl border p-3", cardBg, borderCol)}>
                <div className="mb-1 text-sm font-semibold">{d.label}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={classNames("text-xs", mutedText)}>Score (optional)</label>
                    <input type="number" className={inputCls} value={srs2[d.key]?.score ?? ""} onChange={(e) => setSRS2((s) => ({ ...s, [d.key]: { ...s[d.key], score: e.target.value === "" ? undefined : Number(e.target.value) } }))} />
                  </div>
                  <div className="col-span-2">
                    <label className={classNames("text-xs", mutedText)}>Severity</label>
                    <select className={selectCls} value={srs2[d.key]?.severity ?? ""} onChange={(e) => setSRS2((s) => ({ ...s, [d.key]: { ...s[d.key], severity: e.target.value } }))}>
                      <option value="">—</option>
                      {d.severities.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="WISC — Domain Entries">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {config.wiscDomains.map((d) => (
              <div key={d.key} className={classNames("rounded-xl border p-3", cardBg, borderCol)}>
                <div className="mb-1 text-sm font-semibold">{d.label}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={classNames("text-xs", mutedText)}>Score (optional)</label>
                    <input type="number" className={inputCls} value={wisc[d.key]?.score ?? ""} onChange={(e) => setWISC((s) => ({ ...s, [d.key]: { ...s[d.key], score: e.target.value === "" ? undefined : Number(e.target.value) } }))} />
                  </div>
                  <div className="col-span-2">
                    <label className={classNames("text-xs", mutedText)}>Range</label>
                    <select className={selectCls} value={wisc[d.key]?.severity ?? ""} onChange={(e) => setWISC((s) => ({ ...s, [d.key]: { ...s[d.key], severity: e.target.value } }))}>
                      <option value="">—</option>
                      {d.severities.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className={classNames("mt-2 text-xs", mutedText)}>
            WISC entries are for context and differential formulation; by default they do not alter ASD likelihood.
          </p>
        </Card>

        <Card title="ABAS-3 — Domain Entries">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {config.abasDomains.map((d) => (
              <div key={d.key} className={classNames("rounded-xl border p-3", cardBg, borderCol)}>
                <div className="mb-1 text-sm font-semibold">{d.label}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={classNames("text-xs", mutedText)}>Score (optional)</label>
                    <input type="number" className={inputCls} value={abas[d.key]?.score ?? ""} onChange={(e) => setABAS((s) => ({ ...s, [d.key]: { ...s[d.key], score: e.target.value === "" ? undefined : Number(e.target.value) } }))} />
                  </div>
                  <div className="col-span-2">
                    <label className={classNames("text-xs", mutedText)}>Range</label>
                    <select className={selectCls} value={abas[d.key]?.severity ?? ""} onChange={(e) => setABAS((s) => ({ ...s, [d.key]: { ...s[d.key], severity: e.target.value } }))}>
                      <option value="">—</option>
                      {d.severities.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className={classNames("mt-2 text-xs", mutedText)}>
            ABAS-3 domain ranges influence the provisional support-need prompt via the **impairment** feature.
          </p>
        </Card>

        <Card title="MIGDAS — Qualitative Profile" right={
          <button className={classNames("rounded-xl px-3 py-1 text-sm", isNight ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300")} onClick={() => setMIGDAS((m) => ({ ...m, notes: [...m.notes, ""] }))}>+ Add note</button>
        }>
          <div className="mb-3">
            <label className={classNames("text-xs", mutedText)}>Overall Consistency</label>
            <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
              {(MIGDAS_CONSISTENCY as readonly string[]).map((opt) => (
                <label key={opt} className={classNames("flex items-center gap-2 rounded border p-2", borderCol)}>
                  <input type="radio" name="migdas_consistency" checked={migdas.consistency === opt} onChange={() => setMIGDAS((m) => ({ ...m, consistency: opt as any }))} />
                  {opt === "unclear" ? "Unclear" : opt === "consistent" ? "Consistent with autism" : "Inconsistent with autism"}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {migdas.notes.map((n, i) => (
              <input key={i} className={inputCls} placeholder={`Brief observation note ${i + 1}`} value={n} onChange={(e) => setMIGDAS((m) => ({ ...m, notes: m.notes.map((x, j) => (j === i ? e.target.value : x)) }))} />
            ))}
          </div>
        </Card>

        {/* Generic instruments (scores only) */}
        <Card title="Other Instruments (scores only)">
          <div className="mb-3 flex items-center justify-between">
            <div className={classNames("text-sm", mutedText)}>Enter scores/bands; mappings are configurable later.</div>
            <button className={classNames("rounded-xl px-3 py-1 text-sm", isNight ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300")} onClick={() => setInstruments((arr) => [...arr, { name: "Custom", value: undefined }])}>+ Add instrument</button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {instruments.map((inst, idx) => (
              <div key={idx} className={classNames("rounded-xl border p-3", cardBg, borderCol)}>
                <div className="mb-2 flex items-center justify-between">
                  <input className={inputCls} value={inst.name} onChange={(e) => setInstruments((arr) => arr.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))} />
                  <button className="text-xs text-rose-400 hover:underline" onClick={() => setInstruments((arr) => arr.filter((_, i) => i !== idx))}>Remove</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={classNames("text-xs", mutedText)}>Score</label>
                    <input type="number" className={inputCls} value={inst.value ?? ""} onChange={(e) => {
                      const val = e.target.value === "" ? undefined : Number(e.target.value);
                      setInstruments((arr) => arr.map((x, i) => (i === idx ? { ...x, value: val } : x)));
                    }} />
                  </div>
                  <div className="col-span-2">
                    <label className={classNames("text-xs", mutedText)}>Band (optional)</label>
                    <input className={inputCls} placeholder="e.g., Mild / Moderate / Severe" onChange={(e) => setInstruments((arr) => arr.map((x, i) => (i === idx ? { ...x, band: e.target.value } : x)))} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* History & Observation */}
        <Card title="Developmental History & Clinician Observation">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={classNames("text-sm font-semibold", mutedText)}>Developmental History</label>
              <textarea className={classNames("mt-1 h-32 w-full", textAreaCls)} placeholder="Summarise early development, social communication history, restricted/repetitive patterns." value={history.developmentalConcerns} onChange={(e) => setHistory((s) => ({ ...s, developmentalConcerns: e.target.value }))} />
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={history.earlyOnset} onChange={(e) => setHistory((s) => ({ ...s, earlyOnset: e.target.checked }))} /> Early developmental onset evident</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={history.crossContextImpairment} onChange={(e) => setHistory((s) => ({ ...s, crossContextImpairment: e.target.checked }))} /> Cross-context functional impairment</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={history.maskingIndicators} onChange={(e) => setHistory((s) => ({ ...s, maskingIndicators: e.target.checked }))} /> Masking/camouflaging indicators present</label>
              </div>
            </div>
            <div>
              <label className={classNames("text-sm font-semibold", mutedText)}>Clinician Observation (0–3)</label>
              <div className="grid grid-cols-2 gap-3">
                {(["A1", "A2", "A3", "B1", "B2", "B3", "B4"] as CriterionKey[]).map((k) => (
                  <div key={k}>
                    <label className={classNames("text-xs", mutedText)}>{k}</label>
                    <input type="number" min={0} max={3} className={inputCls} value={(observation as any)[k] ?? 0} onChange={(e) => setObservation((s) => ({ ...s, [k]: Number(e.target.value) }))} />
                  </div>
                ))}
              </div>
              <textarea className={classNames("mt-2 h-20 w-full", textAreaCls)} placeholder="Objective notes (setting, salient behaviours)." value={observation.notes} onChange={(e) => setObservation((s) => ({ ...s, notes: e.target.value }))} />
            </div>
          </div>
        </Card>

        {/* Comorbidity flags */}
        <Card title="Comorbidity / Differential Flags">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {([
              ["ADHD", "ADHD"],
              ["DLD", "Language Disorder (DLD)"],
              ["ID", "Intellectual Disability"],
              ["Anxiety", "Anxiety"],
              ["Depression", "Depression"],
              ["TraumaPTSD", "Trauma/PTSD"],
              ["FASD", "FASD"],
              ["Tics", "Tic Disorder"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(diff as any)[key]} onChange={(e) => setDiff((s) => ({ ...s, [key]: e.target.checked }))} /> {label}
              </label>
            ))}
          </div>
          <div className="mt-2">
            <label className={classNames("text-xs", mutedText)}>Other differential notes</label>
            <input className={inputCls} value={diff.Other} onChange={(e) => setDiff((s) => ({ ...s, Other: e.target.value }))} />
          </div>
        </Card>

        {/* Likelihood & Explainability */}
        <section className={classNames("mb-6 grid grid-cols-1 gap-4 md:grid-cols-3")}>          
          <div className={classNames("md:col-span-2 rounded-2xl border p-4", cardBg, borderCol)}>
            <h3 className="text-lg font-semibold">Likelihood & Domains</h3>
            <div className="mt-2 flex items-end gap-6">
              <div>
                <div className="text-4xl font-bold">{(model.p * 100).toFixed(1)}%</div>
                <div className={classNames("text-xs", mutedText)}>Overall ASD likelihood</div>
                <div className={classNames("text-xs", mutedText)}>Cutpoint: {(model.cut * 100).toFixed(0)}% ({config.riskTolerance})</div>
              </div>
              <div className="grow">
                <div className="mb-2 flex items-center justify-between text-xs"><span>Criterion A</span><span>{(model.pA * 100).toFixed(0)}%</span></div>
                <div className={classNames("h-2 w-full rounded", isNight ? "bg-slate-700" : "bg-slate-200")}>
                  <div className="h-2 rounded bg-indigo-600" style={{ width: `${Math.round(model.pA * 100)}%` }} />
                </div>
                <div className="mt-3 mb-2 flex items-center justify-between text-xs"><span>Criterion B</span><span>{(model.pB * 100).toFixed(0)}%</span></div>
                <div className={classNames("h-2 w-full rounded", isNight ? "bg-slate-700" : "bg-slate-200")}>
                  <div className="h-2 rounded bg-indigo-600" style={{ width: `${Math.round(model.pB * 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm">
              Decision: {model.p >= model.cut ? (
                <span className={chipOk}>Above threshold — proceed</span>
              ) : (
                <span className={chipWarn}>Below threshold — consider more data</span>
              )}
            </div>
          </div>

          <div className={classNames("rounded-2xl border p-4", cardBg, borderCol)}>
            <h4 className="text-sm font-semibold">Provisional Support Needs</h4>
            <div className={classNames("mt-1 rounded-xl p-3 text-center", isNight ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800")}>{supportEstimate}</div>
            <p className={classNames("mt-2 text-xs", mutedText)}>Derived from ABAS domain ranges. Configure mappings in settings (no proprietary content).</p>
          </div>
        </section>

        <Card title="Recommendations">
          <ul className="list-disc pl-6 text-sm">
            {recommendation.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Card>

        <Card title="Explainability — Evidence Contributions">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {model.terms
              .sort((a, b) => Math.abs(b.product) - Math.abs(a.product))
              .map((t, i) => (
                <div key={i} className={classNames("rounded-xl border p-3", cardBg, borderCol)}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">{String(t.key)}</span>
                    <span>{t.product.toFixed(2)}</span>
                  </div>
                  <div className={classNames("mt-2 h-2 w-full rounded", isNight ? "bg-slate-700" : "bg-slate-200")}> 
                    <div className={classNames("h-2 rounded", t.product >= 0 ? "bg-indigo-600" : "bg-rose-500")} style={{ width: `${Math.min(100, Math.abs(t.product) * 20)}%` }} />
                  </div>
                  <div className={classNames("mt-1 text-xs", mutedText)}>value {t.value.toFixed(2)} × weight {t.weight.toFixed(2)}</div>
                </div>
              ))}
          </div>
        </Card>

        <Card title="Structured Report (preview)">
          <pre className={classNames("whitespace-pre-wrap rounded-xl p-3 text-sm", isNight ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800")}>{reportMarkdown}</pre>
        </Card>

        <Card title="Settings & Minimum Dataset">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={classNames("rounded-xl border p-3", cardBg, borderCol)}>
              <h4 className="mb-2 font-semibold">Minimum Dataset</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.minDataset.requireASDInstrument} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireASDInstrument: e.target.checked } }))} /> Require ≥1 ASD instrument</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.minDataset.requireAdaptive} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireAdaptive: e.target.checked } }))} /> Require adaptive measure</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.minDataset.requireHistory} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireHistory: e.target.checked } }))} /> Require history</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.minDataset.requireObservation} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireObservation: e.target.checked } }))} /> Require observation</label>
                <div>
                  <label className={classNames("text-xs", mutedText)}>Min instruments</label>
                  <input type="number" min={0} className={inputCls} value={config.minDataset.minInstruments} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, minInstruments: Number(e.target.value) } }))} />
                </div>
              </div>
              <div className={classNames("mt-2 text-xs", mutedText)}>
                Status: {datasetStatus.passes ? <span className={chipOk}>Meets minimum</span> : <span className={chipWarn}>Does not meet minimum</span>} 
                <span className="ml-2">(Instruments: {datasetStatus.counts.instrumentsEntered}, Effective: {datasetStatus.counts.effectiveInstrumentCount}, ASD instrument: {String(datasetStatus.counts.hasASDInstrument)}, Adaptive: {String(datasetStatus.counts.hasAdaptive)}, History: {String(datasetStatus.counts.historyOk)}, Obs: {String(datasetStatus.counts.observationOk)})</span>
              </div>
            </div>

            <div className={classNames("rounded-xl border p-3", cardBg, borderCol)}>
              <h4 className="mb-2 font-semibold">Audit JSON</h4>
              <pre className={classNames("h-48 overflow-auto whitespace-pre-wrap rounded p-2 text-xs", isNight ? "bg-slate-900" : "bg-slate-50")}>{JSON.stringify({
                clinician,
                srs2,
                wisc,
                abas,
                migdas,
                instruments,
                history,
                observation,
                diff,
                evidence,
                model: { p: model.p, lp: model.lp, cut: model.cut },
                config,
                timestamp: new Date().toISOString(),
              }, null, 2)}</pre>
            </div>
          </div>
          <div className={classNames("mt-4 rounded-xl border p-3 text-xs", borderCol)}>
            <h4 className="mb-1 font-semibold">Regulatory posture & Jurisdiction</h4>
            <p className={mutedText}>
              Clinical Decision Support (CDS) tool. Not a diagnostic device. Intended for use by qualified clinicians under the Australian Privacy Principles (APPs) and the NSW Health Records and Information Privacy Act (HRIP Act). For TGA, design for CDS exemption where applicable; retain versioned rules, audit logs, and clinician attestation in production.
            </p>
          </div>
        </Card>

        <footer className={classNames("my-10 text-center text-xs", mutedText)}>
          © {new Date().getFullYear()} ASD Decision Support MVP — Demonstration only. Night/Day accessibility modes ensure high contrast; please report any visibility issues.
        </footer>
      </div>
      <style>{`@media print { body { background: white; } .no-print { display: none; } }`}</style>
    </div>
  );
}
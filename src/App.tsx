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
} from "./data/testData"; // ⬅️ change to "./testData" if your file lives at src/testData.ts

/**
 * ASD Decision Support — MVP (clean rewrite)
 * - Plain CSS classes (no Tailwind/shadcn)
 * - Tiny UI helpers: <Card>, <Field>
 * - Single export default App()
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

type DomainConfig = {
  key: string;
  label: string;
  severities: string[];
  mapBySeverity: Record<string, InstrumentBandMap>;
};

type MinDatasetRules = {
  minInstruments: number;
  requireASDInstrument: boolean;
  requireAdaptive: boolean;
  requireHistory: boolean;
  requireObservation: boolean;
};

type InstrumentConfig = { name: string; scoreField: string; thresholds: any[] };

type Config = {
  prior: number;
  riskTolerance: "sensitive" | "balanced" | "specific";
  domainWeights: Record<CriterionKey | AltKey, number>;
  minDataset: MinDatasetRules;
  defaultInstruments: InstrumentConfig[];
  srs2Domains: DomainConfig[];
  wiscDomains: DomainConfig[];
  abasDomains: DomainConfig[];
};

type SeverityState = Record<string, { score?: number; severity?: string }>;

// ----------------------- Utils -----------------------

function logistic(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// ----------------------- Default Configuration -----------------------

const DEFAULT_CONFIG: Config = {
  prior: 0,
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
  // Build domain configs with evidence mappings
  srs2Domains: SRS2_DOMAINS.map((d) => {
    const mapBySeverity: Record<string, InstrumentBandMap> = {};
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
    return { key: d.key, label: d.label, severities: [...SRS2_SEVERITIES], mapBySeverity };
  }),
  wiscDomains: WISC_DOMAINS.map((d) => ({
    key: d.key,
    label: d.label,
    severities: [...WISC_SEVERITIES],
    mapBySeverity: {},
  })),
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

// ----------------------- Tiny UI helpers -----------------------

function Card({ title, right, children }: { title?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        {title ? <h2 className="section-title">{title}</h2> : <div />}
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="control">
      <label>{label}</label>
      {children}
    </div>
  );
}

// ---------------------------- Component ----------------------------

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  // Generic Instruments (scores only)
  const [instruments, setInstruments] = useState(
    DEFAULT_CONFIG.defaultInstruments.map((i) => ({ name: i.name, value: undefined as number | undefined, band: "" }))
  );

  // Domain-level states
  const [srs2, setSRS2] = useState<SeverityState>(() => Object.fromEntries(config.srs2Domains.map((d) => [d.key, { score: undefined, severity: "" }])));
  const [wisc, setWISC] = useState<SeverityState>(() => Object.fromEntries(config.wiscDomains.map((d) => [d.key, { score: undefined, severity: "" }])));
  const [abas, setABAS] = useState<SeverityState>(() => Object.fromEntries(config.abasDomains.map((d) => [d.key, { score: undefined, severity: "" }])));

  // MIGDAS qualitative
  const [migdas, setMIGDAS] = useState({
    consistency: (MIGDAS_CONSISTENCY[0] as (typeof MIGDAS_CONSISTENCY)[number]) || "unclear",
    notes: [""] as string[],
  });

  // History & observation
  const [history, setHistory] = useState({
    developmentalConcerns: "",
    earlyOnset: false,
    crossContextImpairment: false,
    maskingIndicators: false,
  });

  const [observation, setObservation] = useState({ A1: 0, A2: 0, A3: 0, B1: 0, B2: 0, B3: 0, B4: 0, notes: "" });

  // Comorbid flags
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

  // Clinician/admin
  const [clinician, setClinician] = useState({ name: "", date: new Date().toISOString().slice(0, 10), attested: false });

  const [reportVoice, setReportVoice] = useState<"clinical" | "dual">("dual");

  // ---------------- Minimum dataset ----------------
  const datasetStatus = useMemo(() => {
    const withValues = instruments.filter((i) => i.value !== undefined);

    const domainSRS2Entered = Object.values(srs2).some((d) => d.severity && d.severity !== "");
    const domainABASEntered = Object.values(abas).some((d) => d.severity && d.severity !== "");
    const migdasEntered = migdas.consistency !== "unclear";

    const effectiveInstrumentCount = withValues.length + (domainSRS2Entered ? 1 : 0) + (domainABASEntered ? 1 : 0) + (migdasEntered ? 1 : 0);

    const hasAdaptive = domainABASEntered || instruments.some((i) => ["Vineland-3", "ABAS-3"].includes(i.name) && i.value !== undefined);
    const hasASDInstrument = domainSRS2Entered || migdasEntered || instruments.some((i) => ["SRS-2", "ADOS-2", "MIGDAS-2", "GARS"].includes(i.name) && i.value !== undefined);

    const historyOk = history.developmentalConcerns.trim().length > 10 && history.earlyOnset;
    const observationOk = (['A1','A2','A3','B1','B2','B3','B4'] as const).every((k) => (observation as any)[k] !== undefined);

    const rules = config.minDataset;
    const passes =
      effectiveInstrumentCount >= rules.minInstruments &&
      (!rules.requireASDInstrument || hasASDInstrument) &&
      (!rules.requireAdaptive || hasAdaptive) &&
      (!rules.requireHistory || historyOk) &&
      (!rules.requireObservation || observationOk);

    return {
      passes,
      counts: { instrumentsEntered: withValues.length, effectiveInstrumentCount, hasASDInstrument, hasAdaptive, historyOk, observationOk },
    };
  }, [instruments, srs2, abas, migdas, history, observation, config.minDataset]);

  // ---------------- Evidence aggregation ----------------
  const evidence = useMemo(() => {
    const ev: Record<CriterionKey | AltKey, number> = {
      A1: 0, A2: 0, A3: 0, B1: 0, B2: 0, B3: 0, B4: 0,
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
    (['A1','A2','A3','B1','B2','B3','B4'] as const).forEach((k) => {
      const v = Number((observation as any)[k]);
      if (!Number.isNaN(v)) (ev as any)[k] += v;
    });

    // SRS-2 domain severities → evidence
    config.srs2Domains.forEach((d) => {
      const sev = srs2[d.key]?.severity || "";
      if (!sev) return;
      const map = d.mapBySeverity[sev];
      if (!map) return;
      Object.entries(map).forEach(([k, v]) => { (ev as any)[k] = ((ev as any)[k] ?? 0) + (v as number); });
    });

    // ABAS-3 domain severities → impairment
    config.abasDomains.forEach((d) => {
      const sev = abas[d.key]?.severity || "";
      if (!sev) return;
      const map = d.mapBySeverity[sev];
      if (!map) return;
      Object.entries(map).forEach(([k, v]) => { (ev as any)[k] = ((ev as any)[k] ?? 0) + (v as number); });
    });

    // MIGDAS qualitative
    if (migdas.consistency === "consistent") {
      ev.A1 += 0.6; ev.A2 += 0.6; ev.A3 += 0.6; ev.B2 += 0.6; ev.B3 += 0.6;
    } else if (migdas.consistency === "inconsistent") {
      ev.A1 += -0.4; ev.A2 += -0.4; ev.A3 += -0.4; ev.B2 += -0.3; ev.B3 += -0.3;
    }

    return ev;
  }, [observation, history, diff, srs2, abas, config.srs2Domains, config.abasDomains, migdas]);

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

  // ---------------- Support estimate ----------------
  const supportEstimate = useMemo(() => {
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

  // ---------------- Report (markdown-ish) ----------------
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
    lines.push(`### SRS-2`);
    config.srs2Domains.forEach((d) => {
      const st = srs2[d.key];
      if (st?.severity || st?.score !== undefined) lines.push(`- ${d.label}: ${st.score ?? "—"} ${st.severity ? `(${st.severity})` : ""}`);
    });
    lines.push(`### WISC`);
    config.wiscDomains.forEach((d) => {
      const st = wisc[d.key];
      if (st?.severity || st?.score !== undefined) lines.push(`- ${d.label}: ${st.score ?? "—"} ${st.severity ? `(${st.severity})` : ""}`);
    });
    lines.push(`### ABAS-3`);
    config.abasDomains.forEach((d) => {
      const st = abas[d.key];
      if (st?.severity || st?.score !== undefined) lines.push(`- ${d.label}: ${st.score ?? "—"} ${st.severity ? `(${st.severity})` : ""}`);
    });
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

  // ---------------------------- UI ----------------------------
  return (
    <div className="app-shell">
      {/* Top Bar */}
      <div className="topbar">
        <div>
          <h1 className="title">ASD Decision Support — MVP</h1>
          <div className="subtitle">DSM-5-TR aligned • draft build</div>
        </div>
        <div className="toolbar">
          <button onClick={() => window.print()}>Export</button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid">
        {/* Dev fixtures */}
        <Card
          title="Dev/Test Fixtures"
          right={
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
                  const select = document.getElementById("fixtureSelect") as HTMLSelectElement | null;
                  if (!select) return;
                  const sel = CANONICAL_CASES.find((c) => c.id === select.value);
                  if (!sel) return;
                  // Apply SRS-2
                  setSRS2((prev) => {
                    const next = { ...prev } as SeverityState;
                    if (sel.srs2)
                      Object.entries(sel.srs2).forEach(([k, v]) => {
                        next[k] = { ...(next[k] || {}), severity: v as string };
                      });
                    return next;
                  });
                  // Apply ABAS-3
                  setABAS((prev) => {
                    const next = { ...prev } as SeverityState;
                    if (sel.abas3)
                      Object.entries(sel.abas3).forEach(([k, v]) => {
                        next[k] = { ...(next[k] || {}), severity: v as string };
                      });
                    return next;
                  });
                  // Apply WISC
                  setWISC((prev) => {
                    const next = { ...prev } as SeverityState;
                    if (sel.wisc)
                      Object.entries(sel.wisc).forEach(([k, v]) => {
                        next[k] = { ...(next[k] || {}), severity: v as string };
                      });
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
              >
                Load
              </button>
            </div>
          }
        >
          <p className="small">Use fixtures to sanity‑check thresholds and the minimum‑dataset gate. (Label‑only; no proprietary content.)</p>
        </Card>

        {/* Clinician & Governance */}
        <Card title="Clinician & Governance">
          <div className="grid">
            <Field label="Clinician Name">
              <input
                value={clinician.name}
                onChange={(e) => setClinician((s) => ({ ...s, name: e.target.value }))}
                placeholder="Dr Jane Citizen"
              />
            </Field>
            <Field label="Date">
              <input type="date" value={clinician.date} onChange={(e) => setClinician((s) => ({ ...s, date: e.target.value }))} />
            </Field>
            <label className="row">
              <input type="checkbox" checked={clinician.attested} onChange={(e) => setClinician((s) => ({ ...s, attested: e.target.checked }))} />
              <span>I attest that clinical judgement prevails.</span>
            </label>
          </div>
          <div className="grid">
            <Field label="Report Voice">
              <select value={reportVoice} onChange={(e) => setReportVoice(e.target.value as any)}>
                <option value="clinical">Clinical only</option>
                <option value="dual">Clinical + Family summary</option>
              </select>
            </Field>
            <Field label="Risk Tolerance">
              <select value={config.riskTolerance} onChange={(e) => setConfig((c) => ({ ...c, riskTolerance: e.target.value as any }))}>
                <option value="sensitive">Sensitive (lower cutpoint)</option>
                <option value="balanced">Balanced</option>
                <option value="specific">Specific (higher cutpoint)</option>
              </select>
            </Field>
            <Field label="Prior (log-odds)">
              <input type="number" step={0.1} value={config.prior} onChange={(e) => setConfig((c) => ({ ...c, prior: Number(e.target.value) }))} />
            </Field>
          </div>
        </Card>

        {/* SRS-2 */}
        <Card title="SRS-2 — Domain Entries">
          <div className="grid">
            {config.srs2Domains.map((d) => (
              <section key={d.key} className="card">
                <div className="stack">
                  <div className="title" style={{ fontSize: 14 }}>{d.label}</div>
                  <div className="grid" style={{ gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                    <Field label="Score (optional)">
                      <input
                        type="number"
                        value={srs2[d.key]?.score ?? ""}
                        onChange={(e) =>
                          setSRS2((s) => ({
                            ...s,
                            [d.key]: { ...s[d.key], score: e.target.value === "" ? undefined : Number(e.target.value) },
                          }))
                        }
                      />
                    </Field>
                    <Field label="Severity">
                      <select
                        value={srs2[d.key]?.severity ?? ""}
                        onChange={(e) => setSRS2((s) => ({ ...s, [d.key]: { ...s[d.key], severity: e.target.value } }))}
                      >
                        <option value="">—</option>
                        {d.severities.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </Card>

        {/* WISC */}
        <Card title="WISC — Domain Entries">
          <div className="grid">
            {config.wiscDomains.map((d) => (
              <section key={d.key} className="card">
                <div className="stack">
                  <div className="title" style={{ fontSize: 14 }}>{d.label}</div>
                  <div className="grid" style={{ gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                    <Field label="Score (optional)">
                      <input
                        type="number"
                        value={wisc[d.key]?.score ?? ""}
                        onChange={(e) =>
                          setWISC((s) => ({
                            ...s,
                            [d.key]: { ...s[d.key], score: e.target.value === "" ? undefined : Number(e.target.value) },
                          }))
                        }
                      />
                    </Field>
                    <Field label="Range">
                      <select
                        value={wisc[d.key]?.severity ?? ""}
                        onChange={(e) => setWISC((s) => ({ ...s, [d.key]: { ...s[d.key], severity: e.target.value } }))}
                      >
                        <option value="">—</option>
                        {d.severities.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              </section>
            ))}
          </div>
          <p className="small">WISC entries are for context and differential formulation; by default they do not alter ASD likelihood.</p>
        </Card>

        {/* ABAS-3 */}
        <Card title="ABAS-3 — Domain Entries">
          <div className="grid">
            {config.abasDomains.map((d) => (
              <section key={d.key} className="card">
                <div className="stack">
                  <div className="title" style={{ fontSize: 14 }}>{d.label}</div>
                  <div className="grid" style={{ gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                    <Field label="Score (optional)">
                      <input
                        type="number"
                        value={abas[d.key]?.score ?? ""}
                        onChange={(e) =>
                          setABAS((s) => ({
                            ...s,
                            [d.key]: { ...s[d.key], score: e.target.value === "" ? undefined : Number(e.target.value) },
                          }))
                        }
                      />
                    </Field>
                    <Field label="Range">
                      <select
                        value={abas[d.key]?.severity ?? ""}
                        onChange={(e) => setABAS((s) => ({ ...s, [d.key]: { ...s[d.key], severity: e.target.value } }))}
                      >
                        <option value="">—</option>
                        {d.severities.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              </section>
            ))}
          </div>
          <p className="small">ABAS-3 domain ranges influence the provisional support-need prompt via the <b>impairment</b> feature.</p>
        </Card>

        {/* MIGDAS */}
        <Card
          title="MIGDAS — Qualitative Profile"
          right={<button onClick={() => setMIGDAS((m) => ({ ...m, notes: [...m.notes, ""] }))}>+ Add note</button>}
        >
          <div className="stack">
            <Field label="Overall Consistency">
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                {(MIGDAS_CONSISTENCY as readonly string[]).map((opt) => (
                  <label key={opt} className="row">
                    <input type="radio" name="migdas_consistency" checked={migdas.consistency === opt} onChange={() => setMIGDAS((m) => ({ ...m, consistency: opt as any }))} />
                    <span>
                      {opt === "unclear" ? "Unclear" : opt === "consistent" ? "Consistent with autism" : "Inconsistent with autism"}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
            <div className="stack">
              {migdas.notes.map((n, i) => (
                <input
                  key={i}
                  placeholder={`Brief observation note ${i + 1}`}
                  value={n}
                  onChange={(e) => setMIGDAS((m) => ({ ...m, notes: m.notes.map((x, j) => (j === i ? e.target.value : x)) }))}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Generic instruments */}
        <Card title="Other Instruments (scores only)">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="small">Enter scores/bands; mappings are configurable later.</div>
            <button onClick={() => setInstruments((arr) => [...arr, { name: "Custom", value: undefined, band: "" }])}>+ Add instrument</button>
          </div>
          <div className="grid">
            {instruments.map((inst, idx) => (
              <section key={idx} className="card">
                <div className="stack">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <input value={inst.name} onChange={(e) => setInstruments((arr) => arr.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))} />
                    <button className="small" onClick={() => setInstruments((arr) => arr.filter((_, i) => i !== idx))}>Remove</button>
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                    <Field label="Score">
                      <input
                        type="number"
                        value={inst.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? undefined : Number(e.target.value);
                          setInstruments((arr) => arr.map((x, i) => (i === idx ? { ...x, value: val } : x)));
                        }}
                      />
                    </Field>
                    <Field label="Band (optional)">
                      <input
                        placeholder="e.g., Mild / Moderate / Severe"
                        value={inst.band || ""}
                        onChange={(e) => setInstruments((arr) => arr.map((x, i) => (i === idx ? { ...x, band: e.target.value } : x)))}
                      />
                    </Field>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </Card>

        {/* History & Observation */}
        <Card title="Developmental History & Clinician Observation">
          <div className="grid">
            <div className="stack">
              <label>Developmental History</label>
              <textarea
                placeholder="Summarise early development, social communication history, restricted/repetitive patterns."
                value={history.developmentalConcerns}
                onChange={(e) => setHistory((s) => ({ ...s, developmentalConcerns: e.target.value }))}
                style={{ height: 120 }}
              />
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <label className="row"><input type="checkbox" checked={history.earlyOnset} onChange={(e) => setHistory((s) => ({ ...s, earlyOnset: e.target.checked }))} /> Early developmental onset evident</label>
                <label className="row"><input type="checkbox" checked={history.crossContextImpairment} onChange={(e) => setHistory((s) => ({ ...s, crossContextImpairment: e.target.checked }))} /> Cross‑context functional impairment</label>
                <label className="row"><input type="checkbox" checked={history.maskingIndicators} onChange={(e) => setHistory((s) => ({ ...s, maskingIndicators: e.target.checked }))} /> Masking/camouflaging indicators present</label>
              </div>
            </div>
            <div className="stack">
              <label>Clinician Observation (0–3)</label>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {(["A1", "A2", "A3", "B1", "B2", "B3", "B4"] as CriterionKey[]).map((k) => (
                  <Field key={k} label={k}>
                    <input type="number" min={0} max={3} value={(observation as any)[k] ?? 0} onChange={(e) => setObservation((s) => ({ ...s, [k]: Number(e.target.value) }))} />
                  </Field>
                ))}
              </div>
              <textarea
                placeholder="Objective notes (setting, salient behaviours)."
                value={observation.notes}
                onChange={(e) => setObservation((s) => ({ ...s, notes: e.target.value }))}
                style={{ height: 80 }}
              />
            </div>
          </div>
        </Card>

        {/* Diff flags */}
        <Card title="Comorbidity / Differential Flags">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
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
              <label key={key} className="row">
                <input type="checkbox" checked={(diff as any)[key]} onChange={(e) => setDiff((s) => ({ ...s, [key]: e.target.checked }))} /> {label}
              </label>
            ))}
          </div>
          <Field label="Other differential notes">
            <input value={diff.Other} onChange={(e) => setDiff((s) => ({ ...s, Other: e.target.value }))} />
          </Field>
        </Card>

        {/* Likelihood & Support needs */}
        <Card title="Likelihood & Domains">
          <div className="row" style={{ alignItems: "flex-end", gap: 24 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{(model.p * 100).toFixed(1)}%</div>
              <div className="small">Overall ASD likelihood</div>
              <div className="small">Cutpoint: {(model.cut * 100).toFixed(0)}% ({config.riskTolerance})</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="small">Criterion A</span>
                <span className="small">{(model.pA * 100).toFixed(0)}%</span>
              </div>
              <div className="meter"><span style={{ width: `${Math.round(model.pA * 100)}%` }} /></div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
                <span className="small">Criterion B</span>
                <span className="small">{(model.pB * 100).toFixed(0)}%</span>
              </div>
              <div className="meter"><span style={{ width: `${Math.round(model.pB * 100)}%` }} /></div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            Decision: {model.p >= model.cut ? <span className="badge ok">Above threshold — proceed</span> : <span className="badge warn">Below threshold — consider more data</span>}
          </div>
        </Card>

        <Card title="Provisional Support Needs">
          <div className="card" style={{ textAlign: "center" }}>{supportEstimate}</div>
          <p className="small">Derived from ABAS domain ranges.</p>
        </Card>

        {/* Recommendations */}
        <Card title="Recommendations">
          <ul style={{ paddingLeft: 20 }}>
            {recommendation.map((r, i) => (
              <li key={i} style={{ fontSize: 14 }}>{r}</li>
            ))}
          </ul>
        </Card>

        {/* Explainability */}
        <Card title="Explainability — Evidence Contributions">
          <div className="grid">
            {model.terms
              .sort((a, b) => Math.abs(b.product) - Math.abs(a.product))
              .map((t, i) => (
                <section key={i} className="card">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>{String(t.key)}</span>
                    <span>{t.product.toFixed(2)}</span>
                  </div>
                  <div className="meter" style={{ marginTop: 8 }}>
                    <span style={{ width: `${Math.min(100, Math.abs(t.product) * 20)}%`, background: t.product >= 0 ? "linear-gradient(90deg,#34d399,#60a5fa)" : "#f43f5e" }} />
                  </div>
                  <div className="small" style={{ marginTop: 4 }}>
                    value {t.value.toFixed(2)} × weight {t.weight.toFixed(2)}
                  </div>
                </section>
              ))}
          </div>
        </Card>

        {/* Report */}
        <Card title="Structured Report (preview)">
          <pre style={{ whiteSpace: "pre-wrap", padding: 12 }}>{reportMarkdown}</pre>
        </Card>

        {/* Settings & Minimum Dataset */}
        <Card title="Settings & Minimum Dataset">
          <div className="grid">
            <section className="card">
              <h3 className="section-title">Minimum Dataset</h3>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <label className="row"><input type="checkbox" checked={config.minDataset.requireASDInstrument} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireASDInstrument: e.target.checked } }))} /> Require ≥1 ASD instrument</label>
                <label className="row"><input type="checkbox" checked={config.minDataset.requireAdaptive} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireAdaptive: e.target.checked } }))} /> Require adaptive measure</label>
                <label className="row"><input type="checkbox" checked={config.minDataset.requireHistory} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireHistory: e.target.checked } }))} /> Require history</label>
                <label className="row"><input type="checkbox" checked={config.minDataset.requireObservation} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireObservation: e.target.checked } }))} /> Require observation</label>
                <Field label="Min instruments">
                  <input type="number" min={0} value={config.minDataset.minInstruments} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, minInstruments: Number(e.target.value) } }))} />
                </Field>
              </div>
              <div className="small" style={{ marginTop: 8 }}>
                Status: {datasetStatus.passes ? <span className="badge ok">Meets minimum</span> : <span className="badge warn">Does not meet minimum</span>}
                <span style={{ marginLeft: 8 }}>
                  (Instruments: {datasetStatus.counts.instrumentsEntered}, Effective: {datasetStatus.counts.effectiveInstrumentCount}, ASD instrument: {String(datasetStatus.counts.hasASDInstrument)}, Adaptive: {String(datasetStatus.counts.hasAdaptive)}, History: {String(datasetStatus.counts.historyOk)}, Obs: {String(datasetStatus.counts.observationOk)})
                </span>
              </div>
            </section>

            <section className="card">
              <h3 className="section-title">Audit JSON</h3>
              <pre style={{ whiteSpace: "pre-wrap", height: 220, overflow: "auto", padding: 8 }}>{JSON.stringify({
                clinician, srs2, wisc, abas, migdas, instruments, history, observation, diff, evidence, model: { p: model.p, lp: model.lp, cut: model.cut }, config, timestamp: new Date().toISOString(),
              }, null, 2)}</pre>
            </section>
          </div>
        </Card>
      </div>

      <footer style={{ margin: "40px 0", textAlign: "center" }} className="small">
        © {new Date().getFullYear()} ASD Decision Support MVP — Demonstration only.
      </footer>

      <style>{`@media print { body { background: white; } .no-print { display: none; } }`}</style>
    </div>
  );
}

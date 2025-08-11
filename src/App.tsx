import React, { useMemo, useState } from "react";
import { DEFAULT_CONFIG } from "./config/modelConfig";
import { Card, Field } from "./components/ui";
import { useAsdEngine } from "./hooks/useAsdEngine";
import { CANONICAL_CASES, MIGDAS_CONSISTENCY } from "./data/testData";
import type { Config, SeverityState, CriterionKey } from "./types";

/**
 * ASD Decision Support — App (slim v4)
 * - Logic moved to hooks/useAsdEngine
 * - Calibration lives in config/modelConfig
 * - UI primitives in components/ui
 */

// Small helper to init domain state from config lists
const initSeverityState = (domains: { key: string }[]): SeverityState =>
  Object.fromEntries(domains.map((d) => [d.key, { score: undefined, severity: "" }])) as SeverityState;

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  // Generic instruments (scores only)
  const [instruments, setInstruments] = useState(
    DEFAULT_CONFIG.defaultInstruments.map((i) => ({ name: i.name, value: undefined as number | undefined, band: "" }))
  );

  // Domain-level states
  const [srs2, setSRS2] = useState<SeverityState>(() => initSeverityState(config.srs2Domains));
  const [wisc, setWISC] = useState<SeverityState>(() => initSeverityState(config.wiscDomains));
  const [abas, setABAS] = useState<SeverityState>(() => initSeverityState(config.abasDomains));

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

  // Clinician/admin
  const [clinician, setClinician] = useState({ name: "", date: new Date().toISOString().slice(0, 10), attested: false });
  const [reportVoice, setReportVoice] = useState<"clinical" | "dual">("dual");

  // Core calculations via hook
  const { datasetStatus, evidence, model, supportEstimate, recommendation } = useAsdEngine(
    config,
    srs2,
    abas,
    wisc,
    migdas,
    history,
    observation as any,
    diff as any,
    instruments
  );

  // Structured report
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
    migdas.notes
      .filter((n) => n.trim())
      .forEach((n, i) => lines.push(`- Note ${i + 1}: ${n.trim()}`));

    lines.push("");
    lines.push(`## Developmental History & Observation`);
    lines.push(`- Early onset reported: ${history.earlyOnset ? "Yes" : "No/Unclear"}`);
    lines.push(`- Cross-context impairment: ${history.crossContextImpairment ? "Yes" : "No/Unclear"}`);
    lines.push(`- Masking/camouflaging indicators: ${history.maskingIndicators ? "Yes" : "No/Unclear"}`);
    lines.push(
      `- Clinician observation (0–3): A1 ${observation.A1}, A2 ${observation.A2}, A3 ${observation.A3}, B1 ${observation.B1}, B2 ${observation.B2}, B3 ${observation.B3}, B4 ${observation.B4}`
    );
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
    lines.push(`**Safety & Governance:** Decision support only; clinician judgement prevails. Config v4; audit JSON available.`);
    return lines.join("\n");
  }, [clinician, model, srs2, wisc, abas, migdas, history, observation, recommendation, supportEstimate, reportVoice, config]);

  // ---------- UI helpers ----------
  const DomainEntry = ({
    domains,
    state,
    setState,
    severityLabel = "Severity",
  }: {
    domains: { key: string; label: string; severities: string[] }[];
    state: SeverityState;
    setState: React.Dispatch<React.SetStateAction<SeverityState>>;
    severityLabel?: string;
  }) => (
    <div className="grid">
      {domains.map((d) => (
        <section key={d.key} className="card">
          <div className="stack">
            <div className="title" style={{ fontSize: 14 }}>{d.label}</div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <Field label="Score (optional)">
                <input
                  type="number"
                  value={state[d.key]?.score ?? ""}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      [d.key]: { ...s[d.key], score: e.target.value === "" ? undefined : Number(e.target.value) },
                    }))
                  }
                />
              </Field>
              <Field label={severityLabel}>
                <select
                  value={state[d.key]?.severity ?? ""}
                  onChange={(e) => setState((s) => ({ ...s, [d.key]: { ...s[d.key], severity: e.target.value } }))}
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
  );

  // -------------- Render --------------
  return (
    <div className="app-shell">
      {/* Top Bar */}
      <div className="topbar">
        <div>
          <h1 className="title">ASD Decision Support — MVP</h1>
          <div className="subtitle">DSM-5-TR aligned • slim build</div>
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
                  // Flags → history
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
              <input
                type="checkbox"
                checked={clinician.attested}
                onChange={(e) => setClinician((s) => ({ ...s, attested: e.target.checked }))}
              />
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
              <input
                type="number"
                step={0.1}
                value={config.prior}
                onChange={(e) => setConfig((c) => ({ ...c, prior: Number(e.target.value) }))}
              />
            </Field>
          </div>
        </Card>

        {/* SRS-2 */}
        <Card title="SRS-2 — Domain Entries">
          <DomainEntry domains={config.srs2Domains} state={srs2} setState={setSRS2} severityLabel="Severity" />
        </Card>

        {/* WISC */}
        <Card title="WISC — Domain Entries">
          <DomainEntry domains={config.wiscDomains} state={wisc} setState={setWISC} severityLabel="Range" />
          <p className="small">WISC entries are for context and differential formulation; by default they do not alter ASD likelihood.</p>
        </Card>

        {/* ABAS-3 */}
        <Card title="ABAS-3 — Domain Entries">
          <DomainEntry domains={config.abasDomains} state={abas} setState={setABAS} severityLabel="Range" />
          <p className="small">
            ABAS-3 domain ranges influence the provisional support-need prompt via the <b>impairment</b> feature.
          </p>
        </Card>

        {/* MIGDAS */}
        <Card title="MIGDAS — Qualitative Profile" right={<button onClick={() => setMIGDAS((m) => ({ ...m, notes: [...m.notes, ""] }))}>+ Add note</button>}>
          <div className="stack">
            <Field label="Overall Consistency">
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                {(MIGDAS_CONSISTENCY as readonly string[]).map((opt) => (
                  <label key={opt} className="row">
                    <input
                      type="radio"
                      name="migdas_consistency"
                      checked={migdas.consistency === opt}
                      onChange={() => setMIGDAS((m) => ({ ...m, consistency: opt as any }))}
                    />
                    <span>{opt === "unclear" ? "Unclear" : opt === "consistent" ? "Consistent with autism" : "Inconsistent with autism"}</span>
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
                    <input
                      value={inst.name}
                      onChange={(e) => setInstruments((arr) => arr.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))}
                    />
                    <button className="small" onClick={() => setInstruments((arr) => arr.filter((_, i) => i !== idx))}>
                      Remove
                    </button>
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
                        value={(inst as any).band || ""}
                        onChange={(e) => setInstruments((arr) => arr.map((x, i) => (i === idx ? { ...x, band: (e.target as HTMLInputElement).value } : x)))}
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
                <label className="row">
                  <input
                    type="checkbox"
                    checked={history.earlyOnset}
                    onChange={(e) => setHistory((s) => ({ ...s, earlyOnset: e.target.checked }))}
                  />
                  Early developmental onset evident
                </label>
                <label className="row">
                  <input
                    type="checkbox"
                    checked={history.crossContextImpairment}
                    onChange={(e) => setHistory((s) => ({ ...s, crossContextImpairment: e.target.checked }))}
                  />
                  Cross‑context functional impairment
                </label>
                <label className="row">
                  <input
                    type="checkbox"
                    checked={history.maskingIndicators}
                    onChange={(e) => setHistory((s) => ({ ...s, maskingIndicators: e.target.checked }))}
                  />
                  Masking/camouflaging indicators present
                </label>
              </div>
            </div>
            <div className="stack">
              <label>Clinician Observation (0–3)</label>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {(["A1", "A2", "A3", "B1", "B2", "B3", "B4"] as CriterionKey[]).map((k) => (
                  <Field key={k} label={k}>
                    <input
                      type="number"
                      min={0}
                      max={3}
                      value={(observation as any)[k] ?? 0}
                      onChange={(e) => setObservation((s) => ({ ...s, [k]: Number(e.target.value) }))}
                    />
                  </Field>
                ))}
              </div>
              <textarea
                placeholder="Objective notes (setting, salient behaviours)."
                value={(observation as any).notes}
                onChange={(e) => setObservation((s) => ({ ...s, notes: e.target.value }))}
                style={{ height: 80 }}
              />
            </div>
          </div>
        </Card>

        {/* Comorbidity flags */}
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
                <input
                  type="checkbox"
                  checked={(diff as any)[key]}
                  onChange={(e) => setDiff((s) => ({ ...s, [key]: e.target.checked }))}
                />
                {label}
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
              <div className="meter">
                <span style={{ width: `${Math.round(model.pA * 100)}%` }} />
              </div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
                <span className="small">Criterion B</span>
                <span className="small">{(model.pB * 100).toFixed(0)}%</span>
              </div>
              <div className="meter">
                <span style={{ width: `${Math.round(model.pB * 100)}%` }} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            Decision: {model.p >= model.cut ? (
              <span className="badge ok">Above threshold — proceed</span>
            ) : (
              <span className="badge warn">Below threshold — consider more data</span>
            )}
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
              <li key={i} style={{ fontSize: 14 }}>
                {r}
              </li>
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
                    <span
                      style={{
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                      }}
                    >
                      {String(t.key)}
                    </span>
                    <span>{t.product.toFixed(2)}</span>
                  </div>
                  <div className="meter" style={{ marginTop: 8 }}>
                    <span
                      style={{
                        width: `${Math.min(100, Math.abs(t.product) * 20)}%`,
                        background: t.product >= 0 ? "linear-gradient(90deg,#34d399,#60a5fa)" : "#f43f5e",
                      }}
                    />
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
                <label className="row">
                  <input
                    type="checkbox"
                    checked={config.minDataset.requireASDInstrument}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireASDInstrument: e.target.checked } }))
                    }
                  />
                  Require ≥1 ASD instrument
                </label>
                <label className="row">
                  <input
                    type="checkbox"
                    checked={config.minDataset.requireAdaptive}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireAdaptive: e.target.checked } }))
                    }
                  />
                  Require adaptive measure
                </label>
                <label className="row">
                  <input
                    type="checkbox"
                    checked={config.minDataset.requireHistory}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireHistory: e.target.checked } }))
                    }
                  />
                  Require history
                </label>
                <label className="row">
                  <input
                    type="checkbox"
                    checked={config.minDataset.requireObservation}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireObservation: e.target.checked } }))
                    }
                  />
                  Require observation
                </label>
                <Field label="Min instruments">
                  <input
                    type="number"
                    min={0}
                    value={config.minDataset.minInstruments}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, minInstruments: Number(e.target.value) } }))
                    }
                  />
                </Field>
              </div>
              <div className="small" style={{ marginTop: 8 }}>
                Status: {datasetStatus.passes ? (
                  <span className="badge ok">Meets minimum</span>
                ) : (
                  <span className="badge warn">Does not meet minimum</span>
                )}
                <span style={{ marginLeft: 8 }}>
                  (Instruments: {datasetStatus.counts.instrumentsEntered}, Effective: {datasetStatus.counts.effectiveInstrumentCount}, ASD instrument: {String(datasetStatus.counts.hasASDInstrument)}, Adaptive: {String(datasetStatus.counts.hasAdaptive)}, History: {String(datasetStatus.counts.historyOk)}, Obs: {String(datasetStatus.counts.observationOk)})
                </span>
              </div>
            </section>

            <section className="card">
              <h3 className="section-title">Audit JSON</h3>
              <pre style={{ whiteSpace: "pre-wrap", height: 220, overflow: "auto", padding: 8 }}>
                {JSON.stringify(
                  {
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
                  },
                  null,
                  2
                )}
              </pre>
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

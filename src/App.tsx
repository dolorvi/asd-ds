import React, { useMemo, useState } from "react";
import { DEFAULT_CONFIG } from "./config/modelConfig";
import { Card, Field, TabBar, ChipGroup } from "./components/ui";
import { useAsdEngine } from "./hooks/useAsdEngine";
import { CANONICAL_CASES, MIGDAS_CONSISTENCY } from "./data/testData";
import type { Config, SeverityState, CriterionKey } from "./types";

const initSeverityState = (domains: { key: string }[]): SeverityState =>
  Object.fromEntries(domains.map((d) => [d.key, { score: undefined, severity: "" }])) as SeverityState;

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState(0);
  const TABS = ["ASD Measures", "Adaptive", "History", "Comorbidity", "Advanced"];

  // Dev panel
  const [devOpen, setDevOpen] = useState(false);

  // Generic instruments
  const [instruments, setInstruments] = useState(
    DEFAULT_CONFIG.defaultInstruments.map((i) => ({ name: i.name, value: undefined as number | undefined, band: "" }))
  );

  // Domain states
  const [srs2, setSRS2] = useState<SeverityState>(() => initSeverityState(config.srs2Domains));
  const [wisc, setWISC] = useState<SeverityState>(() => initSeverityState(config.wiscDomains));
  const [abas, setABAS] = useState<SeverityState>(() => initSeverityState(config.abasDomains));

  // Collapse controls per instrument (hide/show subtests)
  const [collapsed, setCollapsed] = useState<{ [k: string]: boolean }>({ srs2: false, wisc: true, abas: false });

  // MIGDAS
  const [migdas, setMIGDAS] = useState({
    consistency: (MIGDAS_CONSISTENCY[0] as (typeof MIGDAS_CONSISTENCY)[number]) || "unclear",
    notes: [""] as string[],
  });

  // History & obs
  const [history, setHistory] = useState({ developmentalConcerns: "", earlyOnset: false, crossContextImpairment: false, maskingIndicators: false });
  const [observation, setObservation] = useState({ A1: 0, A2: 0, A3: 0, B1: 0, B2: 0, B3: 0, B4: 0, notes: "" });

  // Diff
  const [diff, setDiff] = useState({ ADHD: false, DLD: false, ID: false, Anxiety: false, Depression: false, TraumaPTSD: false, FASD: false, Tics: false, Other: "" });

  // Clinician/admin
  const [clinician, setClinician] = useState({ name: "", date: new Date().toISOString().slice(0, 10), attested: false });
  const [reportVoice, setReportVoice] = useState<"clinical" | "dual">("dual");

  // Engine
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

  // Dataset ribbon
  const ribbon = useMemo(() => {
    const need: string[] = [];
    const r = config.minDataset;
    const c = datasetStatus.counts;
    if (r.requireASDInstrument && !c.hasASDInstrument) need.push("≥1 ASD instrument");
    if (r.requireAdaptive && !c.hasAdaptive) need.push("adaptive measure");
    if (r.requireHistory && !c.historyOk) need.push("history");
    if (r.requireObservation && !c.observationOk) need.push("observation");
    if (c.effectiveInstrumentCount < r.minInstruments) need.push(`min instruments ${r.minInstruments}`);
    const met = datasetStatus.passes ? "All requirements met" : `${c.effectiveInstrumentCount}/${r.minInstruments} met — need: ${need.join(", ") || "—"}`;
    return met;
  }, [datasetStatus, config.minDataset]);

  // Report
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
    lines.push(`## Findings (prose)`);
    lines.push(
      `SRS-2 domain ratings (severity labels only) and MIGDAS qualitative impressions were combined with developmental history and adaptive functioning to estimate the likelihood of autism. Adaptive functioning bands informed a provisional support estimate.`
    );
    lines.push("");
    lines.push(`## Recommendations`);
    recommendation.forEach((r) => lines.push(`- ${r}`));
    if (reportVoice === "dual") {
      lines.push("");
      lines.push(`## Family Summary`);
      lines.push(`- Based on questionnaires, observations, and history, current indicators suggest ${(model.p * 100).toFixed(0)}% likelihood.`);
      lines.push(`- Your clinician will discuss next steps and supports.`);
    }
    lines.push("");
    lines.push(`**Safety & Governance:** Decision support only; clinician judgement prevails. Config v5; audit JSON available.`);
    return lines.join("\n");
  }, [clinician, model, supportEstimate, recommendation, reportVoice]);

  // Fixture load handler (in dev panel)
  const loadFixture = () => {
    const select = document.getElementById("fixtureSelect") as HTMLSelectElement | null;
    if (!select) return;
    const sel = CANONICAL_CASES.find((c) => c.id === select.value);
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
  };

  // ---------- UI helpers ----------
  const SrsDomainGrid = (
    <div className="grid">
      {config.srs2Domains.map((d) => (
        <section key={d.key} className="card">
          <div className="stack">
            <div className="title" style={{ fontSize: 14 }}>{d.label}</div>
            <ChipGroup
              options={d.severities}
              value={srs2[d.key]?.severity || ""}
              onChange={(val) => setSRS2((s) => ({ ...s, [d.key]: { ...s[d.key], severity: val } }))}
            />
          </div>
        </section>
      ))}
    </div>
  );

  const AbasDomainGrid = (
    <div className="grid">
      {config.abasDomains.map((d) => (
        <section key={d.key} className="card">
          <div className="stack">
            <div className="title" style={{ fontSize: 14 }}>{d.label}</div>
            <ChipGroup
              options={d.severities}
              value={abas[d.key]?.severity || ""}
              onChange={(val) => setABAS((s) => ({ ...s, [d.key]: { ...s[d.key], severity: val } }))}
            />
          </div>
        </section>
      ))}
    </div>
  );

  const WiscDomainGrid = (
    <div className="grid">
      {config.wiscDomains.map((d) => (
        <section key={d.key} className="card">
          <div className="stack">
            <div className="title" style={{ fontSize: 14 }}>{d.label}</div>
            <ChipGroup
              options={d.severities}
              value={wisc[d.key]?.severity || ""}
              onChange={(val) => setWISC((s) => ({ ...s, [d.key]: { ...s[d.key], severity: val } }))}
            />
          </div>
        </section>
      ))}
    </div>
  );

  // -------------- Render --------------
  return (
    <div className="app-shell">
      {/* Top Bar */}
      <div className="topbar" style={{ position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 className="title">ASD Decision Support — MVP</h1>
          <div className="subtitle">DSM-5-TR aligned • tabs build</div>
        </div>
        <div className="toolbar">
          <button onClick={() => setDevOpen((v) => !v)} title="Developer fixtures">Dev</button>
          <button onClick={() => window.print()}>Export</button>
        </div>
      </div>

      {/* Dataset ribbon */}
      <div className="card" style={{ margin: "12px 0", padding: 12, borderLeft: datasetStatus.passes ? "4px solid #10b981" : "4px solid #f59e0b" }}>
        <span className="small"><b>Minimum dataset:</b> {ribbon}</span>
      </div>

      {/* Dev floating panel */}
      {devOpen && (
        <div className="card" style={{ position: "relative", marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <select id="fixtureSelect">
              {CANONICAL_CASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title}
                </option>
              ))}
            </select>
            <button onClick={loadFixture}>Load</button>
            <div className="small">Dev fixtures for sanity‑checks. (Label‑only; no proprietary content.)</div>
          </div>
        </div>
      )}

      {/* Tabs + Sticky summary layout */}
      <TabBar tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
        {/* Left: tab content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === 0 && (
            <>
              <Card
                title="SRS-2 — Domain Entries"
                right={<button className="small" onClick={() => setCollapsed((s) => ({ ...s, srs2: !s.srs2 }))}>{collapsed.srs2 ? "Show" : "Hide"}</button>}
              >
                {!collapsed.srs2 && SrsDomainGrid}
              </Card>
              <Card title="MIGDAS — Qualitative Profile">
                <Field label="Overall Consistency">
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {(MIGDAS_CONSISTENCY as readonly string[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setMIGDAS((m) => ({ ...m, consistency: opt as any }))}
                        className={"chip" + (migdas.consistency === opt ? " chip-active" : "")}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.15)",
                          background: migdas.consistency === opt ? "#3b82f6" : "transparent",
                          color: migdas.consistency === opt ? "#0b1220" : "inherit",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {opt === "unclear" ? "Unclear" : opt === "consistent" ? "Consistent with autism" : "Inconsistent with autism"}
                      </button>
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
                  <button onClick={() => setMIGDAS((m) => ({ ...m, notes: [...m.notes, ""] }))}>+ Add note</button>
                </div>
              </Card>
            </>
          )}

          {activeTab === 1 && (
            <Card
              title="ABAS-3 — Domain Entries"
              right={<button className="small" onClick={() => setCollapsed((s) => ({ ...s, abas: !s.abas }))}>{collapsed.abas ? "Show" : "Hide"}</button>}
            >
              {!collapsed.abas && AbasDomainGrid}
              <p className="small">ABAS-3 domain bands influence the <b>impairment</b> feature and support estimate.</p>
            </Card>
          )}

          {activeTab === 2 && (
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
                    value={(observation as any).notes}
                    onChange={(e) => setObservation((s) => ({ ...s, notes: e.target.value }))}
                    style={{ height: 80 }}
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 3 && (
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
          )}

          {activeTab === 4 && (
            <>
              <Card title="WISC — Domain Entries" right={<button className="small" onClick={() => setCollapsed((s) => ({ ...s, wisc: !s.wisc }))}>{collapsed.wisc ? "Show" : "Hide"}</button>}>
                {!collapsed.wisc && WiscDomainGrid}
                <p className="small">WISC entries are for context and differential formulation; by default they do not alter ASD likelihood.</p>
              </Card>

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

              <Card title="Explainability — Evidence Contributions">
                <div className="grid">
                  {model.terms
                    .sort((a, b) => Math.abs(b.product) - Math.abs(a.product))
                    .slice(0, 5)
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

              <Card title="Settings & Minimum Dataset">
                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <section className="card">
                    <h3 className="section-title">Minimum Dataset</h3>
                    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <label className="row"><input type="checkbox" checked={config.minDataset.requireASDInstrument} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireASDInstrument: e.target.checked } }))} /> Require ≥1 ASD instrument</label>
                      <label className="row"><input type="checkbox" checked={config.minDataset.requireAdaptive} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireAdaptive: e.target.checked } }))} /> Require adaptive measure</label>
                      <label className="row"><input type="checkbox" checked={config.minDataset.requireHistory} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireHistory: e.target.checked } }))} /> Require history</label>
                      <label className="row"><input type="checkbox" checked={config.minDataset.requireObservation} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, requireObservation: e.target.checked } }))} /> Require observation</label>
                      <Field label="Min instruments"><input type="number" min={0} value={config.minDataset.minInstruments} onChange={(e) => setConfig((c) => ({ ...c, minDataset: { ...c.minDataset, minInstruments: Number(e.target.value) } }))} /></Field>
                    </div>
                    <div className="small" style={{ marginTop: 8 }}>
                      Status: {datasetStatus.passes ? <span className="badge ok">Meets minimum</span> : <span className="badge warn">Does not meet minimum</span>}
                    </div>
                  </section>

                  <section className="card">
                    <h3 className="section-title">Audit JSON</h3>
                    <pre style={{ whiteSpace: "pre-wrap", height: 220, overflow: "auto", padding: 8 }}>{JSON.stringify({ clinician, srs2, wisc, abas, migdas, instruments, history, observation, diff, evidence, model: { p: model.p, lp: model.lp, cut: model.cut }, config, timestamp: new Date().toISOString() }, null, 2)}</pre>
                  </section>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Right: sticky summary */}
        <aside style={{ width: 340, position: "sticky", top: 64 }}>
          <Card title="Summary">
            <div className="row" style={{ alignItems: "flex-end", gap: 24 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{(model.p * 100).toFixed(1)}%</div>
                <div className="small">Overall ASD likelihood</div>
                <div className="small">Cutpoint: {(model.cut * 100).toFixed(0)}% ({config.riskTolerance})</div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="row" style={{ justifyContent: "space-between" }}><span className="small">Criterion A</span><span className="small">{(model.pA * 100).toFixed(0)}%</span></div>
              <div className="meter"><span style={{ width: `${Math.round(model.pA * 100)}%` }} /></div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}><span className="small">Criterion B</span><span className="small">{(model.pB * 100).toFixed(0)}%</span></div>
              <div className="meter"><span style={{ width: `${Math.round(model.pB * 100)}%` }} /></div>
            </div>
            <div style={{ marginTop: 12 }}>
              Decision: {model.p >= model.cut ? <span className="badge ok">Above threshold — proceed</span> : <span className="badge warn">Below threshold — consider more data</span>}
            </div>
            <div className="card" style={{ textAlign: "center", marginTop: 12 }}>{supportEstimate}</div>
            <button style={{ width: "100%", marginTop: 12 }} onClick={() => window.print()}>Export summary</button>
          </Card>

          <Card title="Clinician & Governance">
            <Field label="Clinician">
              <input value={clinician.name} onChange={(e) => setClinician((s) => ({ ...s, name: e.target.value }))} placeholder="Dr Jane Citizen" />
            </Field>
            <Field label="Date">
              <input type="date" value={clinician.date} onChange={(e) => setClinician((s) => ({ ...s, date: e.target.value }))} />
            </Field>
            <label className="row"><input type="checkbox" checked={clinician.attested} onChange={(e) => setClinician((s) => ({ ...s, attested: e.target.checked }))} /> I attest that clinical judgement prevails.</label>
            <Field label="Report Voice">
              <select value={reportVoice} onChange={(e) => setReportVoice(e.target.value as any)}>
                <option value="clinical">Clinical only</option>
                <option value="dual">Clinical + Family summary</option>
              </select>
            </Field>
            <Field label="Risk Tolerance">
              <select value={config.riskTolerance} onChange={(e) => setConfig((c) => ({ ...c, riskTolerance: e.target.value as any }))}>
                <option value="sensitive">Sensitive</option>
                <option value="balanced">Balanced</option>
                <option value="specific">Specific</option>
              </select>
            </Field>
            <Field label="Prior (log-odds)"><input type="number" step={0.1} value={config.prior} onChange={(e) => setConfig((c) => ({ ...c, prior: Number(e.target.value) }))} /></Field>
          </Card>
        </aside>
      </div>

      {/* Report preview (print-friendly) */}
      <Card title="Structured Report (preview)"><pre style={{ whiteSpace: "pre-wrap", padding: 12 }}>{reportMarkdown}</pre></Card>

      <footer style={{ margin: "40px 0", textAlign: "center" }} className="small">
        © {new Date().getFullYear()} ASD Decision Support MVP — Demonstration only.
      </footer>

      <style>{`@media print { body { background: white; } .no-print { display: none; } }`}</style>
    </div>
  );
}

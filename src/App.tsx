import React, { useMemo, useState, useEffect } from "react";
import { DEFAULT_CONFIG, PRIOR_BY_AGE, DEFAULT_AGE_BAND, type AgeBandKey } from "./config/modelConfig";
import { VINELAND_BANDS } from "./config/modelConfig";
import { useAsdEngine } from "./hooks/useAsdEngine";
import { CANONICAL_CASES, MIGDAS_CONSISTENCY } from "./data/testData";
import type { Config, SeverityState, CriterionKey } from "./types";
import { Card, Field, TabBar, ChipGroup, Header, Footer } from "./components/ui";

const initSeverityState = (domains: { key: string }[]): SeverityState =>
  Object.fromEntries(domains.map((d) => [d.key, { score: undefined, severity: "" }])) as SeverityState;

const setInstrumentBand = (name: string, band: string) =>
  setInstruments(arr => arr.map(x => x.name === name ? { ...x, band } : x));
const getInstrumentBand = (name: string) =>
  instruments.find(x => x.name === name)?.band || "";

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState(0);
  const TABS = ["ASD Measures", "Adaptive", "History", "Comorbidity", "Advanced", "Report"];
  const [devOpen, setDevOpen] = useState(false);

  const reportText = useMemo(() => {
  const lines: string[] = [];
  const lik = model.p >= 0.70 ? "High likelihood" : model.p >= model.cut ? "Moderate likelihood" : "Low likelihood";
  const cons = migdas.consistency === "inconsistent" ? "Inconsistent with autism"
              : (model.p >= model.cut ? "Consistent with autism" : "Not currently consistent with autism");

  lines.push("ASD Decision Support — Summary Report");
  lines.push("");
  lines.push(`Overall: ${lik} • ${cons}`);
  lines.push(`Provisional support needs: ${supportEstimate}`);
  lines.push("");

  lines.push("SRS-2 (labels):");
  config.srs2Domains.forEach(d => { const s = srs2[d.key]?.severity; if (s) lines.push(`- ${d.label}: ${s}`); });

  const vin = getInstrumentBand("Vineland-3"); if (vin) { lines.push(""); lines.push(`Vineland-3 composite: ${vin}`); }
  lines.push(""); lines.push("MIGDAS: " + (migdas.consistency === "unclear" ? "Unclear" :
                             migdas.consistency === "consistent" ? "Consistent with autism" : "Inconsistent with autism"));
  const notes = migdas.notes.filter(n => n.trim()); notes.forEach((n,i)=>lines.push(`- Note ${i+1}: ${n.trim()}`));

  lines.push(""); lines.push("Recommendations:");
  recommendation.slice(0,6).forEach(r => lines.push("- " + r));

  lines.push(""); lines.push("Governance: Decision support only; clinician judgement prevails.");
  return lines.join("\n");
}, [model, migdas, supportEstimate, config.srs2Domains, srs2, recommendation]);

  const [instruments, setInstruments] = useState(
    DEFAULT_CONFIG.defaultInstruments.map((i) => ({ name: i.name, value: undefined as number | undefined, band: "" }))
  );
  const [srs2, setSRS2] = useState<SeverityState>(() => initSeverityState(config.srs2Domains));
  const [wisc, setWISC] = useState<SeverityState>(() => initSeverityState(config.wiscDomains));
  const [abas, setABAS] = useState<SeverityState>(() => initSeverityState(config.abasDomains));
  const [collapsed, setCollapsed] = useState<{ [k: string]: boolean }>({ srs2: false, wisc: true, abas: false });

  const [migdas, setMIGDAS] = useState({ consistency: (MIGDAS_CONSISTENCY[0] as (typeof MIGDAS_CONSISTENCY)[number]) || "unclear", notes: [""] as string[] });
  const [history, setHistory] = useState({ developmentalConcerns: "", earlyOnset: false, crossContextImpairment: false, maskingIndicators: false });
  const [observation, setObservation] = useState({ A1: 0, A2: 0, A3: 0, B1: 0, B2: 0, B3: 0, B4: 0, notes: "" });
  const [diff, setDiff] = useState({ ADHD: false, DLD: false, ID: false, Anxiety: false, Depression: false, TraumaPTSD: false, FASD: false, Tics: false, Other: "" });
  const [clinician, setClinician] = useState({ name: "", date: new Date().toISOString().slice(0, 10), attested: false });
  const [reportVoice, setReportVoice] = useState<"clinical" | "dual">("dual");

  const [ageBand, setAgeBand] = useState<AgeBandKey>(DEFAULT_AGE_BAND);
  const [autoPrior, setAutoPrior] = useState(true);

  const [compact, setCompact] = useState(true);
  useEffect(() => {
    document.body.classList.toggle("compact", compact);
  }, [compact]);

  // When auto mode is on, age-band changes update the model prior (log-odds)
  useEffect(() => {
    if (autoPrior) {
      setConfig(c => ({ ...c, prior: PRIOR_BY_AGE[ageBand].logit }));
    }
  }, [ageBand, autoPrior, setConfig]);

  const ruleHash = useMemo(() => {
  const s = JSON.stringify(DEFAULT_CONFIG);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
  }, []);

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));
 
  useEffect(() => {
      document.body.setAttribute("data-theme", theme);
  }, [theme]);
  
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

  // ---------- categorical wording (no % in summary export) ----------
  const likelihoodBand = useMemo(() => {
    if (model.p >= 0.70) return "High likelihood";
    if (model.p >= model.cut) return "Moderate likelihood";
    return "Low likelihood";
  }, [model]);

  const consistencyBand = useMemo(() => {
    if (migdas.consistency === "inconsistent") return "Inconsistent with autism";
    return model.p >= model.cut ? "Consistent with autism" : "Not currently consistent with autism";
  }, [model, migdas]);

  // ---------- dataset ribbon ----------
  const ribbon = useMemo(() => {
    const need: string[] = [];
    const r = config.minDataset;
    const c = datasetStatus.counts;
    if (r.requireASDInstrument && !c.hasASDInstrument) need.push("≥1 ASD instrument");
    if (r.requireAdaptive && !c.hasAdaptive) need.push("adaptive measure");
    if (r.requireHistory && !c.historyOk) need.push("history");
    if (r.requireObservation && !c.observationOk) need.push("observation");
    if (c.effectiveInstrumentCount < r.minInstruments) need.push(`min instruments ${r.minInstruments}`);
    return datasetStatus.passes ? "All requirements met" : `${c.effectiveInstrumentCount}/${r.minInstruments} met — need: ${need.join(", ") || "—"}`;
  }, [datasetStatus, config.minDataset]);

  // ---------- summary-only export ----------
  const exportSummary = () => {
    document.body.classList.add("print-summary");
    setTimeout(() => {
      window.print();
      setTimeout(() => document.body.classList.remove("print-summary"), 0);
    }, 0);
  };

  // ---------- fixture loader ----------
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

  // ---------- tab content helpers (chips only) ----------
  const SrsDomainGrid = (
    <div className="grid">
      {config.srs2Domains.map((d) => (
        <section key={d.key} className="card">
          <div className="stack">
            <div className="title" style={{ fontSize: 14 }}>{d.label}</div>
            <ChipGroup options={d.severities} value={srs2[d.key]?.severity || ""} onChange={(val) => setSRS2((s) => ({ ...s, [d.key]: { ...s[d.key], severity: val } }))} />
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
            <ChipGroup options={d.severities} value={abas[d.key]?.severity || ""} onChange={(val) => setABAS((s) => ({ ...s, [d.key]: { ...s[d.key], severity: val } }))} />
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
            <ChipGroup options={d.severities} value={wisc[d.key]?.severity || ""} onChange={(val) => setWISC((s) => ({ ...s, [d.key]: { ...s[d.key], severity: val } }))} />
          </div>
        </section>
      ))}
    </div>
  );

  // -------------- Render --------------
  return (
    <div className="app-shell">
      <Header
        title="ASD Decision Support — MVP"
        subtitle="DSM-5-TR aligned • tabs build"
        onDevToggle={() => setDevOpen(v => !v)}
        onExportSummary={exportSummary}
        onExportFull={() => window.print()}
        onThemeToggle={toggleTheme}
        theme={theme}
        />
 
      <div className="row no-print" style={{ justifyContent: "flex-end", gap: 8, margin: "6px 0 4px" }}>
      <label className="row small">
        <input
          type="checkbox"
          checked={compact}
          onChange={e => setCompact(e.target.checked)}
        />
        Compact mode
      </label>
      </div>

      <div className="card" style={{ margin: "12px 0", padding: 12, borderLeft: datasetStatus.passes ? "4px solid #10b981" : "4px solid #f59e0b" }}>
        <span className="small"><b>Minimum dataset:</b> {ribbon}</span>
      </div>

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

      <TabBar tabs={[...TABS]} active={activeTab} onSelect={setActiveTab} />

      <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === 0 && (
            <>
              <Card title="SRS-2 — Domain Entries" right={<button className="small" onClick={() => setCollapsed((s) => ({ ...s, srs2: !s.srs2 }))}>{collapsed.srs2 ? "Show" : "Hide"}</button>}>
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
                        style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: migdas.consistency === opt ? "#3b82f6" : "transparent", color: migdas.consistency === opt ? "#0b1220" : "inherit", fontSize: 12, fontWeight: 600 }}
                      >
                        {opt === "unclear" ? "Unclear" : opt === "consistent" ? "Consistent with autism" : "Inconsistent with autism"}
                      </button>
                    ))}
                  </div>
                </Field>
                <div className="stack">
                  {migdas.notes.map((n, i) => (
                    <input key={i} placeholder={`Brief observation note ${i + 1}`} value={n} onChange={(e) => setMIGDAS((m) => ({ ...m, notes: m.notes.map((x, j) => (j === i ? e.target.value : x)) }))} />
                  ))}
                  <button onClick={() => setMIGDAS((m) => ({ ...m, notes: [...m.notes, ""] }))}>+ Add note</button>
                </div>
              </Card>
            </>
          )}

          {activeTab === 1 && (
  <>
    <Card
      title="ABAS-3 — Domain Entries"
      right={
        <button
          className="small"
          onClick={() => setCollapsed((s) => ({ ...s, abas: !s.abas }))}
        >
          {collapsed.abas ? "Show" : "Hide"}
        </button>
      }
    >
      {!collapsed.abas && AbasDomainGrid}
      <p className="small">
        ABAS-3 domain bands influence the <b>impairment</b> feature and support estimate.
      </p>
    </Card>

    <Card title="Vineland-3 — Composite Band">
      <ChipGroup
        options={[...VINELAND_BANDS]}
        value={getInstrumentBand("Vineland-3")}
        onChange={(val) => setInstrumentBand("Vineland-3", val)}
      />
      <div className="small">Band contributes to impairment (same direction as ABAS).</div>
    </Card>
  </>
)}

          {activeTab === 2 && (
            <Card title="Developmental History & Clinician Observation">
              <div className="grid">
                <div className="stack">
                  <label>Developmental History</label>
                  <textarea placeholder="Summarise early development, social communication history, restricted/repetitive patterns." value={history.developmentalConcerns} onChange={(e) => setHistory((s) => ({ ...s, developmentalConcerns: e.target.value }))} style={{ height: 120 }} />
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
                  <textarea placeholder="Objective notes (setting, salient behaviours)." value={(observation as any).notes} onChange={(e) => setObservation((s) => ({ ...s, notes: e.target.value }))} style={{ height: 80 }} />
                </div>
              </div>
            </Card>
      )}

      {activeTab === 5 && (
  <Card title="Report (preview)">
    <pre id="report-section" style={{ whiteSpace: "pre-wrap", padding: 12 }}>{reportText}</pre>
    <div className="row" style={{ gap: 8 }}>
      <button onClick={() => navigator.clipboard.writeText(reportText)}>Copy</button>
      <button onClick={() => {
        document.body.classList.add("print-summary");
        const el = document.getElementById("report-section");
        if (el) el.classList.add("print-target");
        setTimeout(() => { window.print(); setTimeout(() => {
          document.body.classList.remove("print-summary");
          el && el.classList.remove("print-target");
        }, 0); }, 0);
      }}>Print report</button>
    </div>
  </Card>
)}

          {activeTab === 3 && (
            <Card title="Comorbidity / Differential Flags">
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                {([["ADHD", "ADHD"],["DLD", "Language Disorder (DLD)"],["ID", "Intellectual Disability"],["Anxiety", "Anxiety"],["Depression", "Depression"],["TraumaPTSD", "Trauma/PTSD"],["FASD", "FASD"],["Tics", "Tic Disorder"]] as const).map(([key, label]) => (
                  <label key={key} className="row"><input type="checkbox" checked={(diff as any)[key]} onChange={(e) => setDiff((s) => ({ ...s, [key]: e.target.checked }))} /> {label}</label>
                ))}
              </div>
              <Field label="Other differential notes"><input value={diff.Other} onChange={(e) => setDiff((s) => ({ ...s, Other: e.target.value }))} /></Field>
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
                          <Field label="Score"><input type="number" value={inst.value ?? ""} onChange={(e) => { const val = e.target.value === "" ? undefined : Number(e.target.value); setInstruments((arr) => arr.map((x, i) => (i === idx ? { ...x, value: val } : x))); }} /></Field>
                          <Field label="Band (optional)"><input placeholder="e.g., Mild / Moderate / Severe" value={(inst as any).band || ""} onChange={(e) => setInstruments((arr) => arr.map((x, i) => (i === idx ? { ...x, band: (e.target as HTMLInputElement).value } : x)))} /></Field>
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
              </Card>

              <Card title="Explainability — Evidence Contributions">
                <div className="grid">
                  {model.terms.sort((a, b) => Math.abs(b.product) - Math.abs(a.product)).slice(0, 5).map((t, i) => (
                    <section key={i} className="card">
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>{String(t.key)}</span>
                        <span>{t.product.toFixed(2)}</span>
                      </div>
                      <div className="meter" style={{ marginTop: 8 }}><span style={{ width: `${Math.min(100, Math.abs(t.product) * 20)}%`, background: t.product >= 0 ? "linear-gradient(90deg,#34d399,#60a5fa)" : "#f43f5e" }} /></div>
                      <div className="small" style={{ marginTop: 4 }}>value {t.value.toFixed(2)} × weight {t.weight.toFixed(2)}</div>
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
                    <div className="small" style={{ marginTop: 8 }}>Status: {datasetStatus.passes ? <span className="badge ok">Meets minimum</span> : <span className="badge warn">Does not meet minimum</span>}</div>
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

        {/* Sticky Summary */}
        <aside id="summary-section" className="summary-only" style={{ width: 340, position: "sticky", top: 64 }}>
          <Card title="Summary">
            {/* Screen-only numeric view */}
            <div className="screen-only">
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
            </div>

            {/* Print-only categorical summary */}
            <div className="print-only" style={{ display: "none" }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Summary</div>
              <div><b>Likelihood:</b> {likelihoodBand}</div>
              <div><b>Overall pattern:</b> {consistencyBand}</div>
              <div style={{ marginTop: 8 }}><b>Provisional support needs:</b> {supportEstimate}</div>
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {recommendation.slice(0, 5).map((r, i) => (
                  <li key={i} style={{ fontSize: 13 }}>{r}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: 12 }}>
              Decision: {model.p >= model.cut ? <span className="badge ok">Above threshold — proceed</span> : <span className="badge warn">Below threshold — consider more data</span>}
            </div>
            <div className="card" style={{ textAlign: "center", marginTop: 12 }}>{supportEstimate}</div>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <button style={{ flex: 1 }} onClick={exportSummary}>Export summary</button>
              <button style={{ flex: 1 }} onClick={() => window.print()}>Export full</button>
            </div>
          </Card>

          <Card title="Clinician & Governance">
            <Field label="Age band (sets baseline)">
              <select
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value as AgeBandKey)}
                disabled={!autoPrior}
                >
                {Object.entries(PRIOR_BY_AGE).map(([key, v]) => (
                  <option key={key} value={key}>{v.label}</option>
                ))}
              </select>
            </Field>

            <label className="row" title="When ON, the prior is set from Age band. Turn OFF to input a custom prior.">
              <input type="checkbox" checked={autoPrior} onChange={(e) => setAutoPrior(e.target.checked)} />
              Auto-set prior from Age band
            </label>

            <div className="small" style={{ opacity: 0.9 }}>
              Baseline prevalence: {(PRIOR_BY_AGE[ageBand].prevalence * 100).toFixed(1)}% • Log-odds: {PRIOR_BY_AGE[ageBand].logit.toFixed(3)}
            </div>

            <Field label="Clinician"><input value={clinician.name} onChange={(e) => setClinician((s) => ({ ...s, name: e.target.value }))} placeholder="Dr Jane Citizen" /></Field>
            <Field label="Date"><input type="date" value={clinician.date} onChange={(e) => setClinician((s) => ({ ...s, date: e.target.value }))} /></Field>
            <label className="row"><input type="checkbox" checked={clinician.attested} onChange={(e) => setClinician((s) => ({ ...s, attested: e.target.checked }))} /> I attest that clinical judgement prevails.</label>
            <Field label="Report Voice"><select value={reportVoice} onChange={(e) => setReportVoice(e.target.value as any)}><option value="clinical">Clinical only</option><option value="dual">Clinical + Family summary</option></select></Field>
            <Field label="Risk Tolerance"><select value={config.riskTolerance} onChange={(e) => setConfig((c) => ({ ...c, riskTolerance: e.target.value as any }))}><option value="sensitive">Sensitive</option><option value="balanced">Balanced</option><option value="specific">Specific</option></select></Field>
            <Field label="Prior (log-odds)"> 
              <input
                type="number"
                step={0.1}
                value={config.prior}
                onChange={(e) => {
                  setAutoPrior(false);
                  setConfig((c) => ({ ...c, prior: Number(e.target.value) }));
                }}
                />
            </Field>
          </Card>
        </aside>
      </div>

      <Footer version="v0.6" ruleHash={ruleHash} />

      {/* print-only CSS for summary export */}
      <style>{`
        @media print {
          body.print-summary * { visibility: hidden !important; }
          body.print-summary #summary-section, body.print-summary #summary-section * { visibility: visible !important; }
          body.print-summary #summary-section { position: absolute; left: 0; top: 0; width: 100%; }
          body.print-summary .screen-only { display: none !important; }
          body.print-summary .print-only { display: block !important; }
        }
      `}</style>
    </div>
  );
}

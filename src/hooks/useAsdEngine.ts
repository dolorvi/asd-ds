// src/hooks/useAsdEngine.ts
import { useMemo } from "react";
import type { Config, CriterionKey, AltKey, SeverityState } from "../types";
import { VINELAND_IMPAIRMENT_MAP } from "../config/modelConfig"; // make sure this is exported

export function useAsdEngine(
  config: Config,
  srs2: SeverityState,
  srs2Teacher: SeverityState,
  abas: SeverityState,
  abasTeacher: SeverityState,
  wisc: SeverityState, // kept for parity, not used in model by default
  migdas: { consistency: string; notes: string[] },
  history: {
    developmentalConcerns: string;
    earlyOnset: boolean;
    crossContextImpairment: boolean;
    maskingIndicators: boolean;
  },
  observation: Record<CriterionKey | "notes", any>,
  diff: Record<string, boolean | unknown>,
  // allow label-only instruments (e.g., ADI-R band, Vineland composite band)
  instruments: Array<{ name: string; value?: number; band?: string }>
) {
  /** ---------------- Minimum dataset gate ---------------- */
  const datasetStatus = useMemo(() => {
    // Instrument present if it has a score OR a non-empty band label
    let withValues = instruments.filter(
      (i) => i.value !== undefined || (i.band && i.band.trim() !== "")
    );

    const srsEntered =
      Object.values(srs2).some((d) => !!d.severity) ||
      Object.values(srs2Teacher).some((d) => !!d.severity);
    const abasEntered =
      Object.values(abas).some((d) => !!d.severity) ||
      Object.values(abasTeacher).some((d) => !!d.severity);
    const migEntered = migdas.consistency !== "unclear";

    if (srsEntered) withValues = withValues.filter((i) => i.name !== "ASRS");
    if (abasEntered) withValues = withValues.filter((i) => i.name !== "Vineland-3");

    const effectiveInstrumentCount =
      withValues.length + (srsEntered ? 1 : 0) + (abasEntered ? 1 : 0) + (migEntered ? 1 : 0);

    // Adaptive satisfied by ABAS domains OR a Vineland score/band
    const vinelandBandEntered = withValues.some(
      (i) => i.name === "Vineland-3" && i.band && i.band.trim() !== ""
    );
    const hasAdaptive =
      abasEntered ||
      vinelandBandEntered ||
      withValues.some((i) => ["Vineland-3", "ABAS-3"].includes(i.name));

    // ASD instrument satisfied by SRS-2/MIGDAS domains or common ASD tools (label-only OK)
    const hasASDInst =
      srsEntered ||
      migEntered ||
      withValues.some((i) =>
        ["SRS-2", "ADOS-2", "MIGDAS-2", "GARS", "ADI-R", "ASRS"].includes(i.name)
      );

    const historyOk = history.developmentalConcerns.trim().length > 10 && history.earlyOnset;

    const obsOk = (["A1", "A2", "A3", "B1", "B2", "B3", "B4"] as const).every(
      (k) => observation[k] !== undefined
    );

    const r = config.minDataset;
    const passes =
      effectiveInstrumentCount >= r.minInstruments &&
      (!r.requireASDInstrument || hasASDInst) &&
      (!r.requireAdaptive || hasAdaptive) &&
      (!r.requireHistory || historyOk) &&
      (!r.requireObservation || obsOk);

    return {
      passes,
      counts: {
        instrumentsEntered: withValues.length,
        effectiveInstrumentCount,
        hasASDInstrument: hasASDInst,
        hasAdaptive,
        historyOk,
        observationOk: obsOk,
      },
    };
  }, [config.minDataset, instruments, srs2, srs2Teacher, abas, abasTeacher, migdas, history, observation]);

  /** ---------------- Evidence aggregation ---------------- */
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
      langDisorder: (diff as any).DLD ? 1 : 0,
      intellectualDisability: (diff as any).ID ? 1 : 0,
      altTrauma: (diff as any).TraumaPTSD ? 1 : 0,
      altADHD: (diff as any).ADHD ? 1 : 0,
      altAnxiety: (diff as any).Anxiety || (diff as any).Depression ? 1 : 0,
      altOther: (diff as any).FASD || (diff as any).Tics || !!(diff as any).Other ? 1 : 0,
    };

    // Clinician observation (0..3 each)
    (["A1", "A2", "A3", "B1", "B2", "B3", "B4"] as const).forEach((k) => {
      const v = Number(observation[k]);
      if (!Number.isNaN(v)) (ev as any)[k] += v;
    });

    // SRS-2 domain severities → evidence via config maps (label-only)
    const applySrs = (src: SeverityState) => {
      config.srs2Domains.forEach((d) => {
        const sev = src[d.key]?.severity || "";
        const map = d.mapBySeverity[sev];
        if (!map) return;
        Object.entries(map).forEach(([k, v]) => {
          (ev as any)[k] = ((ev as any)[k] ?? 0) + (v as number);
        });
      });
    };
    applySrs(srs2);
    applySrs(srs2Teacher);

    // ABAS-3 domain severities → impairment (label-only)
    const applyAbas = (src: SeverityState) => {
      config.abasDomains.forEach((d) => {
        const sev = src[d.key]?.severity || "";
        const map = d.mapBySeverity[sev];
        if (!map) return;
        Object.entries(map).forEach(([k, v]) => {
          (ev as any)[k] = ((ev as any)[k] ?? 0) + (v as number);
        });
      });
    };
    applyAbas(abas);
    applyAbas(abasTeacher);

    // Vineland-3 composite band → impairment delta (label-only) if no ABAS present
    const abasEntered =
      Object.values(abas).some((d) => !!d.severity) ||
      Object.values(abasTeacher).some((d) => !!d.severity);
    if (!abasEntered) {
      const vineland = instruments.find(
        (i) => i.name === "Vineland-3" && i.band && i.band.trim()
      );
      if (vineland?.band) {
        const delta = (VINELAND_IMPAIRMENT_MAP as any)[vineland.band];
        if (typeof delta === "number") ev.impairment += delta;
      }
    }

    // MIGDAS qualitative → balanced push/pull across social/rrb
    if (migdas.consistency === "consistent") {
      ev.A1 += 0.6;
      ev.A2 += 0.6;
      ev.A3 += 0.6;
      ev.B2 += 0.6;
      ev.B3 += 0.6;
    } else if (migdas.consistency === "inconsistent") {
      ev.A1 -= 0.4;
      ev.A2 -= 0.4;
      ev.A3 -= 0.4;
      ev.B2 -= 0.3;
      ev.B3 -= 0.3;
    }

    return ev;
  }, [config.srs2Domains, config.abasDomains, srs2, srs2Teacher, abas, abasTeacher, migdas, observation, history, diff, instruments]);

  /** ---------------- Likelihood model ---------------- */
  const model = useMemo(() => {
    const w = config.domainWeights;

    const terms = (Object.keys(w) as (keyof typeof w)[]).map((k) => {
      const value = (evidence as any)[k] ?? 0;
      const weight = w[k];
      return { key: k, value, weight, product: value * weight };
    });

    const lp = config.prior + terms.reduce((a, b) => a + b.product, 0);
    const p = 1 / (1 + Math.exp(-lp));

    const A = evidence.A1 + evidence.A2 + evidence.A3;
    const B = evidence.B1 + evidence.B2 + evidence.B3 + evidence.B4;
    const pA = Math.min(1, Math.max(0, A / (3 * 3)));
    const pB = Math.min(1, Math.max(0, B / (4 * 3)));

    const cut =
      config.riskTolerance === "sensitive" ? 0.35 :
      config.riskTolerance === "specific"  ? 0.70 :
      0.50;

    return { p, lp, pA, pB, cut, terms };
  }, [config, evidence]);

  /** ---------------- Support & recommendations ---------------- */
  const supportEstimate = useMemo(() => {
    const sevs = [...Object.values(abas), ...Object.values(abasTeacher)].map((d) => d.severity || "");
    if (sevs.some((s) => s === "Extremely Low" || s === "Very Low")) return "High support likely";
    if (sevs.some((s) => s === "Low Average" || s === "Average")) return "Moderate support possible";
    if (sevs.some((s) => s)) return "Lower support likely";
    return "Insufficient data";
  }, [abas, abasTeacher]);

  const recommendation = useMemo(() => {
    const recs: string[] = [];
    if (!datasetStatus.passes) {
      recs.push(
        "Collect minimum dataset: ≥2 instruments (incl. ≥1 ASD instrument), adaptive measure, developmental history, and clinician observation."
      );
      return recs;
    }
    if (model.p >= model.cut) {
      recs.push(
        "Proceed with full diagnostic formulation aligned to DSM-5-TR; integrate ADOS-2 (if appropriate), collateral reports, and medical/hearing screens."
      );
      if (supportEstimate.includes("High")) {
        recs.push("Initiate support planning; coordinate NDIS-relevant documentation where applicable.");
      }
    } else {
      recs.push(
        "Risk below decision threshold. If concern persists, add informant measures/observations across settings; review in 3–6 months."
      );
    }
    return recs;
  }, [datasetStatus, model, supportEstimate]);

  return { datasetStatus, evidence, model, supportEstimate, recommendation };
}

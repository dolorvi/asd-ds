// src/hooks/useAsdEngine.ts
import { useMemo } from "react";
import type { Config, CriterionKey, AltKey, SeverityState } from "../types";
import { VINELAND_IMPAIRMENT_MAP } from "../config/modelConfig"; // make sure this is exported

export function useAsdEngine(
  config: Config,
  srs2: SeverityState,
  srs2Teacher: SeverityState,
  asrs: SeverityState,
  asrsTeacher: SeverityState,
  abas: SeverityState,
  abasTeacher: SeverityState,
  wisc: SeverityState, // kept for parity, not used in model by default
  migdas: { consistency: string; notes: string[] },
  history: {
    developmentalConcerns: string;
    earlyOnset: boolean;
    earlySocial: boolean;
    earlyRRB: boolean;
    regression: boolean;
    crossContextImpairment: boolean;
    familyHistory: boolean;
    maskingIndicators: boolean;
    verbalFluency: string;
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
    const asrsEntered =
      Object.values(asrs).some((d) => !!d.severity) ||
      Object.values(asrsTeacher).some((d) => !!d.severity);
    const abasEntered =
      Object.values(abas).some((d) => !!d.severity) ||
      Object.values(abasTeacher).some((d) => !!d.severity);
    const migEntered = migdas.consistency !== "unclear";

    if (srsEntered || asrsEntered)
      withValues = withValues.filter((i) => i.name !== "ASRS");
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
      asrsEntered ||
      migEntered ||
      withValues.some((i) =>
        ["SRS-2", "ADOS-2", "MIGDAS-2", "ADI-R", "ASRS", "AQ"].includes(i.name)
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
  }, [config.minDataset, instruments, srs2, srs2Teacher, asrs, asrsTeacher, abas, abasTeacher, migdas, history, observation]);

  /** ---------------- Evidence aggregation ---------------- */
  const [evidence, sources] = useMemo(() => {
    const ev: Record<CriterionKey | AltKey, number> = {
      A1: 0,
      A2: 0,
      A3: 0,
      B1: 0,
      B2: 0,
      B3: 0,
      B4: 0,
      onsetEarly: 0,
      impairment: 0,
      masking: 0,
      langDisorder: 0,
      intellectualDisability: 0,
      altTrauma: 0,
      altADHD: 0,
      altAnxiety: 0,
      altOther: 0,
    };
    const src: Record<string, Record<CriterionKey | AltKey, number>> = {};
    const add = (s: string, k: keyof typeof ev, v: number) => {
      ev[k] += v;
      if (!src[s]) src[s] = {} as any;
      (src[s][k] as number | undefined) = (src[s][k] ?? 0) + v;
    };

    add("Early history", "onsetEarly", history.earlyOnset ? 1 : 0);
    add("Early history", "impairment", history.crossContextImpairment ? 1 : 0);
    add("Early history", "masking", history.maskingIndicators ? 1 : 0);
    add("Differentials", "langDisorder", (diff as any).languageDisorder ? 1 : 0);
    add("Differentials", "intellectualDisability", (diff as any).globalID ? 1 : 0);
    add("Differentials", "altTrauma", (diff as any).trauma ? 1 : 0);
    add("Differentials", "altADHD", (diff as any).adhdFeatures ? 1 : 0);
    add("Differentials", "altAnxiety", (diff as any).anxietyPrimary ? 1 : 0);
    add("Differentials", "altOther", (diff as any).ocdFeatures ? 1 : 0);

    add("Early history", "A1", history.earlySocial ? 0.6 : -0.2);
    add("Early history", "B2", history.earlyRRB ? 0.6 : -0.2);
    if (history.regression) {
      add("Early history", "A1", 0.3);
      add("Early history", "A3", 0.3);
    }
    if (history.familyHistory) add("Early history", "onsetEarly", 0.2);

    (["A1", "A2", "A3", "B1", "B2", "B3", "B4"] as const).forEach((k) => {
      const v = Number(observation[k]);
      if (!Number.isNaN(v)) add("Observation", k, v);
    });

    const applySrs = (srcData: SeverityState) => {
      config.srs2Domains.forEach((d) => {
        const sev = srcData[d.key]?.severity || "";
        const map = d.mapBySeverity[sev];
        if (!map) return;
        Object.entries(map).forEach(([k, v]) => add("SRS-2", k as any, v as number));
      });
    };
    applySrs(srs2);
    applySrs(srs2Teacher);

    const applyAsrs = (srcData: SeverityState) => {
      config.asrsDomains.forEach((d) => {
        const sev = srcData[d.key]?.severity || "";
        const map = d.mapBySeverity[sev];
        if (!map) return;
        Object.entries(map).forEach(([k, v]) => add("ASRS", k as any, v as number));
      });
    };
    applyAsrs(asrs);
    applyAsrs(asrsTeacher);

    const applyAbas = (srcData: SeverityState) => {
      config.abasDomains.forEach((d) => {
        const sev = srcData[d.key]?.severity || "";
        const map = d.mapBySeverity[sev];
        if (!map) return;
        Object.entries(map).forEach(([k, v]) => add("ABAS-3", k as any, v as number));
      });
    };
    applyAbas(abas);
    applyAbas(abasTeacher);

    const abasEntered =
      Object.values(abas).some((d) => !!d.severity) ||
      Object.values(abasTeacher).some((d) => !!d.severity);
    if (!abasEntered) {
      const vineland = instruments.find(
        (i) => i.name === "Vineland-3" && i.band && i.band.trim()
      );
      if (vineland?.band) {
        const delta = (VINELAND_IMPAIRMENT_MAP as any)[vineland.band];
        if (typeof delta === "number") add("Vineland-3", "impairment", delta);
      }
    }

    if (migdas.consistency === "consistent") {
      add("MIGDAS-2", "A1", 0.6);
      add("MIGDAS-2", "A2", 0.6);
      add("MIGDAS-2", "A3", 0.6);
      add("MIGDAS-2", "B2", 0.6);
      add("MIGDAS-2", "B3", 0.6);
    } else if (migdas.consistency === "inconsistent") {
      add("MIGDAS-2", "A1", -0.4);
      add("MIGDAS-2", "A2", -0.4);
      add("MIGDAS-2", "A3", -0.4);
      add("MIGDAS-2", "B2", -0.3);
      add("MIGDAS-2", "B3", -0.3);
    }

    return [ev, src] as const;
  }, [config.srs2Domains, config.asrsDomains, config.abasDomains, srs2, srs2Teacher, asrs, asrsTeacher, abas, abasTeacher, migdas, observation, history, diff, instruments]);

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

    const cut = config.certaintyThreshold;

    const drivers = Object.entries(sources).map(([name, contrib]) => {
      const prod = Object.entries(contrib).reduce(
        (sum, [k, v]) => sum + v * (w as any)[k],
        0
      );
      const lpWithout = lp - prod;
      const pWithout = 1 / (1 + Math.exp(-lpWithout));
      return { name, delta: (p - pWithout) * 100 };
    }).sort((a,b) => b.delta - a.delta);

    return { p, lp, pA, pB, cut, terms, drivers };
  }, [config, evidence, sources]);

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

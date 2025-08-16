import React from "react";
import { Card } from "../components/primitives";
import { VERBAL_FLUENCY_OPTIONS } from "../data/autismProfile";

export function HistoryPanel({
  history,
  setHistory,
  observation,
  setObservation,
}: {
  history: any;
  setHistory: (fn: (h: any) => any) => void;
  observation: Record<string, any>;
  setObservation: (fn: (o: any) => any) => void;
}) {
  const updateHistory = (k: string, v: any) =>
    setHistory((h: any) => {
      const next = { ...h, [k]: v };
      next.regression = !!(
        next.regressionLanguage || next.regressionSocial || next.regressionMotor
      );
      next.earlySocial = !!(
        next.jointAttention ||
        next.gestureDelay ||
        next.socialReciprocity ||
        next.atypicalEyeGaze ||
        next.pragmaticLanguage
      );
      next.earlyRRB = !!(
        next.stereotypedMovements ||
        next.insistenceSameness ||
        next.restrictedInterests ||
        next.sensoryAuditory ||
        next.sensoryTactile ||
        next.sensoryVisual ||
        next.sensoryProprio ||
        next.sensoryTaste
      );
      next.crossContextImpairment = !!(
        next.presentHome || next.presentSchool || next.presentPeers
      );
      return next;
    });
  const updateFamily = (k: string, v: boolean) =>
    setHistory((h: any) => {
      const next = { ...h, [k]: v };
      next.familyHistory = !!(
        next.familyASD || next.familyADHD || next.familyID || next.familyPsych
      );
      return next;
    });
  const updateObservation = (k: string, v: any) =>
    setObservation((o: any) => ({ ...o, [k]: v }));

  return (
    <div className="stack stack--lg">
      <Card title="History Quick Checklist (v2)">
        <div className="stack stack--lg">
          <section>
            <div className="card-subtitle">A. Onset & Course</div>
            <div className="stack stack--sm">
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.earlyOnset}
                  onChange={(e) => updateHistory("earlyOnset", e.target.checked)}
                />
                <span>
                  First concerns before age 3 (enter age
                  <input
                    type="number"
                    value={history.firstConcernsAge || ""}
                    onChange={(e) => updateHistory("firstConcernsAge", e.target.value)}
                    style={{ width: "4rem", marginLeft: "4px" }}
                  />)
                </span>
              </label>
              <div className="stack stack--xs" style={{ marginLeft: "1.5em" }}>
                <span>Regression (tick domains):</span>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.regressionLanguage || false}
                    onChange={(e) => updateHistory("regressionLanguage", e.target.checked)}
                  />
                  language
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.regressionSocial || false}
                    onChange={(e) => updateHistory("regressionSocial", e.target.checked)}
                  />
                  social
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.regressionMotor || false}
                    onChange={(e) => updateHistory("regressionMotor", e.target.checked)}
                  />
                  motor
                </label>
              </div>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.persistentSymptoms || false}
                  onChange={(e) => updateHistory("persistentSymptoms", e.target.checked)}
                />
                Persistent symptoms ≥12 months
              </label>
            </div>
          </section>

          <section>
            <div className="card-subtitle">B. Cross-Setting & Informants</div>
            <div className="stack stack--sm">
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.presentHome || false}
                  onChange={(e) => updateHistory("presentHome", e.target.checked)}
                />
                Present at home
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.presentSchool || false}
                  onChange={(e) => updateHistory("presentSchool", e.target.checked)}
                />
                Present at childcare/school
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.presentPeers || false}
                  onChange={(e) => updateHistory("presentPeers", e.target.checked)}
                />
                Present with peers/community
              </label>
              <div className="stack stack--xs" style={{ marginLeft: "1.5em" }}>
                <span>Multi-informant agreement:</span>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.informantParent || false}
                    onChange={(e) => updateHistory("informantParent", e.target.checked)}
                  />
                  parent
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.informantTeacher || false}
                    onChange={(e) => updateHistory("informantTeacher", e.target.checked)}
                  />
                  teacher
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.informantSelf || false}
                    onChange={(e) => updateHistory("informantSelf", e.target.checked)}
                  />
                  self
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.informantClinician || false}
                    onChange={(e) => updateHistory("informantClinician", e.target.checked)}
                  />
                  clinician
                </label>
              </div>
              <div className="row row--center">
                Evidence quality:
                {["none", "low", "moderate", "high"].map((lvl) => (
                  <label key={lvl} style={{ marginLeft: "0.5em" }}>
                    <input
                      type="radio"
                      name="evidenceQuality"
                      value={lvl}
                      checked={history.evidenceQuality === lvl}
                      onChange={(e) => updateHistory("evidenceQuality", e.target.value)}
                    />
                    {lvl}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="card-subtitle">C. Early Social-Communication (18–36 months)</div>
            <div className="stack stack--sm">
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.jointAttention || false}
                  onChange={(e) => updateHistory("jointAttention", e.target.checked)}
                />
                Limited joint attention (show/point/share)
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.gestureDelay || false}
                  onChange={(e) => updateHistory("gestureDelay", e.target.checked)}
                />
                Delays in gesture or pretend play
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.socialReciprocity || false}
                  onChange={(e) => updateHistory("socialReciprocity", e.target.checked)}
                />
                Reduced social reciprocity (back-and-forth)
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.atypicalEyeGaze || false}
                  onChange={(e) => updateHistory("atypicalEyeGaze", e.target.checked)}
                />
                Atypical eye-gaze / facial expression
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.pragmaticLanguage || false}
                  onChange={(e) => updateHistory("pragmaticLanguage", e.target.checked)}
                />
                Pragmatic language concerns
              </label>
            </div>
          </section>

          <section>
            <div className="card-subtitle">D. RRB / Sensory / Interests</div>
            <div className="stack stack--sm">
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.stereotypedMovements || false}
                  onChange={(e) => updateHistory("stereotypedMovements", e.target.checked)}
                />
                Stereotyped movements or speech (echolalia, scripting)
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.insistenceSameness || false}
                  onChange={(e) => updateHistory("insistenceSameness", e.target.checked)}
                />
                Insistence on sameness / rituals / distress with change
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.restrictedInterests || false}
                  onChange={(e) => updateHistory("restrictedInterests", e.target.checked)}
                />
                Highly restricted, intense interests
              </label>
              <div className="stack stack--xs" style={{ marginLeft: "1.5em" }}>
                <span>Sensory hyper/hypo/seeking (modalities):</span>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.sensoryAuditory || false}
                    onChange={(e) => updateHistory("sensoryAuditory", e.target.checked)}
                  />
                  auditory
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.sensoryTactile || false}
                    onChange={(e) => updateHistory("sensoryTactile", e.target.checked)}
                  />
                  tactile
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.sensoryVisual || false}
                    onChange={(e) => updateHistory("sensoryVisual", e.target.checked)}
                  />
                  visual
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.sensoryProprio || false}
                    onChange={(e) => updateHistory("sensoryProprio", e.target.checked)}
                  />
                  proprio/vestibular
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.sensoryTaste || false}
                    onChange={(e) => updateHistory("sensoryTaste", e.target.checked)}
                  />
                  taste/smell
                </label>
              </div>
            </div>
          </section>

          <section>
            <div className="card-subtitle">E. Differential Pointers</div>
            <div className="stack stack--sm">
              <div className="stack stack--xs">
                <strong>FASD risk/exposure</strong>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.fasdExposure || false}
                    onChange={(e) => updateHistory("fasdExposure", e.target.checked)}
                  />
                  Confirmed prenatal alcohol exposure
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.fasdGrowth || false}
                    onChange={(e) => updateHistory("fasdGrowth", e.target.checked)}
                  />
                  Growth concerns / facial features / CNS history
                </label>
              </div>
              <div className="stack stack--xs">
                <strong>ADHD profile</strong>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.adhdInattention || false}
                    onChange={(e) => updateHistory("adhdInattention", e.target.checked)}
                  />
                  Early pervasive inattention/impulsivity across settings
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.adhdResponseStructure || false}
                    onChange={(e) => updateHistory("adhdResponseStructure", e.target.checked)}
                  />
                  Marked response to structure; symptoms escalate with demand/length
                </label>
              </div>
              <div className="stack stack--xs">
                <strong>ID / Global delay</strong>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.idDelays || false}
                    onChange={(e) => updateHistory("idDelays", e.target.checked)}
                  />
                  Delays across multiple domains
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.idMilestones || false}
                    onChange={(e) => updateHistory("idMilestones", e.target.checked)}
                  />
                  Milestone history suggests global, not specific, impairment
                </label>
              </div>
              <div className="stack stack--xs">
                <strong>Other contributors</strong>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.otherHearingVision || false}
                    onChange={(e) => updateHistory("otherHearingVision", e.target.checked)}
                  />
                  Hearing/vision concerns ruled out
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.otherSleep || false}
                    onChange={(e) => updateHistory("otherSleep", e.target.checked)}
                  />
                  Sleep disorder
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.otherSeizures || false}
                    onChange={(e) => updateHistory("otherSeizures", e.target.checked)}
                  />
                  seizures/neurology
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.otherPainGI || false}
                    onChange={(e) => updateHistory("otherPainGI", e.target.checked)}
                  />
                  chronic pain/GI
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.otherTrauma || false}
                    onChange={(e) => updateHistory("otherTrauma", e.target.checked)}
                  />
                  Trauma / adversity / attachment disruptions
                </label>
                <label className="row row--center">
                  <input
                    type="checkbox"
                    checked={history.otherEAL || false}
                    onChange={(e) => updateHistory("otherEAL", e.target.checked)}
                  />
                  English as additional language / cultural factors
                </label>
              </div>
            </div>
          </section>

          <section>
            <div className="card-subtitle">F. Family & Genetic Risk</div>
            <div className="stack stack--sm">
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.familyASD || false}
                  onChange={(e) => updateFamily("familyASD", e.target.checked)}
                />
                First-degree ASD
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.familyADHD || false}
                  onChange={(e) => updateFamily("familyADHD", e.target.checked)}
                />
                ADHD / learning disorders
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.familyID || false}
                  onChange={(e) => updateFamily("familyID", e.target.checked)}
                />
                ID / genetic syndromes
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.familyPsych || false}
                  onChange={(e) => updateFamily("familyPsych", e.target.checked)}
                />
                Psychiatric history relevant to social/EF traits
              </label>
            </div>
          </section>

          <section>
            <div className="card-subtitle">G. Functional Impact & Supports</div>
            <div className="stack stack--sm">
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.functionalAdaptive || false}
                  onChange={(e) => updateHistory("functionalAdaptive", e.target.checked)}
                />
                Adaptive skill impacts (communication / socialization / daily living)
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.functionalSchool || false}
                  onChange={(e) => updateHistory("functionalSchool", e.target.checked)}
                />
                School adjustments / IEP / SLSO
              </label>
              <label className="row row--center">
                <input
                  type="checkbox"
                  checked={history.functionalServices || false}
                  onChange={(e) => updateHistory("functionalServices", e.target.checked)}
                />
                NDIS / other services in place
              </label>
            </div>
          </section>

          <section>
            <div className="card-subtitle">H. Notes</div>
            <label className="stack stack--sm">
              Free-text: brief examples, ages, contexts.
              <textarea
                value={history.notes || ""}
                onChange={(e) => updateHistory("notes", e.target.value)}
              />
            </label>
          </section>
        </div>
      </Card>

      <Card title="Developmental History">
        <div className="stack stack--sm">
          <label title="Developmental concerns">
            <div className="card-title" title="Developmental concerns">Developmental concerns</div>
            <textarea
              value={history.developmentalConcerns}
              onChange={(e) => updateHistory("developmentalConcerns", e.target.value)}
            />
          </label>
          <label className="row row--center" title="Masking indicators">
            <input
              type="checkbox"
              checked={history.maskingIndicators}
              onChange={(e) => updateHistory("maskingIndicators", e.target.checked)}
            />
            Masking indicators
          </label>
          <label className="stack stack--sm" title="Verbal fluency">
            <div className="card-title" title="Verbal fluency">Verbal fluency</div>
            <select
              value={history.verbalFluency}
              onChange={(e) => updateHistory("verbalFluency", e.target.value)}
            >
              <option value=""></option>
              {VERBAL_FLUENCY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card title="Clinician Observation" helper="Direct observation carries the highest weight.">
        <div className="grid grid--sm" style={{ marginBottom: "var(--space-gap)" }}>
          {["A1", "A2", "A3", "B1", "B2", "B3", "B4"].map((k) => (
            <label key={k} className="stack stack--sm" title={k}>
              <div className="card-title" title={k}>{k}</div>
              <select
                value={observation[k]}
                onChange={(e) => updateObservation(k, Number(e.target.value))}
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <label className="stack stack--sm" title="Notes">
          <div className="card-title" title="Notes">Notes</div>
          <textarea
            value={observation.notes}
            onChange={(e) => updateObservation("notes", e.target.value)}
          />
        </label>
      </Card>
    </div>
  );
}

export default HistoryPanel;

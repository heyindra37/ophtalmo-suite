"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import kb from "@/data/uveitis/uveitis_knowledge_base.json";
import type { KnowledgeBase } from "@/lib/uveitis-differential/types";
import { defaultClinicalInput } from "@/lib/uveitis-differential/types";
import { computeDifferentialDiagnosis } from "@/lib/uveitis-differential/scoring";
import ClinicalInputForm from "./ClinicalInputForm";
import DifferentialResultCard from "./DifferentialResultCard";
import ScleritisResultSection from "./ScleritisResultSection";
import type { ReviewOfSystemsData } from "./ReviewOfSystemsChecklist";
import Disclaimer from "./Disclaimer";
import FacilityAvailabilitySettings, {
  type FacilityPrefs,
  defaultFacilityPrefs,
  loadFacilityPrefs,
  saveFacilityPrefs,
} from "./FacilityAvailabilitySettings";
import { C } from "./tokens";

const typedKb = kb as unknown as KnowledgeBase;

export default function UveitisDifferentialClient() {
  const [input, setInput] = useState(defaultClinicalInput);
  const [facilityPrefs, setFacilityPrefs] = useState<FacilityPrefs>(defaultFacilityPrefs);
  const [hasComputed, setHasComputed] = useState(false);

  useEffect(() => {
    setFacilityPrefs(loadFacilityPrefs());
  }, []);

  const handleFacilityChange = (p: FacilityPrefs) => {
    setFacilityPrefs(p);
    saveFacilityPrefs(p);
  };

  const allResults = useMemo(() => {
    if (!hasComputed) return [];
    return computeDifferentialDiagnosis(input, typedKb);
  }, [input, hasComputed]);

  const results = useMemo(() => allResults.filter((r) => r.disease.disease_category !== "scleritis"), [allResults]);
  const scleritisResults = useMemo(() => allResults.filter((r) => r.disease.disease_category === "scleritis"), [allResults]);

  const hasAnyInput =
    input.anatomic.length > 0 ||
    !!input.onset ||
    !!input.course ||
    !!input.laterality ||
    !!input.granulomatous ||
    !!input.ageGroup ||
    !!input.iop ||
    !!input.kpMorphology ||
    !!input.kpDistribution ||
    input.selectedTags.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div
        style={{
          background: C.panel,
          borderBottom: `1px solid ${C.border}`,
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link href="/" style={{ color: C.accent, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
          ← Kembali
        </Link>
        <span style={{ color: C.text, fontSize: 15, fontWeight: 700, fontFamily: "'Fraunces', serif" }}>Uveitis Differential</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
            Uveitis Differential
          </h1>
          <p style={{ color: C.textDim, fontSize: 14, margin: 0 }}>
            Diagnosis banding uveitis berbasis Kanski&apos;s Clinical Ophthalmology, 10th Ed.
          </p>
        </div>

        <Disclaimer />

        <FacilityAvailabilitySettings prefs={facilityPrefs} onChange={handleFacilityChange} />

        <ClinicalInputForm
          input={input}
          onChange={setInput}
          reviewOfSystemsData={typedKb.appendix_a_review_of_systems_checklist_aao as unknown as ReviewOfSystemsData}
        />

        <button
          onClick={() => setHasComputed(true)}
          style={{
            background: C.accent,
            border: "none",
            borderRadius: 10,
            color: C.bg,
            fontSize: 15,
            fontWeight: 700,
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          Hitung Diagnosis
        </button>

        {hasComputed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!hasAnyInput ? (
              <p style={{ color: C.textFaint, fontSize: 14, textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>
                Isi minimal beberapa temuan untuk hasil yang berarti.
              </p>
            ) : results.length === 0 ? (
              <p style={{ color: C.textFaint, fontSize: 14, textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>
                Data belum cukup spesifik, pertimbangkan kumpulkan temuan tambahan.
              </p>
            ) : (
              results.map((r) => (
                <DifferentialResultCard key={r.diseaseId} result={r} facilityPrefs={facilityPrefs} conflictLog={typedKb.source_conflict_log} />
              ))
            )}
            <ScleritisResultSection results={scleritisResults} facilityPrefs={facilityPrefs} conflictLog={typedKb.source_conflict_log} />
          </div>
        )}

        <Disclaimer />
      </div>
    </div>
  );
}

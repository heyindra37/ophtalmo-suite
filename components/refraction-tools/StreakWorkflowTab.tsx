"use client";

import { useState, useMemo } from "react";
import {
  parseDecimal,
  checkOrthogonality,
  subtractWorkingDistance,
  reconstructSpherocyl,
  sphericalEquivalent,
  checkAnisometropia,
  checkOutOfRange,
} from "@/lib/refraction-tools/engine";
import { formatRxLine } from "@/lib/refraction-tools/format";
import EyeInputPanel, { defaultEyeState, type EyeClinicalState } from "./EyeInputPanel";
import EyeResultBlock from "./EyeResultBlock";
import OrthogonalityAlert from "./OrthogonalityAlert";
import AnisometropiaBadge from "./AnisometropiaBadge";
import CycloplegiaSelector, { type CycloplegiaStatus } from "./CycloplegiaSelector";
import { REFLEX_FLAG_NOTES } from "./ReflexQualityFlags";
import CopyButton from "./CopyButton";
import type { MeridianFinding } from "@/lib/refraction-tools/types";

function computeEye(state: EyeClinicalState) {
  const p1 = parseDecimal(state.p1Raw);
  const p2 = parseDecimal(state.p2Raw);
  if (p1 === null || p2 === null) return { status: "incomplete" as const };

  const m2 = state.obliqueUnlocked ? state.m2 : (state.m1 + 90) % 180 || 180;
  const orth = checkOrthogonality(state.m1, m2);
  if (!orth.ok) return { status: "non-orthogonal" as const };

  const f1: MeridianFinding = { meridianDeg: state.m1, powerD: p1 };
  const f2: MeridianFinding = { meridianDeg: m2, powerD: p2 };
  const net1 = subtractWorkingDistance(f1, state.workingDistance);
  const net2 = subtractWorkingDistance(f2, state.workingDistance);
  const reconstruction = reconstructSpherocyl(net1, net2);
  const se = sphericalEquivalent(reconstruction.plus);
  const outOfRangePlus = checkOutOfRange(reconstruction.plus);
  const outOfRangeMinus = checkOutOfRange(reconstruction.minus);

  return {
    status: "ok" as const,
    grossFindings: state.workingDistance.mode === "gross" ? ([f1, f2] as [MeridianFinding, MeridianFinding]) : null,
    netFindings: [net1, net2] as [MeridianFinding, MeridianFinding],
    workingDistanceLabel:
      state.workingDistance.mode === "gross"
        ? `${state.workingDistance.distanceCm} cm (−${(100 / (state.workingDistance.distanceCm as number)).toFixed(2).replace(".", ",")} D)`
        : null,
    reconstruction,
    se,
    outOfRange: {
      sphereOOR: outOfRangePlus.sphereOOR || outOfRangeMinus.sphereOOR,
      cylOOR: outOfRangePlus.cylOOR || outOfRangeMinus.cylOOR,
    },
  };
}

export default function StreakWorkflowTab() {
  const [singleEyeOnly, setSingleEyeOnly] = useState(false);
  const [onlyEye, setOnlyEye] = useState<"OD" | "OS">("OD");
  const [odState, setOdState] = useState<EyeClinicalState>(defaultEyeState());
  const [osState, setOsState] = useState<EyeClinicalState>(defaultEyeState());
  const [cycloplegia, setCycloplegia] = useState<CycloplegiaStatus>("none");
  const [pediatric, setPediatric] = useState(false);

  const odResult = useMemo(() => computeEye(odState), [odState]);
  const osResult = useMemo(() => computeEye(osState), [osState]);

  const showOD = !singleEyeOnly || onlyEye === "OD";
  const showOS = !singleEyeOnly || onlyEye === "OS";

  const anisometropia =
    showOD && showOS && odResult.status === "ok" && osResult.status === "ok"
      ? checkAnisometropia(odResult.se, osResult.se)
      : null;

  const reflexNotesFor = (state: EyeClinicalState) =>
    (Object.keys(state.reflexFlags) as (keyof typeof state.reflexFlags)[])
      .filter((k) => state.reflexFlags[k])
      .map((k) => REFLEX_FLAG_NOTES[k]);

  const combinedCopyText = useMemo(() => {
    const lines: string[] = [];
    if (showOD && odResult.status === "ok") lines.push(formatRxLine("OD", odResult.reconstruction.plus));
    if (showOS && osResult.status === "ok") lines.push(formatRxLine("OS", osResult.reconstruction.plus));
    return lines.join("\n");
  }, [showOD, showOS, odResult, osResult]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={singleEyeOnly}
            onChange={(e) => setSingleEyeOnly(e.target.checked)}
          />
          Hanya satu mata
        </label>
        {singleEyeOnly && (
          <div className="flex gap-2">
            {(["OD", "OS"] as const).map((eye) => (
              <button
                key={eye}
                type="button"
                onClick={() => setOnlyEye(eye)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                  onlyEye === eye
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "bg-white border-gray-200 text-slate-600"
                }`}
              >
                {eye}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Status Sikloplegia
        </label>
        <CycloplegiaSelector
          status={cycloplegia}
          onStatusChange={setCycloplegia}
          pediatric={pediatric}
          onPediatricChange={setPediatric}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {showOD && <EyeInputPanel eyeLabel="OD" value={odState} onChange={setOdState} />}
        {showOS && <EyeInputPanel eyeLabel="OS" value={osState} onChange={setOsState} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {showOD &&
          (odResult.status === "non-orthogonal" ? (
            <OrthogonalityAlert />
          ) : odResult.status === "ok" ? (
            <EyeResultBlock
              eyeLabel="OD"
              grossFindings={odResult.grossFindings}
              netFindings={odResult.netFindings}
              workingDistanceLabel={odResult.workingDistanceLabel}
              reconstruction={odResult.reconstruction}
              outOfRange={odResult.outOfRange}
              reflexNotes={reflexNotesFor(odState)}
              cycloplegiaNote={null}
            />
          ) : null)}
        {showOS &&
          (osResult.status === "non-orthogonal" ? (
            <OrthogonalityAlert />
          ) : osResult.status === "ok" ? (
            <EyeResultBlock
              eyeLabel="OS"
              grossFindings={osResult.grossFindings}
              netFindings={osResult.netFindings}
              workingDistanceLabel={osResult.workingDistanceLabel}
              reconstruction={osResult.reconstruction}
              outOfRange={osResult.outOfRange}
              reflexNotes={reflexNotesFor(osState)}
              cycloplegiaNote={null}
            />
          ) : null)}
      </div>

      {anisometropia?.flagged && <AnisometropiaBadge magnitudeD={anisometropia.magnitudeD} />}

      {combinedCopyText && (
        <div className="flex items-center gap-3">
          <CopyButton text={combinedCopyText} label="Copy OD+OS" />
        </div>
      )}
    </div>
  );
}

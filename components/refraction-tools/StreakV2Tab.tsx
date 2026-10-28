"use client";

import { useMemo, useState } from "react";
import {
  normalizeMeridian,
  parseDecimal,
  checkOrthogonality,
  subtractWorkingDistance,
  reconstructSpherocyl,
  sphericalEquivalent,
  checkAnisometropia,
  checkOutOfRange,
} from "@/lib/refraction-tools/engine";
import { formatRxLine } from "@/lib/refraction-tools/format";
import { estimateNeutral, type LensEntry } from "@/lib/refraction-tools/lensLog";
import { ARK_BCVA_ROWS, defaultArkBcva, formatRowLine, type ArkBcva } from "@/lib/refraction-tools/arkBcva";
import type { MeridianFinding, WorkingDistanceInput } from "@/lib/refraction-tools/types";
import MeridianPresetPicker from "./MeridianPresetPicker";
import ClockFaceDiagram from "./ClockFaceDiagram";
import WorkingDistanceControl from "./WorkingDistanceControl";
import ReflexQualityFlags, { REFLEX_FLAG_NOTES, type ReflexFlags } from "./ReflexQualityFlags";
import CycloplegiaSelector, { type CycloplegiaStatus } from "./CycloplegiaSelector";
import LensLogMeridian from "./LensLogMeridian";
import ArkBcvaPanel from "./ArkBcvaPanel";
import EyeResultBlock from "./EyeResultBlock";
import OrthogonalityAlert from "./OrthogonalityAlert";
import AnisometropiaBadge from "./AnisometropiaBadge";
import CopyButton from "./CopyButton";

type Eye = "OD" | "OS";

interface EyeV2State {
  m1: number;
  m2: number;
  obliqueUnlocked: boolean;
  log1: LensEntry[];
  log2: LensEntry[];
  override1: string;
  override2: string;
  workingDistance: WorkingDistanceInput;
  reflexFlags: ReflexFlags;
  arkBcva: ArkBcva;
}

function defaultEyeV2(): EyeV2State {
  return {
    m1: 90,
    m2: 180,
    obliqueUnlocked: false,
    log1: [],
    log2: [],
    override1: "",
    override2: "",
    workingDistance: { mode: "gross", distanceCm: 67 },
    reflexFlags: { scissoring: false, dim: false, uncertain: false },
    arkBcva: defaultArkBcva(),
  };
}

/** Manual override wins; otherwise the lens-log estimate. */
function meridianPower(log: LensEntry[], overrideRaw: string): number | null {
  const manual = parseDecimal(overrideRaw);
  if (manual !== null) return manual;
  const est = estimateNeutral(log);
  return est.status === "ok" ? est.powerD : null;
}

function computeEye(state: EyeV2State) {
  const p1 = meridianPower(state.log1, state.override1);
  const p2 = meridianPower(state.log2, state.override2);
  if (p1 === null || p2 === null) return { status: "incomplete" as const };

  const m2 = state.obliqueUnlocked ? state.m2 : normalizeMeridian(state.m1 + 90);
  if (!checkOrthogonality(state.m1, m2).ok) return { status: "non-orthogonal" as const };

  const f1: MeridianFinding = { meridianDeg: state.m1, powerD: p1 };
  const f2: MeridianFinding = { meridianDeg: m2, powerD: p2 };
  const net1 = subtractWorkingDistance(f1, state.workingDistance);
  const net2 = subtractWorkingDistance(f2, state.workingDistance);
  const reconstruction = reconstructSpherocyl(net1, net2);
  const oorPlus = checkOutOfRange(reconstruction.plus);
  const oorMinus = checkOutOfRange(reconstruction.minus);

  return {
    status: "ok" as const,
    grossFindings: state.workingDistance.mode === "gross" ? ([f1, f2] as [MeridianFinding, MeridianFinding]) : null,
    netFindings: [net1, net2] as [MeridianFinding, MeridianFinding],
    workingDistanceLabel:
      state.workingDistance.mode === "gross"
        ? `${state.workingDistance.distanceCm} cm (−${(100 / (state.workingDistance.distanceCm as number)).toFixed(2).replace(".", ",")} D)`
        : null,
    reconstruction,
    se: sphericalEquivalent(reconstruction.plus),
    outOfRange: { sphereOOR: oorPlus.sphereOOR || oorMinus.sphereOOR, cylOOR: oorPlus.cylOOR || oorMinus.cylOOR },
  };
}

type EyeResult = ReturnType<typeof computeEye>;

function eyeCopyBlock(eye: Eye, state: EyeV2State, result: EyeResult): string | null {
  const lines: string[] = [];
  const ark = ARK_BCVA_ROWS.filter((r) => r.key.startsWith("ark"))
    .map((r) => formatRowLine(r.key, state.arkBcva[r.key]))
    .filter((l): l is string => !!l);
  const bcva = ARK_BCVA_ROWS.filter((r) => r.key.startsWith("bcva"))
    .map((r) => formatRowLine(r.key, state.arkBcva[r.key]))
    .filter((l): l is string => !!l);
  lines.push(...ark);
  if (result.status === "ok") lines.push(`${"Streak".padEnd(16)}: ${formatRxLine(eye, result.reconstruction.plus).replace(`${eye}: `, "")}`);
  lines.push(...bcva);
  return lines.length ? `${eye}:\n${lines.join("\n")}` : null;
}

function EyeV2Panel({ eye, value, onChange }: { eye: Eye; value: EyeV2State; onChange: (v: EyeV2State) => void }) {
  const derivedM2 = normalizeMeridian(value.m1 + 90);
  const m2 = value.obliqueUnlocked ? value.m2 : derivedM2;
  const label = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 min-w-0">
      <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
        {eye === "OD" ? "Mata Kanan (OD)" : "Mata Kiri (OS)"}
      </h3>

      <div className="flex flex-col gap-2">
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            <label className={label}>Meridian 1</label>
            <MeridianPresetPicker value={value.m1} onChange={(m1) => onChange({ ...value, m1 })} />
          </div>
          <ClockFaceDiagram meridianDeg={value.m1} />
        </div>
        <label className={label}>Log lensa meridian 1</label>
        <LensLogMeridian
          entries={value.log1}
          onChange={(log1) => onChange({ ...value, log1 })}
          overrideRaw={value.override1}
          onOverrideChange={(override1) => onChange({ ...value, override1 })}
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={value.obliqueUnlocked}
          onChange={(e) => onChange({ ...value, obliqueUnlocked: e.target.checked, m2: e.target.checked ? value.m2 : derivedM2 })}
        />
        Mode oblik (buka meridian 2 secara manual, bukan otomatis M1+90)
      </label>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            <label className={label}>
              Meridian 2 {!value.obliqueUnlocked && <span className="normal-case font-normal">(otomatis = M1+90)</span>}
            </label>
            {value.obliqueUnlocked ? (
              <MeridianPresetPicker value={value.m2} onChange={(v) => onChange({ ...value, m2: v })} />
            ) : (
              <div className="border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono">{Math.round(derivedM2)}°</div>
            )}
          </div>
          <ClockFaceDiagram meridianDeg={m2} />
        </div>
        <label className={label}>Log lensa meridian 2</label>
        <LensLogMeridian
          entries={value.log2}
          onChange={(log2) => onChange({ ...value, log2 })}
          overrideRaw={value.override2}
          onOverrideChange={(override2) => onChange({ ...value, override2 })}
        />
      </div>

      <div className="border-t border-gray-100 pt-3">
        <label className={label}>Working Distance</label>
        <WorkingDistanceControl value={value.workingDistance} onChange={(workingDistance) => onChange({ ...value, workingDistance })} />
      </div>

      <div className="border-t border-gray-100 pt-3">
        <label className={label}>Kualitas Refleks</label>
        <ReflexQualityFlags value={value.reflexFlags} onChange={(reflexFlags) => onChange({ ...value, reflexFlags })} />
      </div>

      <div className="border-t border-gray-100 pt-3">
        <label className={label}>ARK & BCVA (centang yang diperiksa)</label>
        <ArkBcvaPanel value={value.arkBcva} onChange={(arkBcva) => onChange({ ...value, arkBcva })} />
      </div>
    </div>
  );
}

export default function StreakV2Tab() {
  const [singleEyeOnly, setSingleEyeOnly] = useState(false);
  const [onlyEye, setOnlyEye] = useState<Eye>("OD");
  const [od, setOd] = useState<EyeV2State>(defaultEyeV2());
  const [os, setOs] = useState<EyeV2State>(defaultEyeV2());
  const [cycloplegia, setCycloplegia] = useState<CycloplegiaStatus>("none");
  const [pediatric, setPediatric] = useState(false);

  const odResult = useMemo(() => computeEye(od), [od]);
  const osResult = useMemo(() => computeEye(os), [os]);
  const showOD = !singleEyeOnly || onlyEye === "OD";
  const showOS = !singleEyeOnly || onlyEye === "OS";

  const anisometropia =
    showOD && showOS && odResult.status === "ok" && osResult.status === "ok" ? checkAnisometropia(odResult.se, osResult.se) : null;

  const reflexNotesFor = (s: EyeV2State) =>
    (Object.keys(s.reflexFlags) as (keyof ReflexFlags)[]).filter((k) => s.reflexFlags[k]).map((k) => REFLEX_FLAG_NOTES[k]);

  const copyText = useMemo(
    () =>
      [showOD ? eyeCopyBlock("OD", od, odResult) : null, showOS ? eyeCopyBlock("OS", os, osResult) : null]
        .filter((b): b is string => !!b)
        .join("\n\n"),
    [showOD, showOS, od, os, odResult, osResult]
  );

  const results: [Eye, EyeV2State, EyeResult, boolean][] = [
    ["OD", od, odResult, showOD],
    ["OS", os, osResult, showOS],
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-slate-500">
        Versi 2: catat setiap lensa yang dicoba beserta refleksnya. Bila netral tidak terlihat, netral diperkirakan dari bracket
        with ↔ against (titik tengah, digeser ke refleks yang lebih cepat). Versi 1 tetap tersedia di tab Streak Workflow.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={singleEyeOnly} onChange={(e) => setSingleEyeOnly(e.target.checked)} />
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
                  onlyEye === eye ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-gray-200 text-slate-600"
                }`}
              >
                {eye}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Status Sikloplegia</label>
        <CycloplegiaSelector status={cycloplegia} onStatusChange={setCycloplegia} pediatric={pediatric} onPediatricChange={setPediatric} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {showOD && <EyeV2Panel eye="OD" value={od} onChange={setOd} />}
        {showOS && <EyeV2Panel eye="OS" value={os} onChange={setOs} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {results.map(([eye, state, r, show]) =>
          !show ? null : r.status === "non-orthogonal" ? (
            <OrthogonalityAlert key={eye} />
          ) : r.status === "ok" ? (
            <EyeResultBlock
              key={eye}
              eyeLabel={eye}
              grossFindings={r.grossFindings}
              netFindings={r.netFindings}
              workingDistanceLabel={r.workingDistanceLabel}
              reconstruction={r.reconstruction}
              outOfRange={r.outOfRange}
              reflexNotes={reflexNotesFor(state)}
              cycloplegiaNote={null}
            />
          ) : null
        )}
      </div>

      {anisometropia?.flagged && <AnisometropiaBadge magnitudeD={anisometropia.magnitudeD} />}

      {copyText && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-auto">Teks untuk rekam medis</span>
            <CopyButton text={copyText} label="Copy OD+OS" />
          </div>
          <pre className="text-xs font-mono text-slate-700 bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap" data-testid="v2-copy">
            {copyText}
          </pre>
        </div>
      )}
    </div>
  );
}

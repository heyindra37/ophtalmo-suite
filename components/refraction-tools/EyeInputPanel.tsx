"use client";

import { normalizeMeridian } from "@/lib/refraction-tools/engine";
import MeridianPresetPicker from "./MeridianPresetPicker";
import ClockFaceDiagram from "./ClockFaceDiagram";
import WorkingDistanceControl from "./WorkingDistanceControl";
import ReflexQualityFlags, { type ReflexFlags } from "./ReflexQualityFlags";
import type { WorkingDistanceInput } from "@/lib/refraction-tools/types";

export interface EyeClinicalState {
  m1: number;
  p1Raw: string;
  m2: number;
  p2Raw: string;
  obliqueUnlocked: boolean;
  workingDistance: WorkingDistanceInput;
  reflexFlags: ReflexFlags;
}

export function defaultEyeState(): EyeClinicalState {
  return {
    m1: 90,
    p1Raw: "",
    m2: 180,
    p2Raw: "",
    obliqueUnlocked: false,
    workingDistance: { mode: "gross", distanceCm: 67 },
    reflexFlags: { scissoring: false, dim: false, uncertain: false },
  };
}

export default function EyeInputPanel({
  eyeLabel,
  value,
  onChange,
}: {
  eyeLabel: "OD" | "OS";
  value: EyeClinicalState;
  onChange: (v: EyeClinicalState) => void;
}) {
  const derivedM2 = normalizeMeridian(value.m1 + 90);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <h3
        className="text-lg font-bold text-slate-900"
        style={{ fontFamily: "var(--font-fraunces, serif)" }}
      >
        {eyeLabel === "OD" ? "Mata Kanan (OD)" : "Mata Kiri (OS)"}
      </h3>

      <div className="flex gap-4 items-start">
        <div className="flex-1 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Meridian 1
            </label>
            <MeridianPresetPicker
              value={value.m1}
              onChange={(m1) => onChange({ ...value, m1 })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Daya netralisasi 1
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="mis. +1,75"
              value={value.p1Raw}
              onChange={(e) => onChange({ ...value, p1Raw: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>
        <ClockFaceDiagram meridianDeg={value.m1} />
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={value.obliqueUnlocked}
          onChange={(e) =>
            onChange({
              ...value,
              obliqueUnlocked: e.target.checked,
              m2: e.target.checked ? value.m2 : derivedM2,
            })
          }
        />
        Mode oblik (buka meridian 2 secara manual, bukan otomatis M1+90)
      </label>

      <div className="flex gap-4 items-start">
        <div className="flex-1 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Meridian 2 {!value.obliqueUnlocked && <span className="normal-case font-normal">(otomatis = M1+90)</span>}
            </label>
            {value.obliqueUnlocked ? (
              <MeridianPresetPicker value={value.m2} onChange={(m2) => onChange({ ...value, m2 })} />
            ) : (
              <div className="border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono">
                {Math.round(derivedM2)}°
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Daya netralisasi 2
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="mis. +3,25"
              value={value.p2Raw}
              onChange={(e) => onChange({ ...value, p2Raw: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>
        <ClockFaceDiagram meridianDeg={value.obliqueUnlocked ? value.m2 : derivedM2} />
      </div>

      <div className="border-t border-gray-100 pt-3">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Working Distance
        </label>
        <WorkingDistanceControl
          value={value.workingDistance}
          onChange={(workingDistance) => onChange({ ...value, workingDistance })}
        />
      </div>

      <div className="border-t border-gray-100 pt-3">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Kualitas Refleks
        </label>
        <ReflexQualityFlags
          value={value.reflexFlags}
          onChange={(reflexFlags) => onChange({ ...value, reflexFlags })}
        />
      </div>
    </div>
  );
}

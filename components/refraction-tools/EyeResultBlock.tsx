import type { MeridianFinding, SpherocylResult } from "@/lib/refraction-tools/types";
import { formatSignedDisplay, formatAxisDisplay, formatRxLine } from "@/lib/refraction-tools/format";
import { sphericalEquivalent } from "@/lib/refraction-tools/engine";
import CopyButton from "./CopyButton";

const monoStyle = { fontFamily: "var(--font-dm-mono, monospace)" };

export default function EyeResultBlock({
  eyeLabel,
  grossFindings,
  netFindings,
  workingDistanceLabel,
  reconstruction,
  outOfRange,
  reflexNotes,
  cycloplegiaNote,
}: {
  eyeLabel: "OD" | "OS";
  grossFindings: [MeridianFinding, MeridianFinding] | null;
  netFindings: [MeridianFinding, MeridianFinding];
  workingDistanceLabel: string | null;
  reconstruction: { plus: SpherocylResult; minus: SpherocylResult };
  outOfRange: { sphereOOR: boolean; cylOOR: boolean };
  reflexNotes: string[];
  cycloplegiaNote: string | null;
}) {
  const sePlus = sphericalEquivalent(reconstruction.plus);
  const seMinus = sphericalEquivalent(reconstruction.minus);
  const seMismatch = Math.abs(sePlus - seMinus) > 0.01;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <h3
        className="text-lg font-bold text-slate-900"
        style={{ fontFamily: "var(--font-fraunces, serif)" }}
      >
        {eyeLabel === "OD" ? "Mata Kanan (OD)" : "Mata Kiri (OS)"}
      </h3>

      <div className="text-sm" style={monoStyle}>
        {grossFindings && (
          <>
            <div className="flex gap-4">
              <span className="w-20 text-slate-400 font-semibold">GROSS</span>
              <span>
                M{Math.round(grossFindings[0].meridianDeg)} = {formatSignedDisplay(grossFindings[0].powerD)}
                {"   |   "}
                M{Math.round(grossFindings[1].meridianDeg)} = {formatSignedDisplay(grossFindings[1].powerD)}
              </span>
            </div>
            <div className="text-slate-400 pl-24 text-xs py-0.5">
              ↓ working distance {workingDistanceLabel}
            </div>
          </>
        )}
        <div className="flex gap-4">
          <span className="w-20 text-slate-400 font-semibold">NET</span>
          <span>
            M{Math.round(netFindings[0].meridianDeg)} = {formatSignedDisplay(netFindings[0].powerD)}
            {"   |   "}
            M{Math.round(netFindings[1].meridianDeg)} = {formatSignedDisplay(netFindings[1].powerD)}
          </span>
        </div>
        <div className="text-slate-400 pl-24 text-xs py-0.5">↓ rekonstruksi</div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="w-20 text-teal-700 font-semibold">PLUS-CYL</span>
          <span>
            S {formatSignedDisplay(reconstruction.plus.sphereD)}{"   "}
            C {formatSignedDisplay(reconstruction.plus.cylinderD)}{"   "}
            X {formatAxisDisplay(reconstruction.plus.axisDeg)}
          </span>
          <CopyButton text={formatRxLine(eyeLabel, reconstruction.plus)} />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="w-20 text-teal-700 font-semibold">MINUS-CYL</span>
          <span>
            S {formatSignedDisplay(reconstruction.minus.sphereD)}{"   "}
            C {formatSignedDisplay(reconstruction.minus.cylinderD)}{"   "}
            X {formatAxisDisplay(reconstruction.minus.axisDeg)}
          </span>
          <CopyButton text={formatRxLine(eyeLabel, reconstruction.minus)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
            seMismatch ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {seMismatch ? "⚠️" : "✅"} SE {formatSignedDisplay(sePlus)} D
        </span>
        {outOfRange.sphereOOR || outOfRange.cylOOR ? (
          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            di luar rentang refraksi umum — periksa kembali input
          </span>
        ) : null}
      </div>

      {reflexNotes.length > 0 && (
        <div className="flex flex-col gap-1">
          {reflexNotes.map((note, i) => (
            <p key={i} className="text-xs text-slate-500 italic leading-relaxed">
              {note}
            </p>
          ))}
        </div>
      )}

      {cycloplegiaNote && (
        <p className="text-xs text-slate-500 italic leading-relaxed">{cycloplegiaNote}</p>
      )}
    </div>
  );
}

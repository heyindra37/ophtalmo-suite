"use client";

import { useMemo, useState } from "react";
import { parseDecimal, sphericalEquivalent, checkAnisometropia } from "@/lib/refraction-tools/engine";
import { formatSignedDisplay } from "@/lib/refraction-tools/format";
import CopyButton from "./CopyButton";
import AnisometropiaBadge from "./AnisometropiaBadge";

function EyeSEInput({
  eyeLabel,
  sphereRaw,
  setSphereRaw,
  cylRaw,
  setCylRaw,
  se,
}: {
  eyeLabel: "OD" | "OS";
  sphereRaw: string;
  setSphereRaw: (v: string) => void;
  cylRaw: string;
  setCylRaw: (v: string) => void;
  se: number | null;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <h3
        className="text-sm font-bold text-slate-900"
        style={{ fontFamily: "var(--font-fraunces, serif)" }}
      >
        {eyeLabel === "OD" ? "Mata Kanan (OD)" : "Mata Kiri (OS)"}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Sphere
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="mis. +1,00"
            value={sphereRaw}
            onChange={(e) => setSphereRaw(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Cylinder
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="mis. +2,00"
            value={cylRaw}
            onChange={(e) => setCylRaw(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>
      {se !== null && (
        <span className="self-start inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          ✅ SE {formatSignedDisplay(se)} D
        </span>
      )}
    </div>
  );
}

export default function SphericalEquivalentTab() {
  const [sphereRawOD, setSphereRawOD] = useState("");
  const [cylRawOD, setCylRawOD] = useState("");
  const [sphereRawOS, setSphereRawOS] = useState("");
  const [cylRawOS, setCylRawOS] = useState("");

  const seOD = useMemo(() => {
    const sphereD = parseDecimal(sphereRawOD);
    const cylinderD = parseDecimal(cylRawOD);
    if (sphereD === null || cylinderD === null) return null;
    return sphericalEquivalent({ sphereD, cylinderD, axisDeg: null });
  }, [sphereRawOD, cylRawOD]);

  const seOS = useMemo(() => {
    const sphereD = parseDecimal(sphereRawOS);
    const cylinderD = parseDecimal(cylRawOS);
    if (sphereD === null || cylinderD === null) return null;
    return sphericalEquivalent({ sphereD, cylinderD, axisDeg: null });
  }, [sphereRawOS, cylRawOS]);

  const anisometropia = useMemo(() => {
    if (seOD === null || seOS === null) return null;
    return checkAnisometropia(seOD, seOS);
  }, [seOD, seOS]);

  const copyText =
    seOD !== null && seOS !== null
      ? `OD: SE ${formatSignedDisplay(seOD)}D | OS: SE ${formatSignedDisplay(seOS)}D`
      : null;

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <p className="text-sm text-slate-600">
        Masukkan sphere & cylinder dari resep/hasil refraksi apa pun — spherical equivalent
        (SE) dihitung otomatis untuk masing-masing mata.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EyeSEInput
          eyeLabel="OD"
          sphereRaw={sphereRawOD}
          setSphereRaw={setSphereRawOD}
          cylRaw={cylRawOD}
          setCylRaw={setCylRawOD}
          se={seOD}
        />
        <EyeSEInput
          eyeLabel="OS"
          sphereRaw={sphereRawOS}
          setSphereRaw={setSphereRawOS}
          cylRaw={cylRawOS}
          setCylRaw={setCylRawOS}
          se={seOS}
        />
      </div>

      {anisometropia?.flagged && <AnisometropiaBadge magnitudeD={anisometropia.magnitudeD} />}

      {copyText && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-slate-700">{copyText}</span>
          <CopyButton text={copyText} />
        </div>
      )}
    </div>
  );
}

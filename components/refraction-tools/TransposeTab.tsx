"use client";

import { useMemo, useState } from "react";
import { parseDecimal, transpose } from "@/lib/refraction-tools/engine";
import { formatSignedDisplay, formatAxisDisplay, formatRxLine } from "@/lib/refraction-tools/format";
import CopyButton from "./CopyButton";

export default function TransposeTab() {
  const [sphereRaw, setSphereRaw] = useState("");
  const [cylRaw, setCylRaw] = useState("");
  const [axisRaw, setAxisRaw] = useState("90");

  const result = useMemo(() => {
    const sphereD = parseDecimal(sphereRaw);
    const cylinderD = parseDecimal(cylRaw);
    const axisDeg = parseDecimal(axisRaw);
    if (sphereD === null || cylinderD === null) return null;
    const input = { sphereD, cylinderD, axisDeg: cylinderD === 0 ? null : axisDeg };
    return transpose(input);
  }, [sphereRaw, cylRaw, axisRaw]);

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <p className="text-sm text-slate-600">
        Masukkan notasi apa pun (plus-cyl atau minus-cyl) — hasil transpose langsung
        ditampilkan. Fungsi konversi ini persis sama dengan yang dipakai di tab Streak
        Workflow.
      </p>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Sphere
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="mis. +0,25"
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
              placeholder="mis. +1,50"
              value={cylRaw}
              onChange={(e) => setCylRaw(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Axis
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="mis. 90"
              value={axisRaw}
              onChange={(e) => setAxisRaw(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {result && (
          <div className="border-t border-gray-100 pt-3 flex items-center gap-4 flex-wrap">
            <span className="text-sm" style={{ fontFamily: "var(--font-dm-mono, monospace)" }}>
              S {formatSignedDisplay(result.sphereD)}{"   "}
              C {formatSignedDisplay(result.cylinderD)}{"   "}
              X {formatAxisDisplay(result.axisDeg)}
            </span>
            <CopyButton text={formatRxLine("OD", result)} />
          </div>
        )}
      </div>
    </div>
  );
}

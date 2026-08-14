"use client";

import type { WorkingDistanceInput } from "@/lib/refraction-tools/types";

const DISTANCE_PRESETS = [
  { cm: 67, label: "67 cm" },
  { cm: 50, label: "50 cm" },
  { cm: 100, label: "100 cm" },
];

export default function WorkingDistanceControl({
  value,
  onChange,
}: {
  value: WorkingDistanceInput;
  onChange: (v: WorkingDistanceInput) => void;
}) {
  const isPreset = DISTANCE_PRESETS.some((p) => p.cm === value.distanceCm);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="radio"
            className="mt-0.5"
            checked={value.mode === "gross"}
            onChange={() => onChange({ mode: "gross", distanceCm: value.distanceCm ?? 67 })}
          />
          <span>
            Nilai yang saya masukkan = <strong>GROSS</strong> (belum dikurangi working distance)
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="radio"
            className="mt-0.5"
            checked={value.mode === "net"}
            onChange={() => onChange({ mode: "net" })}
          />
          <span>
            Nilai yang saya masukkan = <strong>NET</strong> (sudah saya kurangi sendiri)
          </span>
        </label>
      </div>

      {value.mode === "gross" && (
        <div className="flex flex-wrap items-center gap-2 pl-6">
          {DISTANCE_PRESETS.map((p) => (
            <button
              key={p.cm}
              type="button"
              onClick={() => onChange({ mode: "gross", distanceCm: p.cm })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                value.distanceCm === p.cm
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "bg-white border-gray-200 text-slate-600 hover:border-teal-300"
              }`}
            >
              {p.label} (−{(100 / p.cm).toFixed(2)} D)
            </button>
          ))}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              inputMode="decimal"
              min={1}
              placeholder="Custom (cm)"
              value={isPreset ? "" : value.distanceCm ?? ""}
              onChange={(e) => {
                const cm = Number(e.target.value);
                if (Number.isFinite(cm) && cm > 0) onChange({ mode: "gross", distanceCm: cm });
              }}
              className="w-28 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            {!isPreset && value.distanceCm ? (
              <span className="text-xs text-slate-500 font-mono">
                −{(100 / value.distanceCm).toFixed(2)} D
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

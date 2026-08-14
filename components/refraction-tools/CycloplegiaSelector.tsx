"use client";

export type CycloplegiaStatus = "none" | "tropicamide" | "cyclopentolate" | "atropine";

const OPTIONS: { value: CycloplegiaStatus; label: string }[] = [
  { value: "none", label: "Tanpa sikloplegik" },
  { value: "tropicamide", label: "Tropicamide 1%" },
  { value: "cyclopentolate", label: "Cyclopentolate 1%" },
  { value: "atropine", label: "Atropin 1%" },
];

export default function CycloplegiaSelector({
  status,
  onStatusChange,
  pediatric,
  onPediatricChange,
}: {
  status: CycloplegiaStatus;
  onStatusChange: (v: CycloplegiaStatus) => void;
  pediatric: boolean;
  onPediatricChange: (v: boolean) => void;
}) {
  const showWarning = pediatric && (status === "none" || status === "tropicamide");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as CycloplegiaStatus)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={pediatric}
            onChange={(e) => onPediatricChange(e.target.checked)}
          />
          Pasien anak
        </label>
      </div>
      {showWarning && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-3 py-2.5 text-xs leading-relaxed">
          Pada pasien anak dengan iris berpigmen gelap, tropicamide 1% tidak adekuat sebagai
          sikloplegik — risiko under-estimasi hiperopia bermakna.{" "}
          <strong>Cyclopentolate 1% adalah standar minimum.</strong> Hasil ini tidak layak
          dijadikan dasar resep definitif tanpa sikloplegia adekuat.
        </div>
      )}
    </div>
  );
}

"use client";

import type { RankedEntity } from "@/lib/keratitis-differential/types";

function MatchBadge({ level }: { level: "tinggi" | "sedang" }) {
  return level === "tinggi" ? (
    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-600 text-white">
      Kecocokan Tinggi
    </span>
  ) : (
    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-teal-600 text-teal-700">
      Kecocokan Sedang
    </span>
  );
}

export default function RankingPanel({
  ranked,
  others,
  selectedEntityId,
  onSelectEntity,
  hasSelection,
}: {
  ranked: RankedEntity[];
  others: RankedEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
  hasSelection: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-sm font-bold text-slate-900 uppercase tracking-wide"
        style={{ fontFamily: "var(--font-fraunces, serif)" }}
      >
        Ranking Kecocokan
      </h2>

      {!hasSelection ? (
        <p className="text-sm text-slate-400 italic py-4 text-center bg-white rounded-xl border border-gray-100">
          Centang temuan klinis di sebelah kiri untuk melihat ranking entitas.
        </p>
      ) : ranked.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-4 text-center bg-white rounded-xl border border-gray-100">
          Belum ada entitas yang cocok dengan ambang batas. Lihat &quot;Kemungkinan lain&quot; di
          bawah.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {ranked.map((r) => (
            <button
              key={r.entity.id}
              type="button"
              onClick={() => onSelectEntity(r.entity.id)}
              className={`text-left bg-white rounded-xl border p-4 flex flex-col gap-2 transition-colors ${
                selectedEntityId === r.entity.id
                  ? "border-teal-600 ring-2 ring-teal-100"
                  : "border-gray-100 hover:border-teal-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 text-sm">{r.entity.name}</span>
                <MatchBadge level={r.matchLevel} />
              </div>
            </button>
          ))}
        </div>
      )}

      {hasSelection && others.length > 0 && (
        <details className="bg-white rounded-xl border border-gray-100 p-3">
          <summary className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
            Kemungkinan lain ({others.length})
          </summary>
          <div className="flex flex-col gap-2 mt-3">
            {others.map((r) => (
              <button
                key={r.entity.id}
                type="button"
                onClick={() => onSelectEntity(r.entity.id)}
                className={`text-left rounded-lg border px-3 py-2 text-sm text-slate-500 transition-colors ${
                  selectedEntityId === r.entity.id
                    ? "border-teal-600 text-teal-700"
                    : "border-gray-200 hover:border-teal-300"
                }`}
              >
                {r.entity.name}
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

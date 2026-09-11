"use client";

import type { KeratitisEntity } from "@/lib/keratitis-differential/types";
import { buildCopyText } from "@/lib/keratitis-differential/scoring";
import CopyButton from "./CopyButton";

const EVIDENCE_LABELS: Record<string, string> = {
  RCT: "RCT",
  consensus: "Konsensus",
  "case-series": "Case Series",
  extrapolation: "Ekstrapolasi",
};

export default function EntityDetailPanel({
  entity,
  selectedFindingIds,
  findingLabelsById,
}: {
  entity: KeratitisEntity;
  selectedFindingIds: Set<string>;
  findingLabelsById: Map<string, string>;
}) {
  const copyText = buildCopyText(entity, selectedFindingIds, findingLabelsById);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h2
          className="text-lg font-bold text-slate-900"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          {entity.name}
        </h2>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{entity.entryRoutePathogenesis}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1.5">
          Ciri Pembeda
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          {entity.distinguishingFeatures.map((f, i) => (
            <li key={i} className="text-sm text-slate-700 leading-relaxed">
              {f}
            </li>
          ))}
        </ul>
      </div>

      {entity.mimicWarnings && entity.mimicWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Waspada Mimic
          </p>
          {entity.mimicWarnings.map((m, i) => (
            <p key={i} className="text-sm text-amber-800 leading-relaxed">
              <span className="font-semibold">{m.mimicName}:</span> {m.note}
            </p>
          ))}
        </div>
      )}

      {entity.redFlags && entity.redFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-1">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Red Flags</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            {entity.redFlags.map((f, i) => (
              <li key={i} className="text-sm text-red-700 leading-relaxed">
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1.5">
          Terapi Lini Pertama
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{entity.therapy.firstLine}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1.5">
          Wajib Dihindari
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          {entity.therapy.avoid.map((a, i) => (
            <li key={i} className="text-sm text-slate-700 leading-relaxed">
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
        <span className="font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          Evidence: {EVIDENCE_LABELS[entity.therapy.evidenceLevel] ?? entity.therapy.evidenceLevel}
        </span>
        <span>{entity.therapy.references.join("; ")}</span>
      </div>

      <div className="border border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-1.5 text-slate-400">
        <span className="text-2xl">📷</span>
        <span className="text-xs">Gambar referensi akan ditambahkan</span>
      </div>

      <CopyButton text={copyText} />
    </div>
  );
}

"use client";

import { useState } from "react";
import type { ClinicalFinding, FindingCategory } from "@/lib/keratitis-differential/types";

const CATEGORY_LABELS: Record<FindingCategory, string> = {
  kulit_sistemik: "Kulit / Sistemik",
  konjungtiva_kgb: "Konjungtiva / KGB",
  kornea_epitel: "Kornea — Epitel",
  kornea_stroma_endotel: "Kornea — Stroma / Endotel",
  sensasi_nyeri: "Sensasi / Nyeri",
  bilik_mata_depan: "Bilik Mata Depan",
  lateralitas_tempo: "Lateralitas / Tempo",
};

const CATEGORY_ORDER: FindingCategory[] = [
  "kulit_sistemik",
  "konjungtiva_kgb",
  "kornea_epitel",
  "kornea_stroma_endotel",
  "sensasi_nyeri",
  "bilik_mata_depan",
  "lateralitas_tempo",
];

function AccordionGroup({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <h3
          className="text-sm font-bold text-slate-900"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          {title}
        </h3>
        <span className="text-slate-400 text-sm flex-shrink-0">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100 pt-3">{children}</div>}
    </div>
  );
}

export default function FindingChecklist({
  findings,
  selectedFindingIds,
  onToggle,
}: {
  findings: ClinicalFinding[];
  selectedFindingIds: Set<string>;
  onToggle: (findingId: string) => void;
}) {
  const byCategory = new Map<FindingCategory, ClinicalFinding[]>();
  for (const f of findings) {
    if (!byCategory.has(f.category)) byCategory.set(f.category, []);
    byCategory.get(f.category)!.push(f);
  }

  return (
    <div className="flex flex-col gap-3">
      {CATEGORY_ORDER.filter((cat) => byCategory.has(cat)).map((cat, i) => (
        <AccordionGroup key={cat} title={CATEGORY_LABELS[cat]} defaultOpen={i < 2}>
          <div className="flex flex-wrap gap-2">
            {byCategory.get(cat)!.map((finding) => {
              const checked = selectedFindingIds.has(finding.id);
              return (
                <label
                  key={finding.id}
                  className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "bg-white border-gray-200 text-slate-700 hover:border-teal-300"
                  }`}
                  title={finding.helpText}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(finding.id)}
                    className="sr-only"
                  />
                  {finding.label}
                </label>
              );
            })}
          </div>
        </AccordionGroup>
      ))}
    </div>
  );
}

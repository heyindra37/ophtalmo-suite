"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import knowledgeBaseData from "@/data/keratitis-differential/keratitis_knowledge_base.json";
import type { KeratitisKnowledgeBase } from "@/lib/keratitis-differential/types";
import { rankEntities } from "@/lib/keratitis-differential/scoring";
import CategorySelector from "./CategorySelector";
import FindingChecklist from "./FindingChecklist";
import RankingPanel from "./RankingPanel";
import EntityDetailPanel from "./EntityDetailPanel";
import Disclaimer from "./Disclaimer";

const kb = knowledgeBaseData as KeratitisKnowledgeBase;
const findingLabelsById = new Map(kb.findings.map((f) => [f.id, f.label]));

export default function KeratitisDifferentialClient() {
  const [selectedFindingIds, setSelectedFindingIds] = useState<Set<string>>(new Set());
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const toggleFinding = (findingId: string) => {
    setSelectedFindingIds((prev) => {
      const next = new Set(prev);
      if (next.has(findingId)) next.delete(findingId);
      else next.add(findingId);
      return next;
    });
  };

  const { ranked, others } = useMemo(
    () => rankEntities(selectedFindingIds, kb.entities),
    [selectedFindingIds]
  );

  const selectedEntity = useMemo(
    () => kb.entities.find((e) => e.id === selectedEntityId) ?? null,
    [selectedEntityId]
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-teal-600 text-sm font-medium hover:underline">
            ← Kembali
          </Link>
          <h1
            className="text-lg font-bold text-slate-900"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Viral Keratitis Differential
          </h1>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 flex flex-col gap-5">
        <p className="text-slate-600 text-sm">
          Centang temuan klinis yang diobservasi — ranking entitas keratitis viral ter-update
          secara langsung, terurut berdasarkan kecocokan.
        </p>

        <CategorySelector />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          <FindingChecklist
            findings={kb.findings}
            selectedFindingIds={selectedFindingIds}
            onToggle={toggleFinding}
          />

          <div className="lg:sticky lg:top-20 flex flex-col gap-5">
            <RankingPanel
              ranked={ranked}
              others={others}
              selectedEntityId={selectedEntityId}
              onSelectEntity={setSelectedEntityId}
              hasSelection={selectedFindingIds.size > 0}
            />
            {selectedEntity && (
              <EntityDetailPanel
                entity={selectedEntity}
                selectedFindingIds={selectedFindingIds}
                findingLabelsById={findingLabelsById}
              />
            )}
          </div>
        </div>
      </main>

      <Disclaimer />
    </div>
  );
}

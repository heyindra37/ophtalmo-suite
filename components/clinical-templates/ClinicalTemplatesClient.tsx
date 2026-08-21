"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import templatesData from "@/data/clinical-templates/templates.json";
import type { ClinicalTemplate, ClinicalTemplateItem } from "@/lib/clinical-templates/types";
import { renderDatePlaceholders } from "@/lib/clinical-templates/dateEngine";

const templates = templatesData as ClinicalTemplate[];

function itemText(item: string | ClinicalTemplateItem): string {
  return typeof item === "string" ? item : item.text;
}
function itemScenario(item: string | ClinicalTemplateItem): string | undefined {
  return typeof item === "string" ? undefined : item.scenario;
}

/** Items visible for the given scenario: untagged items always show, tagged items only for a match. */
function visibleItems(items: (string | ClinicalTemplateItem)[], scenario: string | null): (string | ClinicalTemplateItem)[] {
  return items.filter((it) => {
    const s = itemScenario(it);
    return !s || s === scenario;
  });
}

function renderText(text: string, anchorDate: string): string {
  return anchorDate ? renderDatePlaceholders(text, anchorDate) : text;
}

function buildCopyText(t: ClinicalTemplate, anchorDate: string, scenario: string | null): string {
  const lines: string[] = [t.name];
  for (const section of t.sections) {
    const title = renderText(section.title, anchorDate);
    const items = section.items ? visibleItems(section.items, scenario) : [];
    if (items.length > 0) {
      lines.push("", `${title}:`);
      for (const item of items) lines.push(`- ${renderText(itemText(item), anchorDate)}`);
    } else if (section.text) {
      lines.push("", `${title}: ${renderText(section.text, anchorDate)}`);
    }
  }
  return lines.join("\n");
}

function TemplateCard({ template }: { template: ClinicalTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [anchorDate, setAnchorDate] = useState("");
  const [scenario, setScenario] = useState<string | null>(
    template.generator?.defaultScenario ?? template.generator?.scenarios?.[0]?.id ?? null
  );

  const generator = template.generator;
  const needsDate = !!generator && !anchorDate;

  const handleCopy = () => {
    navigator.clipboard.writeText(buildCopyText(template, anchorDate, scenario)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <h3
            className="text-base font-bold text-slate-900"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            {template.name}
          </h3>
          {template.category && (
            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700">
              {template.category}
            </span>
          )}
        </div>
        <span className="text-slate-400 text-sm flex-shrink-0">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 flex flex-col gap-4">
          {generator && (
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  {generator.anchorLabel}
                </label>
                <input
                  type="date"
                  value={anchorDate}
                  onChange={(e) => setAnchorDate(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              {generator.scenarios && generator.scenarios.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Skenario Klinis
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {generator.scenarios.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setScenario(s.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                          scenario === s.id
                            ? "bg-teal-600 border-teal-600 text-white"
                            : "bg-white border-gray-200 text-slate-600 hover:border-teal-300"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {needsDate ? (
            <p className="text-sm text-slate-400 italic text-center py-4">
              Isi {generator!.anchorLabel.toLowerCase()} di atas untuk menghasilkan jadwal.
            </p>
          ) : (
            template.sections.map((section, si) => {
              const items = section.items ? visibleItems(section.items, scenario) : [];
              const hasNoContentForScenario = !!section.items && section.items.length > 0 && items.length === 0;
              if (items.length === 0 && !section.text && !hasNoContentForScenario) return null;
              return (
                <div key={si}>
                  <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1.5">
                    {renderText(section.title, anchorDate)}
                  </p>
                  {items.length > 0 ? (
                    <ul className="list-disc pl-5 flex flex-col gap-1">
                      {items.map((item, i) => (
                        <li key={i} className="text-sm text-slate-700 leading-relaxed">
                          {renderText(itemText(item), anchorDate)}
                        </li>
                      ))}
                    </ul>
                  ) : hasNoContentForScenario ? (
                    <p className="text-sm text-slate-400 italic">
                      Instruksi untuk skenario ini belum tersedia untuk titik waktu ini.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed">{renderText(section.text || "", anchorDate)}</p>
                  )}
                </div>
              );
            })
          )}

          {!needsDate && (
            <button
              onClick={handleCopy}
              className={`self-start inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-150 ${
                copied ? "bg-emerald-500 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              {copied ? "✓ Tersalin" : "Copy"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClinicalTemplatesClient() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-teal-600 text-sm font-medium hover:underline">
            ← Kembali
          </Link>
          <h1
            className="text-lg font-bold text-slate-900"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Template Klinis
          </h1>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-5">
        <p className="text-slate-600 text-sm">
          Kumpulan template rencana tindakan & pengobatan per diagnosis — siap disalin ke rekam medis.
        </p>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Cari nama diagnosis / kategori..."
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
        />

        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10 italic">
              Tidak ada template yang cocok dengan pencarian.
            </p>
          ) : (
            filtered.map((t) => <TemplateCard key={t.id} template={t} />)
          )}
        </div>
      </main>
    </div>
  );
}

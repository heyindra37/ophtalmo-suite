"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import templatesData from "@/data/clinical-templates/templates.json";
import type { ClinicalTemplate } from "@/lib/clinical-templates/types";

const templates = templatesData as ClinicalTemplate[];

function buildCopyText(t: ClinicalTemplate): string {
  const lines: string[] = [t.name];
  for (const section of t.sections) {
    if (section.items && section.items.length > 0) {
      lines.push("", `${section.title}:`);
      for (const item of section.items) lines.push(`- ${item}`);
    } else if (section.text) {
      lines.push("", `${section.title}: ${section.text}`);
    }
  }
  return lines.join("\n");
}

function TemplateCard({ template }: { template: ClinicalTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(buildCopyText(template)).then(() => {
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
          {template.sections.map((section, si) => {
            if (!section.items?.length && !section.text) return null;
            return (
              <div key={si}>
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1.5">
                  {section.title}
                </p>
                {section.items && section.items.length > 0 ? (
                  <ul className="list-disc pl-5 flex flex-col gap-1">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed">{section.text}</p>
                )}
              </div>
            );
          })}
          <button
            onClick={handleCopy}
            className={`self-start inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-150 ${
              copied ? "bg-emerald-500 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            {copied ? "✓ Tersalin" : "Copy"}
          </button>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { FACTORS, OTS_TABLE, OUTCOMES, VA_CATEGORIES, computeOts, type Factor, type VaCategory } from "@/lib/ophtal-calculator/ots";

export default function OtsCalculator() {
  const [eye, setEye] = useState<"OD" | "OS">("OD");
  const [va, setVa] = useState<VaCategory | null>(null);
  const [factors, setFactors] = useState<Set<Factor>>(new Set());
  const [copied, setCopied] = useState(false);

  const result = va ? computeOts(va, factors) : null;
  const toggle = (f: Factor) =>
    setFactors((s) => {
      const n = new Set(s);
      if (n.has(f)) n.delete(f);
      else n.add(f);
      return n;
    });

  const summary = result
    ? `OTS ${eye}: raw score ${result.raw} → OTS ${result.ots}. Visus awal ${VA_CATEGORIES.find((v) => v.id === va)!.label}` +
      (factors.size ? `; ${FACTORS.filter((f) => factors.has(f.id)).map((f) => f.label.replace(/ \(.*\)/, "").toLowerCase()).join(", ")}` : "") +
      `. Prognosis visus 6 bulan: ${OUTCOMES.map((o, i) => `${o} ${result.row.pct[i]}%`).join(", ")}.`
    : "";

  const copy = () =>
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4 flex-wrap">
          <Link href="/ophtal-calculator" className="text-teal-600 text-sm font-medium hover:underline">
            ← Ophtal-calculator
          </Link>
          <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
            Ocular Trauma Score
          </h1>
          <div className="flex gap-1 ml-auto">
            {(["OD", "OS"] as const).map((e) => (
              <button
                key={e}
                onClick={() => setEye(e)}
                className={`px-4 py-1.5 text-sm rounded-lg font-semibold ${eye === e ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">A. Visus awal (Snellen meter)</h2>
          <div className="grid gap-2 sm:grid-cols-5">
            {VA_CATEGORIES.map((v) => (
              <button
                key={v.id}
                onClick={() => setVa(v.id)}
                aria-pressed={va === v.id}
                className={`rounded-lg border px-3 py-2 text-left ${
                  va === v.id ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-gray-200 text-slate-700 hover:border-teal-300"
                }`}
              >
                <span className="block text-sm font-bold">{v.label}</span>
                <span className={`block text-[11px] leading-tight ${va === v.id ? "text-teal-50" : "text-slate-500"}`}>{v.detail}</span>
                <span className={`block text-xs font-semibold mt-1 ${va === v.id ? "text-white" : "text-teal-700"}`}>{v.points} poin</span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">B–F. Temuan (dikurangkan)</h2>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {FACTORS.map((f) => (
              <label key={f.id} className="flex items-start gap-2 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="mt-1 accent-red-600" checked={factors.has(f.id)} onChange={() => toggle(f.id)} />
                <span className="text-sm text-slate-800">
                  {f.label} <b className="text-red-600">{f.points}</b>
                  {f.hint && <span className="block text-[11px] text-slate-500">{f.hint}</span>}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3" data-testid="ots-result">
          {!result ? (
            <p className="text-sm text-slate-500">Pilih kategori visus awal untuk menghitung OTS.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-600">
                  Raw score <b className="text-slate-900">{result.raw}</b>
                </span>
                <span className="text-lg font-bold px-4 py-1 rounded-full bg-teal-600 text-white" data-testid="ots-category">
                  OTS {result.ots}
                </span>
                <button
                  onClick={copy}
                  className={`ml-auto text-sm font-semibold px-4 py-1.5 rounded-xl ${copied ? "bg-emerald-500 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"}`}
                >
                  {copied ? "✓ Tersalin" : "Copy ringkasan"}
                </button>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Kemungkinan visus akhir (6 bulan)</p>
                <div className="flex flex-col gap-1.5">
                  {OUTCOMES.map((o, i) => (
                    <div key={o} className="flex items-center gap-2 text-sm">
                      <span className="w-28 shrink-0 text-slate-600">{o}</span>
                      <div className="flex-1 h-4 rounded bg-gray-100 overflow-hidden">
                        <div className="h-full bg-teal-500" style={{ width: `${result.row.pct[i]}%` }} />
                      </div>
                      <span className="w-10 text-right font-semibold text-slate-800">{result.row.pct[i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs font-mono text-slate-600 bg-gray-50 border border-gray-200 rounded-lg p-2">{summary}</p>
            </>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 overflow-x-auto">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tabel konversi</h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs text-slate-500">
                <th className="py-1 pr-2">Raw score</th>
                <th className="py-1 pr-2">OTS</th>
                {OUTCOMES.map((o) => (
                  <th key={o} className="py-1 pr-2 whitespace-nowrap">
                    {o}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OTS_TABLE.map((r) => (
                <tr key={r.ots} className={`border-t border-gray-100 ${result?.ots === r.ots ? "bg-teal-50 font-semibold" : ""}`}>
                  <td className="py-1 pr-2 whitespace-nowrap">
                    {r.min}–{r.max}
                  </td>
                  <td className="py-1 pr-2">{r.ots}</td>
                  {r.pct.map((p, i) => (
                    <td key={i} className="py-1 pr-2">
                      {p}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-slate-400 mt-2">
            Kuhn F, et al. The Ocular Trauma Score (OTS). Ophthalmol Clin North Am 2002. Persentase prognosis: kartu Asia-Pacific Ophthalmic
            Trauma Society. Kategori visus dikonversi dari feet ke Snellen meter (20/200 = 6/60, 20/50 = 6/15, 20/40 = 6/12).
          </p>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ALIGNMENT_LABELS,
  MONOFIXATION_TEXT,
  RESPONSE_LABELS,
  buildCopyText,
  interpretResponse,
  isMonofixation,
  type Alignment,
  type WfdtResponse,
} from "@/lib/worth-four-dot/interpret";
import GogglesAnimation from "./GogglesAnimation";
import ResponsePicker from "./ResponsePicker";

const ALIGNMENTS: Alignment[] = ["ortho", "esotropia", "exotropia"];

const ANIMATION_CSS = `
@keyframes wfdt-drop { 0% { transform: translateY(-40px); opacity: 0 } 60% { opacity: 1 } 100% { transform: translateY(0); opacity: 1 } }
@keyframes wfdt-fade { 0%, 50% { opacity: 0 } 100% { opacity: 1 } }
@keyframes wfdt-swap-a { 0%, 45% { opacity: 1 } 50%, 95% { opacity: 0 } 100% { opacity: 1 } }
@keyframes wfdt-swap-b { 0%, 45% { opacity: 0 } 50%, 95% { opacity: 1 } 100% { opacity: 0 } }
.wfdt-goggles { animation: wfdt-drop 1.2s ease-out both; }
.wfdt-fade { animation: wfdt-fade 1.6s ease-out both; }
.wfdt-alt-a { animation: wfdt-swap-a 2.4s infinite; }
.wfdt-alt-b { animation: wfdt-swap-b 2.4s infinite; }
@media (prefers-reduced-motion: reduce) {
  .wfdt-goggles, .wfdt-fade { animation: none; }
}
`;

function ResultBlock({ label, resp, alignment }: { label: string; resp: WfdtResponse; alignment: Alignment }) {
  const i = interpretResponse(resp, alignment);
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-500">{RESPONSE_LABELS[resp]}</p>
      <p className="text-sm font-bold text-slate-900">{i.title}</p>
      <p className="text-sm text-slate-700 leading-relaxed">{i.detail}</p>
    </div>
  );
}

export default function WorthFourDotClient() {
  const [alignment, setAlignment] = useState<Alignment>("ortho");
  const [jauh, setJauh] = useState<WfdtResponse | null>(null);
  const [dekat, setDekat] = useState<WfdtResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const mono = isMonofixation(jauh, dekat);

  const handleCopy = () => {
    navigator.clipboard.writeText(buildCopyText(alignment, jauh, dekat)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <style>{ANIMATION_CSS}</style>
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-teal-600 text-sm font-medium hover:underline">
            ← Kembali
          </Link>
          <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
            Worth Four Dot Test
          </h1>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-5">
        <GogglesAnimation />

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Status alignment saat tes
          </label>
          <div className="flex flex-wrap gap-2">
            {ALIGNMENTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAlignment(a)}
                className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
                  alignment === a
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "bg-white border-gray-200 text-slate-600 hover:border-teal-300"
                }`}
              >
                {ALIGNMENT_LABELS[a]}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Bila pasien melihat 5 titik, tanyakan apakah semua titik muncul bersamaan atau bergantian.
        </p>

        <ResponsePicker title="Jarak Jauh (≥3 m)" value={jauh} onChange={setJauh} />
        <ResponsePicker title="Jarak Dekat (33 cm)" value={dekat} onChange={setDekat} />

        {(jauh || dekat) && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
              Interpretasi
            </h2>
            {jauh && <ResultBlock label="Jarak jauh (≥3 m)" resp={jauh} alignment={alignment} />}
            {dekat && <ResultBlock label="Jarak dekat (33 cm)" resp={dekat} alignment={alignment} />}
            {mono && (
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                <p className="text-sm font-bold text-violet-800 mb-1">Sesuai monofixation syndrome</p>
                <p className="text-sm text-violet-800 leading-relaxed">{MONOFIXATION_TEXT}</p>
              </div>
            )}
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
      </main>

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 text-xs text-slate-500 leading-relaxed text-center">
        Interpretasi bersifat alat bantu; keputusan klinis tetap berdasarkan pemeriksaan lengkap (cover test, motilitas, dll).
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  buildCorpalLines,
  buildCorpalText,
  durationWarning,
  type CorpalInput,
  type HariBukaOption,
  type MataOption,
} from "@/lib/clinical-templates/corpalGenerator";

const MATA_OPTIONS: MataOption[] = ["OD", "OS", "ODS"];
const HARI_BUKA_OPTIONS: { value: HariBukaOption; label: string }[] = [
  { value: "hari-ini", label: "Hari Ini" },
  { value: "besok", label: "Besok" },
];
const JAM_PRESETS = ["06:00", "07:00", "08:00"];
const MINIMAL_PRESETS = ["3 hari", "1 minggu", "2 minggu"];
const KONTROL_PRESETS = ["1 minggu", "2 minggu"];

function DurationPicker({
  label,
  presets,
  value,
  onChange,
}: {
  label: string;
  presets: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const isCustom = !presets.includes(value);
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              value === p
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white border-gray-200 text-slate-600 hover:border-teal-300"
            }`}
          >
            {p}
          </button>
        ))}
        <input
          type="text"
          value={isCustom ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Custom..."
          className={`text-xs px-3 py-1.5 rounded-lg border w-24 focus:outline-none focus:ring-2 focus:ring-teal-600 ${
            isCustom ? "border-teal-300 text-slate-900" : "border-gray-200 text-slate-400"
          }`}
        />
      </div>
    </div>
  );
}

export default function CorpalFormCard() {
  const [expanded, setExpanded] = useState(false);
  const [mata, setMata] = useState<MataOption | null>(null);
  const [hariBuka, setHariBuka] = useState<HariBukaOption>("besok");
  const [jamBuka, setJamBuka] = useState("07:00");
  const [durasiMinimal, setDurasiMinimal] = useState("1 minggu");
  const [durasiKontrol, setDurasiKontrol] = useState("2 minggu");
  const [catatanTambahan, setCatatanTambahan] = useState("");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const input: CorpalInput | null = mata
    ? { mata, hariBuka, jamBuka, durasiMinimal, durasiKontrol, catatanTambahan }
    : null;

  const warning = useMemo(() => (input ? durationWarning(input) : null), [input]);
  const lines = useMemo(() => (input ? buildCorpalLines(input) : []), [input]);

  const handleGenerate = () => setGenerated(true);

  const handleCopy = () => {
    if (!input) return;
    navigator.clipboard.writeText(buildCorpalText(input)).then(() => {
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
            Edukasi Pasca Ekstraksi Corpal
          </h3>
          <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700">
            Pasca Tindakan
          </span>
        </div>
        <span className="text-slate-400 text-sm flex-shrink-0">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 flex flex-col gap-4">
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Mata</label>
              <div className="flex gap-2">
                {MATA_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMata(m);
                      setGenerated(false);
                    }}
                    className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
                      mata === m
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "bg-white border-gray-200 text-slate-600 hover:border-teal-300"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Hari Buka Bebat
              </label>
              <div className="flex gap-2">
                {HARI_BUKA_OPTIONS.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => setHariBuka(h.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      hariBuka === h.value
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "bg-white border-gray-200 text-slate-600 hover:border-teal-300"
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Jam Buka Bebat
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="time"
                  value={jamBuka}
                  onChange={(e) => setJamBuka(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                {JAM_PRESETS.map((j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setJamBuka(j)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      jamBuka === j
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "bg-white border-gray-200 text-slate-600 hover:border-teal-300"
                    }`}
                  >
                    {j}
                  </button>
                ))}
              </div>
            </div>

            <DurationPicker
              label="Durasi Minimal Obat"
              presets={MINIMAL_PRESETS}
              value={durasiMinimal}
              onChange={setDurasiMinimal}
            />
            <DurationPicker
              label="Durasi Kontrol"
              presets={KONTROL_PRESETS}
              value={durasiKontrol}
              onChange={setDurasiKontrol}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Catatan Tambahan (opsional)
              </label>
              <input
                type="text"
                value={catatanTambahan}
                onChange={(e) => setCatatanTambahan(e.target.value)}
                placeholder="mis. evaluasi keratitis"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {warning && (
              <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ {warning}
              </p>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!mata}
              className={`self-start text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-150 ${
                mata ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Generate
            </button>
          </div>

          {generated && input && (
            <div className="flex flex-col gap-3">
              <ul className="list-disc pl-5 flex flex-col gap-1">
                {lines.map((line, i) => (
                  <li key={i} className="text-sm text-slate-700 leading-relaxed">
                    {line}
                  </li>
                ))}
              </ul>
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
      )}
    </div>
  );
}

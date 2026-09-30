"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import lesionConfig from "@/data/gemini-retinal/lesion_config.json";
import { gazeSubLabel, type Eye, type Gaze, type Pt } from "@/lib/gemini-retinal/geometry";
import { buildNarrative, type DrawnItem, type LesionDef } from "@/lib/gemini-retinal/narrative";
import { GlobalMapCanvas, ViewportCanvas } from "./Canvases";

const CATEGORY_LABELS: Record<string, string> = {
  vascular_diabetic: "Vaskular / Diabetik",
  structural_breaks: "Robekan & Degenerasi",
  detachment_macula: "Ablasio & Makula",
};

const CATEGORIES = Object.entries(lesionConfig as Record<string, LesionDef[]>);
const DEFS: LesionDef[] = CATEGORIES.flatMap(([, defs]) => defs);
const LS_KEY = "gemini-retinal-drawing:v1";

const GAZE_GRID: { gaze: Gaze; label: string }[] = [
  { gaze: "atas-kanan", label: "↖ Atas-Kanan" },
  { gaze: "atas", label: "↑ Atas" },
  { gaze: "atas-kiri", label: "↗ Atas-Kiri" },
  { gaze: "kanan", label: "← Kanan" },
  { gaze: "primer", label: "● Primer" },
  { gaze: "kiri", label: "→ Kiri" },
  { gaze: "bawah-kanan", label: "↙ Bawah-Kanan" },
  { gaze: "bawah", label: "↓ Bawah" },
  { gaze: "bawah-kiri", label: "↘ Bawah-Kiri" },
];

interface State {
  eye: Eye;
  lesions: Record<Eye, DrawnItem[]>;
}

type Action =
  | { type: "eye"; eye: Eye }
  | { type: "add"; item: DrawnItem }
  | { type: "undo" }
  | { type: "clear" }
  | { type: "load"; state: State };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "eye":
      return { ...s, eye: a.eye };
    case "add":
      return { ...s, lesions: { ...s.lesions, [s.eye]: [...s.lesions[s.eye], a.item] } };
    case "undo":
      return { ...s, lesions: { ...s.lesions, [s.eye]: s.lesions[s.eye].slice(0, -1) } };
    case "clear":
      return { ...s, lesions: { ...s.lesions, [s.eye]: [] } };
    case "load":
      return a.state;
  }
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

let uidSeq = 0;
const uid = () => `${Date.now().toString(36)}-${(uidSeq++).toString(36)}`;

export default function GeminiRetinalClient() {
  const [state, dispatch] = useReducer(reducer, { eye: "OD", lesions: { OD: [], OS: [] } });
  const [gaze, setGaze] = useState<Gaze>("primer");
  const [lesionId, setLesionId] = useState(DEFS[0].id);
  const [tool, setTool] = useState<"pin" | "brush">(DEFS[0].type === "area" ? "brush" : "pin");
  const [brushWidth, setBrushWidth] = useState(0.06);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [leftRef, leftW] = useWidth<HTMLDivElement>();
  const [rightRef, rightW] = useWidth<HTMLDivElement>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) dispatch({ type: "load", state: JSON.parse(raw) as State });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const items = state.lesions[state.eye];
  const narrative = useMemo(() => buildNarrative(state.lesions, DEFS), [state.lesions]);
  const def = DEFS.find((d) => d.id === lesionId)!;

  const pickLesion = (id: string) => {
    setLesionId(id);
    const d = DEFS.find((x) => x.id === id);
    if (d) setTool(d.type === "area" ? "brush" : "pin");
  };

  const addPin = (p: Pt) => dispatch({ type: "add", item: { uid: uid(), lesionId, kind: "pin", points: [p] } });
  const addStroke = (pts: Pt[]) =>
    dispatch({
      type: "add",
      item: pts.length === 1
        ? { uid: uid(), lesionId, kind: "pin", points: pts }
        : { uid: uid(), lesionId, kind: "stroke", points: pts, width: brushWidth },
    });

  const copy = () =>
    navigator.clipboard.writeText(narrative).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  const viewportSize = Math.max(220, Math.min(leftW, 380));
  const mapSize = Math.max(260, Math.min(rightW, 560));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4 flex-wrap">
          <Link href="/" className="text-teal-600 text-sm font-medium hover:underline">
            ← Kembali
          </Link>
          <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
            Gemini Retinal Drawing
          </h1>
          <div className="ml-auto flex gap-1">
            {(["OD", "OS"] as Eye[]).map((e) => (
              <button
                key={e}
                onClick={() => dispatch({ type: "eye", eye: e })}
                className={`px-4 py-1.5 text-sm rounded-lg font-semibold ${
                  state.eye === e ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">
        <p className="text-xs text-slate-500">
          Gambar di lensa (bayangan 90D/78D terbalik) — posisi otomatis diterjemahkan ke peta fundus absolut
          sesuai arah lirikan pasien.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5 items-start">
          {/* Left panel */}
          <div className="flex flex-col gap-4 min-w-0">
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Arah lirikan pasien
              </h2>
              <div className="grid grid-cols-3 gap-1.5">
                {GAZE_GRID.map(({ gaze: g, label }) => (
                  <button
                    key={g}
                    onClick={() => setGaze(g)}
                    className={`rounded-lg px-1 py-1.5 text-xs font-semibold leading-tight transition-colors ${
                      gaze === g ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                    <span className={`block text-[10px] font-normal ${gaze === g ? "text-teal-50" : "text-slate-500"}`}>
                      {gazeSubLabel(g, state.eye)}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2">
              <h2 className="self-start text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Lensa {state.eye} — {gazeSubLabel(gaze, state.eye)}
              </h2>
              <div ref={leftRef} className="w-full flex justify-center">
                {leftW > 0 && (
                  <ViewportCanvas
                    size={viewportSize}
                    eye={state.eye}
                    gaze={gaze}
                    items={items}
                    defs={DEFS}
                    tool={tool}
                    brushWidth={brushWidth}
                    onPin={addPin}
                    onStroke={addStroke}
                  />
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
              <div className="flex gap-1.5">
                {(["pin", "brush"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTool(t)}
                    className={`flex-1 rounded-lg py-1.5 text-sm font-semibold ${
                      tool === t ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                    }`}
                  >
                    {t === "pin" ? "📍 Pin" : "🖌️ Brush"}
                  </button>
                ))}
              </div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Lesi
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ background: def.color }} />
                  <select
                    value={lesionId}
                    onChange={(e) => pickLesion(e.target.value)}
                    className="w-full text-sm normal-case font-normal border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {CATEGORIES.map(([cat, defs]) => (
                      <optgroup key={cat} label={CATEGORY_LABELS[cat] ?? cat}>
                        {defs.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </label>
              {tool === "brush" && (
                <label className="text-xs text-slate-500">
                  Ukuran brush
                  <input
                    type="range"
                    min={0.02}
                    max={0.15}
                    step={0.01}
                    value={brushWidth}
                    onChange={(e) => setBrushWidth(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </label>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => dispatch({ type: "undo" })}
                  disabled={!items.length}
                  className="flex-1 rounded-lg py-1.5 text-sm font-semibold bg-gray-100 text-slate-700 hover:bg-gray-200 disabled:opacity-40"
                >
                  ↶ Undo
                </button>
                <button
                  onClick={() => confirm(`Hapus semua gambar ${state.eye}?`) && dispatch({ type: "clear" })}
                  disabled={!items.length}
                  className="flex-1 rounded-lg py-1.5 text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40"
                >
                  Hapus {state.eye}
                </button>
              </div>
            </section>
          </div>

          {/* Right panel */}
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2 min-w-0">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Peta Fundus {state.eye} (Amsler-Dubois) — menghadap pasien
            </h2>
            <div ref={rightRef} className="w-full flex justify-center">
              {rightW > 0 && <GlobalMapCanvas size={mapSize} eye={state.eye} gaze={gaze} items={items} defs={DEFS} />}
            </div>
            <p className="text-[11px] text-slate-400">
              Lingkaran putus-putus hijau = area yang sedang dilihat lensa. N = nasal, T = temporal.
            </p>
          </section>
        </div>

        {/* Narrative */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Narasi klinis otomatis</h2>
            <button
              onClick={copy}
              disabled={!narrative}
              className={`text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors disabled:opacity-40 ${
                copied ? "bg-emerald-500 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              {copied ? "✓ Tersalin" : "Copy to Clipboard"}
            </button>
          </div>
          <textarea
            readOnly
            value={narrative || "Belum ada lesi yang digambar."}
            rows={4}
            className="w-full text-sm font-mono text-slate-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-y"
          />
        </section>
      </main>
    </div>
  );
}

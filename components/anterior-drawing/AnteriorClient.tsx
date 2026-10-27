"use client";

import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type Konva from "konva";
import lesionConfig from "@/data/anterior-drawing/lesion_config.json";
import type { Eye, Pt } from "@/lib/anterior-drawing/geometry";
import {
  GRADES,
  GROUP_LABEL,
  NORMAL_TEXT,
  buildAnteriorNarrative,
  emptyInputs,
  pterygiumResult,
  type AnteriorDef,
  type AnteriorInputs,
  type DrawnItem,
  type Group,
} from "@/lib/anterior-drawing/narrative";
import { composeImage, downloadCanvas, type ExportScope, type ImageFormat } from "@/lib/gemini-retinal/exportImage";
import { AnteriorCanvas } from "./AnteriorCanvas";

const CATEGORY_LABELS: Record<string, string> = {
  kornea: "Kornea",
  bmd_iris: "BMD & Iris",
  lensa: "Lensa & Pasca-op",
  konjungtiva_palpebra: "Konjungtiva & Palpebra",
};

const CATEGORIES = Object.entries(lesionConfig as Record<string, AnteriorDef[]>);
const DEFS: AnteriorDef[] = CATEGORIES.flatMap(([, defs]) => defs);
const LS_KEY = "anterior-drawing:v1";
const EXPORT_OPTS = { title: "Anterior Segment Drawing", subtitle: "pemeriksa menghadap pasien (slit lamp)", empty: "Belum ada temuan." };

interface State {
  eye: Eye;
  lesions: Record<Eye, DrawnItem[]>;
  inputs: Record<Eye, AnteriorInputs>;
}

function initialState(): State {
  return { eye: "OD", lesions: { OD: [], OS: [] }, inputs: { OD: emptyInputs(), OS: emptyInputs() } };
}

function normalizeState(raw: Partial<State>): State {
  const base = initialState();
  return {
    ...base,
    ...raw,
    lesions: { ...base.lesions, ...raw.lesions },
    inputs: { OD: { ...base.inputs.OD, ...raw.inputs?.OD }, OS: { ...base.inputs.OS, ...raw.inputs?.OS } },
  };
}

type Action =
  | { type: "eye"; eye: Eye }
  | { type: "add"; item: DrawnItem }
  | { type: "remove"; uid: string }
  | { type: "undo" }
  | { type: "clear" }
  | { type: "load"; state: State }
  | { type: "input"; input: AnteriorInputs };

function reducer(s: State, a: Action): State {
  const set = (items: DrawnItem[]) => ({ ...s, lesions: { ...s.lesions, [s.eye]: items } });
  switch (a.type) {
    case "eye":
      return { ...s, eye: a.eye };
    case "add":
      return set([...s.lesions[s.eye], a.item]);
    case "remove":
      return set(s.lesions[s.eye].filter((i) => i.uid !== a.uid));
    case "undo":
      return set(s.lesions[s.eye].slice(0, -1));
    case "clear":
      return { ...set([]), inputs: { ...s.inputs, [s.eye]: emptyInputs() } };
    case "load":
      return a.state;
    case "input":
      return { ...s, inputs: { ...s.inputs, [s.eye]: a.input } };
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

/** Most recent item with a point within `radius` mm of `p`. */
function nearestItem(items: DrawnItem[], p: Pt, radius: number): DrawnItem | undefined {
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].points.some((q) => Math.hypot(q.x - p.x, q.y - p.y) <= radius + (items[i].width ?? 0) / 2)) return items[i];
  }
}

export default function AnteriorClient() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [lesionId, setLesionId] = useState(DEFS[0].id);
  const [tool, setTool] = useState<"pin" | "brush" | "erase">(DEFS[0].type === "area" ? "brush" : "pin");
  const [brushWidth, setBrushWidth] = useState(1);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<ImageFormat | null>(null);
  const [exportScope, setExportScope] = useState<ExportScope>("ODS");
  const exportOd = useRef<Konva.Stage>(null);
  const exportOs = useRef<Konva.Stage>(null);
  const [hydrated, setHydrated] = useState(false);
  const [canvasRef, canvasW] = useWidth<HTMLDivElement>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) dispatch({ type: "load", state: normalizeState(JSON.parse(raw)) });
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
  const input = state.inputs[state.eye];
  const narrative = useMemo(() => buildAnteriorNarrative(state.lesions, DEFS, state.inputs), [state.lesions, state.inputs]);
  const def = DEFS.find((d) => d.id === lesionId)!;
  const pupilSize = (eye: Eye) => Number(state.inputs[eye].pupilSize.replace(",", ".")) || undefined;

  const pickLesion = (id: string) => {
    setLesionId(id);
    const d = DEFS.find((x) => x.id === id);
    if (d) setTool(d.type === "area" ? "brush" : "pin");
  };

  const addPin = (p: Pt) => dispatch({ type: "add", item: { uid: uid(), lesionId, kind: "pin", points: [p] } });
  const addStroke = (pts: Pt[]) =>
    dispatch({
      type: "add",
      item:
        pts.length === 1 || def.type !== "area"
          ? { uid: uid(), lesionId, kind: pts.length === 1 ? "pin" : "stroke", points: pts }
          : { uid: uid(), lesionId, kind: "stroke", points: pts, width: brushWidth },
    });
  const erase = (p: Pt) => {
    const hit = nearestItem(items, p, 1);
    if (hit) dispatch({ type: "remove", uid: hit.uid });
  };

  useEffect(() => {
    if (!exporting) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const eyes: Eye[] = exportScope === "ODS" ? ["OD", "OS"] : [exportScope];
        const maps = eyes.map((eye) => ({ eye, canvas: (eye === "OD" ? exportOd : exportOs).current?.toCanvas({ pixelRatio: 1 }) }));
        if (maps.every((m) => m.canvas)) {
          const text = buildAnteriorNarrative(state.lesions, DEFS, state.inputs, eyes);
          const when = new Date();
          downloadCanvas(
            composeImage(maps as { eye: Eye; canvas: HTMLCanvasElement }[], text, when, EXPORT_OPTS),
            exporting,
            exportScope,
            when,
            "anterior-segment"
          );
        }
        setExporting(null);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [exporting, exportScope, state.lesions, state.inputs]);

  const copy = () =>
    navigator.clipboard.writeText(narrative).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  const canvasSize = Math.max(280, Math.min(canvasW, 640));
  const setInput = (patch: Partial<AnteriorInputs>) => dispatch({ type: "input", input: { ...input, ...patch } });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4 flex-wrap">
          <Link href="/" className="text-teal-600 text-sm font-medium hover:underline">
            ← Kembali
          </Link>
          <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
            Anterior Segment Drawing
          </h1>
          <div className="flex gap-1 ml-auto">
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
          Gambar langsung seperti yang terlihat di slit lamp (pemeriksa menghadap pasien). Posisi jam, zona kornea, dan
          ukuran (mm) dihitung otomatis. Hipopion/hifema: klik tinggi permukaan cairan.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2 min-w-0">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Segmen anterior {state.eye}</h2>
            <div ref={canvasRef} className="w-full flex justify-center">
              {canvasW > 0 && (
                <AnteriorCanvas
                  size={canvasSize}
                  eye={state.eye}
                  items={items}
                  defs={DEFS}
                  pupilSize={pupilSize(state.eye)}
                  tool={tool}
                  brushWidth={brushWidth}
                  onPin={addPin}
                  onStroke={addStroke}
                  onErase={erase}
                />
              )}
            </div>
            <p className="text-[11px] text-slate-400">N = nasal, T = temporal. Angka = posisi jam.</p>
          </section>

          <div className="flex flex-col gap-4 min-w-0">
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
              <div className="flex gap-1.5">
                {(["pin", "brush", "erase"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTool(t)}
                    className={`flex-1 rounded-lg py-1.5 text-sm font-semibold ${
                      tool === t ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                    }`}
                  >
                    {t === "pin" ? "📍 Pin" : t === "brush" ? "🖌️ Brush" : "⌫ Hapus"}
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
                  Ukuran brush ({brushWidth.toLocaleString("id-ID")} mm)
                  <input
                    type="range"
                    min={0.3}
                    max={3}
                    step={0.1}
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
                  onClick={() => confirm(`Hapus semua gambar & isian ${state.eye}?`) && dispatch({ type: "clear" })}
                  className="flex-1 rounded-lg py-1.5 text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Reset {state.eye}
                </button>
              </div>
            </section>

            <ExamPanel eye={state.eye} input={input} items={items} onChange={setInput} />
          </div>
        </div>

        {exporting && (
          <div aria-hidden style={{ position: "fixed", left: -10000, top: 0 }}>
            {(exportScope === "ODS" ? (["OD", "OS"] as Eye[]) : [exportScope]).map((e) => (
              <AnteriorCanvas
                key={e}
                size={700}
                eye={e}
                items={state.lesions[e]}
                defs={DEFS}
                pupilSize={pupilSize(e)}
                stageRef={e === "OD" ? exportOd : exportOs}
              />
            ))}
          </div>
        )}

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="mr-auto text-xs font-semibold text-slate-500 uppercase tracking-wide">Narasi klinis otomatis</h2>
            <button
              onClick={copy}
              disabled={!narrative}
              className={`text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors disabled:opacity-40 ${
                copied ? "bg-emerald-500 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              {copied ? "✓ Tersalin" : "Copy to Clipboard"}
            </button>
            <div className="flex rounded-xl border border-teal-600 overflow-hidden text-sm font-semibold" role="group" aria-label="Mata yang disimpan">
              {(["ODS", "OD", "OS"] as ExportScope[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setExportScope(s)}
                  disabled={!!exporting}
                  aria-pressed={exportScope === s}
                  className={`px-2.5 py-1.5 ${exportScope === s ? "bg-teal-600 text-white" : "text-teal-700 hover:bg-teal-50"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {(["png", "jpeg"] as ImageFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setExporting(f)}
                disabled={!!exporting}
                className="text-sm font-semibold px-3 py-1.5 rounded-xl border border-teal-600 text-teal-700 hover:bg-teal-50 disabled:opacity-40"
              >
                {exporting === f ? "Menyimpan…" : `Simpan ${f === "png" ? "PNG" : "JPEG"} (${exportScope})`}
              </button>
            ))}
          </div>
          <textarea
            readOnly
            value={narrative || "Belum ada temuan."}
            rows={4}
            className="w-full text-sm font-mono text-slate-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-y"
          />
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-0.5 text-xs text-slate-500">
      {label}
      {children}
    </label>
  );
}

const SELECT = "text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500";

function Select<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className={SELECT}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o || "—"}
        </option>
      ))}
    </select>
  );
}

function ExamPanel({
  eye,
  input,
  items,
  onChange,
}: {
  eye: Eye;
  input: AnteriorInputs;
  items: DrawnItem[];
  onChange: (p: Partial<AnteriorInputs>) => void;
}) {
  const pt = pterygiumResult(items, input);
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3" data-testid="exam-panel">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Isian pemeriksaan {eye}</h2>
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1">Normal (dicentang bila sudah diperiksa dan tidak ada lesi)</p>
        <div className="grid grid-cols-2 gap-1">
          {(Object.keys(NORMAL_TEXT) as Group[]).map((g) => (
            <label key={g} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="accent-emerald-600"
                checked={!!input.normal[g]}
                onChange={(e) => onChange({ normal: { ...input.normal, [g]: e.target.checked } })}
              />
              {GROUP_LABEL[g]}: {NORMAL_TEXT[g]}
            </label>
          ))}
        </div>
      </div>
      {pt && (
        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-2 flex flex-col gap-1.5" data-testid="pterygium-panel">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Pterigium</span>
            <span className="text-sm font-bold px-2.5 py-0.5 rounded-full border bg-white border-rose-300 text-rose-800" data-testid="pterygium-grade">
              Derajat {pt.final}
            </span>
            <span className="text-xs text-slate-500">
              otomatis: {pt.grade}, invasi ±{pt.invasionMm.toLocaleString("id-ID", { maximumFractionDigits: 1 })} mm
            </span>
          </div>
          <Field label="Koreksi derajat">
            <select
              value={input.pterygiumGrade}
              onChange={(e) => onChange({ pterygiumGrade: e.target.value as AnteriorInputs["pterygiumGrade"] })}
              className={SELECT}
            >
              <option value="">Otomatis ({pt.grade})</option>
              {(["I", "II", "III", "IV"] as const).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <p className="text-[11px] text-slate-400">
            I: di limbus · II: ≤2 mm melewati limbus · III: &gt;2 mm, belum mencapai tepi pupil · IV: mencapai/melewati tepi pupil
          </p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <Field label="BMD">
          <Select value={input.depth} options={["", "dalam", "dangkal"] as const} onChange={(v) => onChange({ depth: v })} />
        </Field>
        <Field label="Sel (SUN)">
          <Select value={input.cells} options={GRADES} onChange={(v) => onChange({ cells: v })} />
        </Field>
        <Field label="Flare (SUN)">
          <Select value={input.flare} options={GRADES} onChange={(v) => onChange({ flare: v })} />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Pupil">
          <Select value={input.pupilShape} options={["", "bulat", "irreguler"] as const} onChange={(v) => onChange({ pupilShape: v })} />
        </Field>
        <Field label="Diameter (mm)">
          <input
            inputMode="decimal"
            value={input.pupilSize}
            onChange={(e) => onChange({ pupilSize: e.target.value.replace(/[^0-9.,]/g, "") })}
            className={SELECT}
          />
        </Field>
        <Field label="Refleks cahaya">
          <Select value={input.reflex} options={["", "+", "lambat", "-", "RAPD +"] as const} onChange={(v) => onChange({ reflex: v })} />
        </Field>
      </div>
      <Field label="Lensa">
        <Select value={input.lens} options={["", "jernih", "katarak", "pseudofakia", "afakia"] as const} onChange={(v) => onChange({ lens: v })} />
      </Field>
      {input.lens === "katarak" && (
        <div className="grid grid-cols-3 gap-2">
          <Field label="NO (1–6)">
            <Select value={input.no} options={["", "1", "2", "3", "4", "5", "6"]} onChange={(v) => onChange({ no: v })} />
          </Field>
          <Field label="C (1–5)">
            <Select value={input.c} options={["", "1", "2", "3", "4", "5"]} onChange={(v) => onChange({ c: v })} />
          </Field>
          <Field label="P (1–5)">
            <Select value={input.p} options={["", "1", "2", "3", "4", "5"]} onChange={(v) => onChange({ p: v })} />
          </Field>
        </div>
      )}
      {input.lens === "pseudofakia" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Posisi IOL">
            <Select value={input.iol} options={["", "in the bag", "sulkus", "BMD (AC IOL)"] as const} onChange={(v) => onChange({ iol: v })} />
          </Field>
          <Field label="Sentrasi">
            <Select value={input.iolCentered} options={["", "sentral", "desentrasi"] as const} onChange={(v) => onChange({ iolCentered: v })} />
          </Field>
        </div>
      )}
    </section>
  );
}

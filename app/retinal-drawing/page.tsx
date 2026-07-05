"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ── Amsler-Dubois color/lesion taxonomy ──────────────────────────────────────
type LesionColor = "merah" | "biru" | "hijau" | "coklat" | "kuning" | "hitam";

const COLOR_HEX: Record<LesionColor, string> = {
  merah: "#dc2626",
  biru: "#2563eb",
  hijau: "#16a34a",
  coklat: "#92400e",
  kuning: "#ca8a04",
  hitam: "#171717",
};

const COLOR_LABEL: Record<LesionColor, string> = {
  merah: "Merah",
  biru: "Biru",
  hijau: "Hijau",
  coklat: "Coklat",
  kuning: "Kuning",
  hitam: "Hitam",
};

const LESION_TYPES: Record<LesionColor, string[]> = {
  merah: [
    "Perdarahan (preretinal/intraretinal)",
    "Retina attached",
    "Arteriol retina",
    "Neovaskularisasi",
    "Vascular abnormalities/anomalies",
    "Vascular tumors",
    "Bagian terbuka robekan retina (tears/holes)",
    "Bagian terbuka outer layer holes (retinoschisis)",
    "Bagian terbuka retinal holes inner layer (retinoschisis)",
    "Giant Retinal Tear (GRT)/large dialyses",
    "Area retina tipis (bagian dalam)",
    "Neovaskularisasi elevated",
    "Subhyaloid hemorrhage",
    "Macular edema",
  ],
  biru: [
    "Retina detached",
    "Vena retina",
    "Outline robekan retina",
    "Inner layer retinoschisis",
    "Outline lattice degeneration",
    "Outline area retina tipis",
    "Outline ora serrata",
    "Outline perubahan area/lipatan retina detached",
    "Detached pars plana epithelium",
    "White with/without pressure",
    "Rolled edges of retinal tears",
    "Cystoid degeneration",
    "Outline neovaskularisasi flat",
  ],
  hijau: [
    "Opasitas media",
    "Perdarahan vitreous",
    "Membran vitreous",
    "Hyaloid ring",
    "Intraocular foreign body (IOFB)",
    "Asteroid hyalosis",
    "Frosting/snowflakes (cystoid degeneration)",
    "Retinoschisis/lattice degeneration",
    "Outline neovaskularisasi elevated",
  ],
  coklat: [
    "Jaringan uveal",
    "Pigmen di bawah retina detached",
    "Pigment epithelial detachment (PED)",
    "Malignant choroidal melanoma",
    "Choroidal detachment",
    "Outline posterior staphyloma",
  ],
  kuning: [
    "Eksudat keras intraretinal/subretinal",
    "Deposit RPE",
    "Edema retina post cryo/laser",
    "Drusen",
    "Venous sheathing",
  ],
  hitam: [
    "Hiperpigmentasi (post cryo/diathermy)",
    "Sclerosed vessels",
    "Pigmen di retina detached",
    "Pigmented demarcation lines",
  ],
};

interface Lesion {
  id: string;
  color: LesionColor;
  type: string;
  clockStart: number;
  clockEnd: number;
  distance: string;
  size: string;
  notes: string;
}

interface Stroke {
  points: { x: number; y: number }[];
}

// ── Geometry helpers ──────────────────────────────────────────────────────────
const CANVAS_SIZE = 560;
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;
const R_OUTER = 250; // junction pars plana-plicata
const R_MID = 195; // ora serrata
const R_INNER = 135; // ekuator
const R_LESION = (R_MID + R_OUTER) / 2;

function clockToAngleRad(hour: number): number {
  const h = ((hour - 1 + 12) % 12) + 1; // normalize 1-12
  return ((h % 12) * 30 - 90) * (Math.PI / 180);
}

function polar(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

// ── Summary text ──────────────────────────────────────────────────────────────
function lesionSentence(l: Lesion): string {
  const jam = l.clockStart === l.clockEnd ? `jam ${l.clockStart}` : `jam ${l.clockStart}-${l.clockEnd}`;
  const parts = [`${l.type} ${jam}`];
  if (l.distance) parts.push(`${l.distance} dari ora`);
  if (l.size) parts.push(`ukuran ${l.size}`);
  if (l.notes) parts.push(l.notes);
  return parts.join(", ");
}

function buildSummaryText(lesions: Lesion[]): string {
  if (lesions.length === 0) return "";
  return `Retina: ${lesions.map(lesionSentence).join(". ")}.`;
}

// ── Small UI helpers (konsisten dgn SoapMataClient) ──────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{children}</label>;
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

// ── Main client component ────────────────────────────────────────────────────
function RetinalDrawingInner() {
  const searchParams = useSearchParams();
  const [eye, setEye] = useState<"OD" | "OS">(() => (searchParams.get("eye") === "OS" ? "OS" : "OD"));
  const [session] = useState<string>(() => searchParams.get("session") || String(Date.now()));

  const [lesions, setLesions] = useState<Lesion[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [saved, setSaved] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);

  // form state
  const [color, setColor] = useState<LesionColor>("merah");
  const [type, setType] = useState(LESION_TYPES.merah[0]);
  const [clockStart, setClockStart] = useState("12");
  const [clockEnd, setClockEnd] = useState("12");
  const [distance, setDistance] = useState("");
  const [size, setSize] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setCanGoBack(typeof window !== "undefined" && !!window.opener);
  }, []);

  const handleColorChange = (v: string) => {
    const c = v as LesionColor;
    setColor(c);
    setType(LESION_TYPES[c][0]);
  };

  const addLesion = () => {
    const newLesion: Lesion = {
      id: `lesion-${Date.now()}`,
      color,
      type,
      clockStart: Number(clockStart),
      clockEnd: Number(clockEnd),
      distance,
      size,
      notes,
    };
    setLesions((prev) => [...prev, newLesion]);
    setDistance("");
    setSize("");
    setNotes("");
  };

  const removeLesion = (id: string) => {
    setLesions((prev) => prev.filter((l) => l.id !== id));
  };

  // ── Canvas drawing ──────────────────────────────────────────────────────
  const drawBase = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 3 concentric circles
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    [R_INNER, R_MID, R_OUTER].forEach((r) => {
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 12 radial spokes
    ctx.strokeStyle = "#e2e8f0";
    for (let h = 1; h <= 12; h++) {
      const ang = clockToAngleRad(h);
      const p1 = polar(CX, CY, R_INNER, ang);
      const p2 = polar(CX, CY, R_OUTER, ang);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Roman numeral labels — dirotasi 180° (posisi_tampak = (posisi_asli+6) mod 12)
    // sesuai konvensi "seperti tampak di condensing lens"
    const roman = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
    ctx.fillStyle = "#475569";
    ctx.font = "13px 'DM Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let slot = 1; slot <= 12; slot++) {
      const displayHour = ((slot + 6 - 1) % 12) + 1;
      const label = roman[displayHour - 1];
      const ang = clockToAngleRad(slot);
      const p = polar(CX, CY, R_OUTER + 20, ang);
      ctx.fillText(label, p.x, p.y);
    }

    // Macula (pusat)
    ctx.fillStyle = "#b45309";
    ctx.beginPath();
    ctx.arc(CX, CY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Optic disc — offset nasal, mirror antara OD/OS
    // Konvensi: OD -> disc di sisi KANAN makula, OS -> disc di sisi KIRI makula
    const discDx = eye === "OD" ? 42 : -42;
    ctx.fillStyle = "#fef3c7";
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(CX + discDx, CY - 4, 16, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }, [eye]);

  const drawLesions = useCallback((ctx: CanvasRenderingContext2D) => {
    lesions.forEach((l) => {
      const hex = COLOR_HEX[l.color];
      ctx.strokeStyle = hex;
      ctx.fillStyle = hex;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";

      if (l.clockStart === l.clockEnd) {
        const p = polar(CX, CY, R_LESION, clockToAngleRad(l.clockStart));
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        // arc band dari clockStart ke clockEnd, searah jarum jam
        let a1 = clockToAngleRad(l.clockStart);
        let a2 = clockToAngleRad(l.clockEnd);
        if (a2 <= a1) a2 += Math.PI * 2;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(CX, CY, R_LESION, a1, a2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
  }, [lesions]);

  const drawFreehand = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokes.forEach((s) => {
      if (s.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      s.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  }, [strokes]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawBase(ctx);
    drawLesions(ctx);
    drawFreehand(ctx);
  }, [drawBase, drawLesions, drawFreehand]);

  useEffect(() => {
    redrawAll();
  }, [redrawAll]);

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);
    if (tool === "eraser") {
      // hapus stroke terdekat dari titik klik
      let nearestIdx = -1;
      let nearestDist = 20; // radius toleransi
      strokes.forEach((s, idx) => {
        s.points.forEach((p) => {
          const d = Math.hypot(p.x - pos.x, p.y - pos.y);
          if (d < nearestDist) {
            nearestDist = d;
            nearestIdx = idx;
          }
        });
      });
      if (nearestIdx >= 0) {
        setStrokes((prev) => prev.filter((_, i) => i !== nearestIdx));
      }
      return;
    }
    drawingRef.current = true;
    currentStrokeRef.current = [pos];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || tool !== "pencil") return;
    const pos = getCanvasPos(e);
    currentStrokeRef.current.push(pos);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      redrawAll();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      const pts = currentStrokeRef.current;
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    if (drawingRef.current && currentStrokeRef.current.length > 1) {
      setStrokes((prev) => [...prev, { points: currentStrokeRef.current }]);
    }
    drawingRef.current = false;
    currentStrokeRef.current = [];
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setStrokes([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const sketchDataUrl = canvas ? canvas.toDataURL("image/png") : "";
    const summaryText = buildSummaryText(lesions);
    const payload = {
      eye,
      updatedAt: new Date().toISOString(),
      lesions,
      sketchDataUrl,
      summaryText,
    };
    try {
      localStorage.setItem(`retinal-drawing:${session}:${eye}`, JSON.stringify(payload));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (canGoBack) {
      setTimeout(() => window.close(), 400);
    }
  };

  const summaryPreview = buildSummaryText(lesions);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-100 shadow-sm px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/" className="text-teal-600 hover:text-teal-800 text-sm font-medium shrink-0">
          ← Kembali
        </Link>
        <h1 className="text-base font-bold text-slate-900 flex-1" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
          Retinal Drawing — {eye}
        </h1>
        {!searchParams.get("eye") && (
          <div className="flex gap-1">
            {(["OD", "OS"] as const).map((e) => (
              <button
                key={e}
                onClick={() => setEye(e)}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
                  eye === e ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={handleSave}
          className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
            saved ? "bg-emerald-500 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
          }`}
        >
          {saved ? "✓ Tersimpan" : "Simpan & Kembali ke SOAP"}
        </button>
      </header>

      <div className="max-w-6xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[560px_1fr] gap-6">
        {/* ── Kanvas ── */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setTool("pencil")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  tool === "pencil" ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-600"
                }`}
              >
                ✏️ Pensil
              </button>
              <button
                onClick={() => setTool("eraser")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                  tool === "eraser" ? "bg-teal-600 text-white" : "bg-gray-100 text-slate-600"
                }`}
              >
                🧽 Hapus Sketsa
              </button>
              <button onClick={handleUndo} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-slate-600 hover:bg-gray-200">
                ↩️ Undo
              </button>
              <button onClick={handleClearAll} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-slate-600 hover:bg-gray-200">
                🗑️ Clear Sketsa
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="w-full h-auto border border-gray-200 rounded-lg touch-none cursor-crosshair"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
            <p className="text-xs text-slate-400 mt-2">
              Diagram digambar seperti tampak di condensing lens (terbalik dari orientasi fundus asli). Pensil: gambar bebas. Hapus Sketsa: klik dekat garis untuk menghapusnya.
            </p>
          </div>

          <SectionCard title="Ringkasan Otomatis">
            <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-3 min-h-16">
              {summaryPreview || <span className="text-slate-400 italic">Belum ada lesi ditambahkan...</span>}
            </p>
          </SectionCard>
        </div>

        {/* ── Form ── */}
        <div className="space-y-4">
          <SectionCard title="Tambah Lesi (Standar Amsler-Dubois)">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Warna / Kategori</Label>
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(COLOR_HEX) as LesionColor[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => handleColorChange(c)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border ${
                        color === c ? "border-teal-500 bg-teal-50 font-semibold" : "border-gray-200"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLOR_HEX[c] }} />
                      {COLOR_LABEL[c]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label>Jenis Lesi</Label>
              <Select value={type} onChange={setType} options={LESION_TYPES[color]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Jam Mulai</Label>
                <Select value={clockStart} onChange={setClockStart} options={Array.from({ length: 12 }, (_, i) => String(i + 1))} />
              </div>
              <div>
                <Label>Jam Akhir (opsional, utk rentang)</Label>
                <Select value={clockEnd} onChange={setClockEnd} options={Array.from({ length: 12 }, (_, i) => String(i + 1))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Jarak dari Ora/Disc</Label>
                <TextInput value={distance} onChange={setDistance} placeholder="mis. 1 DD" />
              </div>
              <div>
                <Label>Ukuran</Label>
                <TextInput value={size} onChange={setSize} placeholder="mis. 1 DD" />
              </div>
            </div>
            <div>
              <Label>Catatan Tambahan</Label>
              <TextInput value={notes} onChange={setNotes} placeholder="Catatan bebas (opsional)" />
            </div>
            <button
              onClick={addLesion}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              + Tambah Lesi
            </button>
          </SectionCard>

          <SectionCard title={`Daftar Lesi (${lesions.length})`}>
            {lesions.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Belum ada lesi ditambahkan.</p>
            ) : (
              <div className="space-y-2">
                {lesions.map((l) => (
                  <div key={l.id} className="flex items-start justify-between gap-2 border border-gray-100 rounded-lg p-2.5">
                    <div className="flex items-start gap-2">
                      <span className="w-3 h-3 rounded-full inline-block mt-1 shrink-0" style={{ background: COLOR_HEX[l.color] }} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{l.type}</p>
                        <p className="text-xs text-slate-500">{lesionSentence(l)}</p>
                      </div>
                    </div>
                    <button onClick={() => removeLesion(l.id)} className="text-xs text-red-500 hover:text-red-700 shrink-0">
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {canGoBack ? (
            <p className="text-xs text-slate-400 text-center">Tab ini akan tertutup otomatis setelah menyimpan.</p>
          ) : (
            <Link href="/soap-mata" className="block text-center text-sm text-teal-600 hover:text-teal-800 font-medium">
              ← Kembali ke SOAP Mata
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RetinalDrawingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <RetinalDrawingInner />
    </Suspense>
  );
}

"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";

// ── Design tokens (bright theme) ─────────────────────────────────────────────
const C = {
  bg: "#f8fafc",
  panel: "#ffffff",
  panel2: "#f1f5f9",
  border: "#e2e8f0",
  accent: "#0d9488",
  accentDim: "rgba(13,148,136,0.10)",
  text: "#0f172a",
  textDim: "#475569",
  textFaint: "#94a3b8",
  error: "#dc2626",
  errorBg: "rgba(220,38,38,0.08)",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface TaperingStep {
  id: number;
  durasi: number;
  dosis: number;
  frekuensi: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateStr: string, days: number): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return dt;
}

function formatTanggal(dt: Date): string {
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function breakdownTablet(doseMg: number): { n16: number; n8: number; n4: number } {
  const n16 = Math.floor(doseMg / 16);
  let sisa = doseMg % 16;
  const n8 = Math.floor(sisa / 8);
  sisa = sisa % 8;
  const n4 = sisa / 4;
  return { n16, n8, n4 };
}

interface ScheduleLine {
  mulai: Date;
  akhir: Date;
  frekuensi: number;
  dosis: number;
  isLast: boolean;
}

function buildSchedule(tanggalMulai: string, steps: TaperingStep[]): ScheduleLine[] {
  const lines: ScheduleLine[] = [];
  let cursor = tanggalMulai;
  steps.forEach((step, idx) => {
    const mulai = addDays(cursor, 0);
    const akhir = addDays(cursor, step.durasi - 1);
    lines.push({ mulai, akhir, frekuensi: step.frekuensi, dosis: step.dosis, isLast: idx === steps.length - 1 });
    cursor = formatISO(addDays(cursor, step.durasi));
  });
  return lines;
}

function formatISO(dt: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function buildJadwalText(lines: ScheduleLine[], tanggalKontrol: Date): string {
  const rows = lines.map((l) => {
    const suffix = l.isLast ? ", lalu stop" : "";
    return `* ${formatTanggal(l.mulai)} - ${formatTanggal(l.akhir)} : ${l.frekuensi}x${l.dosis} mg${suffix}`;
  });
  rows.push(`\nKontrol: ${formatTanggal(tanggalKontrol)}`);
  return rows.join("\n");
}

interface ResepRow { label: string; total: number; stok: number; perlu: number }
interface StokSisa { s16: number; s8: number; s4: number }

function buildResep(steps: TaperingStep[], stok: StokSisa): ResepRow[] {
  let total16 = 0, total8 = 0, total4 = 0;
  for (const s of steps) {
    const bd = breakdownTablet(s.dosis);
    total16 += bd.n16 * s.frekuensi * s.durasi;
    total8  += bd.n8  * s.frekuensi * s.durasi;
    total4  += bd.n4  * s.frekuensi * s.durasi;
  }
  const rows: ResepRow[] = [];
  if (total16 > 0) rows.push({ label: "16 mg", total: total16, stok: stok.s16, perlu: Math.max(0, total16 - stok.s16) });
  if (total8  > 0) rows.push({ label: "8 mg",  total: total8,  stok: stok.s8,  perlu: Math.max(0, total8  - stok.s8)  });
  if (total4  > 0) rows.push({ label: "4 mg",  total: total4,  stok: stok.s4,  perlu: Math.max(0, total4  - stok.s4)  });
  return rows;
}

// ── Default steps ─────────────────────────────────────────────────────────────
const DEFAULT_STEPS: TaperingStep[] = [
  { id: 1, durasi: 5, dosis: 48, frekuensi: 1 },
  { id: 2, durasi: 5, dosis: 16, frekuensi: 2 },
  { id: 3, durasi: 5, dosis: 16, frekuensi: 1 },
  { id: 4, durasi: 5, dosis: 8,  frekuensi: 1 },
];

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', system-ui, sans-serif" } as React.CSSProperties,
  topbar: { background: C.panel, borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 16, position: "sticky" as const, top: 0, zIndex: 10 } as React.CSSProperties,
  backLink: { color: C.accent, fontSize: 14, fontWeight: 500, textDecoration: "none" } as React.CSSProperties,
  topTitle: { color: C.text, fontSize: 15, fontWeight: 700, fontFamily: "'Fraunces', serif" } as React.CSSProperties,
  main: { maxWidth: 1100, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 } as React.CSSProperties,
  mainMobile: { gridTemplateColumns: "1fr" } as React.CSSProperties,
  card: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 0 } as React.CSSProperties,
  sectionTitle: { fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: C.accent, marginBottom: 16, marginTop: 0 } as React.CSSProperties,
  label: { display: "block", fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 },
  input: { width: "100%", background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "'DM Sans', sans-serif", fontSize: 15, padding: "10px 14px", outline: "none", boxSizing: "border-box" as const },
  inputError: { borderColor: C.error },
  errorText: { color: C.error, fontSize: 12, marginTop: 4 },
  stepCard: { background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 12 } as React.CSSProperties,
  stepHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } as React.CSSProperties,
  stepLabel: { fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase" as const, letterSpacing: "0.06em" },
  deleteBtn: { background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.error, cursor: "pointer", fontSize: 14, padding: "4px 10px" } as React.CSSProperties,
  fieldRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } as React.CSSProperties,
  addBtn: { width: "100%", background: C.accentDim, border: `1px dashed ${C.accent}`, borderRadius: 10, color: C.accent, cursor: "pointer", fontSize: 14, fontWeight: 600, padding: "11px", marginTop: 4 } as React.CSSProperties,
  outputCard: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column" as const, gap: 20 } as React.CSSProperties,
  outputHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" } as React.CSSProperties,
  copyBtn: { background: C.accent, border: "none", borderRadius: 8, color: C.bg, cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "8px 18px" } as React.CSSProperties,
  copyBtnDone: { background: "#16a34a" } as React.CSSProperties,
  jadwalPre: { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", fontFamily: "'DM Mono', monospace", fontSize: 13.5, color: C.text, whiteSpace: "pre-wrap" as const, lineHeight: 1.8, margin: 0 },
  divider: { border: "none", borderTop: `1px solid ${C.border}`, margin: "4px 0" },
  resepTitle: { fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 12, marginTop: 0 },
  table: { width: "100%", borderCollapse: "collapse" as const, fontFamily: "'DM Mono', monospace", fontSize: 14 },
  th: { textAlign: "left" as const, fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase" as const, letterSpacing: "0.06em", padding: "6px 12px", borderBottom: `1px solid ${C.border}` },
  td: { padding: "10px 12px", color: C.text, borderBottom: `1px solid rgba(13,148,136,0.08)` },
  tdNum: { padding: "10px 12px", color: C.accent, fontWeight: 500, borderBottom: `1px solid rgba(13,148,136,0.08)` },
  emptyState: { color: C.textFaint, fontSize: 14, textAlign: "center" as const, padding: "32px 0", fontStyle: "italic" },
  validErr: { background: C.errorBg, border: `1px solid ${C.error}`, borderRadius: 10, padding: "12px 16px", color: C.error, fontSize: 13, fontWeight: 500, marginBottom: 8 },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function TaperingMPClient() {
  const [tanggalMulai, setTanggalMulai] = useState(todayISO);
  const [steps, setSteps] = useState<TaperingStep[]>(DEFAULT_STEPS);
  const [copied, setCopied] = useState(false);
  const [nextId, setNextId] = useState(5);
  const [stok, setStok] = useState<StokSisa>({ s16: 0, s8: 0, s4: 0 });

  const errors = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of steps) {
      if (s.dosis <= 0 || s.dosis % 4 !== 0) map[s.id] = "Dosis harus kelipatan 4 mg";
      if (s.durasi <= 0) map[s.id] = (map[s.id] ? map[s.id] + "; " : "") + "Durasi harus > 0";
    }
    return map;
  }, [steps]);

  const hasErrors = Object.keys(errors).length > 0;

  const { jadwalText, resepRows, tanggalKontrol } = useMemo(() => {
    if (hasErrors || !tanggalMulai || steps.length === 0) {
      return { jadwalText: "", resepRows: [], tanggalKontrol: null };
    }
    const lines = buildSchedule(tanggalMulai, steps);
    const lastLine = lines[lines.length - 1];
    const kontrol = new Date(lastLine.akhir);
    kontrol.setDate(kontrol.getDate() + 1);
    const text = buildJadwalText(lines, kontrol);
    const resep = buildResep(steps, stok);
    return { jadwalText: text, resepRows: resep, tanggalKontrol: kontrol };
  }, [tanggalMulai, steps, hasErrors, stok]);

  const updateStep = useCallback((id: number, field: keyof TaperingStep, value: number) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }, []);

  const addStep = useCallback(() => {
    setSteps((prev) => [...prev, { id: nextId, durasi: 5, dosis: 16, frekuensi: 1 }]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const removeStep = useCallback((id: number) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(jadwalText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={S.page}>
      {/* Top bar */}
      <div style={S.topbar}>
        <Link href="/" style={S.backLink}>← Kembali</Link>
        <span style={S.topTitle}>Tapering MP</span>
      </div>

      {/* Main grid */}
      <div style={S.main}>
        {/* ── Left: Form ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Header */}
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
              Tapering MP
            </h1>
            <p style={{ color: C.textDim, fontSize: 14, margin: 0 }}>
              Kalkulator tapering off methylprednisolone oral
            </p>
          </div>

          {/* Tanggal mulai */}
          <div style={S.card}>
            <p style={S.sectionTitle}>Tanggal Mulai</p>
            <label style={S.label}>Tanggal mulai tapering</label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              style={S.input}
            />
          </div>

          {/* Stok sisa */}
          <div style={S.card}>
            <p style={S.sectionTitle}>Stok Obat Tersisa (Opsional)</p>
            <p style={{ color: C.textDim, fontSize: 13, margin: "0 0 12px" }}>
              Isi jika pasien masih punya sisa tablet — jumlah resep akan otomatis dikurangi supaya lebih ekonomis.
            </p>
            <div style={S.fieldRow}>
              <div>
                <label style={S.label}>Sisa 16 mg</label>
                <input
                  type="number"
                  min={0}
                  value={stok.s16}
                  onChange={(e) => setStok((s) => ({ ...s, s16: Math.max(0, Number(e.target.value)) }))}
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Sisa 8 mg</label>
                <input
                  type="number"
                  min={0}
                  value={stok.s8}
                  onChange={(e) => setStok((s) => ({ ...s, s8: Math.max(0, Number(e.target.value)) }))}
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Sisa 4 mg</label>
                <input
                  type="number"
                  min={0}
                  value={stok.s4}
                  onChange={(e) => setStok((s) => ({ ...s, s4: Math.max(0, Number(e.target.value)) }))}
                  style={S.input}
                />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={S.card}>
            <p style={S.sectionTitle}>Jadwal Tapering</p>

            {steps.map((step, idx) => (
              <div key={step.id} style={S.stepCard}>
                <div style={S.stepHeader}>
                  <span style={S.stepLabel}>Step {idx + 1}{idx === steps.length - 1 ? " — lalu stop" : ""}</span>
                  {steps.length > 1 && (
                    <button onClick={() => removeStep(step.id)} style={S.deleteBtn}>✕ Hapus</button>
                  )}
                </div>
                <div style={S.fieldRow}>
                  <div>
                    <label style={S.label}>Durasi (hari)</label>
                    <input
                      type="number"
                      min={1}
                      value={step.durasi}
                      onChange={(e) => updateStep(step.id, "durasi", Number(e.target.value))}
                      style={{ ...S.input }}
                    />
                  </div>
                  <div>
                    <label style={S.label}>Dosis (mg/pemberian)</label>
                    <input
                      type="number"
                      min={4}
                      step={4}
                      value={step.dosis}
                      onChange={(e) => updateStep(step.id, "dosis", Number(e.target.value))}
                      style={{ ...S.input, ...(errors[step.id] ? S.inputError : {}) }}
                    />
                    {errors[step.id] && <p style={S.errorText}>{errors[step.id]}</p>}
                  </div>
                  <div>
                    <label style={S.label}>Frekuensi/hari</label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={step.frekuensi}
                      onChange={(e) => updateStep(step.id, "frekuensi", Number(e.target.value))}
                      style={{ ...S.input }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addStep} style={S.addBtn}>+ Tambah Step</button>
          </div>
        </div>

        {/* ── Right: Output ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ height: 66 }} /> {/* spacer untuk sejajar dengan tanggal */}

          <div style={S.outputCard}>
            {/* Jadwal tapering */}
            <div>
              <div style={S.outputHeader}>
                <p style={{ ...S.sectionTitle, marginBottom: 0 }}>Jadwal Tapering</p>
                {!hasErrors && jadwalText && (
                  <button
                    onClick={handleCopy}
                    style={{ ...S.copyBtn, ...(copied ? S.copyBtnDone : {}) }}
                  >
                    {copied ? "✓ Tersalin" : "Copy"}
                  </button>
                )}
              </div>

              {hasErrors ? (
                <div style={{ ...S.validErr, marginTop: 14 }}>
                  Perbaiki error pada form sebelum melihat output.
                </div>
              ) : jadwalText ? (
                <pre style={{ ...S.jadwalPre, marginTop: 14 }}>{jadwalText}</pre>
              ) : (
                <p style={{ ...S.emptyState, marginTop: 14 }}>Output akan muncul di sini...</p>
              )}
            </div>

            <hr style={S.divider} />

            {/* Rincian resep */}
            <div>
              <p style={S.resepTitle}>Rincian Resep</p>
              {!hasErrors && resepRows.length > 0 ? (
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Kekuatan</th>
                      <th style={{ ...S.th, textAlign: "right" }}>Kebutuhan</th>
                      <th style={{ ...S.th, textAlign: "right" }}>Stok</th>
                      <th style={{ ...S.th, textAlign: "right" }}>Perlu diresepkan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resepRows.map((r) => (
                      <tr key={r.label}>
                        <td style={S.td}>Methylprednisolone {r.label}</td>
                        <td style={{ ...S.td, textAlign: "right" }}>{r.total} tab</td>
                        <td style={{ ...S.td, textAlign: "right" }}>{r.stok > 0 ? `${r.stok} tab` : "—"}</td>
                        <td style={{ ...S.tdNum, textAlign: "right" }}>{r.perlu} tab</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={S.emptyState}>
                  {hasErrors ? "—" : "Isi form untuk melihat rincian resep."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

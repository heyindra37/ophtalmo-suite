"use client";

import { useState } from "react";
import type { AnatomicClass, ClinicalInput } from "@/lib/uveitis-differential/types";
import { TAG_GROUPS } from "@/lib/uveitis-differential/tags";
import ReviewOfSystemsChecklist, { type ReviewOfSystemsData } from "./ReviewOfSystemsChecklist";
import { C } from "./tokens";

const ANATOMIC_OPTIONS: { value: AnatomicClass; label: string }[] = [
  { value: "anterior", label: "Anterior" },
  { value: "intermediate", label: "Intermediate" },
  { value: "posterior", label: "Posterior" },
  { value: "panuveitis", label: "Panuveitis" },
];

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: C.panel2,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 13,
  padding: "8px 10px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: C.textDim,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 4,
};

function AccordionSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          padding: "12px 16px",
          color: C.accent,
          fontFamily: "'Fraunces', serif",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {title}
        <span style={{ fontSize: 12, color: C.textDim }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
    </div>
  );
}

export default function ClinicalInputForm({
  input,
  onChange,
  reviewOfSystemsData,
}: {
  input: ClinicalInput;
  onChange: (i: ClinicalInput) => void;
  reviewOfSystemsData?: ReviewOfSystemsData;
}) {
  const upd = (patch: Partial<ClinicalInput>) => onChange({ ...input, ...patch });

  const toggleTag = (tag: string) => {
    const has = input.selectedTags.includes(tag);
    upd({ selectedTags: has ? input.selectedTags.filter((t) => t !== tag) : [...input.selectedTags, tag] });
  };

  const toggleAnatomic = (value: AnatomicClass) => {
    const has = input.anatomic.includes(value);
    upd({ anatomic: has ? input.anatomic.filter((a) => a !== value) : [...input.anatomic, value] });
  };

  const historyGroups = TAG_GROUPS.filter((g) => g.group === "Riwayat & Sistemik" || g.group === "Demografi" || g.group === "Hasil Investigasi (jika sudah ada)");
  const clinicalGroups = TAG_GROUPS.filter((g) => !historyGroups.includes(g));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* A. Karakteristik Dasar */}
      <AccordionSection title="A. Karakteristik Dasar" defaultOpen>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Kelas Anatomis (bisa lebih dari satu)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
            {ANATOMIC_OPTIONS.map((opt) => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.text, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={input.anatomic.includes(opt.value)}
                  onChange={() => toggleAnatomic(opt.value)}
                  style={{ accentColor: C.accent }}
                />
                {opt.label}
              </label>
            ))}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.text, cursor: "pointer", marginTop: 8 }}>
            <input
              type="checkbox"
              checked={input.includeScleritis}
              onChange={(e) => upd({ includeScleritis: e.target.checked })}
              style={{ accentColor: C.accent }}
            />
            Sertakan Scleritis (klasifikasi lokasi sklera, bukan kompartemen intraokular — checkbox anatomis di atas tidak berlaku untuk entitas ini)
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          <div>
            <label style={labelStyle}>Course</label>
            <select style={selectStyle} value={input.course} onChange={(e) => upd({ course: e.target.value as ClinicalInput["course"] })}>
              <option value="">Tidak tahu</option>
              <option value="acute">Akut</option>
              <option value="recurrent">Rekuren</option>
              <option value="chronic">Kronis</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Lateralitas</label>
            <select style={selectStyle} value={input.laterality} onChange={(e) => upd({ laterality: e.target.value as ClinicalInput["laterality"] })}>
              <option value="">Tidak tahu</option>
              <option value="unilateral">Unilateral</option>
              <option value="bilateral">Bilateral</option>
              <option value="alternating">Bergantian sisi</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Granulomatous</label>
            <select style={selectStyle} value={input.granulomatous} onChange={(e) => upd({ granulomatous: e.target.value as ClinicalInput["granulomatous"] })}>
              <option value="">Tidak yakin</option>
              <option value="yes">Ya</option>
              <option value="no">Tidak</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Usia</label>
            <select style={selectStyle} value={input.ageGroup} onChange={(e) => upd({ ageGroup: e.target.value as ClinicalInput["ageGroup"] })}>
              <option value="">Tidak diisi</option>
              <option value="child">Anak (0-9)</option>
              <option value="teen">Remaja (10-17)</option>
              <option value="adult">Dewasa (18-60)</option>
              <option value="elderly">Lansia (61+)</option>
            </select>
          </div>
        </div>
      </AccordionSection>

      {/* B. Gejala & Tanda Klinis */}
      <AccordionSection title="B. Gejala & Tanda Klinis" defaultOpen>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <p style={{ ...labelStyle, marginBottom: 6 }}>IOP & Keratic Precipitates</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
              <div>
                <label style={labelStyle}>IOP</label>
                <select style={selectStyle} value={input.iop} onChange={(e) => upd({ iop: e.target.value as ClinicalInput["iop"] })}>
                  <option value="">Tidak diperiksa</option>
                  <option value="elevated">Meningkat</option>
                  <option value="reduced">Menurun</option>
                  <option value="normal">Normal</option>
                  <option value="unknown">Tidak tahu</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Distribusi KP</label>
                <select style={selectStyle} value={input.kpDistribution} onChange={(e) => upd({ kpDistribution: e.target.value as ClinicalInput["kpDistribution"] })}>
                  <option value="">Tidak diperiksa</option>
                  <option value="arlt_triangle_inferior">Segitiga Arlt (inferior)</option>
                  <option value="diffuse_beyond_midline">Difus, melewati midline</option>
                  <option value="linear_turks_line">Linear (Turk's line)</option>
                  <option value="unknown">Tidak tahu</option>
                </select>
              </div>
            </div>
            <p style={{ fontSize: 11, color: C.textFaint, margin: "6px 0 0", lineHeight: 1.5 }}>
              Distribusi KP tidak dipakai sebagai fitur berdiri sendiri — hanya menaikkan skor jika dikombinasikan dengan IOP, pola atrofi iris, atau status sinekia posterior.
            </p>
          </div>
          {clinicalGroups.map((g) => (
            <div key={g.group}>
              <p style={{ ...labelStyle, marginBottom: 6 }}>{g.group}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
                {g.tags.map((t) => (
                  <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.text, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={input.selectedTags.includes(t.id)}
                      onChange={() => toggleTag(t.id)}
                      style={{ accentColor: C.accent }}
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* C+D. Riwayat, Sistemik, Demografi, Hasil Investigasi */}
      <AccordionSection title="C. Riwayat & Hasil Investigasi" defaultOpen>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {historyGroups.map((g) => (
            <div key={g.group}>
              <p style={{ ...labelStyle, marginBottom: 6 }}>{g.group}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
                {g.tags.map((t) => (
                  <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.text, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={input.selectedTags.includes(t.id)}
                      onChange={() => toggleTag(t.id)}
                      style={{ accentColor: C.accent }}
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      {reviewOfSystemsData && (
        <AccordionSection title="D. Review of Systems (AAO, referensi)" defaultOpen={false}>
          <ReviewOfSystemsChecklist data={reviewOfSystemsData} />
        </AccordionSection>
      )}
    </div>
  );
}

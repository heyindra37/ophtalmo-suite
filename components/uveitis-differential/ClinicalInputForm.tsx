"use client";

import { useState } from "react";
import type { ClinicalInput } from "@/lib/uveitis-differential/types";
import { TAG_GROUPS } from "@/lib/uveitis-differential/tags";
import { C } from "./tokens";

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
}: {
  input: ClinicalInput;
  onChange: (i: ClinicalInput) => void;
}) {
  const upd = (patch: Partial<ClinicalInput>) => onChange({ ...input, ...patch });

  const toggleTag = (tag: string) => {
    const has = input.selectedTags.includes(tag);
    upd({ selectedTags: has ? input.selectedTags.filter((t) => t !== tag) : [...input.selectedTags, tag] });
  };

  const historyGroups = TAG_GROUPS.filter((g) => g.group === "Riwayat & Sistemik" || g.group === "Demografi" || g.group === "Hasil Investigasi (jika sudah ada)");
  const clinicalGroups = TAG_GROUPS.filter((g) => !historyGroups.includes(g));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* A. Karakteristik Dasar */}
      <AccordionSection title="A. Karakteristik Dasar" defaultOpen>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          <div>
            <label style={labelStyle}>Kelas Anatomis</label>
            <select style={selectStyle} value={input.anatomic} onChange={(e) => upd({ anatomic: e.target.value as ClinicalInput["anatomic"] })}>
              <option value="">Tidak tahu</option>
              <option value="anterior">Anterior</option>
              <option value="intermediate">Intermediate</option>
              <option value="posterior">Posterior</option>
              <option value="panuveitis">Panuveitis</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Onset</label>
            <select style={selectStyle} value={input.onset} onChange={(e) => upd({ onset: e.target.value as ClinicalInput["onset"] })}>
              <option value="">Tidak tahu</option>
              <option value="sudden">Mendadak</option>
              <option value="insidious">Insidious</option>
            </select>
          </div>
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
              <option value="child">Anak</option>
              <option value="adult">Dewasa</option>
              <option value="elderly">Lansia</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Jenis Kelamin</label>
            <select style={selectStyle} value={input.sex} onChange={(e) => upd({ sex: e.target.value as ClinicalInput["sex"] })}>
              <option value="">Tidak diisi</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
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
                <label style={labelStyle}>Morfologi KP</label>
                <select style={selectStyle} value={input.kpMorphology} onChange={(e) => upd({ kpMorphology: e.target.value as ClinicalInput["kpMorphology"] })}>
                  <option value="">Tidak diperiksa</option>
                  <option value="fine">Fine</option>
                  <option value="stellate">Stellate</option>
                  <option value="mutton_fat">Mutton-fat</option>
                  <option value="large_greasy">Large/greasy</option>
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
    </div>
  );
}

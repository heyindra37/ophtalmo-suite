"use client";

import { useState } from "react";
import { C } from "./tokens";

// Render read-only dari kb.appendix_a_review_of_systems_checklist_aao (AAO BCSC Section 9,
// Appendix A) — kuesioner review-of-systems TERVALIDASI, menggantikan free-text riwayat manual.
// CATATAN: checklist ini murni dokumentasi/bantu-ingat untuk dokter — pilihan di sini TIDAK
// memengaruhi skor otomatis (beda dari checkbox "Riwayat & Sistemik" di bagian B yang sudah
// dipetakan ke tag taxonomy untuk scoring).

export interface ReviewOfSystemsData {
  family_history?: string[];
  social_history?: string[];
  personal_medical_history?: string[];
  prior_diagnosed_conditions_checklist?: string[];
  review_of_systems_past_3_months?: Record<string, string[]>;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: C.textDim,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
};

function CheckGroup({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <p style={labelStyle}>{title}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 12px" }}>
        {items.map((item) => (
          <label key={item} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.text, cursor: "pointer" }}>
            <input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} style={{ accentColor: C.accent }} />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ReviewOfSystemsChecklist({ data }: { data?: ReviewOfSystemsData }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [rosOpen, setRosOpen] = useState(false);

  if (!data) return null;

  const toggle = (item: string) => {
    setSelected((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const rosGroups = data.review_of_systems_past_3_months || {};
  const rosGroupLabels: Record<string, string> = {
    general: "Umum", head: "Kepala", ears: "Telinga", nose_throat: "Hidung/Tenggorokan",
    skin: "Kulit", respiratory: "Respirasi", cardiovascular: "Kardiovaskular", blood: "Darah",
    gastrointestinal: "Gastrointestinal", bones_joints: "Tulang/Sendi",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: 11, color: C.textFaint, margin: 0, fontStyle: "italic" }}>
        Checklist referensi AAO BCSC — bantu-ingat riwayat, tidak memengaruhi skor otomatis (beda dari checkbox &quot;Riwayat &amp; Sistemik&quot; di atas).
      </p>
      {data.family_history && (
        <CheckGroup title="Riwayat Keluarga" items={data.family_history} selected={selected} onToggle={toggle} />
      )}
      {data.social_history && (
        <CheckGroup title="Riwayat Sosial" items={data.social_history} selected={selected} onToggle={toggle} />
      )}
      {data.personal_medical_history && (
        <CheckGroup title="Riwayat Medis Pribadi" items={data.personal_medical_history} selected={selected} onToggle={toggle} />
      )}
      {data.prior_diagnosed_conditions_checklist && (
        <CheckGroup title="Kondisi yang Pernah Didiagnosis" items={data.prior_diagnosed_conditions_checklist} selected={selected} onToggle={toggle} />
      )}
      {Object.keys(rosGroups).length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setRosOpen((o) => !o)}
            style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.accent, fontSize: 12, fontWeight: 600, padding: "5px 12px", cursor: "pointer" }}
          >
            {rosOpen ? "▲ Sembunyikan" : "▼ Tinjauan Sistem (3 bulan terakhir)"}
          </button>
          {rosOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              {Object.entries(rosGroups).map(([key, items]) => (
                <CheckGroup key={key} title={rosGroupLabels[key] || key} items={items} selected={selected} onToggle={toggle} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

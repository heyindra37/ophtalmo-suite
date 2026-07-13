import type { SourceConflictLog } from "@/lib/uveitis-differential/types";
import { C } from "./tokens";

// Generik terhadap field `source_conflicts` di disease MANAPUN (bukan hardcode untuk Behçet
// saja) — kalau kb.source_conflict_log terus di-update dengan disease lain, komponen ini
// otomatis ikut menampilkannya. Kanski vs AAO SELALU ditampilkan berdampingan, tidak pernah
// digabung jadi satu kalimat rekomendasi (lihat PRD section 2C).
export default function ConflictNotice({
  diseaseId,
  conflictLog,
}: {
  diseaseId: string;
  conflictLog?: SourceConflictLog;
}) {
  const conflicts = (conflictLog?.conflicts || []).filter((c) => c.affects_disease_id === diseaseId);
  if (conflicts.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.warn, margin: 0 }}>⚠️ Ada perbedaan sumber</p>
      {conflicts.map((c, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: C.text, margin: 0 }}>{c.topic}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
            <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: "uppercase", margin: "0 0 3px" }}>Kanski</p>
              <p style={{ fontSize: 12.5, color: C.text, margin: 0, lineHeight: 1.5 }}>{c.kanski_position}</p>
            </div>
            <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: "uppercase", margin: "0 0 3px" }}>AAO</p>
              <p style={{ fontSize: 12.5, color: C.text, margin: 0, lineHeight: 1.5 }}>{c.aao_position}</p>
            </div>
          </div>
          {c.resolution && <p style={{ fontSize: 12, color: C.textDim, margin: 0, fontStyle: "italic" }}>{c.resolution}</p>}
        </div>
      ))}
    </div>
  );
}

import type { RankedResult, SourceConflictLog } from "@/lib/uveitis-differential/types";
import type { FacilityPrefs } from "./FacilityAvailabilitySettings";
import DifferentialResultCard from "./DifferentialResultCard";
import { C } from "./tokens";

// Section terpisah dari hasil uveitis utama — basis penilaian scleritis (klasifikasi lokasi
// sklera) konseptual berbeda dari anatomic_class uveitis, jadi tidak dicampur dalam satu
// ranked list (lihat PRD section 5D).
export default function ScleritisResultSection({
  results,
  facilityPrefs,
  conflictLog,
}: {
  results: RankedResult[];
  facilityPrefs: FacilityPrefs;
  conflictLog?: SourceConflictLog;
}) {
  if (results.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
      <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: 14 }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
          Diferensial Scleritis (kategori berbeda dari uveitis)
        </h2>
        <p style={{ fontSize: 12.5, color: C.textDim, margin: 0 }}>
          Dinilai berdasarkan klasifikasi lokasi sklera, bukan kompartemen intraokular.
        </p>
      </div>
      {results.map((r) => (
        <DifferentialResultCard key={r.diseaseId} result={r} facilityPrefs={facilityPrefs} conflictLog={conflictLog} />
      ))}
    </div>
  );
}

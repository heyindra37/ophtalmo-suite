import type { DiseaseTreatment } from "@/lib/uveitis-differential/types";
import { C } from "./tokens";

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function TreatmentTab({
  treatment,
  criticalNote,
}: {
  treatment: DiseaseTreatment;
  criticalNote?: string;
}) {
  const entries = Object.entries(treatment).filter(([, v]) => !!v);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {criticalNote && (
        <div
          style={{
            background: C.errorBg,
            border: `1px solid ${C.error}`,
            borderRadius: 8,
            padding: "10px 14px",
            color: C.error,
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          ⚠️ {criticalNote}
        </div>
      )}
      {entries.length === 0 ? (
        <p style={{ color: C.textFaint, fontSize: 13, fontStyle: "italic" }}>Tidak ada data terapi terstruktur untuk penyakit ini.</p>
      ) : (
        entries.map(([key, value]) => (
          <div key={key}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>
              {humanizeKey(key)}
            </p>
            <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{value}</p>
          </div>
        ))
      )}
    </div>
  );
}

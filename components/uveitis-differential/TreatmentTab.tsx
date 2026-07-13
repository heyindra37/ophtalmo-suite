import type { DiseaseTreatment } from "@/lib/uveitis-differential/types";
import { normalizeDifferentialNote } from "@/lib/uveitis-differential/normalize";
import { C } from "./tokens";

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function renderValue(value: unknown) {
  if (typeof value === "string") {
    return <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{value}</p>;
  }
  if (Array.isArray(value)) {
    return (
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.text, lineHeight: 1.6 }}>
        {value.map((v, i) => (
          <li key={i}>{typeof v === "string" ? v : JSON.stringify(v)}</li>
        ))}
      </ul>
    );
  }
  if (value && typeof value === "object") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 2 }}>
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: "uppercase", margin: "0 0 2px" }}>{humanizeKey(k)}</p>
            {renderValue(v)}
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function TreatmentTab({
  treatment,
  criticalNote,
  differentialNote,
}: {
  treatment: DiseaseTreatment;
  criticalNote?: string;
  differentialNote?: unknown;
}) {
  const entries = Object.entries(treatment || {}).filter(([, v]) => !!v);
  const note = normalizeDifferentialNote(differentialNote);

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
            {renderValue(value)}
          </div>
        ))
      )}
      {note && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>
            Catatan Diferensial
          </p>
          {note.kind === "text" ? (
            <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{note.text}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(note.stages).map(([stage, text]) => (
                <div key={stage}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: C.textDim, textTransform: "uppercase", margin: "0 0 2px" }}>{humanizeKey(stage)}</p>
                  <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { C } from "./tokens";

// Alert keselamatan (dari field `action` di quick_pattern_matchers) — sengaja pakai warna
// amber (C.warn), BUKAN teal skema skor atau merah critical_note, supaya dokter langsung
// membedakan ini instruksi tindakan, bukan sekadar catatan skor.
export default function ActionAlert({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            background: C.warnBg,
            border: `1px solid ${C.warn}`,
            borderRadius: 8,
            padding: "10px 14px",
            color: C.warn,
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          🔔 {msg}
        </div>
      ))}
    </div>
  );
}

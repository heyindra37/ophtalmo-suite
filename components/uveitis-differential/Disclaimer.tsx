import { C } from "./tokens";

export default function Disclaimer() {
  return (
    <div
      style={{
        background: C.warnBg,
        border: `1px solid ${C.warn}`,
        borderRadius: 10,
        padding: "10px 16px",
        color: C.warn,
        fontSize: 12.5,
        lineHeight: 1.5,
      }}
    >
      ⚠️ Alat bantu edukasi berbasis Kanski&apos;s Clinical Ophthalmology, bukan pengganti judgment klinis maupun pemeriksaan penunjang definitif.
    </div>
  );
}

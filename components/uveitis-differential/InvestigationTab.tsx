import type { InvestigationItem } from "@/lib/uveitis-differential/types";
import type { FacilityPrefs } from "./FacilityAvailabilitySettings";
import { C } from "./tokens";

function isAvailable(item: InvestigationItem, prefs: FacilityPrefs): boolean {
  if (item.tier === "basic") return prefs.basicAvailable;
  if (item.tier === "in_house_if_available") return prefs.inHouseAvailable;
  return prefs.referralEasy;
}

export default function InvestigationTab({
  investigations,
  prefs,
}: {
  investigations?: InvestigationItem[];
  prefs: FacilityPrefs;
}) {
  if (!investigations || investigations.length === 0) {
    return <p style={{ color: C.textFaint, fontSize: 13, fontStyle: "italic" }}>Tidak ada data investigasi spesifik untuk penyakit ini.</p>;
  }

  const sorted = [...investigations].sort((a, b) => {
    const aAvail = isAvailable(a, prefs);
    const bAvail = isAvailable(b, prefs);
    return aAvail === bAvail ? 0 : aAvail ? -1 : 1;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {sorted.map((inv, idx) => {
        const available = isAvailable(inv, prefs);
        return (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
              padding: "8px 12px",
              background: C.panel2,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
            }}
          >
            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{inv.name}</span>
            <span
              style={{
                flexShrink: 0,
                fontSize: 10.5,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 999,
                background: available ? C.greenBg : "rgba(159,179,212,0.12)",
                color: available ? C.green : C.textDim,
                whiteSpace: "nowrap",
              }}
            >
              {available ? "✓ tersedia" : "perlu rujukan"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

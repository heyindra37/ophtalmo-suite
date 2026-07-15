import { normalizeInvestigations, type NormalizedInvestigation } from "@/lib/uveitis-differential/normalize";
import type { FacilityPrefs } from "./FacilityAvailabilitySettings";
import { C } from "./tokens";

function isAvailable(item: NormalizedInvestigation, prefs: FacilityPrefs): boolean | null {
  if (item.tier === "unknown") return null;
  if (item.tier === "basic") return prefs.basicAvailable;
  return prefs.referralEasy;
}

export default function InvestigationTab({
  investigations,
  prefs,
}: {
  investigations?: unknown;
  prefs: FacilityPrefs;
}) {
  const normalized = normalizeInvestigations(investigations);

  if (normalized.length === 0) {
    return (
      <p style={{ color: C.textFaint, fontSize: 13, fontStyle: "italic" }}>
        Tidak ada data investigasi terstruktur untuk entitas ini di knowledge base saat ini.
      </p>
    );
  }

  const sorted = [...normalized].sort((a, b) => {
    const aAvail = isAvailable(a, prefs);
    const bAvail = isAvailable(b, prefs);
    return (aAvail === bAvail ? 0 : aAvail ? -1 : 1);
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
            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>
              {inv.name}
              {inv.note && <span style={{ color: C.textFaint }}> — {inv.note}</span>}
            </span>
            <span
              style={{
                flexShrink: 0,
                fontSize: 10.5,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 999,
                background: available === null ? "transparent" : available ? C.greenBg : "rgba(71,85,105,0.08)",
                color: available === null ? C.textFaint : available ? C.green : C.textDim,
                border: available === null ? `1px solid ${C.border}` : "none",
                whiteSpace: "nowrap",
              }}
            >
              {available === null ? "tier tidak diketahui" : available ? "✓ tersedia" : "perlu rujukan"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

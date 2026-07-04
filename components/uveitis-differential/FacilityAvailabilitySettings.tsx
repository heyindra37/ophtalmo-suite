"use client";

import { C } from "./tokens";

export interface FacilityPrefs {
  basicAvailable: boolean;
  inHouseAvailable: boolean;
  referralEasy: boolean;
}

export const FACILITY_PREFS_KEY = "uveitis-facility-prefs";

export function defaultFacilityPrefs(): FacilityPrefs {
  return { basicAvailable: true, inHouseAvailable: false, referralEasy: false };
}

export function loadFacilityPrefs(): FacilityPrefs {
  try {
    const raw = localStorage.getItem(FACILITY_PREFS_KEY);
    if (raw) return { ...defaultFacilityPrefs(), ...JSON.parse(raw) };
  } catch {}
  return defaultFacilityPrefs();
}

export function saveFacilityPrefs(prefs: FacilityPrefs) {
  try {
    localStorage.setItem(FACILITY_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export default function FacilityAvailabilitySettings({
  prefs,
  onChange,
}: {
  prefs: FacilityPrefs;
  onChange: (p: FacilityPrefs) => void;
}) {
  const items: { key: keyof FacilityPrefs; label: string }[] = [
    { key: "basicAvailable", label: "Lab dasar (darah lengkap, serologi umum, CXR)" },
    { key: "inHouseAvailable", label: "OCT / B-scan USG in-house" },
    { key: "referralEasy", label: "Akses rujukan cepat (HLA, PCR, FA/ICGA, biopsi)" },
  ];

  return (
    <div
      style={{
        background: C.panel2,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "12px 16px",
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>
        Ketersediaan Fasilitas (preferensi tersimpan di device ini)
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item) => (
          <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={prefs[item.key]}
              onChange={(e) => onChange({ ...prefs, [item.key]: e.target.checked })}
              style={{ accentColor: C.accent }}
            />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

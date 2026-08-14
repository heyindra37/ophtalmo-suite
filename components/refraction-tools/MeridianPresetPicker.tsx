"use client";

import { useState } from "react";

const PRESETS: { label: string; meridian: number }[] = [
  { label: "Streak horizontal — gerak ↕ (meridian 90°)", meridian: 90 },
  { label: "Streak vertikal — gerak ↔ (meridian 180°)", meridian: 180 },
  { label: "Streak oblik 45° — gerak ↗↙ (meridian 135°)", meridian: 135 },
  { label: "Streak oblik 135° — gerak ↖↘ (meridian 45°)", meridian: 45 },
];

export default function MeridianPresetPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const matchedPreset = PRESETS.find((p) => p.meridian === value);
  const [freeMode, setFreeMode] = useState(!matchedPreset);

  return (
    <div className="flex flex-col gap-2">
      <select
        disabled={disabled}
        value={freeMode ? "free" : String(value)}
        onChange={(e) => {
          if (e.target.value === "free") {
            setFreeMode(true);
            return;
          }
          setFreeMode(false);
          onChange(Number(e.target.value));
        }}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
      >
        {PRESETS.map((p) => (
          <option key={p.meridian} value={p.meridian}>
            {p.label}
          </option>
        ))}
        <option value="free">Meridian bebas…</option>
      </select>
      {freeMode && !disabled && (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={180}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-mono text-slate-600 w-12 text-right">
            {Math.round(value)}°
          </span>
        </div>
      )}
    </div>
  );
}

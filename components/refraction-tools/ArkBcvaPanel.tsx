"use client";

import { ARK_BCVA_ROWS, type ArkBcva, type RxRow } from "@/lib/refraction-tools/arkBcva";

const INPUT =
  "w-full min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-600";

export default function ArkBcvaPanel({ value, onChange }: { value: ArkBcva; onChange: (v: ArkBcva) => void }) {
  const set = (key: keyof ArkBcva, patch: Partial<RxRow>) => onChange({ ...value, [key]: { ...value[key], ...patch } });

  return (
    <div className="flex flex-col gap-2" data-testid="ark-bcva">
      {ARK_BCVA_ROWS.map(({ key, label, withVa }) => {
        const row = value[key];
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={row.checked} onChange={(e) => set(key, { checked: e.target.checked })} />
              {label}
            </label>
            {row.checked && (
              <div className={`grid gap-1.5 pl-6 ${withVa ? "grid-cols-4" : "grid-cols-3"}`}>
                {withVa && (
                  <input aria-label={`${label} visus`} placeholder="6/6" value={row.va} onChange={(e) => set(key, { va: e.target.value })} className={INPUT} />
                )}
                <input aria-label={`${label} S`} inputMode="decimal" placeholder="S" value={row.sphere} onChange={(e) => set(key, { sphere: e.target.value })} className={INPUT} />
                <input aria-label={`${label} C`} inputMode="decimal" placeholder="C" value={row.cyl} onChange={(e) => set(key, { cyl: e.target.value })} className={INPUT} />
                <input aria-label={`${label} X`} inputMode="numeric" placeholder="X" value={row.axis} onChange={(e) => set(key, { axis: e.target.value })} className={INPUT} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

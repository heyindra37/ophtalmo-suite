"use client";

export interface ReflexFlags {
  scissoring: boolean;
  dim: boolean;
  uncertain: boolean;
}

export const REFLEX_FLAG_NOTES: Record<keyof ReflexFlags, string> = {
  scissoring:
    "Aberasi ireguler — curiga keratokonus, ektasia, atau irregularitas permukaan. Angka retinoskopi tidak dapat diandalkan sebagai resep tunggal.",
  dim: "Curiga kekeruhan media (katarak, kekeruhan kornea, kelainan vitreous) atau ametropia sangat tinggi. Pada anak: evaluasi red reflex dan pertimbangkan penyebab deprivasi.",
  uncertain:
    "Pertimbangkan sikloplegia belum adekuat, fiksasi tidak stabil, atau pupil terlalu kecil.",
};

export default function ReflexQualityFlags({
  value,
  onChange,
}: {
  value: ReflexFlags;
  onChange: (v: ReflexFlags) => void;
}) {
  const items: { key: keyof ReflexFlags; label: string }[] = [
    { key: "scissoring", label: "Refleks scissoring" },
    { key: "dim", label: "Refleks redup / gelap" },
    { key: "uncertain", label: "Netralisasi sulit ditentukan" },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <label key={item.key} className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={value[item.key]}
            onChange={(e) => onChange({ ...value, [item.key]: e.target.checked })}
          />
          {item.label}
        </label>
      ))}
    </div>
  );
}

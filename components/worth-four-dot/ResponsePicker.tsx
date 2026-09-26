import { RESPONSE_LABELS, type WfdtResponse } from "@/lib/worth-four-dot/interpret";
import DotPattern from "./DotPattern";

const OPTIONS: WfdtResponse[] = ["empat", "dua-merah", "tiga-hijau", "lima-uncrossed", "lima-crossed", "bergantian"];

export default function ResponsePicker({
  title,
  value,
  onChange,
}: {
  title: string;
  value: WfdtResponse | null;
  onChange: (v: WfdtResponse) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
        {title}
      </h2>
      <p className="text-xs text-slate-500">Apa yang dilihat pasien?</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors ${
              value === opt ? "border-teal-600 ring-2 ring-teal-100 bg-teal-50" : "border-gray-200 hover:border-teal-300 bg-white"
            }`}
          >
            <div className="w-full max-w-[110px] bg-slate-900 rounded-md p-1">
              <DotPattern response={opt} />
            </div>
            <span className="text-xs font-medium text-slate-700 text-center leading-snug">{RESPONSE_LABELS[opt]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

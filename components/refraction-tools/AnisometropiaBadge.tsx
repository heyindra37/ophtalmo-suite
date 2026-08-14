export default function AnisometropiaBadge({ magnitudeD }: { magnitudeD: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
      ⚠ Anisometropia: selisih SE {magnitudeD.toFixed(2).replace(".", ",")} D
    </div>
  );
}

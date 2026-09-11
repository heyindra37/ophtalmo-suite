export default function CategorySelector() {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        type="button"
        className="text-sm font-semibold px-4 py-2 rounded-lg border bg-teal-600 border-teal-600 text-white"
      >
        Keratitis Viral
      </button>
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
      >
        Bakteri / Jamur / Acanthamoeba
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
          Segera Hadir
        </span>
      </button>
    </div>
  );
}

import Link from "next/link";

export const metadata = { title: "UveaDx — Ophthalmology Suite" };

export default function UveaDxPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-4 shrink-0">
        <Link href="/" className="text-teal-600 hover:text-teal-800 text-sm font-medium">
          ← Kembali
        </Link>
        <span className="text-slate-700 text-sm font-semibold">UveaDx</span>
      </div>
      <iframe src="/uveadx.html" className="flex-1 w-full border-0" title="UveaDx" />
    </div>
  );
}

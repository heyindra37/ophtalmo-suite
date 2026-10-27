import Link from "next/link";
import AppCard from "@/components/ui/AppCard";

export const metadata = { title: "Ophtal-calculator — Ophthalmology Suite" };

const calculators = [
  {
    icon: "🎯",
    name: "Ocular Trauma Score",
    description: "Hitung OTS (Kuhn) dari visus awal (Snellen meter) dan temuan trauma, lengkap dengan prognosis visus 6 bulan.",
    status: "Live" as const,
    route: "/ophtal-calculator/ocular-trauma-score",
  },
];

export default function OphtalCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-1">
          <Link href="/" className="text-teal-600 text-sm font-medium hover:underline">
            ← Kembali
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
            Ophtal-calculator
          </h1>
          <p className="text-slate-500 text-sm">Kumpulan kalkulator klinis oftalmologi</p>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((c) => (
            <AppCard key={c.route} {...c} />
          ))}
        </div>
      </main>
    </div>
  );
}

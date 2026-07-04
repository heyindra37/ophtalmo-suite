import AppCard from "@/components/ui/AppCard";

const apps = [
  {
    icon: "📋",
    name: "SOAP Mata",
    description:
      "Generator dokumentasi klinis format SOAP untuk pemeriksaan mata, dengan output 4 blok SaOD/SaOS/FdOD/FdOS siap tempel ke rekam medis.",
    status: "Live" as const,
    route: "/soap-mata",
  },
  {
    icon: "👁️",
    name: "Target IOP Calculator",
    description:
      "Panduan cepat target tekanan intraokular (TIO) berdasarkan stadium glaukoma dan faktor risiko pasien.",
    status: "Live" as const,
    route: "/target-iop",
  },
  {
    icon: "📊",
    name: "DR Management Guide",
    description:
      "Referensi klinis komprehensif untuk staging, klasifikasi, dan tata laksana Diabetic Retinopathy (ETDRS).",
    status: "Live" as const,
    route: "/dr-guide",
  },
  {
    icon: "💊",
    name: "OcuDrop Scheduler",
    description:
      "Penjadwal otomatis tetes mata: distribusi dosis merata, deteksi konflik waktu, dan output jadwal siap cetak untuk pasien.",
    status: "Live" as const,
    route: "/ocu-drop",
  },
  {
    icon: "🧮",
    name: "OcuDrop Calculator",
    description:
      "Kalkulator kebutuhan obat tetes mata sampai kontrol berikutnya — berdasarkan frekuensi, jumlah mata, dan sediaan obat.",
    status: "Live" as const,
    route: "/ocu-calc",
  },
  {
    icon: "💊",
    name: "Tapering MP",
    description:
      "Kalkulator tapering off methylprednisolone oral: jadwal per step, tanggal otomatis, dan rincian resep tablet 16/8/4 mg.",
    status: "Live" as const,
    route: "/tapering-mp",
  },
  {
    icon: "🔬",
    name: "Uveitis Differential",
    description:
      "Alat bantu diagnosis banding uveitis berbasis Kanski's Clinical Ophthalmology — ranked differential, investigasi, dan terapi berjenjang.",
    status: "Live" as const,
    route: "/tools/uveitis-differential",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-widest text-teal-600 uppercase">
              dr. Muhammad Indra Mahardika, SpM, M.Ked.Klin
            </span>
            <h1
              className="text-3xl md:text-4xl font-bold text-slate-900"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              Ophthalmology Suite
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Ekosistem aplikasi klinis oftalmologi — RS Mata Solo
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <p className="text-slate-600 mb-8 text-sm">
          Pilih aplikasi di bawah ini untuk mulai bekerja.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app) => (
            <AppCard key={app.route} {...app} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-5 text-xs text-slate-400 text-center">
          <p>
            Aplikasi ini dibuat untuk membantu alur kerja klinis dan bukan pengganti penilaian
            medis profesional. Selalu gunakan pertimbangan klinis dalam setiap keputusan tata
            laksana.
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} dr. Muhammad Indra Mahardika, SpM, M.Ked.Klin
          </p>
        </div>
      </footer>
    </div>
  );
}

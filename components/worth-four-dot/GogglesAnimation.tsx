export default function GogglesAnimation() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3">
      <svg viewBox="0 0 240 150" className="w-full max-w-sm h-auto" role="img" aria-label="Pasien menghadap pemeriksa memakai kacamata merah-hijau">
        {/* face, facing the examiner: patient's right eye appears on screen-left */}
        <ellipse cx="120" cy="85" rx="78" ry="62" fill="#fde7d4" stroke="#e5c4a6" />
        <path d="M108 112 Q120 120 132 112" stroke="#b08968" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="88" cy="78" r="6" fill="#334155" />
        <circle cx="152" cy="78" r="6" fill="#334155" />
        <g className="wfdt-goggles">
          <line x1="40" y1="76" x2="62" y2="76" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <line x1="178" y1="76" x2="200" y2="76" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <line x1="110" y1="76" x2="130" y2="76" stroke="#334155" strokeWidth="4" />
          <circle cx="88" cy="78" r="23" fill="#ef4444" fillOpacity="0.75" stroke="#334155" strokeWidth="3" />
          <circle cx="152" cy="78" r="23" fill="#84cc16" fillOpacity="0.75" stroke="#334155" strokeWidth="3" />
        </g>
        <text x="88" y="140" textAnchor="middle" fontSize="11" fontWeight="700" fill="#b91c1c" className="wfdt-fade">
          OD (kanan)
        </text>
        <text x="152" y="140" textAnchor="middle" fontSize="11" fontWeight="700" fill="#4d7c0f" className="wfdt-fade">
          OS (kiri)
        </text>
      </svg>
      <p className="text-sm text-slate-700 text-center leading-relaxed wfdt-fade">
        <span className="font-semibold text-red-600">Lensa warna merah</span>, letakkan di{" "}
        <span className="font-semibold">mata kanan</span>.{" "}
        <span className="font-semibold text-lime-700">Lensa warna hijau</span>, letakkan di{" "}
        <span className="font-semibold">mata kiri</span>.
      </p>
      <p className="text-xs text-slate-400 text-center">Gambar: pasien menghadap pemeriksa.</p>
    </div>
  );
}

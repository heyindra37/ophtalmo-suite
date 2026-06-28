"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  type SoapState,
  type SaEyeState,
  type FdEyeState,
  type GBMEyeState,
  defaultSoapState,
  defaultSaEye,
  defaultFdEye,
  defaultGBMEye,
} from "@/lib/soap-types";
import {
  CATEGORIES,
  CATEGORY_PRESETS,
  DIAGNOSIS_BY_CATEGORY,
  type Category,
} from "@/lib/soap-presets";
import { buildFullOutput } from "@/lib/soap-logic";

const LS_KEY = "soap-mata-last-session";

// ── small helpers ────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{children}</label>;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function ModeToggle({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors ${
            value === o.value
              ? "bg-teal-600 text-white"
              : "bg-gray-100 text-slate-600 hover:bg-gray-200"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
    />
  );
}

// ── Sa Eye Form ──────────────────────────────────────────────────────────────
function SaEyeForm({
  label,
  state,
  onChange,
}: {
  label: string;
  state: SaEyeState;
  onChange: (s: SaEyeState) => void;
}) {
  const upd = (patch: Partial<SaEyeState>) => onChange({ ...state, ...patch });

  const PALPEBRA_OPTIONS = [
    "normal","edema-ringan","edema-sedang","edema-berat","hiperemis",
    "ptosis-kongenital","ptosis-aponeurotik","entropion-sup","entropion-inf",
    "ektropion","trikiasis","hordeolum","chalazion","massa","hematom","laserasi","manual",
  ];
  const KONJ_OPTIONS = [
    "tidak-hiperemi","hiperemi-ringan","hiperemi-sedang","hiperemi-berat",
    "injeksi-konj","injeksi-siliar","injeksi-mix","kemosis",
    "sekret-mukoid","sekret-mukopurulen","sekret-purulen",
    "perdarahan-subkonj","pterigium","epifora","manual",
  ];
  const KORNEA_OPTIONS = [
    "jernih","edema","edema-bullosa","infiltrat","ulkus","sikatrik",
    "PEE","PEK","dendrit","KP-halus","KP-mutton","flap","manual",
  ];
  const LENSA_OPTIONS = [
    "jernih","katarak-1","katarak-2","katarak-3","katarak-4",
    "pseudofakia","subluksasi","afakia","manual",
  ];

  if (state.mode === "normal") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">Sa{label}</span>
          <ModeToggle
            value={state.mode}
            onChange={(v) => upd({ mode: v as SaEyeState["mode"] })}
            options={[{ value: "full", label: "Full" }, { value: "normal", label: "Normal" }, { value: "partial", label: "Partial" }]}
          />
        </div>
        <p className="text-xs text-slate-400 italic">Output: Sa{label} : normal</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">Sa{label}</span>
        <ModeToggle
          value={state.mode}
          onChange={(v) => upd({ mode: v as SaEyeState["mode"] })}
          options={[{ value: "full", label: "Full" }, { value: "normal", label: "Normal" }, { value: "partial", label: "Partial" }]}
        />
      </div>

      {/* Palpebra */}
      <div>
        <Label>Palpebra</Label>
        <Select value={state.palpebra.value} onChange={(v) => upd({ palpebra: { ...state.palpebra, value: v } })} options={PALPEBRA_OPTIONS} />
        {(state.palpebra.value === "ptosis-kongenital" || state.palpebra.value === "ptosis-aponeurotik") && (
          <TextInput
            value={state.palpebra.ptosisLevatorFungsi || ""}
            onChange={(v) => upd({ palpebra: { ...state.palpebra, ptosisLevatorFungsi: v } })}
            placeholder="Fungsi levator (mm)"
          />
        )}
        {state.palpebra.value === "manual" && (
          <TextInput
            value={state.palpebra.manual || ""}
            onChange={(v) => upd({ palpebra: { ...state.palpebra, manual: v } })}
            placeholder="Deskripsi bebas..."
          />
        )}
      </div>

      {/* Konjungtiva */}
      <div>
        <Label>Konjungtiva / Sklera</Label>
        <Select value={state.konjungtiva.value} onChange={(v) => upd({ konjungtiva: { ...state.konjungtiva, value: v } })} options={KONJ_OPTIONS} />
        {state.konjungtiva.value === "pterigium" && (
          <div className="flex gap-2 mt-1">
            <Select value={state.konjungtiva.pterigiumGrade || "I"} onChange={(v) => upd({ konjungtiva: { ...state.konjungtiva, pterigiumGrade: v } })} options={["I","II","III"]} />
            <Select value={state.konjungtiva.pterigiumLokasi || "nasal"} onChange={(v) => upd({ konjungtiva: { ...state.konjungtiva, pterigiumLokasi: v } })} options={["nasal","temporal"]} />
          </div>
        )}
        {state.konjungtiva.value === "manual" && (
          <TextInput value={state.konjungtiva.manual || ""} onChange={(v) => upd({ konjungtiva: { ...state.konjungtiva, manual: v } })} placeholder="Deskripsi bebas..." />
        )}
      </div>

      {/* Kornea */}
      <div>
        <Label>Kornea</Label>
        <Select value={state.kornea.value} onChange={(v) => upd({ kornea: { ...state.kornea, value: v } })} options={KORNEA_OPTIONS} />
        {state.kornea.value === "infiltrat" && (
          <div className="flex gap-2 mt-1">
            <Select value={state.kornea.infiltratLokasi || "sentral"} onChange={(v) => upd({ kornea: { ...state.kornea, infiltratLokasi: v } })} options={["sentral","parasentral","perifer"]} />
            <TextInput value={state.kornea.infiltratDesc || ""} onChange={(v) => upd({ kornea: { ...state.kornea, infiltratDesc: v } })} placeholder="Deskripsi tambahan" />
          </div>
        )}
        {state.kornea.value === "manual" && (
          <TextInput value={state.kornea.manual || ""} onChange={(v) => upd({ kornea: { ...state.kornea, manual: v } })} placeholder="Deskripsi bebas..." />
        )}
      </div>

      {/* BMD */}
      <div>
        <Label>BMD</Label>
        <Select
          value={state.bmd.value}
          onChange={(v) => upd({ bmd: { ...state.bmd, value: v } })}
          options={["dalam","dangkal","sangat-dangkal"]}
        />
        <div className="mt-1 flex flex-wrap gap-2">
          {[
            { key: "flare", label: "Flare (+)" },
            { key: "cell", label: "Cell (+)" },
            { key: "hipopion", label: "Hipopion (+)" },
            { key: "hifema", label: "Hifema (+)" },
          ].map(({ key, label: lbl }) => (
            <label key={key} className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={state.bmd[key as keyof typeof state.bmd] as boolean}
                onChange={(e) => upd({ bmd: { ...state.bmd, [key]: e.target.checked } })}
                className="accent-teal-600"
              />
              {lbl}
            </label>
          ))}
        </div>
        {state.bmd.flare && (
          <Select value={state.bmd.flareGrade || "ringan"} onChange={(v) => upd({ bmd: { ...state.bmd, flareGrade: v } })} options={["ringan","+1","+2","+3","+4"]} />
        )}
        {state.bmd.cell && (
          <Select value={state.bmd.cellGrade || "+1"} onChange={(v) => upd({ bmd: { ...state.bmd, cellGrade: v } })} options={["+1","+2","+3","+4"]} />
        )}
      </div>

      {/* Iris */}
      <div>
        <Label>Iris</Label>
        <Select
          value={state.iris.value}
          onChange={(v) => upd({ iris: { ...state.iris, value: v } })}
          options={["radier","iridodenesis","sinekia-posterior","sinekia-anterior","neovaskularisasi","bombans","atrofi","heterokromia","manual"]}
        />
        {state.iris.value === "manual" && (
          <TextInput value={state.iris.manual || ""} onChange={(v) => upd({ iris: { ...state.iris, manual: v } })} placeholder="Deskripsi bebas..." />
        )}
      </div>

      {/* Pupil */}
      <div>
        <Label>Pupil</Label>
        <Select
          value={state.pupil.value}
          onChange={(v) => upd({ pupil: { ...state.pupil, value: v } })}
          options={["bulat","ireguler","miosis","midriasis","leukokoria","manual"]}
        />
        {(state.pupil.value === "bulat" || state.pupil.value === "midriasis") && (
          <div className="flex gap-2 mt-1">
            <TextInput value={state.pupil.diameter || ""} onChange={(v) => upd({ pupil: { ...state.pupil, diameter: v } })} placeholder="Diameter (mm)" />
            {state.pupil.value === "bulat" && (
              <Select value={state.pupil.rc || "normal"} onChange={(v) => upd({ pupil: { ...state.pupil, rc: v } })} options={["normal","lambat"]} />
            )}
          </div>
        )}
        {state.pupil.value === "manual" && (
          <TextInput value={state.pupil.manual || ""} onChange={(v) => upd({ pupil: { ...state.pupil, manual: v } })} placeholder="Deskripsi bebas..." />
        )}
        <label className="flex items-center gap-1 text-xs text-slate-600 mt-1 cursor-pointer">
          <input type="checkbox" checked={state.pupil.rapd} onChange={(e) => upd({ pupil: { ...state.pupil, rapd: e.target.checked } })} className="accent-teal-600" />
          RAPD (+)
        </label>
      </div>

      {/* Lensa */}
      <div>
        <Label>Lensa</Label>
        <Select value={state.lensa.value} onChange={(v) => upd({ lensa: { ...state.lensa, value: v } })} options={LENSA_OPTIONS} />
        {state.lensa.value.startsWith("katarak") && (
          <Select
            value={state.lensa.katarakSubtipe || ""}
            onChange={(v) => upd({ lensa: { ...state.lensa, katarakSubtipe: v } })}
            options={["","PSC","nuklear","kortikal","posterior polar"]}
            placeholder="Subtipe (opsional)"
          />
        )}
        {state.lensa.value === "pseudofakia" && (
          <label className="flex items-center gap-1 text-xs text-slate-600 mt-1 cursor-pointer">
            <input type="checkbox" checked={state.lensa.pco || false} onChange={(e) => upd({ lensa: { ...state.lensa, pco: e.target.checked } })} className="accent-teal-600" />
            PCO (+)
          </label>
        )}
        {state.lensa.value === "subluksasi" && (
          <Select value={state.lensa.subluksasiArah || "superior"} onChange={(v) => upd({ lensa: { ...state.lensa, subluksasiArah: v } })} options={["superior","inferior","nasal","temporal"]} />
        )}
        {state.lensa.value === "manual" && (
          <TextInput value={state.lensa.manual || ""} onChange={(v) => upd({ lensa: { ...state.lensa, manual: v } })} placeholder="Deskripsi bebas..." />
        )}
      </div>
    </div>
  );
}

// ── Fd Eye Form ──────────────────────────────────────────────────────────────
function FdEyeForm({
  label,
  state,
  onChange,
}: {
  label: string;
  state: FdEyeState;
  onChange: (s: FdEyeState) => void;
}) {
  const upd = (patch: Partial<FdEyeState>) => onChange({ ...state, ...patch });

  if (state.mode === "normal") {
    return (
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">Fd{label}</span>
        <ModeToggle
          value={state.mode}
          onChange={(v) => upd({ mode: v as FdEyeState["mode"] })}
          options={[
            { value: "full", label: "Full" },
            { value: "normal", label: "Normal" },
            { value: "tidak", label: "Tidak diperiksa" },
          ]}
        />
      </div>
    );
  }

  if (state.mode === "tidak") {
    return (
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">Fd{label}</span>
        <ModeToggle
          value={state.mode}
          onChange={(v) => upd({ mode: v as FdEyeState["mode"] })}
          options={[
            { value: "full", label: "Full" },
            { value: "normal", label: "Normal" },
            { value: "tidak", label: "Tidak diperiksa" },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">Fd{label}</span>
        <ModeToggle
          value={state.mode}
          onChange={(v) => upd({ mode: v as FdEyeState["mode"] })}
          options={[
            { value: "full", label: "Full" },
            { value: "normal", label: "Normal" },
            { value: "tidak", label: "Tidak diperiksa" },
          ]}
        />
      </div>

      {/* FR */}
      <div>
        <Label>Fundus Reflex</Label>
        <Select
          value={state.fr.value}
          onChange={(v) => upd({ fr: { ...state.fr, value: v } })}
          options={["plus","plus-redup","plus-sulit","minus"]}
        />
        {state.fr.value === "plus-sulit" && (
          <TextInput value={state.fr.sulitAlasan || ""} onChange={(v) => upd({ fr: { ...state.fr, sulitAlasan: v } })} placeholder="Alasan sulit (mis. tertutup katarak)" />
        )}
      </div>

      {state.fr.value !== "minus" && (
        <>
          {/* ONH */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Label>ONH / Papil</Label>
              <ModeToggle
                value={state.onh.label}
                onChange={(v) => upd({ onh: { ...state.onh, label: v } })}
                options={[{ value: "Papil N. II", label: "Papil N. II" }, { value: "ONH", label: "ONH" }]}
              />
            </div>
            {state.onh.manual !== undefined && state.onh.manual !== "" ? (
              <TextInput value={state.onh.manual || ""} onChange={(v) => upd({ onh: { ...state.onh, manual: v } })} placeholder="Override manual ONH..." />
            ) : (
              <div className="space-y-1">
                <div className="flex gap-2">
                  <Select value={state.onh.batas} onChange={(v) => upd({ onh: { ...state.onh, batas: v } })} options={["tegas","kabur","kabur-sebagian"]} />
                  <Select value={state.onh.warna} onChange={(v) => upd({ onh: { ...state.onh, warna: v } })} options={["normal","hiperemi","pucat"]} />
                </div>
                <TextInput value={state.onh.cdr} onChange={(v) => upd({ onh: { ...state.onh, cdr: v } })} placeholder="CDR (mis. 0.3)" />
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={state.onh.elevasi} onChange={(e) => upd({ onh: { ...state.onh, elevasi: e.target.checked } })} className="accent-teal-600" />
                    Elevasi (+)
                  </label>
                  <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={state.onh.nvd} onChange={(e) => upd({ onh: { ...state.onh, nvd: e.target.checked } })} className="accent-teal-600" />
                    NVD (+)
                  </label>
                </div>
              </div>
            )}
            <button
              className="text-xs text-teal-600 mt-1"
              onClick={() => upd({ onh: { ...state.onh, manual: state.onh.manual ? "" : " " } })}
            >
              {state.onh.manual ? "← Kembali ke preset" : "✏️ Override manual"}
            </button>
          </div>

          {/* Vitreous */}
          <div>
            <Label>Vitreous</Label>
            <Select
              value={state.vitreous.value}
              onChange={(v) => upd({ vitreous: { ...state.vitreous, value: v } })}
              options={["jernih","floaters","perdarahan","sel","pvd","vitritis","snowball","sulit","manual"]}
            />
            {state.vitreous.value === "perdarahan" && (
              <Select value={state.vitreous.perdarahanLokasi || "diffuse"} onChange={(v) => upd({ vitreous: { ...state.vitreous, perdarahanLokasi: v } })} options={["diffuse","inferior","superior"]} />
            )}
            {state.vitreous.value === "manual" && (
              <TextInput value={state.vitreous.manual || ""} onChange={(v) => upd({ vitreous: { ...state.vitreous, manual: v } })} placeholder="Deskripsi bebas..." />
            )}
          </div>

          {/* Makula */}
          <div>
            <Label>Makula</Label>
            <Select
              value={state.makula.value}
              onChange={(v) => upd({ makula: { ...state.makula, value: v } })}
              options={["refleks-plus","refleks-plus-menurun","refleks-minus","edema","macular-hole","erm","manual"]}
            />
            {state.makula.value === "macular-hole" && (
              <Select value={state.makula.mhGrade || "1"} onChange={(v) => upd({ makula: { ...state.makula, mhGrade: v } })} options={["1","2","3","4"]} />
            )}
            {state.makula.value === "manual" && (
              <TextInput value={state.makula.manual || ""} onChange={(v) => upd({ makula: { ...state.makula, manual: v } })} placeholder="Deskripsi bebas..." />
            )}
          </div>

          {/* Retina */}
          <div>
            <Label>Retina</Label>
            <Select
              value={state.retina.value}
              onChange={(v) => upd({ retina: { ...state.retina, value: v } })}
              options={["attached","dot-blot","flame","eksudat","cws","ablasio","nve","mikroaneurisma","vaskulitis","robekan","sulit","manual"]}
            />
            {state.retina.value === "ablasio" && (
              <Select value={state.retina.ablasioArea || "temporal"} onChange={(v) => upd({ retina: { ...state.retina, ablasioArea: v } })} options={["temporal","nasal","superior","inferior","total"]} />
            )}
            {(state.retina.value === "dot-blot" || state.retina.value === "flame") && (
              <TextInput
                value={(state.retina.value === "dot-blot" ? state.retina.dotBlotLokasi : state.retina.flameLokasi) || ""}
                onChange={(v) => upd({ retina: { ...state.retina, [state.retina.value === "dot-blot" ? "dotBlotLokasi" : "flameLokasi"]: v } })}
                placeholder="Lokasi/kuadran"
              />
            )}
            {state.retina.value === "manual" && (
              <TextInput value={state.retina.manual || ""} onChange={(v) => upd({ retina: { ...state.retina, manual: v } })} placeholder="Deskripsi bebas..." />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── GBM Form ─────────────────────────────────────────────────────────────────
function GBMForm({ label, state, onChange }: { label: string; state: GBMEyeState; onChange: (s: GBMEyeState) => void }) {
  const upd = (patch: Partial<GBMEyeState>) => onChange({ ...state, ...patch });
  const ARAH_OPTIONS = ["nasal","temporal","superior","inferior","superonasal","superotemporal","inferonasal","inferotemporal"];

  return (
    <div className="space-y-2">
      <span className="font-semibold text-slate-700 text-sm">GBM {label}</span>
      <ModeToggle
        value={state.value}
        onChange={(v) => upd({ value: v })}
        options={[{ value: "bebas", label: "Bebas" }, { value: "hambatan", label: "Ada hambatan" }]}
      />
      {state.value === "hambatan" && (
        <div className="space-y-2">
          <Select value={state.derajat || "-1"} onChange={(v) => upd({ derajat: v })} options={["-1","-2","-3","-4"]} />
          <div className="flex flex-wrap gap-1">
            {ARAH_OPTIONS.map((a) => (
              <label key={a} className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.arah.includes(a)}
                  onChange={(e) => upd({ arah: e.target.checked ? [...state.arah, a] : state.arah.filter((x) => x !== a) })}
                  className="accent-teal-600"
                />
                {a}
              </label>
            ))}
          </div>
        </div>
      )}
      <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
        <input type="checkbox" checked={state.nyeri} onChange={(e) => upd({ nyeri: e.target.checked })} className="accent-teal-600" />
        Nyeri (+)
      </label>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SoapMataClient() {
  const [state, setState] = useState<SoapState>(defaultSoapState);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {}
  }, []);

  // Auto-save + live preview
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOutput(buildFullOutput(state));
    }, 300);

    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
    }, 1000);
  }, [state]);

  const upd = useCallback((patch: Partial<SoapState>) => setState((s) => ({ ...s, ...patch })), []);

  const handleCategoryChange = (cat: string) => {
    if (!cat) { upd({ category: "", diagnosis: "" }); return; }
    const preset = CATEGORY_PRESETS[cat as Category];
    if (preset) {
      setState((s) => ({
        ...s,
        category: cat,
        diagnosis: "",
        saOD: { ...defaultSaEye(preset.saOD) },
        saOS: { ...defaultSaEye(preset.saOS) },
        fdOD: { ...defaultFdEye(preset.fdOD) },
        fdOS: { ...defaultFdEye(preset.fdOS) },
        showGBM: preset.showGBM,
        showCoverTest: preset.showCoverTest,
      }));
    }
  };

  const handleDiagnosisChange = (diag: string) => {
    if (!diag || !state.category) { upd({ diagnosis: diag }); return; }
    const list = DIAGNOSIS_BY_CATEGORY[state.category as Category] || [];
    const found = list.find((d) => d.label === diag);
    if (found?.overrides) {
      const o = found.overrides;
      setState((s) => ({
        ...s,
        diagnosis: diag,
        saOD: o.saOD ? { ...s.saOD, mode: o.saOD } : s.saOD,
        saOS: o.saOS ? { ...s.saOS, mode: o.saOS } : s.saOS,
        fdOD: o.fdOD ? { ...s.fdOD, mode: o.fdOD } : s.fdOD,
        fdOS: o.fdOS ? { ...s.fdOS, mode: o.fdOS } : s.fdOS,
        showGBM: o.showGBM !== undefined ? o.showGBM : s.showGBM,
        showCoverTest: o.showCoverTest !== undefined ? o.showCoverTest : s.showCoverTest,
      }));
    } else {
      upd({ diagnosis: diag });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    if (confirm("Reset semua field? Data yang belum disimpan akan hilang.")) {
      setState(defaultSoapState());
      localStorage.removeItem(LS_KEY);
    }
  };

  const diagnoses = state.category
    ? (DIAGNOSIS_BY_CATEGORY[state.category as Category] || []).map((d) => d.label)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/" className="text-teal-600 hover:text-teal-800 text-sm font-medium shrink-0">
          ← Kembali
        </Link>
        <h1 className="text-base font-bold text-slate-900 flex-1" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
          SOAP Mata v2
        </h1>
        <button onClick={handleReset} className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
          Reset / Pasien Baru
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-0 flex-1 max-w-7xl mx-auto w-full">
        {/* ── Left: Form ── */}
        <div className="lg:w-[55%] overflow-y-auto p-4 space-y-4">

          {/* Kategori & Diagnosis */}
          <SectionCard title="Kategori & Diagnosis">
            <div>
              <Label>Kategori</Label>
              <Select
                value={state.category}
                onChange={handleCategoryChange}
                options={[...CATEGORIES]}
                placeholder="— Pilih kategori —"
              />
            </div>
            {state.category && (
              <div>
                <Label>Diagnosis Spesifik</Label>
                <Select
                  value={state.diagnosis}
                  onChange={handleDiagnosisChange}
                  options={diagnoses}
                  placeholder="— Pilih diagnosis —"
                />
              </div>
            )}
          </SectionCard>

          {/* Sa OD */}
          <SectionCard title="Segmen Anterior OD">
            <SaEyeForm label="OD" state={state.saOD} onChange={(s) => upd({ saOD: s })} />
          </SectionCard>

          {/* Sa OS */}
          <SectionCard title="Segmen Anterior OS">
            <SaEyeForm label="OS" state={state.saOS} onChange={(s) => upd({ saOS: s })} />
          </SectionCard>

          {/* Fd OD */}
          <SectionCard title="Segmen Posterior OD">
            <FdEyeForm label="OD" state={state.fdOD} onChange={(s) => upd({ fdOD: s })} />
          </SectionCard>

          {/* Fd OS */}
          <SectionCard title="Segmen Posterior OS">
            <FdEyeForm label="OS" state={state.fdOS} onChange={(s) => upd({ fdOS: s })} />
          </SectionCard>

          {/* GBM */}
          <SectionCard title="GBM — Gerak Bola Mata">
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-2 cursor-pointer">
              <input type="checkbox" checked={state.showGBM} onChange={(e) => upd({ showGBM: e.target.checked })} className="accent-teal-600" />
              Tampilkan seksi GBM
            </label>
            {state.showGBM && (
              <div className="space-y-4">
                <GBMForm label="OD" state={state.gbmOD} onChange={(s) => upd({ gbmOD: s })} />
                <GBMForm label="OS" state={state.gbmOS} onChange={(s) => upd({ gbmOS: s })} />
              </div>
            )}
          </SectionCard>

          {/* Cover Test */}
          <SectionCard title="Cover/Uncover Test">
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-2 cursor-pointer">
              <input type="checkbox" checked={state.showCoverTest} onChange={(e) => upd({ showCoverTest: e.target.checked })} className="accent-teal-600" />
              Tampilkan Cover Test
            </label>
            {state.showCoverTest && (
              <Select
                value={state.coverTest}
                onChange={(v) => upd({ coverTest: v as SoapState["coverTest"] })}
                options={["ortoforia","esotropia-OD","esotropia-OS","esotropia-ODS","eksotropia-OD","eksotropia-OS","eksotropia-ODS","hipertropia-OD","hipertropia-OS"]}
                placeholder="— Pilih hasil —"
              />
            )}
          </SectionCard>

          {/* Catatan */}
          <SectionCard title="Catatan Tambahan">
            <textarea
              value={state.catatanTambahan}
              onChange={(e) => upd({ catatanTambahan: e.target.value })}
              placeholder="Catatan tambahan bebas..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </SectionCard>
        </div>

        {/* ── Right: Output ── */}
        <div className="lg:w-[45%] bg-white border-l border-gray-100 flex flex-col sticky top-[57px] h-[calc(100vh-57px)]">
          <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">Output Preview</h2>
            <button
              onClick={handleCopy}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                copied ? "bg-emerald-500 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              {copied ? "✓ Tersalin" : "Copy Semua"}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <pre
              className="text-sm text-slate-800 whitespace-pre-wrap font-mono leading-relaxed bg-gray-50 rounded-xl p-4 min-h-32"
              style={{ fontFamily: "var(--font-dm-mono, monospace)" }}
            >
              {output || <span className="text-slate-400 italic">Output akan muncul di sini...</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

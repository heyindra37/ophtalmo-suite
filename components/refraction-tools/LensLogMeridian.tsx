"use client";

import { useState } from "react";
import { parseDecimal } from "@/lib/refraction-tools/engine";
import { formatSignedDisplay } from "@/lib/refraction-tools/format";
import { estimateNeutral, type LensEntry, type Reflex, type ReflexSpeed } from "@/lib/refraction-tools/lensLog";

const REFLEX_LABEL: Record<Reflex, string> = { with: "With", neutral: "Netral", against: "Against" };
const REFLEX_STYLE: Record<Reflex, string> = {
  with: "bg-sky-50 text-sky-800 border-sky-200",
  neutral: "bg-emerald-50 text-emerald-800 border-emerald-200",
  against: "bg-amber-50 text-amber-800 border-amber-200",
};
const SPEED_LABEL: Record<ReflexSpeed, string> = { 1: "lambat", 2: "sedang", 3: "cepat" };
const WIDTH_LABEL: Record<ReflexSpeed, string> = { 1: "sempit", 2: "sedang", 3: "lebar" };

/** Next-lens hint worded for the sign of the lens in hand. */
function nextLensHint(powerD: number, needMorePlus: boolean): string {
  if (needMorePlus) return powerD < 0 ? "kurangi minus" : "tambah plus";
  return powerD > 0 ? "kurangi plus" : "tambah minus";
}

function entryNotes(e: LensEntry): string {
  const notes = [e.speed && SPEED_LABEL[e.speed], e.width && WIDTH_LABEL[e.width]].filter(Boolean);
  return notes.length ? ` (${notes.join(", ")})` : "";
}

let seq = 0;
const newId = () => `l${Date.now().toString(36)}${(seq++).toString(36)}`;

export default function LensLogMeridian({
  entries,
  onChange,
  overrideRaw,
  onOverrideChange,
}: {
  entries: LensEntry[];
  onChange: (entries: LensEntry[]) => void;
  overrideRaw: string;
  onOverrideChange: (raw: string) => void;
}) {
  // Start at plano, or at the last lens tried when the log already has entries.
  const [powerRaw, setPowerRaw] = useState(() =>
    entries.length ? formatSignedDisplay(entries[entries.length - 1].powerD) : "0,00"
  );
  const [speed, setSpeed] = useState<ReflexSpeed | null>(null);
  const [width, setWidth] = useState<ReflexSpeed | null>(null);
  const power = parseDecimal(powerRaw);
  const est = estimateNeutral(entries);
  const sorted = [...entries].sort((a, b) => a.powerD - b.powerD);

  const step = (d: number) => setPowerRaw(formatSignedDisplay((power ?? 0) + d));
  const add = (reflex: Reflex) => {
    if (power === null) return;
    const graded = reflex !== "neutral";
    onChange([
      ...entries,
      { id: newId(), powerD: power, reflex, ...(speed && graded ? { speed } : {}), ...(width && graded ? { width } : {}) },
    ]);
  };
  const isBracket = (e: LensEntry) =>
    est.status === "ok" && est.bracket !== null && est.source === "bracket" &&
    ((e.reflex === "with" && e.powerD === est.bracket.withD) || (e.reflex === "against" && e.powerD === est.bracket.againstD));

  return (
    <div className="flex flex-col gap-2" data-testid="lens-log">
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => step(-0.25)} className="w-9 h-9 rounded-lg bg-gray-100 text-slate-700 font-bold">
          −
        </button>
        <input
          type="text"
          inputMode="decimal"
          aria-label="Daya lensa"
          value={powerRaw}
          onChange={(e) => setPowerRaw(e.target.value)}
          className="w-24 border border-gray-200 rounded-lg px-2 py-2 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <button type="button" onClick={() => step(0.25)} className="w-9 h-9 rounded-lg bg-gray-100 text-slate-700 font-bold">
          +
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <select
          aria-label="Kecepatan refleks"
          value={speed ?? ""}
          onChange={(e) => setSpeed(e.target.value ? (Number(e.target.value) as ReflexSpeed) : null)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white"
        >
          <option value="">kecepatan —</option>
          {([1, 2, 3] as ReflexSpeed[]).map((s) => (
            <option key={s} value={s}>
              {SPEED_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          aria-label="Lebar refleks"
          value={width ?? ""}
          onChange={(e) => setWidth(e.target.value ? (Number(e.target.value) as ReflexSpeed) : null)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white"
        >
          <option value="">lebar —</option>
          {([1, 2, 3] as ReflexSpeed[]).map((s) => (
            <option key={s} value={s}>
              {WIDTH_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {(["with", "neutral", "against"] as Reflex[]).map((r) => (
          <button
            key={r}
            type="button"
            disabled={power === null}
            onClick={() => add(r)}
            className={`rounded-lg border py-1.5 text-sm font-semibold disabled:opacity-40 ${REFLEX_STYLE[r]}`}
          >
            {REFLEX_LABEL[r]}
          </button>
        ))}
      </div>

      {sorted.length > 0 && (
        <ul className="flex flex-col gap-1">
          {sorted.map((e) => (
            <li
              key={e.id}
              className={`flex items-center gap-2 text-xs rounded-md border px-2 py-1 ${REFLEX_STYLE[e.reflex]} ${isBracket(e) ? "ring-2 ring-teal-500" : ""}`}
            >
              <span className="font-mono font-semibold w-14">{formatSignedDisplay(e.powerD)}</span>
              <span>
                {REFLEX_LABEL[e.reflex]}
                {entryNotes(e)}
              </span>
              <button
                type="button"
                aria-label="Hapus entri"
                onClick={() => onChange(entries.filter((x) => x.id !== e.id))}
                className="ml-auto text-slate-400 hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="text-xs rounded-lg bg-gray-50 border border-gray-100 px-2 py-1.5 text-slate-600" data-testid="neutral-estimate">
        {est.status === "empty" && "Catat lensa yang dicoba beserta refleksnya."}
        {est.status === "need-against" &&
          `Baru ada with (s.d. ${formatSignedDisplay(est.withMax)}) — ${nextLensHint(est.withMax, true)} sampai muncul against.`}
        {est.status === "need-with" &&
          `Baru ada against (mulai ${formatSignedDisplay(est.againstMin)}) — ${nextLensHint(est.againstMin, false)} sampai muncul with.`}
        {est.status === "ok" && (
          <>
            <b className="text-slate-900">Estimasi netral {formatSignedDisplay(est.powerD)}</b>{" "}
            {est.source === "observed"
              ? "(netral teramati)"
              : `(bracket ${formatSignedDisplay(est.bracket!.withD)} ↔ ${formatSignedDisplay(est.bracket!.againstD)}, ${
                  est.shifted ? "digeser ke refleks yang lebih cepat/lebar" : "titik tengah"
                })`}
            {est.inconsistent && (
              <span className="block text-red-600 font-semibold">⚠ Tidak konsisten: ada with pada lensa lebih plus daripada against. Cek ulang.</span>
            )}
            {est.wide && <span className="block text-amber-700">Bracket lebar — coba lensa di antara keduanya.</span>}
          </>
        )}
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-500">
        Override manual
        <input
          type="text"
          inputMode="decimal"
          placeholder="kosong = pakai estimasi"
          value={overrideRaw}
          onChange={(e) => onOverrideChange(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </label>
    </div>
  );
}

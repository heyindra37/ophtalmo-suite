"use client";

import { useState } from "react";
import { SHARE_CODE_RE, isSnapshot, type StreakV2Snapshot } from "@/lib/refraction-tools/share";

type Mode = "idle" | "sending" | "sent" | "receive" | "loading";

async function errorText(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {}
  return `Gagal (HTTP ${res.status}).`;
}

export default function ShareBar({
  snapshot,
  hasData,
  onLoad,
}: {
  snapshot: () => StreakV2Snapshot;
  hasData: boolean;
  onLoad: (s: StreakV2Snapshot) => void;
}) {
  const [mode, setMode] = useState<Mode>("idle");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const send = async () => {
    setMode("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/streak-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot()),
      });
      if (!res.ok) throw new Error(await errorText(res));
      const data = (await res.json()) as { code: string };
      setCode(data.code);
      setMode("sent");
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof TypeError ? "Tidak ada koneksi internet." : (e as Error).message });
      setMode("idle");
    }
  };

  const receive = async () => {
    const c = input.replace(/\D/g, "");
    if (!SHARE_CODE_RE.test(c)) {
      setMessage({ kind: "error", text: "Kode harus 6 angka." });
      return;
    }
    if (hasData && !confirm("Timpa isian Streak v2 di perangkat ini dengan data dari HP?")) return;
    setMode("loading");
    setMessage(null);
    try {
      const res = await fetch(`/api/streak-share/${c}`, { cache: "no-store" });
      if (!res.ok) throw new Error(await errorText(res));
      const data: unknown = await res.json();
      if (!isSnapshot(data)) throw new Error("Data dari server tidak valid.");
      onLoad(data);
      setMessage({ kind: "ok", text: `Data dari HP (kode ${c}) dimuat.` });
      setInput("");
      setMode("idle");
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof TypeError ? "Tidak ada koneksi internet." : (e as Error).message });
      setMode("receive");
    }
  };

  const btn = "text-sm font-semibold px-3 py-1.5 rounded-lg border disabled:opacity-40";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col gap-2" data-testid="share-bar">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-auto">HP → PC</span>
        <button type="button" onClick={send} disabled={mode === "sending" || mode === "loading"} className={`${btn} bg-teal-600 border-teal-600 text-white`}>
          {mode === "sending" ? "Mengirim…" : "📤 Kirim ke PC"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "receive" ? "idle" : "receive");
            setMessage(null);
          }}
          className={`${btn} bg-white border-teal-600 text-teal-700`}
        >
          📥 Ambil dari HP
        </button>
      </div>

      {mode === "sent" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-teal-50 border border-teal-100 p-3">
          <span className="text-xs text-slate-600">Ketik kode ini di PC (berlaku 2 jam):</span>
          <span className="text-3xl font-bold tracking-widest text-teal-800 font-mono" data-testid="share-code">
            {code.slice(0, 3)} {code.slice(3)}
          </span>
          <button type="button" onClick={() => setMode("idle")} className="ml-auto text-xs text-slate-500 hover:underline">
            Tutup
          </button>
        </div>
      )}

      {(mode === "receive" || mode === "loading") && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            receive();
          }}
        >
          <input
            inputMode="numeric"
            autoFocus
            aria-label="Kode dari HP"
            placeholder="6 angka"
            maxLength={7}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-32 border border-gray-200 rounded-lg px-3 py-1.5 text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          <button type="submit" disabled={mode === "loading"} className={`${btn} bg-teal-600 border-teal-600 text-white`}>
            {mode === "loading" ? "Mengambil…" : "Ambil"}
          </button>
        </form>
      )}

      {message && (
        <p className={`text-xs ${message.kind === "ok" ? "text-emerald-700" : "text-red-600"}`} data-testid="share-message">
          {message.text}
        </p>
      )}
    </div>
  );
}

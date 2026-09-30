"use client";

import dynamic from "next/dynamic";

// Konva needs `window`, so the drawing client is rendered only in the browser.
const GeminiRetinalClient = dynamic(() => import("./GeminiRetinalClient"), {
  ssr: false,
  loading: () => <div className="p-10 text-center text-sm text-slate-400">Memuat kanvas…</div>,
});

export default function GeminiRetinalLoader() {
  return <GeminiRetinalClient />;
}

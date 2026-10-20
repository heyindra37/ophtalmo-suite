"use client";

import dynamic from "next/dynamic";

// Konva needs `window`, so the drawing client is rendered only in the browser.
const AnteriorClient = dynamic(() => import("./AnteriorClient"), {
  ssr: false,
  loading: () => <div className="p-10 text-center text-sm text-slate-400">Memuat kanvas…</div>,
});

export default function AnteriorLoader() {
  return <AnteriorClient />;
}

"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Salin ke Rekam Medis" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-150 ${
        copied ? "bg-emerald-500 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
      }`}
    >
      {copied ? "✓ Tersalin" : label}
    </button>
  );
}

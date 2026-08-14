"use client";

import { useState } from "react";
import Link from "next/link";
import StreakWorkflowTab from "./StreakWorkflowTab";
import TransposeTab from "./TransposeTab";
import Disclaimer from "./Disclaimer";

export default function RefractionToolsClient() {
  const [tab, setTab] = useState<"streak" | "transpose">("streak");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-teal-600 text-sm font-medium hover:underline">
            ← Kembali
          </Link>
          <h1
            className="text-lg font-bold text-slate-900"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Refraction Tools
          </h1>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-5">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("streak")}
            className={`text-sm font-semibold px-4 py-2 rounded-lg border ${
              tab === "streak"
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white border-gray-200 text-slate-600"
            }`}
          >
            Streak Workflow
          </button>
          <button
            onClick={() => setTab("transpose")}
            className={`text-sm font-semibold px-4 py-2 rounded-lg border ${
              tab === "transpose"
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white border-gray-200 text-slate-600"
            }`}
          >
            Transpose
          </button>
        </div>

        {tab === "streak" ? <StreakWorkflowTab /> : <TransposeTab />}
      </main>

      <Disclaimer />
    </div>
  );
}

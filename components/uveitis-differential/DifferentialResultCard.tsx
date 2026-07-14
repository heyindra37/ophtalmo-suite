"use client";

import { useState } from "react";
import type { RankedResult, SourceConflictLog } from "@/lib/uveitis-differential/types";
import type { FacilityPrefs } from "./FacilityAvailabilitySettings";
import InvestigationTab from "./InvestigationTab";
import TreatmentTab from "./TreatmentTab";
import ActionAlert from "./ActionAlert";
import ConflictNotice from "./ConflictNotice";
import { C } from "./tokens";

function scoreColor(score: number): { bg: string; fg: string; border: string } {
  if (score > 70) return { bg: C.accent, fg: C.bg, border: C.accent };
  if (score >= 40) return { bg: "transparent", fg: C.accent, border: C.accent };
  return { bg: "transparent", fg: C.textDim, border: C.border };
}

export default function DifferentialResultCard({
  result,
  facilityPrefs,
  conflictLog,
}: {
  result: RankedResult;
  facilityPrefs: FacilityPrefs;
  conflictLog?: SourceConflictLog;
}) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<"info" | "investigasi" | "terapi">("info");
  const sc = scoreColor(result.scorePercent);

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
            {result.name}
          </h3>
          <span
            style={{
              display: "inline-block",
              fontSize: 10.5,
              fontWeight: 600,
              color: C.textDim,
              background: C.panel2,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: "2px 10px",
              textTransform: "capitalize",
            }}
          >
            {result.anatomicClass}
          </span>
          {result.forcedInclude && (
            <span
              style={{
                display: "inline-block",
                marginLeft: 6,
                fontSize: 10.5,
                fontWeight: 700,
                color: C.warn,
                background: C.warnBg,
                border: `1px solid ${C.warn}`,
                borderRadius: 999,
                padding: "2px 10px",
              }}
            >
              jangan lewatkan
            </span>
          )}
        </div>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              padding: "5px 12px",
              borderRadius: 999,
              background: sc.bg,
              color: sc.fg,
              border: `1.5px solid ${sc.border}`,
            }}
          >
            {result.scorePercent}% match
          </span>
          {typeof result.strongSignals === "number" && (
            <span style={{ fontSize: 10, color: C.textFaint }}>
              {result.strongSignals} sinyal kuat{result.patternMatched ? " + pola khas" : ""}
            </span>
          )}
        </div>
      </div>

      {result.matchedFeatures.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
            Kenapa cocok
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.text, lineHeight: 1.6 }}>
            {result.matchedFeatures.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {result.contradictedFeatures.length > 0 && (
        <div
          style={{
            marginTop: 10,
            background: C.warnBg,
            border: `1px solid ${C.warn}`,
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12.5,
            color: C.warn,
          }}
        >
          Ada temuan yang kurang cocok: {result.contradictedFeatures.join("; ")}
        </div>
      )}

      {result.actionAlerts && <ActionAlert messages={result.actionAlerts} />}

      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          marginTop: 12,
          background: "transparent",
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          color: C.accent,
          fontSize: 12.5,
          fontWeight: 600,
          padding: "6px 14px",
          cursor: "pointer",
        }}
      >
        {expanded ? "▲ Sembunyikan detail" : "▼ Lihat detail lengkap"}
      </button>

      {expanded && (
        <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {(["info", "investigasi", "terapi"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: tab === t ? C.accentDim : "transparent",
                  border: `1px solid ${tab === t ? C.accent : C.border}`,
                  color: tab === t ? C.accent : C.textDim,
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 8,
                  padding: "5px 12px",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {t === "info" ? "Info" : t === "investigasi" ? "Investigasi" : "Terapi"}
              </button>
            ))}
          </div>

          {tab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {result.disease.associations && result.disease.associations.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", margin: "0 0 3px" }}>Asosiasi</p>
                  <p style={{ fontSize: 13, color: C.text, margin: 0 }}>{result.disease.associations.join(", ")}</p>
                </div>
              )}
              {result.disease.critical_note && (
                <div
                  style={{
                    background: C.errorBg,
                    border: `1px solid ${C.error}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: C.error,
                    fontSize: 13,
                  }}
                >
                  ⚠️ {result.disease.critical_note}
                </div>
              )}
              {result.disease.prognosis && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", margin: "0 0 3px" }}>Prognosis</p>
                  <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>{result.disease.prognosis}</p>
                </div>
              )}
              {result.disease.source_conflicts && (
                <ConflictNotice diseaseId={result.diseaseId} conflictLog={conflictLog} />
              )}
            </div>
          )}

          {tab === "investigasi" && (
            <InvestigationTab investigations={result.disease.investigations} prefs={facilityPrefs} />
          )}

          {tab === "terapi" && (
            <TreatmentTab
              treatment={result.disease.treatment}
              criticalNote={result.disease.critical_note}
              differentialNote={result.disease.differential_note}
            />
          )}
        </div>
      )}
    </div>
  );
}

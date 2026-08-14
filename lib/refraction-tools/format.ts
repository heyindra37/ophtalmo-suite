import type { SpherocylResult } from "./types";

/** Round to nearest 0.25 — for DISPLAY only. Calculation always uses full precision. */
export function roundToQuarter(v: number): number {
  return Math.round(v * 4) / 4;
}

function signedFixed(v: number, decimals = 2): string {
  const rounded = roundToQuarter(v);
  const abs = Math.abs(rounded).toFixed(decimals);
  const sign = rounded < 0 ? "-" : "+";
  return sign + abs;
}

/** On-screen display: comma decimal separator, explicit sign, e.g. "+0,25". */
export function formatSignedDisplay(v: number): string {
  return signedFixed(v).replace(".", ",");
}

/** Clipboard/copy output: dot decimal separator, explicit sign, e.g. "+0.25". */
export function formatSignedCopy(v: number): string {
  return signedFixed(v);
}

/** On-screen axis label: "—" when there is no meaningful axis (pure sphere). */
export function formatAxisDisplay(axisDeg: number | null): string {
  return axisDeg === null ? "—" : String(Math.round(axisDeg));
}

/**
 * Copy-ready Rx line, e.g. "OD: S+0.25 C+1.50 X90". When cylinder is 0 (axisDeg null),
 * the X segment is omitted entirely rather than printing a literal em-dash into a
 * medical-record-bound string.
 */
export function formatRxLine(eyeLabel: "OD" | "OS", r: SpherocylResult): string {
  const s = formatSignedCopy(r.sphereD);
  const c = formatSignedCopy(r.cylinderD);
  const axisPart = r.axisDeg !== null ? ` X${Math.round(r.axisDeg)}` : "";
  return `${eyeLabel}: S${s} C${c}${axisPart}`;
}

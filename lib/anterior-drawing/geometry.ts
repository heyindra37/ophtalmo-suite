// Units: millimetres, origin at the corneal centre, x to screen-right, y UP. Drawn as the examiner
// facing the patient (slit-lamp view): OD nasal = screen right, OS nasal = screen left.

export type Eye = "OD" | "OS";
export interface Pt {
  x: number;
  y: number;
}

export const EXTENT = 17; // half-width of the drawing area
export const R_LIMBUS = 5.75;
export const R_PUPIL = 1.75;
export const R_CENTRAL = 1.5;
export const R_PARACENTRAL = 3.5;
export const FISSURE_HALF_W = 14;
export const FISSURE_HALF_H = 7;
/** Everted tarsal conjunctiva panels above and below the eye. */
export const TARSAL = { halfW: 11, inner: 12.5, outer: 16 };

export function upperLid(x: number): number {
  return Math.abs(x) >= FISSURE_HALF_W ? 0 : FISSURE_HALF_H * Math.cos((Math.PI * x) / (2 * FISSURE_HALF_W));
}
export function lowerLid(x: number): number {
  return -upperLid(x);
}

export type Structure =
  | "kornea"
  | "limbus"
  | "konjungtiva bulbi"
  | "konjungtiva tarsal superior"
  | "konjungtiva tarsal inferior"
  | "palpebra superior"
  | "palpebra inferior"
  | "kantus medial"
  | "kantus lateral";

export type CornealZone = "sentral" | "parasentral" | "perifer";

export function isNasal(x: number, eye: Eye): boolean {
  return eye === "OD" ? x > 0 : x < 0;
}

/** Clock hour as the examiner sees it: 12 up, 3 at screen right. */
export function clockHour(p: Pt): number {
  const h = Math.round(Math.atan2(p.x, p.y) / (Math.PI / 6));
  return ((h + 12) % 12) || 12;
}

export function structureOf(p: Pt, eye: Eye): Structure {
  if (Math.abs(p.x) <= TARSAL.halfW && p.y >= TARSAL.inner && p.y <= TARSAL.outer) return "konjungtiva tarsal superior";
  if (Math.abs(p.x) <= TARSAL.halfW && p.y <= -TARSAL.inner && p.y >= -TARSAL.outer) return "konjungtiva tarsal inferior";
  const r = Math.hypot(p.x, p.y);
  if (r <= R_LIMBUS - 0.5) return "kornea";
  if (r <= R_LIMBUS + 0.5) return "limbus";
  if (Math.abs(p.x) >= FISSURE_HALF_W - 2.5 && Math.abs(p.y) < 2.5) return isNasal(p.x, eye) ? "kantus medial" : "kantus lateral";
  if (p.y < upperLid(p.x) && p.y > lowerLid(p.x)) return "konjungtiva bulbi";
  return p.y > 0 ? "palpebra superior" : "palpebra inferior";
}

export function cornealZone(p: Pt): CornealZone {
  const r = Math.hypot(p.x, p.y);
  return r <= R_CENTRAL ? "sentral" : r <= R_PARACENTRAL ? "parasentral" : "perifer";
}

export function sideOf(p: Pt, eye: Eye): "nasal" | "temporal" | "tengah" {
  if (Math.abs(p.x) < 2) return "tengah";
  return isNasal(p.x, eye) ? "nasal" : "temporal";
}

/** Height (mm) of a hypopyon/hyphaema whose fluid level was clicked at `p`, from the inferior limbus. */
export function levelHeight(p: Pt): number {
  return Math.min(2 * R_LIMBUS, Math.max(0, p.y + R_LIMBUS));
}

export function roundHalf(v: number): number {
  return Math.round(v * 2) / 2;
}

export function fmtMm(v: number): string {
  return roundHalf(v).toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

export type PterygiumGrade = "I" | "II" | "III" | "IV";

/**
 * Extent of corneal invasion from the deepest point (head) of any drawn pterygium:
 * I at the limbus, II ≤2 mm past it, III >2 mm short of the pupil margin, IV at or past the pupil margin.
 */
export function pterygiumGrade(points: Pt[], pupilR = R_PUPIL): { grade: PterygiumGrade; invasionMm: number } | null {
  if (!points.length) return null;
  const rMin = Math.min(...points.map((p) => Math.hypot(p.x, p.y)));
  const invasionMm = Math.max(0, R_LIMBUS - rMin);
  const grade: PterygiumGrade = rMin <= pupilR ? "IV" : invasionMm > 2 ? "III" : invasionMm > 0.5 ? "II" : "I";
  return { grade, invasionMm };
}

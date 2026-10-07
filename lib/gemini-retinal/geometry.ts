// Map units: ora serrata = 1.0. Axes: x to screen-right, y UP (superior). The global map is drawn
// as the examiner facing the patient (fundus-photo orientation): OD nasal = screen right.

export type Eye = "OD" | "OS";
export interface Pt {
  x: number;
  y: number;
}

export const R_MACULA = 0.12;
export const R_POSTERIOR_POLE = 0.35;
export const R_EQUATOR = 0.6;
export const R_PERIPHERY = 0.9;
export const R_ORA = 1.0;
export const R_PARS_PLANA = 1.2;
export const VIEWPORT_RADIUS = 0.45;
/**
 * With a 90D lens and eccentric gaze the lens edge reaches the equator to just anterior to it;
 * the ora serrata is not seen without scleral depression.
 */
export const R_GAZE_REACH = 0.7;
export const GAZE_DISTANCE = R_GAZE_REACH - VIEWPORT_RADIUS;
export const DISC_OFFSET = 0.2;
export const DISC_RADIUS = 0.06;

export type Gaze = "atas-kanan" | "atas" | "atas-kiri" | "kanan" | "primer" | "kiri" | "bawah-kanan" | "bawah" | "bawah-kiri";

/**
 * Direction the patient looks, from the patient's own point of view. Looking up shows superior retina;
 * looking to the patient's right shows the retina on the patient's right, which is screen-left on a
 * map drawn facing the patient.
 */
const GAZE_VECTOR: Record<Gaze, Pt> = {
  "atas-kanan": { x: -1, y: 1 },
  atas: { x: 0, y: 1 },
  "atas-kiri": { x: 1, y: 1 },
  kanan: { x: -1, y: 0 },
  primer: { x: 0, y: 0 },
  kiri: { x: 1, y: 0 },
  "bawah-kanan": { x: -1, y: -1 },
  bawah: { x: 0, y: -1 },
  "bawah-kiri": { x: 1, y: -1 },
};

export function gazeOffset(gaze: Gaze): Pt {
  const v = GAZE_VECTOR[gaze];
  const len = Math.hypot(v.x, v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: (v.x / len) * GAZE_DISTANCE, y: (v.y / len) * GAZE_DISTANCE };
}

/** PRD optical inversion: the 90D/78D image is real and inverted on both axes. */
export function localToGlobal(local: Pt, gaze: Gaze): Pt {
  const g = gazeOffset(gaze);
  return { x: g.x - local.x, y: g.y - local.y };
}

export function globalToLocal(global: Pt, gaze: Gaze): Pt {
  const g = gazeOffset(gaze);
  return { x: g.x - global.x, y: g.y - global.y };
}

export function discCenter(eye: Eye): Pt {
  return { x: eye === "OD" ? DISC_OFFSET : -DISC_OFFSET, y: 0 };
}

/** Anatomical name of the side a horizontal screen direction points to, for this eye. */
export function horizontalSide(screenDx: number, eye: Eye): "nasal" | "temporal" {
  const nasalIsRight = eye === "OD";
  return screenDx > 0 === nasalIsRight ? "nasal" : "temporal";
}

export function gazeSubLabel(gaze: Gaze, eye: Eye): string {
  const v = GAZE_VECTOR[gaze];
  if (v.x === 0 && v.y === 0) return "Kutub posterior";
  const side = v.x !== 0 ? horizontalSide(v.x, eye) : "";
  if (v.y !== 0 && side) return `${v.y > 0 ? "Supero" : "Infero"}${side}`;
  if (v.y !== 0) return v.y > 0 ? "Superior" : "Inferior";
  return side === "nasal" ? "Nasal" : "Temporal";
}

// Canonical circular order used for adjacency and for "dari A hingga B" phrasing.
export const SECTORS = [
  "superior",
  "superonasal",
  "nasal",
  "inferonasal",
  "inferior",
  "inferotemporal",
  "temporal",
  "superotemporal",
] as const;
export type Sector = (typeof SECTORS)[number];

export const ZONES = [
  "area makula",
  "kutub posterior",
  "mid-perifer",
  "perifer",
  "perifer dekat ora serrata",
  "pars plana",
] as const;
export type Zone = (typeof ZONES)[number];

export function zoneOf(p: Pt): Zone {
  const r = Math.hypot(p.x, p.y);
  if (r < R_MACULA) return "area makula";
  if (r < R_POSTERIOR_POLE) return "kutub posterior";
  if (r < R_EQUATOR) return "mid-perifer";
  if (r < R_PERIPHERY) return "perifer";
  if (r <= R_ORA) return "perifer dekat ora serrata";
  return "pars plana";
}

export function sectorOf(p: Pt, eye: Eye): Sector {
  // Work in "nasal-positive" space so both eyes share one table.
  const nx = eye === "OD" ? p.x : -p.x;
  const deg = ((Math.atan2(p.y, nx) * 180) / Math.PI + 360) % 360;
  const idx = Math.round(deg / 45) % 8; // 0 = nasal, 2 = superior, 4 = temporal, 6 = inferior
  const byAngle: Sector[] = ["nasal", "superonasal", "superior", "superotemporal", "temporal", "inferotemporal", "inferior", "inferonasal"];
  return byAngle[idx];
}

export function classifyPoint(p: Pt, eye: Eye): { sector: Sector | null; zone: Zone } {
  const zone = zoneOf(p);
  return { sector: zone === "area makula" ? null : sectorOf(p, eye), zone };
}

export type ScreenDirection = "pusat" | "atas" | "kanan-atas" | "kanan" | "kanan-bawah" | "bawah" | "kiri-bawah" | "kiri" | "kiri-atas";

export interface OnhPointer {
  /** Optic-disc position in lens coordinates (screen-right = +x, screen-up = +y). */
  local: Pt;
  distance: number;
  inside: boolean;
  direction: ScreenDirection;
}

const DIRECTIONS_FROM_EAST: ScreenDirection[] = ["kanan", "kanan-atas", "atas", "kiri-atas", "kiri", "kiri-bawah", "bawah", "kanan-bawah"];

/** Where the optic disc appears relative to the lens centre for this eye and gaze, as the examiner sees it. */
export function onhPointer(eye: Eye, gaze: Gaze): OnhPointer {
  const local = globalToLocal(discCenter(eye), gaze);
  const distance = Math.hypot(local.x, local.y);
  const deg = ((Math.atan2(local.y, local.x) * 180) / Math.PI + 360) % 360;
  const direction = distance < 0.02 ? "pusat" : DIRECTIONS_FROM_EAST[Math.round(deg / 45) % 8];
  return { local, distance, inside: distance <= VIEWPORT_RADIUS, direction };
}

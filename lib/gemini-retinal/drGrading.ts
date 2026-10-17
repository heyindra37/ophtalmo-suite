import { DISC_RADIUS, R_MACULA, discCenter, type Eye, type Pt } from "./geometry";
import type { DrawnItem } from "./narrative";

export type Quadrant4 = "superotemporal" | "superonasal" | "inferotemporal" | "inferonasal";
export const QUADRANTS4: Quadrant4[] = ["superotemporal", "superonasal", "inferotemporal", "inferonasal"];

export interface DrInputs {
  /** ICDR "4": more than 20 intraretinal haemorrhages in this quadrant (clinician's judgement). */
  hemSevere: Record<Quadrant4, boolean>;
  nvdLarge: boolean; // NVD >= 1/4-1/3 disc area
  nveLarge: boolean; // NVE >= 1/2 disc area
}

export function emptyDrInputs(): DrInputs {
  return {
    hemSevere: { superotemporal: false, superonasal: false, inferotemporal: false, inferonasal: false },
    nvdLarge: false,
    nveLarge: false,
  };
}

export type DrGrade = "none" | "mild" | "moderate" | "severe" | "pdr";

export interface DrResult {
  grade: DrGrade;
  label: string;
  reasons: string[];
  verySevere: boolean;
  hrc: boolean;
  dmeSuspect: boolean;
}

export function quadrant4(p: Pt, eye: Eye): Quadrant4 {
  const nasalX = eye === "OD" ? p.x : -p.x;
  const sup = p.y >= 0;
  const nasal = nasalX >= 0;
  return `${sup ? "supero" : "infero"}${nasal ? "nasal" : "temporal"}` as Quadrant4;
}

/** NV within one disc diameter of the disc margin counts as NVD. */
export function isNvd(p: Pt, eye: Eye): boolean {
  const d = discCenter(eye);
  return Math.hypot(p.x - d.x, p.y - d.y) <= DISC_RADIUS + 2 * DISC_RADIUS;
}

const HEMORRHAGES = ["dot_blot_hge", "flame_hge"];
const MODERATE_SIGNS = [...HEMORRHAGES, "hard_exudates", "cotton_wool"];
const PDR_SIGNS = ["nve", "vitreous_hge", "fibrovascular"];

function pointsOf(items: DrawnItem[], id: string): Pt[] {
  return items.filter((i) => i.lesionId === id).flatMap((i) => i.points);
}

function quadrantsOf(points: Pt[], eye: Eye): Set<Quadrant4> {
  return new Set(points.map((p) => quadrant4(p, eye)));
}

const has = (items: DrawnItem[], id: string) => items.some((i) => i.lesionId === id);

export const GRADE_LABEL: Record<DrGrade, string> = {
  none: "Tidak tampak retinopati diabetik",
  mild: "Mild NPDR",
  moderate: "Moderate NPDR",
  severe: "Severe NPDR",
  pdr: "PDR",
};

export function gradeDr(items: DrawnItem[], eye: Eye, input: DrInputs): DrResult {
  const reasons: string[] = [];
  const dmeSuspect = pointsOf(items, "hard_exudates").some((p) => Math.hypot(p.x, p.y) < R_MACULA);

  // PDR + high-risk characteristics (DRS)
  const nvPts = pointsOf(items, "nve");
  const nvd = nvPts.some((p) => isNvd(p, eye));
  const nve = nvPts.some((p) => !isNvd(p, eye));
  const vh = has(items, "vitreous_hge");
  if (PDR_SIGNS.some((id) => has(items, id))) {
    if (nvd) reasons.push("NVD (neovaskularisasi ≤1 diameter papil dari diskus)");
    if (nve) reasons.push("NVE");
    if (vh) reasons.push("vitreous hemorrhage");
    if (has(items, "fibrovascular")) reasons.push("jaringan fibrovaskular");
    const hrcWhy: string[] = [];
    if (nvd && input.nvdLarge) hrcWhy.push("NVD ≥¼–⅓ disc area");
    if (nvd && vh) hrcWhy.push("NVD + vitreous hemorrhage");
    if (nve && input.nveLarge && vh) hrcWhy.push("NVE ≥½ disc area + vitreous hemorrhage");
    if (hrcWhy.length) reasons.push(`High-risk characteristics: ${hrcWhy.join("; ")}`);
    return { grade: "pdr", label: hrcWhy.length ? "PDR dengan high-risk characteristics" : "PDR", reasons, verySevere: false, hrc: hrcWhy.length > 0, dmeSuspect };
  }

  // Severe NPDR: 4-2-1 rule
  const vbQuads = quadrantsOf(pointsOf(items, "venous_beading"), eye);
  const irmaQuads = quadrantsOf(pointsOf(items, "irma"), eye);
  const hemAll4 = QUADRANTS4.every((q) => input.hemSevere[q]);
  const criteria: string[] = [];
  if (hemAll4) criteria.push(">20 perdarahan intraretina di 4 kuadran");
  if (vbQuads.size >= 2) criteria.push(`venous beading ${vbQuads.size} kuadran`);
  if (irmaQuads.size >= 1) criteria.push(`IRMA ${irmaQuads.size} kuadran`);
  if (criteria.length) {
    const verySevere = criteria.length >= 2;
    return { grade: "severe", label: verySevere ? "Severe NPDR (very severe)" : "Severe NPDR", reasons: criteria, verySevere, hrc: false, dmeSuspect };
  }

  // Moderate NPDR
  const someHemQuads = QUADRANTS4.filter((q) => input.hemSevere[q]);
  const moderate = MODERATE_SIGNS.filter((id) => has(items, id));
  if (moderate.length || vbQuads.size === 1 || someHemQuads.length) {
    const names: Record<string, string> = { dot_blot_hge: "dot/blot hemorrhage", flame_hge: "flame hemorrhage", hard_exudates: "hard exudates", cotton_wool: "cotton wool spot" };
    reasons.push(...moderate.map((id) => names[id]));
    if (vbQuads.size === 1) reasons.push("venous beading 1 kuadran");
    if (someHemQuads.length) reasons.push(`>20 perdarahan di ${someHemQuads.length} kuadran (belum 4)`);
    return { grade: "moderate", label: "Moderate NPDR", reasons, verySevere: false, hrc: false, dmeSuspect };
  }

  if (has(items, "microaneurysm")) {
    return { grade: "mild", label: "Mild NPDR", reasons: ["microaneurysm saja"], verySevere: false, hrc: false, dmeSuspect };
  }
  return { grade: "none", label: GRADE_LABEL.none, reasons: [], verySevere: false, hrc: false, dmeSuspect };
}

export function drImpression(r: DrResult): string {
  let text: string;
  if (r.grade === "none") text = "tidak tampak retinopati diabetik";
  else if (r.grade === "pdr" && r.hrc) text = `PDR dengan high-risk characteristics (${r.reasons.find((x) => x.startsWith("High-risk"))!.replace("High-risk characteristics: ", "")})`;
  else if (r.grade === "severe") text = `Severe NPDR (${r.verySevere ? "very severe: " : ""}${r.reasons.join(", ")})`;
  else text = r.label;
  if (r.dmeSuspect) text += ", curiga DME (eksudat di area makula, konfirmasi OCT)";
  return `Kesan: ${text}.`;
}

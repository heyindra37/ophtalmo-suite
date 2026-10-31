import { circularRuns, joinId, type DrawnItem } from "@/lib/gemini-retinal/narrative";
import { R_PUPIL, clockHour, cornealZone, fmtMm, levelHeight, pterygiumGrade, sideOf, structureOf, type PterygiumGrade, type CornealZone, type Eye, type Pt } from "./geometry";

export type { DrawnItem };

export type Group = "palpebra" | "konjungtiva" | "kornea" | "bmd" | "iris" | "lensa";
export const GROUPS: Group[] = ["palpebra", "konjungtiva", "kornea", "bmd", "iris", "lensa"];
export const GROUP_LABEL: Record<Group, string> = {
  palpebra: "Palpebra",
  konjungtiva: "Konjungtiva",
  kornea: "Kornea",
  bmd: "BMD",
  iris: "Iris/pupil",
  lensa: "Lensa",
};
/** Groups the doctor can tick as normal when nothing is drawn there; the lens has its own status. */
export const NORMAL_TEXT: Partial<Record<Group, string>> = {
  palpebra: "tenang",
  konjungtiva: "tenang",
  kornea: "jernih",
  bmd: "kesan dalam, jernih",
  iris: "dalam batas normal",
};

export interface AnteriorDef {
  id: string;
  name: string;
  type: "point" | "area" | "level";
  color: string;
  shape?: string;
  fill_opacity?: number;
  group: Group;
  measure?: boolean;
  /** false = never prefix a pin count (e.g. hyperaemia placed once per canthus). */
  count?: boolean;
}

export const GRADES = ["", "0", "0,5+", "1+", "2+", "3+", "4+"] as const;

export interface AnteriorInputs {
  normal: Partial<Record<Group, boolean>>;
  depth: "" | "dalam" | "dangkal";
  cells: string;
  flare: string;
  pupilShape: "" | "bulat" | "irreguler";
  pupilSize: string;
  reflex: "" | "+" | "lambat" | "-" | "RAPD +";
  lens: "" | "jernih" | "katarak" | "pseudofakia" | "afakia";
  no: string;
  c: string;
  p: string;
  iol: "" | "in the bag" | "sulkus" | "BMD (AC IOL)";
  iolCentered: "" | "sentral" | "desentrasi";
  /** Doctor's override of the auto-computed pterygium grade. */
  pterygiumGrade: "" | PterygiumGrade;
}

export function emptyInputs(): AnteriorInputs {
  return {
    normal: {},
    depth: "",
    cells: "",
    flare: "",
    pupilShape: "",
    pupilSize: "",
    reflex: "",
    lens: "",
    no: "",
    c: "",
    p: "",
    iol: "",
    iolCentered: "",
    pterygiumGrade: "",
  };
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const CORNEAL: string[] = ["kornea", "limbus"];

export function hourPhrase(hours: Set<number>): string {
  const runs = circularRuns(hours, HOURS);
  if (runs.length === 1 && runs[0].length === 12) return "360°";
  return `jam ${joinId(runs.map((r) => (r.length === 1 ? `${r[0]}` : `${r[0]}–${r[r.length - 1]}`)))}`;
}

function sizePhrase(item: DrawnItem): string {
  const xs = item.points.map((p) => p.x);
  const ys = item.points.map((p) => p.y);
  const w = (item.width ?? 0) + Math.max(...xs) - Math.min(...xs);
  const h = (item.width ?? 0) + Math.max(...ys) - Math.min(...ys);
  return `±${fmtMm(Math.max(w, 0.5))}×${fmtMm(Math.max(h, 0.5))} mm`;
}

function ordered<T>(set: Set<T>, order: readonly T[]): T[] {
  return order.filter((x) => set.has(x));
}

/** Where a set of drawn items lies, phrased for the group they are reported under. */
function wherePhrase(def: AnteriorDef, items: DrawnItem[], eye: Eye): string {
  const pts: Pt[] = items.flatMap((i) => i.points);
  const structs = new Set(pts.map((p) => structureOf(p, eye)));
  const hours = new Set<number>();
  const zones = new Set<CornealZone>();
  for (const p of pts) {
    if (Math.hypot(p.x, p.y) > 0.75) hours.add(clockHour(p));
    zones.add(cornealZone(p));
  }
  if (def.group === "kornea" || def.group === "iris" || def.group === "lensa") {
    const parts: string[] = [];
    if (hours.size) parts.push(`di ${hourPhrase(hours)}`);
    if (def.group === "kornea") {
      const z = ordered(zones, ["sentral", "parasentral", "perifer"] as CornealZone[]);
      if (structs.has("limbus") && !structs.has("kornea")) parts.push("limbus");
      else if (z.length) parts.push(z.length === 1 ? z[0] : `${z[0]} hingga ${z[z.length - 1]}`);
    }
    return parts.join(", ");
  }
  // Conjunctiva and lids: name the structure and side.
  const places: string[] = [];
  for (const s of structs) {
    const sides = new Set(pts.filter((p) => structureOf(p, eye) === s).map((p) => sideOf(p, eye)));
    const sideTxt = s.startsWith("kantus") ? "" : ordered(sides, ["nasal", "tengah", "temporal"] as const).join("–");
    if (s === "kornea" || s === "limbus") places.push(s === "limbus" ? `limbus ${hourPhrase(hours)}` : "kornea");
    else places.push(sideTxt && sides.size < 3 ? `${s} ${sideTxt}` : s);
  }
  return places.length ? `di ${joinId(places)}` : "";
}

export function lesionPhrase(def: AnteriorDef, items: DrawnItem[], eye: Eye): string {
  // Drop explanatory parentheses such as "(KP)", but keep a result marker like "(+)".
  const name = def.name.replace(/\s*\((?!\+\)).*\)$/, "").toLowerCase();
  if (def.type === "level") {
    return `${name} setinggi ${fmtMm(levelHeight(items[items.length - 1].points[0]))} mm`;
  }
  const pins = items.filter((i) => i.kind === "pin").length;
  const count = def.count !== false && pins > 1 && pins === items.length ? `${pins} ` : "";
  const where = wherePhrase(def, items, eye);
  const size = def.measure && items.length === 1 && items[0].kind === "stroke" ? `, ${sizePhrase(items[0])}` : "";
  return `${count}${name}${where ? ` ${where}` : ""}${size}`;
}

function inputParts(group: Group, inp: AnteriorInputs): string[] {
  const out: string[] = [];
  if (group === "bmd") {
    if (inp.depth) out.push(`kesan ${inp.depth}`);
    if (inp.cells) out.push(`sel ${inp.cells}`);
    if (inp.flare) out.push(`flare ${inp.flare}`);
  }
  if (group === "iris") {
    const pupil = [inp.pupilShape, inp.pupilSize ? `Ø ${inp.pupilSize} mm` : ""].filter(Boolean).join(", ");
    if (pupil) out.push(`pupil ${pupil}`);
    if (inp.reflex) out.push(inp.reflex === "RAPD +" ? "RAPD (+)" : `refleks cahaya ${inp.reflex === "lambat" ? "lambat" : `(${inp.reflex})`}`);
  }
  if (group === "lensa") {
    if (inp.lens === "jernih") out.push("jernih");
    if (inp.lens === "afakia") out.push("afakia");
    if (inp.lens === "katarak") {
      const g = [inp.no && `NO${inp.no}`, inp.c && `C${inp.c}`, inp.p && `P${inp.p}`].filter(Boolean).join(" ");
      out.push(g ? `keruh (katarak ${g})` : "keruh");
    }
    if (inp.lens === "pseudofakia") out.push(["pseudofakia", inp.iol && `IOL ${inp.iol}`, inp.iolCentered].filter(Boolean).join(", "));
  }
  return out;
}

export function pupilRadius(inp: AnteriorInputs): number {
  const d = Number(inp.pupilSize.replace(",", "."));
  return d > 0 && d < 11.5 ? d / 2 : R_PUPIL;
}

/** Auto grade from the drawing, plus the doctor's override when set. */
export function pterygiumResult(items: DrawnItem[], inp: AnteriorInputs) {
  const auto = pterygiumGrade(
    items.filter((i) => i.lesionId === "pterigium").flatMap((i) => i.points),
    pupilRadius(inp)
  );
  return auto && { ...auto, final: inp.pterygiumGrade || auto.grade, overridden: !!inp.pterygiumGrade };
}

export function eyeNarrative(eye: Eye, items: DrawnItem[], defs: AnteriorDef[], inp: AnteriorInputs): string | null {
  const groups: string[] = [];
  for (const g of GROUPS) {
    const parts: string[] = [];
    for (const def of defs.filter((d) => d.group === g)) {
      const mine = items.filter((i) => i.lesionId === def.id);
      if (!mine.length) continue;
      let phrase = lesionPhrase(def, mine, eye);
      const pt = def.id === "pterigium" ? pterygiumResult(items, inp) : null;
      if (pt) phrase += `, derajat ${pt.final}${pt.overridden ? "" : ` (invasi ±${fmtMm(pt.invasionMm)} mm dari limbus)`}`;
      parts.push(phrase);
    }
    const extra = inputParts(g, inp);
    if (!parts.length && inp.normal[g] && NORMAL_TEXT[g]) parts.push(NORMAL_TEXT[g]!);
    parts.push(...extra);
    if (parts.length) groups.push(`${GROUP_LABEL[g]}: ${parts.join("; ")}.`);
  }
  return groups.length ? `SA ${eye} : ${groups.join(" ")}` : null;
}

export function buildAnteriorNarrative(
  lesions: Record<Eye, DrawnItem[]>,
  defs: AnteriorDef[],
  inputs: Record<Eye, AnteriorInputs>,
  eyes: Eye[] = ["OD", "OS"]
): string {
  return eyes
    .map((e) => eyeNarrative(e, lesions[e], defs, inputs[e]))
    .filter((x): x is string => !!x)
    .join("\n");
}

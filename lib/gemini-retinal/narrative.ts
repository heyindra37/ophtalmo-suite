import { SECTORS, ZONES, classifyPoint, type Eye, type Pt, type Sector, type Zone } from "./geometry";

export interface LesionDef {
  id: string;
  name: string;
  type: "point" | "area";
  color: string;
  shape?: string;
  fill_opacity?: number;
}

export interface DrawnItem {
  uid: string;
  lesionId: string;
  kind: "pin" | "stroke";
  points: Pt[]; // global map coordinates
  width?: number; // stroke width in map units
}

const NARRATIVE_LABEL: Record<string, string> = {
  retinal_detachment: "retinal detachment",
  nve: "NVE/NVD",
  erm: "epiretinal membrane",
  vitritis: "vitritis",
  floaters: "floaters",
  vitreous_hge: "vitreous hemorrhage",
  asteroid_hyalosis: "asteroid hyalosis",
  hyaloid_ring: "hyaloid ring",
  irma: "IRMA",
};

export function narrativeLabel(def: LesionDef): string {
  return NARRATIVE_LABEL[def.id] ?? def.name.toLowerCase();
}

/** Groups members of a circular sequence into contiguous runs following `order`. */
export function circularRuns<T>(members: Set<T>, order: readonly T[]): T[][] {
  if (members.size === 0) return [];
  if (members.size === order.length) return [[...order]];
  const has = (i: number) => members.has(order[(i + order.length) % order.length]);
  // Start right after a gap so a run wrapping past index 0 stays whole.
  let start = 0;
  while (has(start - 1)) start++;
  const runs: T[][] = [];
  let cur: T[] = [];
  for (let k = 0; k < order.length; k++) {
    const i = (start + k) % order.length;
    if (has(i)) cur.push(order[i]);
    else if (cur.length) {
      runs.push(cur);
      cur = [];
    }
  }
  if (cur.length) runs.push(cur);
  return runs;
}

/** Groups a set of sectors into circular contiguous runs following SECTORS order. */
export function sectorRuns(sectors: Set<Sector>): Sector[][] {
  return circularRuns(sectors, SECTORS);
}

export function joinId(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} dan ${parts[parts.length - 1]}`;
}

function locationPhrase(sectors: Set<Sector>, macula: boolean): string {
  const runs = sectorRuns(sectors);
  const maculaTail = macula ? " dan area makula" : "";
  if (runs.length === 0) return macula ? "di area makula" : "";
  if (runs.length === 1 && runs[0].length === SECTORS.length) return `di seluruh kuadran${maculaTail}`;
  if (runs.length === 1 && runs[0].length >= 2) {
    const r = runs[0];
    return `meluas dari kuadran ${r[0]} hingga ${r[r.length - 1]}${maculaTail}`;
  }
  const parts = runs.map((r) => (r.length === 1 ? r[0] : `${r[0]} hingga ${r[r.length - 1]}`));
  return `di kuadran ${joinId(parts)}${maculaTail}`;
}

function zonePhrase(zones: Set<Zone>): string {
  const ordered = ZONES.filter((z) => z !== "area makula" && zones.has(z));
  if (ordered.length === 0) return "";
  if (ordered.length === 1) return ordered[0];
  return `${ordered[0]} hingga ${ordered[ordered.length - 1]}`;
}

export function lesionSentence(def: LesionDef, items: DrawnItem[], eye: Eye): string | null {
  const sectors = new Set<Sector>();
  const zones = new Set<Zone>();
  let macula = false;
  for (const it of items) {
    for (const p of it.points) {
      const c = classifyPoint(p, eye);
      zones.add(c.zone);
      if (c.sector) sectors.add(c.sector);
      else macula = true;
    }
  }
  if (sectors.size === 0 && !macula) return null;
  const pinCount = items.filter((i) => i.kind === "pin").length;
  const countPrefix = pinCount > 1 && pinCount === items.length ? `${pinCount} ` : "";
  const where = locationPhrase(sectors, macula);
  const zone = zonePhrase(zones);
  return `Tampak ${countPrefix}${narrativeLabel(def)} ${where}${zone ? `, ${zone}` : ""}.`;
}

export function eyeNarrative(eye: Eye, items: DrawnItem[], defs: LesionDef[]): string | null {
  const sentences: string[] = [];
  for (const def of defs) {
    const mine = items.filter((i) => i.lesionId === def.id);
    if (!mine.length) continue;
    const s = lesionSentence(def, mine, eye);
    if (s) sentences.push(s);
  }
  return sentences.length ? `Fd${eye} : ${sentences.join(" ")}` : null;
}

export function buildNarrative(
  lesions: Record<Eye, DrawnItem[]>,
  defs: LesionDef[],
  impressions?: Partial<Record<Eye, string>>
): string {
  return (["OD", "OS"] as Eye[])
    .map((eye) => {
      const base = eyeNarrative(eye, lesions[eye], defs);
      const imp = impressions?.[eye];
      if (!imp) return base;
      return base ? `${base} ${imp}` : `Fd${eye} : ${imp}`;
    })
    .filter((x): x is string => !!x)
    .join("\n");
}

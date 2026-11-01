import { EXTENT, fmtMm, levelHeight, type Eye, type Pt } from "./geometry";
import type { AnteriorDef, DrawnItem } from "./narrative";

/** One callout: a label tied to the lesion it names. Anchor is in mm. */
export interface CalloutSpec {
  key: string;
  defId: string;
  color: string;
  text: string;
  anchor: Pt;
}

/** A callout placed in a band above or below the drawing; x/w in px, rows count from the outer edge. */
export interface PlacedCallout extends CalloutSpec {
  band: "top" | "bottom";
  row: number;
  x: number;
  w: number;
}

export interface CalloutMetrics {
  fs: number;
  h: number;
  pad: number;
  gap: number;
  rowGap: number;
  chip: number;
  inset: number;
}

export function calloutMetrics(fs: number): CalloutMetrics {
  return {
    fs,
    h: Math.round(fs * 1.9),
    pad: Math.round(fs * 0.4),
    gap: Math.round(fs * 0.4),
    rowGap: Math.round(fs * 0.3),
    chip: Math.round(fs * 0.9),
    inset: Math.round(fs * 0.5),
  };
}

/** Height of a callout band holding `rows` rows (0 when empty, so an unused side costs nothing). */
export function bandPx(rows: number, m: CalloutMetrics): number {
  return rows === 0 ? 0 : m.pad * 2 + rows * m.h + (rows - 1) * m.rowGap + m.rowGap;
}

/** Top edge (px, from the stage top) of a placed callout. */
export function calloutY(c: PlacedCallout, stageHeight: number, m: CalloutMetrics): number {
  return c.band === "top" ? m.pad + c.row * (m.h + m.rowGap) : stageHeight - m.pad - (c.row + 1) * m.h - c.row * m.rowGap;
}

/** Drops explanatory parentheses such as "(KP)" but keeps a result marker like "(+)". */
export function shortName(def: AnteriorDef): string {
  return def.name.replace(/\s*\((?!\+\)).*\)$/, "");
}

interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

function itemBox(i: DrawnItem): Box {
  const half = (i.width ?? 0) / 2;
  const xs = i.points.map((p) => p.x);
  const ys = i.points.map((p) => p.y);
  return { x0: Math.min(...xs) - half, x1: Math.max(...xs) + half, y0: Math.min(...ys) - half, y1: Math.max(...ys) + half };
}

const near = (a: Box, b: Box, m = 1.5) => a.x0 - m <= b.x1 && b.x0 - m <= a.x1 && a.y0 - m <= b.y1 && b.y0 - m <= a.y1;

/** Groups items of one lesion type whose boxes touch or sit within 1.5 mm, so a spray of pins gets one callout. */
function clusters(items: DrawnItem[]): DrawnItem[][] {
  const boxes = items.map(itemBox);
  const parent = items.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++) if (near(boxes[i], boxes[j])) parent[find(j)] = find(i);
  const groups = new Map<number, DrawnItem[]>();
  items.forEach((it, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), it]));
  return [...groups.values()];
}

/** One callout per lesion cluster: name, plus size in mm for measured lesions or a count for repeated pins. */
export function buildCallouts(items: DrawnItem[], defs: AnteriorDef[], eye: Eye): CalloutSpec[] {
  const out: CalloutSpec[] = [];
  for (const def of defs) {
    const mine = items.filter((i) => i.lesionId === def.id);
    if (!mine.length) continue;
    const name = shortName(def);

    if (def.type === "level") {
      const at = mine[mine.length - 1].points[0];
      out.push({
        key: `${eye}-${def.id}`,
        defId: def.id,
        color: def.color,
        text: `${name} ${fmtMm(levelHeight(at))} mm`,
        anchor: { x: 0, y: at.y },
      });
      continue;
    }

    clusters(mine).forEach((group, n) => {
      const pts = group.flatMap((i) => i.points);
      const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      const anchor = pts.reduce((best, p) => (Math.hypot(p.x - cx, p.y - cy) < Math.hypot(best.x - cx, best.y - cy) ? p : best));

      let suffix = "";
      const strokes = group.filter((i) => i.kind === "stroke");
      if (def.measure && strokes.length) {
        const boxes = group.map(itemBox);
        const w = Math.max(...boxes.map((b) => b.x1)) - Math.min(...boxes.map((b) => b.x0));
        const h = Math.max(...boxes.map((b) => b.y1)) - Math.min(...boxes.map((b) => b.y0));
        suffix = ` ±${fmtMm(Math.max(w, 0.5))}×${fmtMm(Math.max(h, 0.5))} mm`;
      } else if (group.length > 1 && strokes.length === 0) {
        suffix = ` ×${group.length}`;
      }
      out.push({ key: `${eye}-${def.id}-${n}`, defId: def.id, color: def.color, text: `${name}${suffix}`, anchor });
    });
  }
  return out;
}

interface Entry {
  spec: CalloutSpec;
  w: number;
  ax: number;
}

/** Splits x-sorted entries into rows that each fit the band width. */
function chunk(entries: Entry[], avail: number, gap: number): Entry[][] {
  const rows: Entry[][] = [];
  let cur: Entry[] = [];
  let used = 0;
  for (const e of entries) {
    const next = used + (cur.length ? gap : 0) + e.w;
    if (cur.length && next > avail) {
      rows.push(cur);
      cur = [];
      used = 0;
    }
    used += (cur.length ? gap : 0) + e.w;
    cur.push(e);
  }
  if (cur.length) rows.push(cur);
  return rows;
}

/** Centres each box over its anchor, then pushes boxes apart left-to-right and back so none overlap. */
function placeRow(row: Entry[], size: number, m: CalloutMetrics): number[] {
  const left = m.pad;
  const right = size - m.pad;
  const xs = row.map((e) => Math.min(Math.max(e.ax - e.w / 2, left), right - e.w));
  for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + row[i - 1].w + m.gap);
  for (let i = xs.length - 1; i >= 0; i--) {
    const limit = i === xs.length - 1 ? right - row[i].w : xs[i + 1] - m.gap - row[i].w;
    xs[i] = Math.min(xs[i], limit);
  }
  return xs;
}

export interface EyeCallouts {
  callouts: PlacedCallout[];
  rowsTop: number;
  rowsBottom: number;
}

/**
 * Lays callouts out as boundary labels: lesions in the upper half get a box in the band above the
 * drawing, the rest below. Within a band boxes keep the lesions' left-to-right order, so leader lines
 * rarely cross; a crowded band wraps to more rows, and a lopsided load is rebalanced across both bands.
 */
export function layoutCallouts(specs: CalloutSpec[], size: number, m: CalloutMetrics, measure: (t: string) => number): EyeCallouts {
  const scale = size / (2 * EXTENT);
  const avail = size - 2 * m.pad;
  const entries: Entry[] = specs.map((spec) => ({
    spec,
    w: Math.min(avail, Math.ceil(measure(spec.text)) + m.inset * 2 + m.chip + m.gap),
    ax: size / 2 + spec.anchor.x * scale,
  }));
  const byX = (a: Entry, b: Entry) => a.ax - b.ax;
  let top = entries.filter((e) => e.spec.anchor.y >= 0).sort(byX);
  let bottom = entries.filter((e) => e.spec.anchor.y < 0).sort(byX);

  const rows = (list: Entry[]) => chunk(list, avail, m.gap).length;
  // Move the entry nearest the horizontal midline to the lighter band until the load is within one row.
  for (let guard = 0; guard < entries.length; guard++) {
    const diff = rows(top) - rows(bottom);
    if (Math.abs(diff) < 2) break;
    const [from, to] = diff > 0 ? [top, bottom] : [bottom, top];
    const pick = from.reduce((best, e) => (Math.abs(e.spec.anchor.y) < Math.abs(best.spec.anchor.y) ? e : best));
    from.splice(from.indexOf(pick), 1);
    to.push(pick);
    to.sort(byX);
  }

  const place = (list: Entry[], band: "top" | "bottom"): { placed: PlacedCallout[]; rows: number } => {
    const grouped = chunk(list, avail, m.gap);
    const placed = grouped.flatMap((row, r) => {
      const xs = placeRow(row, size, m);
      return row.map((e, i): PlacedCallout => ({ ...e.spec, band, row: r, x: xs[i], w: e.w }));
    });
    return { placed, rows: grouped.length };
  };
  const t = place(top, "top");
  const b = place(bottom, "bottom");
  return { callouts: [...t.placed, ...b.placed], rowsTop: t.rows, rowsBottom: b.rows };
}

export interface CalloutLayout {
  perEye: Record<Eye, PlacedCallout[]>;
  bandTop: number;
  bandBottom: number;
  metrics: CalloutMetrics;
}

/** Cubic Bézier from the callout box to its lesion, in stage px. */
export interface LeaderPath {
  p0: Pt;
  c1: Pt;
  c2: Pt;
  p3: Pt;
}

const LEADER_SHIFT = 0.3; // the line may leave the box this fraction of its width off-centre, toward the lesion
const LEADER_BOW = 0.1; // sideways offset of the control points, as a fraction of the line length

/**
 * A leader line is a gentle arc, not a plumb line: it leaves the facing edge of the box a little toward
 * the lesion and bows sideways. Every line bows the same way, so neighbours stay roughly parallel.
 * Very short lines stay straight.
 */
export function leaderPath(c: PlacedCallout, stageHeight: number, m: CalloutMetrics, anchorPx: Pt): LeaderPath {
  const y = calloutY(c, stageHeight, m);
  const cx = c.x + c.w / 2;
  const reach = LEADER_SHIFT * c.w;
  const p0 = { x: cx + Math.max(-reach, Math.min(reach, anchorPx.x - cx)), y: c.band === "top" ? y + m.h : y };
  const vx = anchorPx.x - p0.x;
  const vy = anchorPx.y - p0.y;
  const len = Math.hypot(vx, vy);
  const bow = len < 4 * m.fs ? 0 : Math.min(LEADER_BOW * len, 2.5 * m.fs);
  const nx = len ? (-vy / len) * bow : 0;
  const ny = len ? (vx / len) * bow : 0;
  return {
    p0,
    c1: { x: p0.x + vx / 3 + nx, y: p0.y + vy / 3 + ny },
    c2: { x: p0.x + (2 * vx) / 3 + nx, y: p0.y + (2 * vy) / 3 + ny },
    p3: anchorPx,
  };
}

export function leaderPoint(p: LeaderPath, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p.p0.x + b * p.c1.x + c * p.c2.x + d * p.p3.x, y: a * p.p0.y + b * p.c1.y + c * p.c2.y + d * p.p3.y };
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SAMPLES = 16;

/** Whether the arc passes through the rectangle; the two ends are skipped (one sits on its own box). */
function pathHitsRect(p: LeaderPath, r: Rect, pad = 2): boolean {
  for (let i = 1; i < SAMPLES; i++) {
    const q = leaderPoint(p, i / SAMPLES);
    if (q.x >= r.x - pad && q.x <= r.x + r.w + pad && q.y >= r.y - pad && q.y <= r.y + r.h + pad) return true;
  }
  return false;
}

interface Geometry {
  size: number;
  stageHeight: number;
  bandTop: number;
  m: CalloutMetrics;
}

const anchorPx = (c: PlacedCallout, g: Geometry): Pt => ({
  x: g.size / 2 + c.anchor.x * (g.size / (2 * EXTENT)),
  y: g.bandTop + g.size / 2 - c.anchor.y * (g.size / (2 * EXTENT)),
});
const rectOf = (c: PlacedCallout, g: Geometry): Rect => ({ x: c.x, y: calloutY(c, g.stageHeight, g.m), w: c.w, h: g.m.h });
const pathOf = (c: PlacedCallout, g: Geometry) => leaderPath(c, g.stageHeight, g.m, anchorPx(c, g));

/** Leader lines that run through some other callout's box, summed over the listed eyes. */
export function countLeaderHits(layout: CalloutLayout, size: number, eyes: Eye[] = ["OD", "OS"]): number {
  const g: Geometry = { size, stageHeight: size + layout.bandTop + layout.bandBottom, bandTop: layout.bandTop, m: layout.metrics };
  let n = 0;
  for (const eye of eyes) {
    const list = layout.perEye[eye];
    for (const c of list) for (const o of list) if (o !== c && pathHitsRect(pathOf(c, g), rectOf(o, g))) n++;
  }
  return n;
}

/**
 * Nudges boxes whose leader line crosses another box: tries other x positions along the same band and
 * other rows of it, keeps whichever crosses least (ties go to the smallest move), and leaves a box alone
 * when nothing beats where it is. Bands keep their row count, so the canvas height does not change.
 */
function refineEye(list: PlacedCallout[], g: Geometry): PlacedCallout[] {
  const out = list.map((c) => ({ ...c }));
  const step = Math.max(4, Math.round(g.m.fs * 0.6));
  const rowsIn = (band: "top" | "bottom") => Math.max(0, ...out.filter((o) => o.band === band).map((o) => o.row + 1));
  const crossings = (self: PlacedCallout, others: PlacedCallout[]) => {
    const own = pathOf(self, g);
    const box = rectOf(self, g);
    let n = 0;
    for (const o of others) {
      if (pathHitsRect(own, rectOf(o, g))) n++;
      if (pathHitsRect(pathOf(o, g), box)) n++;
    }
    return n;
  };

  for (let pass = 0; pass < 3; pass++) {
    let moved = false;
    const order = out.map((c, i) => ({ i, n: crossings(c, out.filter((o) => o !== c)) })).filter((e) => e.n > 0).sort((a, b) => b.n - a.n);
    for (const { i } of order) {
      const cur = out[i];
      const others = out.filter((o) => o !== cur);
      const before = crossings(cur, others);
      if (before === 0) continue;
      let best: { c: PlacedCallout; n: number; move: number } | null = null;
      for (let row = 0; row < rowsIn(cur.band); row++) {
        const mates = others.filter((o) => o.band === cur.band && o.row === row);
        for (let x = g.m.pad; x + cur.w <= g.size - g.m.pad + 0.5; x += step) {
          if (mates.some((o) => x < o.x + o.w + g.m.gap && o.x < x + cur.w + g.m.gap)) continue;
          const cand = { ...cur, row, x };
          const n = crossings(cand, others);
          const move = Math.abs(x - cur.x) + 40 * Math.abs(row - cur.row);
          if (n < before && (!best || n < best.n || (n === best.n && move < best.move))) best = { c: cand, n, move };
        }
      }
      if (best) {
        out[i] = best.c;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return out;
}

/** Lays out the listed eyes at one size and gives them common band heights, so the canvases stay level. */
export function layoutAll(
  lesions: Record<Eye, DrawnItem[]>,
  defs: AnteriorDef[],
  size: number,
  fs: number,
  measure: (t: string) => number,
  eyes: Eye[] = ["OD", "OS"],
  /** Rows kept free in each band even when empty, so the first lesion does not shift the drawing. */
  minRows = 0,
  /** Second pass that moves boxes so leader lines avoid other boxes; off only for comparison in tests. */
  refine = true
): CalloutLayout {
  const m = calloutMetrics(fs);
  const perEye: Record<Eye, PlacedCallout[]> = { OD: [], OS: [] };
  let rowsTop = minRows;
  let rowsBottom = minRows;
  for (const eye of eyes) {
    const r = layoutCallouts(buildCallouts(lesions[eye], defs, eye), size, m, measure);
    perEye[eye] = r.callouts;
    rowsTop = Math.max(rowsTop, r.rowsTop);
    rowsBottom = Math.max(rowsBottom, r.rowsBottom);
  }
  const bandTop = bandPx(rowsTop, m);
  const bandBottom = bandPx(rowsBottom, m);
  if (refine) {
    const g: Geometry = { size, stageHeight: size + bandTop + bandBottom, bandTop, m };
    for (const eye of eyes) perEye[eye] = refineEye(perEye[eye], g);
  }
  return { perEye, bandTop, bandBottom, metrics: m };
}

/** Lesion types drawn in any of the listed eyes, in config order: one legend for both eyes. */
export function legendEntries(lesions: Record<Eye, DrawnItem[]>, defs: AnteriorDef[], eyes: Eye[] = ["OD", "OS"]): AnteriorDef[] {
  return defs.filter((d) => eyes.some((e) => lesions[e].some((i) => i.lesionId === d.id)));
}

/** A small stand-in lesion centred on the origin, drawn with the real shape code for the legend glyph. */
export function legendSample(def: AnteriorDef): DrawnItem {
  if (def.type === "area") {
    return { uid: `legend-${def.id}`, lesionId: def.id, kind: "stroke", points: [{ x: -1.4, y: 0 }, { x: 1.4, y: 0 }], width: 1.1 };
  }
  if (def.type === "level") return { uid: `legend-${def.id}`, lesionId: def.id, kind: "pin", points: [{ x: 0, y: 0.3 }] };
  return { uid: `legend-${def.id}`, lesionId: def.id, kind: "pin", points: [{ x: 0, y: 0 }] };
}

export interface LegendLayout {
  cells: { def: AnteriorDef; x: number; y: number }[];
  glyphW: number;
  rowH: number;
  gap: number;
  height: number;
}

export function legendLayout(defs: AnteriorDef[], width: number, fs: number, measure: (t: string) => number): LegendLayout {
  const glyphW = Math.round(fs * 3.6);
  const rowH = Math.round(fs * 2.1);
  const gap = Math.round(fs * 0.6);
  const colGap = Math.round(fs * 1.5);
  const textW = Math.ceil(Math.max(0, ...defs.map((d) => measure(d.name))));
  const colW = glyphW + gap + textW + colGap;
  const cols = Math.max(1, Math.floor((width + colGap) / colW));
  const cells = defs.map((def, i) => ({ def, x: (i % cols) * colW, y: Math.floor(i / cols) * rowH }));
  return { cells, glyphW, rowH, gap, height: Math.ceil(defs.length / cols) * rowH + 2 };
}

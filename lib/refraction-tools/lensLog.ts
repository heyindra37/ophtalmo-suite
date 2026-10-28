export type Reflex = "with" | "neutral" | "against";
/** 1 = slow/narrow, 2 = medium, 3 = fast/wide (closer to neutral). */
export type ReflexSpeed = 1 | 2 | 3;

export interface LensEntry {
  id: string;
  powerD: number;
  reflex: Reflex;
  speed?: ReflexSpeed;
  /** Band width, same 1–3 scale: a wider reflex is closer to neutral. */
  width?: ReflexSpeed;
}

/** How near neutral a reflex looks, from whichever of speed and width were recorded (2 when neither). */
export function closeness(e: LensEntry): number {
  const marks = [e.speed, e.width].filter((v): v is ReflexSpeed => v !== undefined);
  return marks.length ? marks.reduce((s, v) => s + v, 0) / marks.length : 2;
}

export type NeutralEstimate =
  | { status: "empty" }
  | { status: "need-against"; withMax: number }
  | { status: "need-with"; againstMin: number }
  | {
      status: "ok";
      source: "observed" | "bracket";
      powerD: number;
      bracket: { withD: number; againstD: number } | null;
      shifted: boolean;
      inconsistent: boolean;
      wide: boolean;
    };

const WIDE_BRACKET_D = 0.75;

/**
 * Neutral point from a log of trial lenses on one meridian. With motion needs more plus, so it
 * appears on the less-plus side; neutral lies between the most-plus "with" and the least-plus
 * "against". A faster and/or wider reflex is nearer neutral, so the estimate leans toward that side.
 */
export function estimateNeutral(entries: LensEntry[]): NeutralEstimate {
  if (!entries.length) return { status: "empty" };
  const withs = entries.filter((e) => e.reflex === "with");
  const againsts = entries.filter((e) => e.reflex === "against");
  const neutrals = entries.filter((e) => e.reflex === "neutral");
  const inconsistent = withs.some((w) => againsts.some((a) => w.powerD > a.powerD));

  const W = withs.length ? withs.reduce((m, e) => (e.powerD > m.powerD ? e : m)) : null;
  const A = againsts.length ? againsts.reduce((m, e) => (e.powerD < m.powerD ? e : m)) : null;
  const bracket = W && A ? { withD: W.powerD, againstD: A.powerD } : null;

  if (neutrals.length) {
    const powerD = neutrals.reduce((s, e) => s + e.powerD, 0) / neutrals.length;
    return { status: "ok", source: "observed", powerD, bracket, shifted: false, inconsistent, wide: false };
  }
  if (!W) return { status: "need-with", againstMin: A!.powerD };
  if (!A) return { status: "need-against", withMax: W.powerD };

  const sW = closeness(W);
  const sA = closeness(A);
  const lo = Math.min(W.powerD, A.powerD);
  const hi = Math.max(W.powerD, A.powerD);
  // Lean toward the faster reflex: a fast "with" keeps the estimate close to the with lens.
  let powerD = W.powerD + (A.powerD - W.powerD) * (sA / (sW + sA));
  if (sW !== sA) {
    // Snap to a 0.25 D step; a value exactly between two steps goes to the faster reflex's side,
    // otherwise the shift would vanish on display.
    const q = powerD * 4;
    const towardWith = (sW > sA) === W.powerD < A.powerD;
    powerD = (Math.abs(q - Math.round(q)) === 0.5 ? (towardWith ? Math.floor(q) : Math.ceil(q)) : Math.round(q)) / 4;
  }
  const midpoint = (W.powerD + A.powerD) / 2;
  return {
    status: "ok",
    source: "bracket",
    powerD,
    bracket,
    // Only claim a shift when it survives rounding to the displayed 0.25 D step.
    shifted: sW !== sA && Math.round(powerD * 4) !== Math.round(midpoint * 4),
    inconsistent,
    wide: hi - lo > WIDE_BRACKET_D,
  };
}

import type {
  MeridianFinding,
  SpherocylResult,
  ReconstructionResult,
  OrthogonalityCheck,
  WorkingDistanceInput,
  AnisometropiaCheck,
  OutOfRangeCheck,
} from "./types";

/** Parse a decimal that may use comma or dot as separator. Returns null if unparseable. */
export function parseDecimal(raw: string): number | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(",", ".");
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** Normalize a meridian/axis angle into (0, 180]. 0° normalizes to 180°. */
export function normalizeMeridian(deg: number): number {
  let d = deg % 180;
  if (d <= 0) d += 180;
  return d;
}

/** Circular orthogonality check between two meridians, tolerant to input rounding. */
export function checkOrthogonality(m1: number, m2: number, toleranceDeg = 2): OrthogonalityCheck {
  const a = normalizeMeridian(m1);
  const b = normalizeMeridian(m2);
  let diff = Math.abs(a - b);
  if (diff > 90) diff = 180 - diff;
  return { ok: Math.abs(diff - 90) <= toleranceDeg, diffDeg: diff };
}

/**
 * Subtract working distance from a single meridian finding. Applied independently and
 * identically to both meridians of an eye — this is what keeps cylinder/axis unaffected,
 * only sphere shifts.
 */
export function subtractWorkingDistance(
  finding: MeridianFinding,
  wd: WorkingDistanceInput
): MeridianFinding {
  if (wd.mode === "net") {
    return { meridianDeg: finding.meridianDeg, powerD: finding.powerD };
  }
  const distanceD = 100 / (wd.distanceCm as number);
  return { meridianDeg: finding.meridianDeg, powerD: finding.powerD - distanceD };
}

/** Standard plus↔minus cylinder transposition. Works in either direction. */
export function transpose(input: SpherocylResult): SpherocylResult {
  if (input.cylinderD === 0) {
    return { sphereD: input.sphereD, cylinderD: 0, axisDeg: null };
  }
  const newSphere = input.sphereD + input.cylinderD;
  const newCyl = -input.cylinderD;
  const newAxis = normalizeMeridian((input.axisDeg ?? 90) + 90);
  return { sphereD: newSphere, cylinderD: newCyl, axisDeg: newAxis };
}

/**
 * Reconstruct plus-cyl and minus-cyl spherocylinder notation from two perpendicular
 * meridian findings. Caller MUST have already verified orthogonality (checkOrthogonality)
 * before calling this — it does not re-check.
 *
 * minus is derived via transpose(plus), not a parallel formula — this is what makes the
 * "one engine, two tabs" requirement mechanical rather than coincidental.
 */
export function reconstructSpherocyl(f1: MeridianFinding, f2: MeridianFinding): ReconstructionResult {
  const a: MeridianFinding = { meridianDeg: normalizeMeridian(f1.meridianDeg), powerD: f1.powerD };
  const b: MeridianFinding = { meridianDeg: normalizeMeridian(f2.meridianDeg), powerD: f2.powerD };
  const lower = a.powerD <= b.powerD ? a : b;
  const higher = lower === a ? b : a;

  if (lower.powerD === higher.powerD) {
    const flat: SpherocylResult = { sphereD: lower.powerD, cylinderD: 0, axisDeg: null };
    return { plus: flat, minus: flat };
  }

  const plus: SpherocylResult = {
    sphereD: lower.powerD,
    cylinderD: higher.powerD - lower.powerD,
    axisDeg: lower.meridianDeg,
  };
  const minus = transpose(plus);
  return { plus, minus };
}

export function sphericalEquivalent(r: SpherocylResult): number {
  return r.sphereD + r.cylinderD / 2;
}

export function checkAnisometropia(seOD: number, seOS: number, thresholdD = 1.0): AnisometropiaCheck {
  const magnitudeD = Math.abs(seOD - seOS);
  return { flagged: magnitudeD >= thresholdD, magnitudeD };
}

export function checkOutOfRange(r: SpherocylResult): OutOfRangeCheck {
  return { sphereOOR: Math.abs(r.sphereD) > 25, cylOOR: Math.abs(r.cylinderD) > 10 };
}

export type CylNotation = "plus" | "minus";

export interface MeridianFinding {
  meridianDeg: number; // clinical axis convention, 0–180
  powerD: number; // full precision, +/-
}

export interface SpherocylResult {
  sphereD: number;
  cylinderD: number; // 0 when spherical; sign matches notation
  axisDeg: number | null; // null only when cylinderD === 0
}

export interface ReconstructionResult {
  plus: SpherocylResult;
  minus: SpherocylResult;
}

export interface OrthogonalityCheck {
  ok: boolean;
  diffDeg: number;
}

export type WorkingDistanceMode = "gross" | "net";

export interface WorkingDistanceInput {
  mode: WorkingDistanceMode;
  distanceCm?: number; // required when mode === "gross"
}

export interface AnisometropiaCheck {
  flagged: boolean;
  magnitudeD: number;
}

export interface OutOfRangeCheck {
  sphereOOR: boolean;
  cylOOR: boolean;
}

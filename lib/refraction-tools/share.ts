import type { LensEntry } from "./lensLog";

export const SHARE_TTL_SECONDS = 2 * 60 * 60;
export const SHARE_MAX_BYTES = 20_000;
export const SHARE_CODE_RE = /^\d{6}$/;

/** Everything on the Streak v2 tab, sent from the phone and loaded on the PC. */
export interface StreakV2Snapshot {
  v: 1;
  singleEyeOnly: boolean;
  onlyEye: "OD" | "OS";
  cycloplegia: string;
  pediatric: boolean;
  od: unknown;
  os: unknown;
}

function isLog(v: unknown): v is LensEntry[] {
  return (
    Array.isArray(v) &&
    v.length <= 60 &&
    v.every(
      (e) =>
        e &&
        typeof e === "object" &&
        typeof (e as LensEntry).id === "string" &&
        Number.isFinite((e as LensEntry).powerD) &&
        ["with", "neutral", "against"].includes((e as LensEntry).reflex)
    )
  );
}

function isEye(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    Number.isFinite(e.m1) &&
    Number.isFinite(e.m2) &&
    isLog(e.log1) &&
    isLog(e.log2) &&
    typeof e.override1 === "string" &&
    typeof e.override2 === "string" &&
    !!e.workingDistance &&
    !!e.reflexFlags &&
    !!e.arkBcva
  );
}

/** Shape check for data crossing the network; rejects anything that is not a Streak v2 snapshot. */
export function isSnapshot(v: unknown): v is StreakV2Snapshot {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    s.v === 1 &&
    typeof s.singleEyeOnly === "boolean" &&
    (s.onlyEye === "OD" || s.onlyEye === "OS") &&
    typeof s.cycloplegia === "string" &&
    typeof s.pediatric === "boolean" &&
    isEye(s.od) &&
    isEye(s.os)
  );
}

export function newShareCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

import { parseDecimal } from "./engine";
import { formatSignedCopy } from "./format";

export type ArkBcvaKey = "arkSmall" | "arkWide" | "bcvaSmall" | "bcvaWide";

export interface RxRow {
  checked: boolean;
  sphere: string;
  cyl: string;
  axis: string;
  /** Snellen VA, BCVA rows only. */
  va: string;
}

export type ArkBcva = Record<ArkBcvaKey, RxRow>;

export const ARK_BCVA_ROWS: { key: ArkBcvaKey; label: string; withVa: boolean }[] = [
  { key: "arkSmall", label: "ARK pupil kecil", withVa: false },
  { key: "arkWide", label: "ARK pupil lebar", withVa: false },
  { key: "bcvaSmall", label: "BCVA pupil kecil", withVa: true },
  { key: "bcvaWide", label: "BCVA pupil lebar", withVa: true },
];

const emptyRow = (): RxRow => ({ checked: false, sphere: "", cyl: "", axis: "", va: "" });

export function defaultArkBcva(): ArkBcva {
  return { arkSmall: emptyRow(), arkWide: emptyRow(), bcvaSmall: emptyRow(), bcvaWide: emptyRow() };
}

/** "S-1.00 C-0.50 X180", skipping parts left blank. */
export function formatRowRx(row: RxRow): string {
  const s = parseDecimal(row.sphere);
  const c = parseDecimal(row.cyl);
  const x = parseDecimal(row.axis);
  const parts: string[] = [];
  if (s !== null) parts.push(`S${formatSignedCopy(s)}`);
  if (c !== null && c !== 0) {
    parts.push(`C${formatSignedCopy(c)}`);
    if (x !== null) parts.push(`X${Math.round(x)}`);
  }
  return parts.join(" ");
}

/** Copy line for a ticked row, or null when unticked/empty. */
export function formatRowLine(key: ArkBcvaKey, row: RxRow): string | null {
  if (!row.checked) return null;
  const meta = ARK_BCVA_ROWS.find((r) => r.key === key)!;
  const rx = formatRowRx(row);
  const va = row.va.trim();
  const body = meta.withVa ? [va, rx && `dengan ${rx}`].filter(Boolean).join(" ") : rx;
  return body ? `${meta.label.padEnd(16)}: ${body}` : null;
}

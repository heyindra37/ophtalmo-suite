const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** e.g. "Kamis, 2 Januari 2026" */
export function formatIndonesianDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Replace every {{date+N}} / {{date-N}} placeholder in `text` with the formatted date
 * N days from `anchorISO` (anchor itself = offset 0). Anchor day is day 0, not day 1.
 */
export function renderDatePlaceholders(text: string, anchorISO: string): string {
  if (!anchorISO) return text;
  const anchor = parseISODate(anchorISO);
  return text.replace(/\{\{date([+-]\d+)\}\}/g, (_match, offsetStr: string) => {
    const offset = parseInt(offsetStr, 10);
    return formatIndonesianDate(addDays(anchor, offset));
  });
}

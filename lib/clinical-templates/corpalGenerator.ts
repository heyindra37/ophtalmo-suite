export type MataOption = "OD" | "OS" | "ODS";

export function mataLatinLabel(mata: MataOption): string {
  switch (mata) {
    case "OD":
      return "dextra (OD)";
    case "OS":
      return "sinistra (OS)";
    case "ODS":
      return "dextra et sinistra (ODS)";
  }
}

/** Prepared per PRD §3.2 for a future patient-facing display — not used in v1 UI. */
export function mataAwamLabel(mata: MataOption): string {
  switch (mata) {
    case "OD":
      return "mata kanan";
    case "OS":
      return "mata kiri";
    case "ODS":
      return "kedua mata";
  }
}

export interface CorpalInput {
  mata: MataOption;
  jamBuka: string;
  durasiMinimal: string;
  durasiKontrol: string;
  catatanTambahan: string;
}

function parseDurationDays(s: string): number | null {
  const m = s.trim().toLowerCase().match(/^(\d+)\s*(hari|minggu)$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return m[2] === "minggu" ? n * 7 : n;
}

export function durationWarning(input: CorpalInput): string | null {
  const minimal = parseDurationDays(input.durasiMinimal);
  const kontrol = parseDurationDays(input.durasiKontrol);
  if (minimal === null || kontrol === null) return null;
  if (kontrol < minimal) {
    return `Durasi kontrol (${input.durasiKontrol}) lebih pendek dari durasi minimal obat (${input.durasiMinimal}) — periksa kembali input.`;
  }
  return null;
}

export function buildCorpalText(input: CorpalInput): string {
  const { mata, jamBuka, durasiMinimal, durasiKontrol, catatanTambahan } = input;
  const lines: string[] = [
    `Tindakan: ekstraksi corpus alienum (corpal) okuli ${mataLatinLabel(mata)}`,
    `Post-tindakan ${mata} dipasang bebat mata (eye pad) + salep`,
    "",
    `Besok pagi pukul ${jamBuka}: bebat dibuka, dilanjutkan pemberian tetes mata dan salep mata`,
    "",
    `Tetes mata dan salep dipakai minimal ${durasiMinimal}; setelah ${durasiMinimal}, obat boleh dihentikan apabila sudah tidak ada keluhan`,
    "",
    `Bila dalam ${durasiKontrol} keluhan masih ada, pasien wajib kontrol kembali`,
  ];
  const catatan = catatanTambahan.trim();
  if (catatan) {
    lines.push(`Kontrol wajib untuk evaluasi: ${catatan}`);
  }
  return lines.join("\n");
}

export function buildCorpalLines(input: CorpalInput): string[] {
  return buildCorpalText(input)
    .split("\n")
    .filter((line) => line.trim().length > 0);
}

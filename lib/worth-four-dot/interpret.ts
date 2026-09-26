export type WfdtResponse =
  | "empat"
  | "dua-merah"
  | "tiga-hijau"
  | "lima-uncrossed"
  | "lima-crossed"
  | "bergantian";

export type Alignment = "ortho" | "esotropia" | "exotropia";

export interface Interpretation {
  title: string;
  detail: string;
}

export const RESPONSE_LABELS: Record<WfdtResponse, string> = {
  empat: "4 titik",
  "dua-merah": "2 titik merah",
  "tiga-hijau": "3 titik hijau",
  "lima-uncrossed": "5 titik — merah di kanan, hijau di kiri",
  "lima-crossed": "5 titik — hijau di kanan, merah di kiri",
  bergantian: "Bergantian (3 hijau, lalu 2 merah)",
};

export const ALIGNMENT_LABELS: Record<Alignment, string> = {
  ortho: "Ortho (tanpa strabismus manifes)",
  esotropia: "Esotropia manifes",
  exotropia: "Exotropia manifes",
};

const ORTHO_MISMATCH =
  "Diplopia 5 titik tidak sesuai dengan status ortho saat tes — periksa ulang cover test / status alignment.";

export function interpretResponse(resp: WfdtResponse, alignment: Alignment): Interpretation {
  switch (resp) {
    case "empat":
      return alignment === "ortho"
        ? {
            title: "Normal (fusi)",
            detail: "Hasil normal pada pasien dengan alignment normal saat pemeriksaan.",
          }
        : {
            title: "Anomalous retinal correspondence (ARC)",
            detail:
              "Pasien dengan strabismus manifes saat pemeriksaan namun melihat 4 titik menunjukkan anomalous retinal correspondence (ARC).",
          };
    case "dua-merah":
      return { title: "Supresi mata kiri (OS)", detail: "Hanya lensa merah (mata kanan) yang menangkap cahaya." };
    case "tiga-hijau":
      return { title: "Supresi mata kanan (OD)", detail: "Hanya lensa hijau (mata kiri) yang menangkap cahaya." };
    case "lima-uncrossed":
      if (alignment === "esotropia")
        return {
          title: "Diplopia tidak bersilang (uncrossed) — sesuai esotropia",
          detail: "Titik merah di kanan, hijau di kiri: temuan yang diharapkan pada esotropia.",
        };
      if (alignment === "exotropia")
        return {
          title: "Diplopia tidak bersilang (uncrossed) — ARC",
          detail: "Diplopia tidak bersilang pada pasien exotropia menunjukkan anomalous retinal correspondence (ARC).",
        };
      return { title: "Diplopia tidak bersilang (uncrossed)", detail: ORTHO_MISMATCH };
    case "lima-crossed":
      if (alignment === "exotropia")
        return {
          title: "Diplopia bersilang (crossed) — sesuai exotropia",
          detail: "Titik hijau di kanan, merah di kiri: temuan yang diharapkan pada exotropia.",
        };
      if (alignment === "esotropia")
        return {
          title: "Diplopia bersilang (crossed) — ARC",
          detail: "Diplopia bersilang pada pasien esotropia menunjukkan anomalous retinal correspondence (ARC).",
        };
      return { title: "Diplopia bersilang (crossed)", detail: ORTHO_MISMATCH };
    case "bergantian":
      return {
        title: "Supresi bergantian (alternating suppression)",
        detail: "Pasien melihat 3 titik hijau, lalu 2 titik merah secara bergantian.",
      };
  }
}

export const MONOFIXATION_TEXT =
  "Supresi satu mata pada jarak jauh dengan respons normal pada jarak dekat: sesuai monofixation syndrome. Skotoma sentral 1–4° khas pada monofixation syndrome. Pada jarak ≥3 m, cahaya senter terproyeksi ≤1° di retina sentral sehingga tidak terlihat oleh mata yang memiliki skotoma. Pada jarak dekat, cahaya terproyeksi di luar skotoma sehingga dapat dilihat oleh kedua mata.";

export function isMonofixation(jauh: WfdtResponse | null, dekat: WfdtResponse | null): boolean {
  return (jauh === "dua-merah" || jauh === "tiga-hijau") && dekat === "empat";
}

export function buildCopyText(
  alignment: Alignment,
  jauh: WfdtResponse | null,
  dekat: WfdtResponse | null
): string {
  const lines = ["Worth Four Dot Test (lensa merah OD / hijau OS)", `Alignment saat tes: ${ALIGNMENT_LABELS[alignment]}`];
  const add = (label: string, resp: WfdtResponse | null) => {
    if (!resp) return;
    const i = interpretResponse(resp, alignment);
    lines.push(`${label}: ${RESPONSE_LABELS[resp]} → ${i.title}`);
  };
  add("Jarak jauh (≥3 m)", jauh);
  add("Jarak dekat (33 cm)", dekat);
  if (isMonofixation(jauh, dekat)) lines.push("Kesimpulan: sesuai monofixation syndrome");
  return lines.join("\n");
}

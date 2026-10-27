// Ocular Trauma Score (Kuhn et al. 2002), visual acuity categories expressed in metric Snellen.
// Prognosis percentages follow the Asia-Pacific Ophthalmic Trauma Society (APOTS) card.

export type VaCategory = "npl" | "lp_hm" | "cf" | "mid" | "good";

export const VA_CATEGORIES: { id: VaCategory; label: string; detail: string; points: number }[] = [
  { id: "npl", label: "NLP", detail: "tidak ada persepsi cahaya (0)", points: 60 },
  { id: "lp_hm", label: "LP / HM", detail: "1/∞ (persepsi cahaya) atau 1/300 (lambaian tangan)", points: 70 },
  { id: "cf", label: "1/60 – <6/60", detail: "hitung jari 1/60–5/60 sampai di bawah 6/60", points: 80 },
  { id: "mid", label: "6/60 – 6/15", detail: "6/60, 6/45, 6/30, 6/24, 6/20, 6/18, 6/15", points: 90 },
  { id: "good", label: "≥ 6/12", detail: "6/12 atau lebih baik", points: 100 },
];

export type Factor = "rupture" | "endophthalmitis" | "perforating" | "rd" | "rapd";

export const FACTORS: { id: Factor; label: string; hint: string; points: number }[] = [
  { id: "rupture", label: "Ruptur bola mata (globe rupture)", hint: "luka full-thickness akibat benda tumpul", points: -23 },
  { id: "endophthalmitis", label: "Endoftalmitis", hint: "", points: -17 },
  { id: "perforating", label: "Trauma perforasi", hint: "luka masuk dan keluar oleh benda tajam yang sama", points: -14 },
  { id: "rd", label: "Ablasio retina", hint: "", points: -11 },
  { id: "rapd", label: "RAPD", hint: "relative afferent pupillary defect", points: -10 },
];

/** Final-VA columns of the prognosis table, worst to best. */
export const OUTCOMES = ["NLP", "LP/HM", "1/60 – <6/60", "6/60 – 6/15", "≥ 6/12"] as const;

/** Raw-score bands (Kuhn) and 6-month final-VA likelihood (%), APOTS card. */
export const OTS_TABLE: { ots: 1 | 2 | 3 | 4 | 5; min: number; max: number; pct: number[] }[] = [
  { ots: 1, min: 0, max: 44, pct: [73, 17, 7, 2, 1] },
  { ots: 2, min: 45, max: 65, pct: [28, 26, 18, 13, 15] },
  { ots: 3, min: 66, max: 80, pct: [2, 11, 15, 28, 44] },
  { ots: 4, min: 81, max: 91, pct: [1, 2, 2, 21, 74] },
  { ots: 5, min: 92, max: 100, pct: [0, 1, 2, 5, 92] },
];

export function computeOts(va: VaCategory, factors: Set<Factor>) {
  const base = VA_CATEGORIES.find((v) => v.id === va)!.points;
  const raw = FACTORS.reduce((sum, f) => sum + (factors.has(f.id) ? f.points : 0), base);
  const row = OTS_TABLE.find((r) => raw <= r.max) ?? OTS_TABLE[0];
  return { raw, ots: row.ots, row };
}

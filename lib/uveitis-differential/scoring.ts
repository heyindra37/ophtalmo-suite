import type { ClinicalInput, Disease, KnowledgeBase, RankedResult } from "./types";
import { DISEASE_TAGS, PATTERN_MATCHERS, TAG_LABELS } from "./tags";

const WEIGHT_BASE_FIELD = 5;
const WEIGHT_BASE_FIELD_IMPLICIT = 3;
const WEIGHT_AGE = 3;
const WEIGHT_TAG = 15;
const WEIGHT_CONTRADICTION = -10;
const WEIGHT_PATTERN_BONUS = 25;
const MIN_STRONG_SIGNALS = 2;

function parseGranulomatous(value: Disease["granulomatous"]): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower.startsWith("true")) return true;
    if (lower.startsWith("false")) return false;
  }
  return null;
}

// anatomic_class di knowledge base v2 SELALU array (lihat kb.anatomic_class_reference).
// Aturan resmi (dikutip dari revision_note & scoring_rule di reference itu, juga dikonfirmasi
// oleh definisi SUN di kb.sun_official_reference): kalau array disease mengandung "panuveitis",
// itu otomatis cocok terhadap checkbox anatomis TUNGGAL apa pun yang dicentang dokter (anterior/
// intermediate/posterior), karena panuveitis by definition melibatkan semua kompartemen — TAPI
// mencentang anterior+intermediate+posterior sekaligus TIDAK secara otomatis membuktikan
// panuveitis untuk disease yang arraynya tidak mengandung "panuveitis" (mis. tidak ada lesi
// korioretinal eksplisit) — cukup dengan tidak pernah men-set checkbox panuveitis secara implisit
// dari kombinasi checkbox lain, aturan SUN ini sudah terpenuhi secara struktural.
type AnatomicMatchKind = "exact" | "implicit_panuveitis" | "none";

function anatomicMatchKind(diseaseClasses: string[], selected: string): AnatomicMatchKind {
  if (diseaseClasses.includes(selected)) return "exact";
  if (diseaseClasses.includes("panuveitis")) return "implicit_panuveitis";
  return "none";
}

// kp_distribution_reference.combination_rule_for_scoring: distribusi KP TIDAK BOLEH
// dipakai sebagai fitur berdiri sendiri — hanya sah menaikkan skor jika minimal ada
// 1 sinyal pendukung lain (IOP, pola atrofi iris, atau ada/tidaknya sinekia posterior).
function hasKpSupportingSignal(input: ClinicalInput): boolean {
  const hasIop = input.iop === "elevated" || input.iop === "reduced" || input.iop === "normal";
  const hasIrisAtrophy = input.selectedTags.includes("iris_atrophy_diffuse") || input.selectedTags.includes("iris_atrophy_sectoral");
  const hasPS = input.selectedTags.includes("posterior_synechiae_present") || input.selectedTags.includes("posterior_synechiae_absent");
  return hasIop || hasIrisAtrophy || hasPS;
}

function isMasqueradeSafetyNet(disease: Disease): boolean {
  const note = disease.critical_note;
  return typeof note === "string" && /masquerade|safety-net/i.test(note);
}

interface ScoreDetail {
  score: number;
  maxScore: number;
  matched: string[];
  contradicted: string[];
  /** Jumlah sinyal KUAT yang cocok (tag key_features, pattern khas, field dasar exact-match) —
   * SENGAJA TIDAK menghitung anatomic-match yang cuma implicit dari aturan panuveitis, karena
   * itu sinyal lemah (lihat kritik dummy-testing: disease bertag kosong bisa "100% match" hanya
   * dari 1 checkbox anatomis via implicit-panuveitis-rule, tanpa bukti klinis lain apa pun). */
  strongSignals: number;
  /** true kalau ada minimal 1 quick_pattern_matcher yang match penuh untuk disease ini —
   * pola klinis khas dianggap bukti kuat tersendiri walau cuma 1 sinyal. */
  patternMatched: boolean;
}

function scoreDisease(disease: Disease, input: ClinicalInput): ScoreDetail {
  let score = 0;
  let maxScore = 0;
  let strongSignals = 0;
  let patternMatched = false;
  const matched: string[] = [];
  const contradicted: string[] = [];

  // Kelas anatomis — multi-select, dinilai per checkbox yang dicentang. Implicit-panuveitis-match
  // (disease tidak explicit mengandung checkbox yang dicentang, tapi arraynya mengandung
  // "panuveitis") diberi bobot LEBIH RENDAH dan TIDAK dihitung sebagai strong signal — mencegah
  // disease tanpa tag ter-kurasi otomatis "100% match" hanya dari 1 checkbox anatomis.
  input.anatomic.forEach((sel) => {
    maxScore += WEIGHT_BASE_FIELD;
    const kind = anatomicMatchKind(disease.anatomic_class, sel);
    if (kind === "exact") {
      score += WEIGHT_BASE_FIELD;
      matched.push(`Kelas anatomis: ${sel}`);
      strongSignals += 1;
    } else if (kind === "implicit_panuveitis") {
      score += WEIGHT_BASE_FIELD_IMPLICIT;
      matched.push(`Kelas anatomis: ${sel} (implisit dari panuveitis)`);
    } else {
      score += WEIGHT_CONTRADICTION;
      contradicted.push(`Kelas anatomis ${sel} tidak cocok (disease: ${disease.anatomic_class.join("/")})`);
    }
  });

  if (input.course && disease.course) {
    maxScore += WEIGHT_BASE_FIELD;
    const courseLower = disease.course.toLowerCase();
    if (courseLower.includes(input.course)) {
      score += WEIGHT_BASE_FIELD;
      matched.push(`Course: ${input.course}`);
      strongSignals += 1;
    } else {
      score += WEIGHT_CONTRADICTION;
      contradicted.push(`Course tidak cocok (disease: ${disease.course})`);
    }
  }

  if (input.granulomatous) {
    const diseaseGranulomatous = parseGranulomatous(disease.granulomatous);
    if (diseaseGranulomatous !== null) {
      maxScore += WEIGHT_BASE_FIELD;
      const userSaysGranulomatous = input.granulomatous === "yes";
      if (userSaysGranulomatous === diseaseGranulomatous) {
        score += WEIGHT_BASE_FIELD;
        matched.push(`Granulomatous: ${input.granulomatous === "yes" ? "ya" : "tidak"}`);
        strongSignals += 1;
      } else {
        score += WEIGHT_CONTRADICTION;
        contradicted.push("Status granulomatous tidak cocok");
      }
    }
  }

  if (input.laterality && disease.laterality) {
    maxScore += WEIGHT_BASE_FIELD;
    const latLower = disease.laterality.toLowerCase();
    if (latLower.includes(input.laterality)) {
      score += WEIGHT_BASE_FIELD;
      matched.push(`Lateralitas: ${input.laterality}`);
      strongSignals += 1;
    } else {
      score += WEIGHT_CONTRADICTION;
      contradicted.push(`Lateralitas tidak cocok (disease: ${disease.laterality})`);
    }
  }

  // Kelompok usia — bobot rendah, skip (netral) kalau disease tidak punya data usia eksplisit,
  // TIDAK ada penalti kontradiksi (sinyal lemah, per PRD: jangan naikkan bobot walau data makin banyak)
  const diseaseAgeGroups = Array.isArray(disease.age_group) ? disease.age_group : [];
  if (input.ageGroup && diseaseAgeGroups.length > 0) {
    maxScore += WEIGHT_AGE;
    const ageMatches = diseaseAgeGroups.some((a) => typeof a === "string" && a.toLowerCase().includes(input.ageGroup));
    if (ageMatches) {
      score += WEIGHT_AGE;
      matched.push(`Kelompok usia: ${input.ageGroup}`);
      // Sengaja TIDAK dihitung strongSignals — bobot rendah/sinyal lemah per desain.
    }
  }

  // KP distribution — combination-gated (lihat hasKpSupportingSignal)
  if (input.kpDistribution && input.kpDistribution !== "unknown" && disease.kp_distribution) {
    maxScore += WEIGHT_TAG;
    const diseasePattern = disease.kp_distribution.pattern.toLowerCase();
    const patternMatches = diseasePattern.includes(input.kpDistribution);
    if (patternMatches) {
      if (hasKpSupportingSignal(input)) {
        score += WEIGHT_TAG;
        matched.push(`Distribusi KP cocok (${disease.kp_distribution.pattern}), didukung sinyal lain (IOP/atrofi iris/sinekia posterior)`);
        strongSignals += 1;
      }
      // Cocok tapi tanpa sinyal pendukung -> tidak dihitung sama sekali (netral),
      // sesuai combination_rule_for_scoring: tidak boleh menaikkan skor sendirian.
    } else {
      score += WEIGHT_CONTRADICTION;
      contradicted.push(`Distribusi KP tidak cocok (disease: ${disease.kp_distribution.pattern})`);
    }
  }

  // Tag-based key features
  const diseaseTags = DISEASE_TAGS[disease.id] || [];
  maxScore += diseaseTags.length * WEIGHT_TAG;
  diseaseTags.forEach((tag) => {
    if (input.selectedTags.includes(tag)) {
      score += WEIGHT_TAG;
      matched.push(TAG_LABELS[tag] || tag);
      strongSignals += 1;
    }
  });

  // Pattern matcher bonus
  PATTERN_MATCHERS.forEach((pm) => {
    if (!pm.differential.includes(disease.id)) return;
    maxScore += WEIGHT_PATTERN_BONUS;
    const allPresent = pm.requiredTags.length > 0 && pm.requiredTags.every((t) => input.selectedTags.includes(t));
    if (allPresent) {
      score += WEIGHT_PATTERN_BONUS;
      matched.push(`Pola khas: ${pm.requiredTags.map((t) => TAG_LABELS[t] || t).join(" + ")}`);
      patternMatched = true;
    }
  });

  return { score, maxScore, matched, contradicted, strongSignals, patternMatched };
}

export function computeDifferentialDiagnosis(input: ClinicalInput, kb: KnowledgeBase): RankedResult[] {
  const hasAnyInput =
    input.anatomic.length > 0 ||
    !!input.onset ||
    !!input.course ||
    !!input.laterality ||
    !!input.granulomatous ||
    !!input.ageGroup ||
    !!input.iop ||
    !!input.kpMorphology ||
    !!input.kpDistribution ||
    input.selectedTags.length > 0;

  if (!hasAnyInput) return [];

  // Filter kategori penyakit: 6 entitas disease_category==="scleritis" hanya disertakan kalau
  // dokter mencentang "Sertakan Scleritis" — dikeluarkan total, bukan cuma diturunkan skornya,
  // karena checkbox anatomis uveitis tidak applicable untuk klasifikasi lokasi sklera.
  const candidateDiseases = kb.diseases.filter((d) => input.includeScleritis || d.disease_category !== "scleritis");

  // Kumpulkan action alert & forced-include dari quick_pattern_matchers yang match secara global
  // (lihat PRD section 4 poin 3-4: action = alert keselamatan, must_exclude = pengingat diferensial
  // yang wajib tetap tampil walau skor rendah).
  const actionAlertsByDisease = new Map<string, string[]>();
  const forcedIncludeIds = new Set<string>();
  PATTERN_MATCHERS.forEach((pm) => {
    const allPresent = pm.requiredTags.length > 0 && pm.requiredTags.every((t) => input.selectedTags.includes(t));
    if (!allPresent) return;
    if (pm.action) {
      pm.differential.forEach((id) => {
        const existing = actionAlertsByDisease.get(id) || [];
        existing.push(pm.action as string);
        actionAlertsByDisease.set(id, existing);
      });
    }
    if (pm.mustExclude) forcedIncludeIds.add(pm.mustExclude);
  });

  const results: RankedResult[] = candidateDiseases
    .map((disease) => {
      const { score, maxScore, matched, contradicted, strongSignals, patternMatched } = scoreDisease(disease, input);
      const scorePercent = maxScore > 0 ? Math.max(0, Math.round((score / maxScore) * 100)) : 0;
      // critical_note masquerade override: kalau disease ditandai sebagai "safety-net" entity
      // dan ADA minimal 2 sinyal KUAT, paksa tetap tampil walau di bawah threshold normal.
      // Syarat `>= 2` (bukan `matched.length > 0`, dan bukan `> 0`) penting — 1 sinyal kuat
      // bisa berupa exact-match anatomic_class SENDIRIAN, yang sangat non-spesifik (mis. cuma
      // centang "anterior" langsung cocok ke lusinan disease). Tanpa syarat ini, disease apa pun
      // yang critical_note-nya menyinggung kata "masquerade" sebagai CAVEAT (bukan sinyal aktif)
      // ikut nampang di hampir semua hasil hanya lewat 1 checkbox anatomis generik.
      const forced = forcedIncludeIds.has(disease.id) || (isMasqueradeSafetyNet(disease) && strongSignals >= 2);
      return {
        diseaseId: disease.id,
        name: disease.name,
        anatomicClass: disease.anatomic_class.join(" / "),
        scorePercent,
        matchedFeatures: matched,
        contradictedFeatures: contradicted,
        disease,
        actionAlerts: actionAlertsByDisease.get(disease.id),
        forcedInclude: forced,
        strongSignals,
        patternMatched,
      };
    })
    // Evidence-based gate — MENGGANTIKAN filter persentase flat lama (`scorePercent > 15`).
    // Alasan (lihat kritik dummy-testing): `scorePercent` per disease dinormalisasi terhadap
    // maxScore-nya SENDIRI, yang timpang antar disease karena kedalaman kurasi tag manual
    // berbeda-beda (0-6 tag). Itu membuat disease bertag kosong bisa "100% match" dari 1
    // checkbox anatomis kebetulan cocok, sementara disease terkurasi lengkap yang match separuh
    // dari BANYAK kriteria malah tersaring habis. Solusinya: syaratkan minimal 2 sinyal KUAT
    // (bukan implicit-panuveitis/usia yang sinyal lemah), ATAU 1 pola klinis khas yang match
    // penuh (patternMatched), ATAU forced-include (masquerade safety-net/must-exclude companion).
    .filter((r) => r.forcedInclude || r.patternMatched || r.strongSignals >= MIN_STRONG_SIGNALS)
    // Urutkan berdasar JUMLAH sinyal kuat dulu (bukan scorePercent langsung) — scorePercent
    // tetap timpang antar disease utk RANKING (bukan cuma filtering) karena denominator
    // (maxScore) beda-beda tergantung kedalaman kurasi tag manual. Disease dgn 7 tag ter-kurasi
    // yang match 3 di antaranya (sinyal kuat secara absolut) bisa persentasenya lebih rendah
    // dari disease bertag tipis (2 tag) yang match 1 — tapi yang match 3 kriteria lebih relevan
    // secara klinis, jadi harus tetap di atas. Pattern-matcher penuh dihitung setara 2 sinyal
    // kuat (pola klinis khas = bukti lebih kuat dari 1 tag individual).
    .sort((a, b) => {
      const aStrength = a.strongSignals + (a.patternMatched ? 2 : 0);
      const bStrength = b.strongSignals + (b.patternMatched ? 2 : 0);
      if (bStrength !== aStrength) return bStrength - aStrength;
      return b.scorePercent - a.scorePercent;
    });

  return results;
}

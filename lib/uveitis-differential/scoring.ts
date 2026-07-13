import type { ClinicalInput, Disease, KnowledgeBase, RankedResult } from "./types";
import { DISEASE_TAGS, PATTERN_MATCHERS, TAG_LABELS } from "./tags";

const WEIGHT_BASE_FIELD = 5;
const WEIGHT_AGE = 3;
const WEIGHT_TAG = 15;
const WEIGHT_CONTRADICTION = -10;
const WEIGHT_PATTERN_BONUS = 25;
const MIN_SCORE_PERCENT = 15;

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
function anatomicMatches(diseaseClasses: string[], selected: string): boolean {
  return diseaseClasses.includes(selected) || diseaseClasses.includes("panuveitis");
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
}

function scoreDisease(disease: Disease, input: ClinicalInput): ScoreDetail {
  let score = 0;
  let maxScore = 0;
  const matched: string[] = [];
  const contradicted: string[] = [];

  // Kelas anatomis — multi-select, dinilai per checkbox yang dicentang (lihat anatomicMatches)
  input.anatomic.forEach((sel) => {
    maxScore += WEIGHT_BASE_FIELD;
    if (anatomicMatches(disease.anatomic_class, sel)) {
      score += WEIGHT_BASE_FIELD;
      matched.push(`Kelas anatomis: ${sel}`);
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
    }
  });

  return { score, maxScore, matched, contradicted };
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
      const { score, maxScore, matched, contradicted } = scoreDisease(disease, input);
      const scorePercent = maxScore > 0 ? Math.max(0, Math.round((score / maxScore) * 100)) : 0;
      // critical_note masquerade override: kalau disease ditandai sebagai "safety-net" entity
      // dan ADA partial match sama sekali, paksa tetap tampil walau di bawah threshold normal.
      const forced = forcedIncludeIds.has(disease.id) || (isMasqueradeSafetyNet(disease) && matched.length > 0);
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
      };
    })
    .filter((r) => r.scorePercent > MIN_SCORE_PERCENT || r.forcedInclude)
    .sort((a, b) => b.scorePercent - a.scorePercent);

  return results;
}

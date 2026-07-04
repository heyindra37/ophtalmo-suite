import type { ClinicalInput, Disease, KnowledgeBase, RankedResult } from "./types";
import { DISEASE_TAGS, PATTERN_MATCHERS, TAG_LABELS } from "./tags";

const WEIGHT_BASE_FIELD = 5;
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

function anatomicMatches(disease: Disease, anatomic: string): boolean {
  const cls = disease.anatomic_class.toLowerCase();
  return cls === anatomic || cls.includes(anatomic) || cls === "any (anterior/intermediate/posterior/pan)" || cls.includes("any");
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

  // Basic fields — anatomic_class, course, granulomatous, laterality
  if (input.anatomic) {
    maxScore += WEIGHT_BASE_FIELD;
    if (anatomicMatches(disease, input.anatomic)) {
      score += WEIGHT_BASE_FIELD;
      matched.push(`Kelas anatomis: ${input.anatomic}`);
    } else {
      score += WEIGHT_CONTRADICTION;
      contradicted.push(`Kelas anatomis tidak cocok (disease: ${disease.anatomic_class})`);
    }
  }

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
    const allPresent = pm.requiredTags.every((t) => input.selectedTags.includes(t));
    if (allPresent && pm.requiredTags.length > 0) {
      score += WEIGHT_PATTERN_BONUS;
      matched.push(`Pola khas: ${pm.requiredTags.map((t) => TAG_LABELS[t] || t).join(" + ")}`);
    }
  });

  return { score, maxScore, matched, contradicted };
}

export function computeDifferentialDiagnosis(input: ClinicalInput, kb: KnowledgeBase): RankedResult[] {
  const hasAnyInput =
    !!input.anatomic ||
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

  const results: RankedResult[] = kb.diseases
    .map((disease) => {
      const { score, maxScore, matched, contradicted } = scoreDisease(disease, input);
      const scorePercent = maxScore > 0 ? Math.max(0, Math.round((score / maxScore) * 100)) : 0;
      return {
        diseaseId: disease.id,
        name: disease.name,
        anatomicClass: disease.anatomic_class,
        scorePercent,
        matchedFeatures: matched,
        contradictedFeatures: contradicted,
        disease,
      };
    })
    .filter((r) => r.scorePercent > MIN_SCORE_PERCENT)
    .sort((a, b) => b.scorePercent - a.scorePercent);

  return results;
}

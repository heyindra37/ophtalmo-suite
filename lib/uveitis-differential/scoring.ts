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

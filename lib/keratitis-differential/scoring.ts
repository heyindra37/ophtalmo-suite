import type { KeratitisEntity, RankedEntity, MatchLevel } from "./types";

export const MATCH_THRESHOLD_HIGH = 0.7;
export const MATCH_THRESHOLD_MEDIUM = 0.4;

export function computeMaxScore(entity: KeratitisEntity): number {
  return entity.findingWeights
    .filter((fw) => fw.weight > 0)
    .reduce((sum, fw) => sum + fw.weight, 0);
}

export function scoreEntity(entity: KeratitisEntity, selectedFindingIds: Set<string>): number {
  return entity.findingWeights
    .filter((fw) => selectedFindingIds.has(fw.findingId))
    .reduce((sum, fw) => sum + fw.weight, 0);
}

export function classifyMatch(score: number, maxScore: number): MatchLevel | null {
  if (maxScore <= 0) return null;
  const percent = score / maxScore;
  if (percent >= MATCH_THRESHOLD_HIGH) return "tinggi";
  if (percent >= MATCH_THRESHOLD_MEDIUM) return "sedang";
  return null;
}

/**
 * Ranks entities by weighted-match score against the selected findings.
 * Returns two lists: `ranked` (entities that clear the "sedang"/"tinggi" threshold,
 * sorted by score desc) and `others` (everything else, for a collapsed "kemungkinan lain" list).
 */
export function rankEntities(
  selectedFindingIds: Set<string>,
  entities: KeratitisEntity[]
): { ranked: RankedEntity[]; others: RankedEntity[] } {
  const scored = entities.map((entity) => {
    const maxScore = computeMaxScore(entity);
    const score = scoreEntity(entity, selectedFindingIds);
    const scorePercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const matchLevel = classifyMatch(score, maxScore);
    return { entity, score, maxScore, scorePercent, matchLevel };
  });

  const ranked: RankedEntity[] = [];
  const others: RankedEntity[] = [];
  for (const s of scored) {
    if (s.matchLevel) {
      ranked.push({ entity: s.entity, score: s.score, maxScore: s.maxScore, scorePercent: s.scorePercent, matchLevel: s.matchLevel });
    } else {
      others.push({ entity: s.entity, score: s.score, maxScore: s.maxScore, scorePercent: s.scorePercent, matchLevel: "sedang" });
    }
  }
  ranked.sort((a, b) => b.score - a.score);
  others.sort((a, b) => b.score - a.score);
  return { ranked, others };
}

export function buildCopyText(
  entity: KeratitisEntity,
  selectedFindingIds: Set<string>,
  findingLabelsById: Map<string, string>
): string {
  const matchedPositiveLabels = entity.findingWeights
    .filter((fw) => fw.weight > 0 && selectedFindingIds.has(fw.findingId))
    .map((fw) => findingLabelsById.get(fw.findingId))
    .filter((label): label is string => !!label);

  const dasarParts = [...entity.distinguishingFeatures];
  if (matchedPositiveLabels.length > 0) {
    dasarParts.push(`Temuan tercentang yang mendukung: ${matchedPositiveLabels.join(", ")}`);
  }

  const lines = [
    `Kecurigaan klinis: ${entity.name}`,
    `Dasar: ${dasarParts.join("; ")}`,
    `Terapi: ${entity.therapy.firstLine}`,
    `Wajib dihindari: ${entity.therapy.avoid.join("; ")}`,
  ];
  return lines.join("\n");
}

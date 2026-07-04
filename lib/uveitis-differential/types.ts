export type Anatomic = "" | "anterior" | "intermediate" | "posterior" | "panuveitis";
export type Onset = "" | "sudden" | "insidious";
export type Course = "" | "acute" | "recurrent" | "chronic";
export type Laterality = "" | "unilateral" | "bilateral" | "alternating";
export type TriState = "" | "yes" | "no";
export type AgeGroup = "" | "child" | "adult" | "elderly";
export type Sex = "" | "male" | "female";
export type FacilityTier = "basic" | "in_house_if_available" | "referral";

export type IopStatus = "" | "elevated" | "reduced" | "normal" | "unknown";
export type KpMorphology = "" | "fine" | "stellate" | "mutton_fat" | "large_greasy" | "unknown";
export type KpDistributionPattern = "" | "arlt_triangle_inferior" | "diffuse_beyond_midline" | "linear_turks_line" | "unknown";

export interface ClinicalInput {
  anatomic: Anatomic;
  onset: Onset;
  course: Course;
  laterality: Laterality;
  granulomatous: TriState;
  ageGroup: AgeGroup;
  sex: Sex;
  iop: IopStatus;
  kpMorphology: KpMorphology;
  kpDistribution: KpDistributionPattern;
  selectedTags: string[];
}

export function defaultClinicalInput(): ClinicalInput {
  return {
    anatomic: "",
    onset: "",
    course: "",
    laterality: "",
    granulomatous: "",
    ageGroup: "",
    sex: "",
    iop: "",
    kpMorphology: "",
    kpDistribution: "",
    selectedTags: [],
  };
}

export interface InvestigationItem {
  name: string;
  tier: FacilityTier;
}

export interface DiseaseTreatment {
  [key: string]: string | undefined;
}

// Struktur bersama untuk catatan referensi klinis per-penyakit yang punya bentuk
// {pattern, detail, source_note} — dipakai baik oleh `iop_pattern` maupun `kp_distribution`.
export interface PatternNote {
  pattern: string;
  detail: string;
  source_note: string;
}

export interface Disease {
  id: string;
  name: string;
  anatomic_class: string;
  etiology_group: string;
  course?: string;
  granulomatous?: boolean | string;
  laterality?: string;
  key_features: string[];
  associations?: string[];
  investigations?: InvestigationItem[];
  treatment: DiseaseTreatment;
  critical_note?: string;
  prognosis?: string;
  epidemiology?: string;
  screening_schedule?: Record<string, string>;
  screening?: string;
  context?: string;
  diagnostic_criteria?: string;
  diagnostic_criteria_table?: string;
  diagnostic_levels?: string[];
  differential?: string;
  differential_note?: string;
  note?: string;
  critical_note_treatment?: string;
  urgency_note?: string;
  epidemiology_note?: string;
  prevention?: string;
  iop_pattern?: PatternNote;
  kp_distribution?: PatternNote;
}

export interface QuickPatternMatcher {
  pattern: string;
  differential: string[];
  must_exclude?: string;
  note?: string;
  action?: string;
}

// Referensi top-level "quick reference" (dipakai sebagai tooltip/help text di UI,
// tidak diparse programatik untuk scoring — bentuknya longgar mengikuti JSON sumber).
export interface KpDistributionReference {
  purpose: string;
  arlt_triangle: Record<string, unknown>;
  diffuse_beyond_midline_pattern: Record<string, unknown>;
  linear_turks_line_pattern: Record<string, unknown>;
  combination_rule_for_scoring: string;
}

export interface IopReferenceTable {
  purpose: string;
  general_principle: string;
  entities_with_IOP_ELEVATION_as_a_notable_feature: { id: string; strength: string }[];
  iatrogenic_caution: string;
  clinical_utility_note: string;
}

export interface KnowledgeBase {
  meta: Record<string, unknown>;
  input_schema: Record<string, unknown>;
  kp_distribution_reference?: KpDistributionReference;
  iop_reference_table?: IopReferenceTable;
  diseases: Disease[];
  quick_pattern_matchers: QuickPatternMatcher[];
}

export interface RankedResult {
  diseaseId: string;
  name: string;
  anatomicClass: string;
  scorePercent: number;
  matchedFeatures: string[];
  contradictedFeatures: string[];
  disease: Disease;
}

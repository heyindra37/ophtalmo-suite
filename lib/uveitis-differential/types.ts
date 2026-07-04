export type Anatomic = "" | "anterior" | "intermediate" | "posterior" | "panuveitis";
export type Onset = "" | "sudden" | "insidious";
export type Course = "" | "acute" | "recurrent" | "chronic";
export type Laterality = "" | "unilateral" | "bilateral" | "alternating";
export type TriState = "" | "yes" | "no";
export type AgeGroup = "" | "child" | "adult" | "elderly";
export type Sex = "" | "male" | "female";
export type FacilityTier = "basic" | "in_house_if_available" | "referral";

export interface ClinicalInput {
  anatomic: Anatomic;
  onset: Onset;
  course: Course;
  laterality: Laterality;
  granulomatous: TriState;
  ageGroup: AgeGroup;
  sex: Sex;
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
  note?: string;
  critical_note_treatment?: string;
  urgency_note?: string;
  epidemiology_note?: string;
  prevention?: string;
}

export interface QuickPatternMatcher {
  pattern: string;
  differential: string[];
  must_exclude?: string;
  note?: string;
  action?: string;
}

export interface KnowledgeBase {
  meta: Record<string, unknown>;
  input_schema: Record<string, unknown>;
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

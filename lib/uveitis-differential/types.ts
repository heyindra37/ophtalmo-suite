export type AnatomicClass = "anterior" | "intermediate" | "posterior" | "panuveitis";
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
  /** Multi-select checkbox — knowledge base v2 mengubah anatomic_class jadi array per disease
   * (lihat kb.anatomic_class_reference), jadi input dokter juga jadi checkbox, bukan dropdown. */
  anatomic: AnatomicClass[];
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
  /** Kalau true, sertakan 6 entitas disease_category==="scleritis" dalam scoring (default false). */
  includeScleritis: boolean;
}

export function defaultClinicalInput(): ClinicalInput {
  return {
    anatomic: [],
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
    includeScleritis: false,
  };
}

export interface InvestigationItem {
  name: string;
  tier: FacilityTier;
}

export interface DiseaseTreatment {
  [key: string]: string | Record<string, unknown> | undefined;
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
  /** Selalu array di knowledge base v2 (lihat kb.anatomic_class_reference.revision_note). */
  anatomic_class: string[];
  etiology_group: string;
  course?: string;
  granulomatous?: boolean | string;
  laterality?: string;
  key_features: string[];
  associations?: string[];
  /** 3 bentuk berbeda di knowledge base v2: array {name,tier,note?}, array string lama,
   * atau tidak ada field ini sama sekali — selalu baca lewat normalizeInvestigations(). */
  investigations?: InvestigationItem[] | string[];
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
  /** String biasa di sebagian besar disease, TAPI object bertingkat (per-stage) di `dusn` —
   * selalu baca lewat normalizeDifferentialNote(), jangan akses langsung sebagai string. */
  differential_note?: string | Record<string, string>;
  note?: string;
  critical_note_treatment?: string;
  urgency_note?: string;
  epidemiology_note?: string;
  prevention?: string;
  iop_pattern?: PatternNote;
  kp_distribution?: PatternNote;
  /** "scleritis" untuk 6 entitas; undefined (tidak ada field ini) = uveitis (default). */
  disease_category?: "scleritis";
  /** "kanski" | "aao" — sumber utama entri. Murni metadata, tidak mempengaruhi skor. */
  source?: string;
  /** Kalau ada, disease ini punya entri terkait di kb.source_conflict_log.conflicts. */
  source_conflicts?: string[];
  age_group?: string[];
  age_group_note?: string;
  /** Field naratif lain yang namanya spesifik per-disease (mis. congenital_syphilis,
   * screening_schedule, ilar_subtype_breakdown_aao) — tidak bisa dihardcode satu-satu,
   * dibaca generik lewat index signature ini kalau UI perlu render read-only. */
  [extra: string]: unknown;
}

export interface QuickPatternMatcher {
  pattern: string;
  differential: string[];
  must_exclude?: string;
  note?: string;
  action?: string;
  source?: string;
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

export interface SourceConflictEntry {
  topic: string;
  kanski_position: string;
  aao_position: string;
  resolution?: string;
  affects_disease_id: string;
}

export interface SourceConflictLog {
  purpose: string;
  conflicts: SourceConflictEntry[];
  note_for_tool_ui?: string;
}

export interface SunOfficialReference {
  anatomic_classification_official_rule: string;
  table_5_1_categories?: Record<string, unknown>;
  [extra: string]: unknown;
}

export interface KnowledgeBase {
  meta: Record<string, unknown>;
  input_schema: Record<string, unknown>;
  kp_distribution_reference?: KpDistributionReference;
  iop_reference_table?: IopReferenceTable;
  diseases: Disease[];
  quick_pattern_matchers: QuickPatternMatcher[];
  // Reference object baru v2 (16 total) — dipakai read-only (detail view / Reference Library
  // yang ditunda, lihat PRD section 5B), kecuali sun_official_reference & source_conflict_log
  // yang juga dipakai logic (lihat scoring.ts & ConflictNotice.tsx).
  age_group_reference?: Record<string, unknown>;
  anatomic_class_reference?: Record<string, unknown>;
  sun_official_reference?: SunOfficialReference;
  source_conflict_log?: SourceConflictLog;
  treatment_algorithm_general_aao?: Record<string, unknown>;
  immunomodulatory_drug_reference_aao?: Record<string, unknown>;
  appendix_a_review_of_systems_checklist_aao?: Record<string, unknown>;
  appendix_b_intravitreal_antimicrobial_reference_aao?: Record<string, unknown>;
  surgical_management_notes_aao_ch16_partial?: Record<string, unknown>;
  white_dot_syndrome_comparison_table_aao?: Record<string, unknown>;
  neuroretinitis_differential_reference_aao?: Record<string, unknown>;
  scleritis_classification_reference_aao?: Record<string, unknown>;
}

export interface RankedResult {
  diseaseId: string;
  name: string;
  anatomicClass: string;
  scorePercent: number;
  matchedFeatures: string[];
  contradictedFeatures: string[];
  disease: Disease;
  /** Alert keselamatan dari quick_pattern_matchers yang match & punya field `action`. */
  actionAlerts?: string[];
  /** true kalau hasil ini dipaksa tampil (must_exclude companion atau critical_note masquerade),
   * walau skornya di bawah threshold normal. */
  forcedInclude?: boolean;
  /** Jumlah sinyal kuat yang cocok (lihat scoring.ts) — dipakai gate tampilan, juga berguna
   * untuk transparansi UI ("N dari M kriteria") kalau nanti diperlukan. */
  strongSignals?: number;
  /** true kalau minimal 1 quick_pattern_matcher match penuh untuk disease ini. */
  patternMatched?: boolean;
}

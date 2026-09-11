export type EvidenceLevel = "RCT" | "consensus" | "case-series" | "extrapolation";

export type FindingCategory =
  | "kulit_sistemik"
  | "konjungtiva_kgb"
  | "kornea_epitel"
  | "kornea_stroma_endotel"
  | "sensasi_nyeri"
  | "bilik_mata_depan"
  | "lateralitas_tempo";

export interface ClinicalFinding {
  id: string;
  label: string;
  category: FindingCategory;
  helpText?: string;
}

export interface FindingWeight {
  findingId: string;
  weight: number;
}

export interface MimicWarning {
  mimicName: string;
  note: string;
}

export interface TherapyInfo {
  firstLine: string;
  avoid: string[];
  evidenceLevel: EvidenceLevel;
  references: string[];
}

export interface ImageAsset {
  url: string;
  caption: string;
  view: "eksternal" | "slit-lamp-difus" | "slit-lamp-fokal" | "kobalt-blue" | "fundus";
}

export interface KeratitisEntity {
  id: string;
  category: "viral" | "bakteri" | "jamur" | "acanthamoeba" | "lainnya";
  subcategory?: string;
  name: string;
  entryRoutePathogenesis: string;
  findingWeights: FindingWeight[];
  distinguishingFeatures: string[];
  mimicWarnings?: MimicWarning[];
  therapy: TherapyInfo;
  redFlags?: string[];
  images: {
    hasPlaceholderOnly: boolean;
    assets: ImageAsset[];
  };
}

export interface KeratitisKnowledgeBase {
  findings: ClinicalFinding[];
  entities: KeratitisEntity[];
}

export type MatchLevel = "tinggi" | "sedang";

export interface RankedEntity {
  entity: KeratitisEntity;
  score: number;
  maxScore: number;
  scorePercent: number;
  matchLevel: MatchLevel;
}

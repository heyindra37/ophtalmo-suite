export interface ClinicalTemplateItem {
  text: string;
  /** Only shown when this scenario is selected. Omit to show for every scenario. */
  scenario?: string;
}

export interface ClinicalTemplateSection {
  /** May contain {{date+N}} / {{date-N}} placeholders when the template has a generator. */
  title: string;
  items?: (string | ClinicalTemplateItem)[];
  /** May contain {{date+N}} / {{date-N}} placeholders when the template has a generator. */
  text?: string;
}

export interface ClinicalTemplateScenario {
  id: string;
  label: string;
}

export interface ClinicalTemplateGenerator {
  /** Label for the date input driving {{date+N}} placeholders, e.g. "Tanggal Operasi". */
  anchorLabel: string;
  /** Optional scenario branches; when present, item-level `scenario` gates visibility. */
  scenarios?: ClinicalTemplateScenario[];
  defaultScenario?: string;
}

export interface ClinicalTemplate {
  id: string;
  name: string;
  category?: string;
  /** When present, this template computes dates from an input date and/or branches by scenario. */
  generator?: ClinicalTemplateGenerator;
  sections: ClinicalTemplateSection[];
  tags?: string[];
}

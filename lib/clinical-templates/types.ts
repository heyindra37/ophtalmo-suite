export interface ClinicalTemplateSection {
  title: string;
  items?: string[];
  text?: string;
}

export interface ClinicalTemplate {
  id: string;
  name: string;
  category?: string;
  sections: ClinicalTemplateSection[];
  tags?: string[];
}

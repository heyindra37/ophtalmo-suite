export interface ClinicalTemplate {
  id: string;
  name: string;
  category?: string;
  actionPlan?: string[];
  preOp?: string[];
  postOp?: string[];
  notes?: string[];
  tags?: string[];
}

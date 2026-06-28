export type SaMode = "full" | "normal" | "partial";
export type FdMode = "full" | "normal" | "tidak";

export interface CategoryPreset {
  saOD: SaMode;
  saOS: SaMode;
  fdOD: FdMode;
  fdOS: FdMode;
  showGBM: boolean;
  showCoverTest: boolean;
  priorityFields: string[];
}

export const CATEGORIES = [
  "Katarak",
  "Vitreoretina",
  "Infeksi Kornea & Eksternal",
  "External Eye Disease",
  "Refraksi",
  "Glaukoma",
  "Uveitis",
  "Neuro-Ophthalmology",
  "Pediatric",
  "Okuloplasti & Rekonstruksi",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_PRESETS: Record<Category, CategoryPreset> = {
  Katarak: {
    saOD: "full", saOS: "full", fdOD: "full", fdOS: "full",
    showGBM: false, showCoverTest: false,
    priorityFields: ["lensa", "fr", "onh"],
  },
  Vitreoretina: {
    saOD: "normal", saOS: "normal", fdOD: "full", fdOS: "full",
    showGBM: false, showCoverTest: false,
    priorityFields: ["vitreous", "makula", "retina"],
  },
  "Infeksi Kornea & Eksternal": {
    saOD: "full", saOS: "full", fdOD: "normal", fdOS: "normal",
    showGBM: false, showCoverTest: false,
    priorityFields: ["konjungtiva", "kornea", "bmd"],
  },
  "External Eye Disease": {
    saOD: "full", saOS: "full", fdOD: "normal", fdOS: "normal",
    showGBM: false, showCoverTest: false,
    priorityFields: ["palpebra", "konjungtiva", "kornea"],
  },
  Refraksi: {
    saOD: "normal", saOS: "normal", fdOD: "normal", fdOS: "normal",
    showGBM: false, showCoverTest: false,
    priorityFields: [],
  },
  Glaukoma: {
    saOD: "full", saOS: "full", fdOD: "full", fdOS: "full",
    showGBM: false, showCoverTest: false,
    priorityFields: ["onh"],
  },
  Uveitis: {
    saOD: "full", saOS: "full", fdOD: "full", fdOS: "full",
    showGBM: false, showCoverTest: false,
    priorityFields: ["bmd", "iris", "vitreous"],
  },
  "Neuro-Ophthalmology": {
    saOD: "normal", saOS: "normal", fdOD: "full", fdOS: "full",
    showGBM: true, showCoverTest: false,
    priorityFields: ["pupil", "onh"],
  },
  Pediatric: {
    saOD: "normal", saOS: "normal", fdOD: "normal", fdOS: "normal",
    showGBM: false, showCoverTest: false,
    priorityFields: ["palpebra", "lensa"],
  },
  "Okuloplasti & Rekonstruksi": {
    saOD: "full", saOS: "full", fdOD: "tidak", fdOS: "tidak",
    showGBM: false, showCoverTest: false,
    priorityFields: ["palpebra"],
  },
};

export interface DiagnosisPreset {
  category: Category;
  label: string;
  overrides: Partial<{
    saOD: SaMode; saOS: SaMode; fdOD: FdMode; fdOS: FdMode;
    showGBM: boolean; showCoverTest: boolean;
    notes: string;
  }>;
}

export const DIAGNOSIS_BY_CATEGORY: Record<Category, DiagnosisPreset[]> = {
  Katarak: [
    { category: "Katarak", label: "Katarak senilis (rutin)", overrides: {} },
    { category: "Katarak", label: "Katarak senilis imatur", overrides: {} },
    { category: "Katarak", label: "Posterior Capsular Opacity (PCO)", overrides: {} },
    { category: "Katarak", label: "Katarak komplikata", overrides: {} },
    { category: "Katarak", label: "Katarak traumatika", overrides: {} },
    { category: "Katarak", label: "Katarak kongenital", overrides: {} },
    { category: "Katarak", label: "Subluksasi lensa", overrides: {} },
    { category: "Katarak", label: "Glaukoma fakomorfik", overrides: {} },
  ],
  Vitreoretina: [
    { category: "Vitreoretina", label: "Diabetic Retinopathy (NPDR)", overrides: {} },
    { category: "Vitreoretina", label: "Diabetic Retinopathy (PDR)", overrides: {} },
    { category: "Vitreoretina", label: "Macular Hole", overrides: {} },
    { category: "Vitreoretina", label: "Epiretinal Membrane", overrides: {} },
    { category: "Vitreoretina", label: "Ablasio Retina", overrides: {} },
    { category: "Vitreoretina", label: "CRVO/BRVO", overrides: {} },
    { category: "Vitreoretina", label: "Retinopati Hipertensi", overrides: {} },
    { category: "Vitreoretina", label: "Endoftalmitis/Vitritis", overrides: { saOD: "full", saOS: "full" } },
    { category: "Vitreoretina", label: "PVD / Floaters", overrides: {} },
    { category: "Vitreoretina", label: "ROP (Skrining)", overrides: {} },
  ],
  "Infeksi Kornea & Eksternal": [
    { category: "Infeksi Kornea & Eksternal", label: "Keratitis bakterial", overrides: {} },
    { category: "Infeksi Kornea & Eksternal", label: "Keratitis jamur", overrides: {} },
    { category: "Infeksi Kornea & Eksternal", label: "Keratitis HSV (dendritik)", overrides: {} },
    { category: "Infeksi Kornea & Eksternal", label: "Endoftalmitis post-op", overrides: {} },
    { category: "Infeksi Kornea & Eksternal", label: "Selulitis preseptal", overrides: {} },
  ],
  "External Eye Disease": [
    { category: "External Eye Disease", label: "Konjungtivitis bakterial", overrides: {} },
    { category: "External Eye Disease", label: "Keratokonjungtivitis vernal", overrides: {} },
    { category: "External Eye Disease", label: "Hordeolum eksterna", overrides: {} },
    { category: "External Eye Disease", label: "Chalazion", overrides: {} },
    { category: "External Eye Disease", label: "Pterigium", overrides: {} },
    { category: "External Eye Disease", label: "Dry Eye Syndrome", overrides: {} },
    { category: "External Eye Disease", label: "Episkleritis", overrides: {} },
    { category: "External Eye Disease", label: "Perdarahan subkonjungtiva", overrides: {} },
    { category: "External Eye Disease", label: "Blefaritis", overrides: {} },
  ],
  Refraksi: [
    { category: "Refraksi", label: "Miopia", overrides: {} },
    { category: "Refraksi", label: "Hipermetropia", overrides: {} },
    { category: "Refraksi", label: "Astigmatisme", overrides: {} },
    { category: "Refraksi", label: "Presbiopia", overrides: {} },
  ],
  Glaukoma: [
    { category: "Glaukoma", label: "POAG (kontrol)", overrides: {} },
    { category: "Glaukoma", label: "Glaukoma akut sudut tertutup", overrides: {} },
    { category: "Glaukoma", label: "Glaukoma sekunder ec uveitis", overrides: {} },
    { category: "Glaukoma", label: "Suspect glaukoma", overrides: { saOD: "normal", saOS: "normal" } },
    { category: "Glaukoma", label: "Glaukoma absolut", overrides: {} },
    { category: "Glaukoma", label: "Post trabekulektomi", overrides: {} },
  ],
  Uveitis: [
    { category: "Uveitis", label: "Uveitis anterior akut", overrides: {} },
    { category: "Uveitis", label: "Uveitis anterior granulomatosa", overrides: {} },
    { category: "Uveitis", label: "Uveitis intermediate", overrides: {} },
    { category: "Uveitis", label: "Uveitis posterior", overrides: {} },
    { category: "Uveitis", label: "Panuveitis", overrides: {} },
  ],
  "Neuro-Ophthalmology": [
    { category: "Neuro-Ophthalmology", label: "Neuritis optik", overrides: { showGBM: true } },
    { category: "Neuro-Ophthalmology", label: "Papiledema", overrides: {} },
    { category: "Neuro-Ophthalmology", label: "Atrofi papil", overrides: {} },
    { category: "Neuro-Ophthalmology", label: "Parese N.III", overrides: { showGBM: true } },
    { category: "Neuro-Ophthalmology", label: "Parese N.VI", overrides: { showGBM: true, showCoverTest: true } },
    { category: "Neuro-Ophthalmology", label: "Pupil Adie", overrides: {} },
  ],
  Pediatric: [
    { category: "Pediatric", label: "Strabismus esotropia", overrides: { showCoverTest: true } },
    { category: "Pediatric", label: "Ambliopia", overrides: {} },
    { category: "Pediatric", label: "Katarak kongenital", overrides: { saOD: "full", saOS: "full" } },
    { category: "Pediatric", label: "Ptosis kongenital", overrides: { saOD: "full", saOS: "full" } },
    { category: "Pediatric", label: "ROP skrining", overrides: { fdOD: "full", fdOS: "full" } },
    { category: "Pediatric", label: "Konjungtivitis neonatorum", overrides: { saOD: "full", saOS: "full" } },
    { category: "Pediatric", label: "Dakriostenosis kongenital", overrides: {} },
    { category: "Pediatric", label: "Selulitis preseptal anak", overrides: { saOD: "full", saOS: "full" } },
  ],
  "Okuloplasti & Rekonstruksi": [
    { category: "Okuloplasti & Rekonstruksi", label: "Entropion", overrides: {} },
    { category: "Okuloplasti & Rekonstruksi", label: "Ektropion", overrides: {} },
    { category: "Okuloplasti & Rekonstruksi", label: "Ptosis (dewasa/aponeurotik)", overrides: {} },
    { category: "Okuloplasti & Rekonstruksi", label: "Trikiasis", overrides: {} },
    { category: "Okuloplasti & Rekonstruksi", label: "Tumor palpebra", overrides: {} },
    { category: "Okuloplasti & Rekonstruksi", label: "Blow-out fracture", overrides: { showGBM: true } },
    { category: "Okuloplasti & Rekonstruksi", label: "Laserasi palpebra", overrides: {} },
    { category: "Okuloplasti & Rekonstruksi", label: "Anophthalmic socket", overrides: {} },
  ],
};

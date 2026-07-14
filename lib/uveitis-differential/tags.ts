// Tag taxonomy kanonis — normalisasi dari `key_features` teks bebas di knowledge base
// menjadi checklist terstruktur, supaya satu checkbox bisa menaikkan skor beberapa
// penyakit sekaligus. Lihat plan/PRD Uveitis Differential untuk rasional.

export interface TagGroup {
  group: string;
  tags: { id: string; label: string }[];
}

export const TAG_GROUPS: TagGroup[] = [
  {
    group: "Segmen Anterior",
    tags: [
      { id: "hypopyon_mobile", label: "Hipopion mobile" },
      { id: "hypopyon_immobile", label: "Hipopion immobile" },
      { id: "fibrin_ac", label: "Fibrin di bilik mata depan" },
      { id: "painful_red_eye", label: "Mata merah dan nyeri" },
      { id: "kp_fine", label: "KP halus (non-granulomatous)" },
      { id: "kp_stellate", label: "KP stellate difus" },
      { id: "kp_mutton_fat", label: "KP mutton-fat" },
      { id: "posterior_synechiae_present", label: "Sinekia posterior ada" },
      { id: "posterior_synechiae_absent", label: "Sinekia posterior tidak ada" },
      { id: "heterochromia", label: "Heterokromia iris" },
      { id: "iris_atrophy_diffuse", label: "Atrofi iris difus" },
      { id: "iris_atrophy_sectoral", label: "Atrofi iris sektoral/patchy" },
      { id: "eye_white_quiet_looking", label: "Mata relatif putih/tenang" },
      { id: "injection_absent_despite_severity", label: "Tanpa injeksi walau inflamasi berat" },
      { id: "band_keratopathy", label: "Band keratopathy" },
      { id: "recent_cataract_surgery_or_lens_trauma", label: "Riwayat operasi katarak baru / trauma lensa" },
    ],
  },
  {
    group: "Vitreous",
    tags: [
      { id: "vitritis_present", label: "Vitritis ada" },
      { id: "vitritis_dense", label: "Vitritis dense/berat" },
      { id: "vitritis_minimal", label: "Vitritis minimal/tidak ada" },
      { id: "snowballs", label: "Snowballs" },
      { id: "snowbanking", label: "Snowbanking" },
    ],
  },
  {
    group: "Fundus / Retina / Koroid",
    tags: [
      { id: "retinitis_satellite_to_old_scar", label: "Retinitis satelit dekat skar lama" },
      { id: "retinitis_pizza_pie", label: "Retinitis pola 'pizza pie'" },
      { id: "retinitis_necrosis_minimal_inflammation", label: "Nekrosis retina, inflamasi minimal" },
      { id: "retinitis_necrosis_prominent_inflammation", label: "Nekrosis retina, inflamasi prominen" },
      { id: "chorioretinal_granuloma", label: "Granuloma korioretina" },
      { id: "leukocoria_or_strabismus_child", label: "Leukokoria/strabismus pada anak" },
      { id: "placoid_lesion_posterior", label: "Lesi placoid posterior pole" },
      { id: "serpiginous_pattern", label: "Pola serpiginosa/geografik" },
      { id: "choroidal_patches_radiating_disc", label: "Bercak koroid radiating dari disc" },
      { id: "macular_yellow_spots_atrophic", label: "Bercak kuning makula, evolusi atrofi" },
      { id: "histo_spots_no_vitritis", label: "'Histo spots' tanpa vitritis" },
      { id: "exudative_rd", label: "Ablasio retina eksudatif" },
      { id: "disc_edema", label: "Edema diskus optik" },
      { id: "retinal_vasculitis_arteritis", label: "Vaskulitis retina — arteritis" },
      { id: "retinal_vasculitis_phlebitis", label: "Vaskulitis retina — phlebitis" },
      { id: "white_dots_evanescent", label: "Bercak putih evanescent" },
      { id: "wedge_parafoveal_lesion", label: "Lesi wedge parafovea" },
    ],
  },
  {
    group: "Riwayat & Sistemik",
    tags: [
      { id: "oral_genital_ulcers", label: "Ulkus oral/genital" },
      { id: "joint_pain_back_stiffness", label: "Nyeri sendi/kaku punggung" },
      { id: "tinnitus_vertigo_hearing_loss", label: "Tinnitus/vertigo/gangguan dengar" },
      { id: "alopecia_vitiligo_poliosis", label: "Alopecia/vitiligo/poliosis" },
      { id: "prior_penetrating_trauma_or_vr_surgery", label: "Riwayat trauma tembus/operasi vitreoretinal" },
      { id: "child_asymptomatic_with_arthritis", label: "Anak, uveitis asimtomatik + artritis" },
      { id: "tick_bite_history", label: "Riwayat gigitan kutu" },
      { id: "immunocompromised_hiv", label: "HIV/imunokompromais" },
      { id: "pregnancy", label: "Kehamilan" },
      { id: "chronic_diarrhea", label: "Diare kronis/nyeri perut" },
      { id: "flu_like_prodrome", label: "Prodromal flu-like" },
    ],
  },
  {
    group: "Demografi",
    tags: [
      { id: "young_myopic_female", label: "Wanita muda, miopia" },
      { id: "middle_aged_female", label: "Wanita paruh baya" },
    ],
  },
  {
    group: "Hasil Investigasi (jika sudah ada)",
    tags: [
      { id: "hla_b27_positive", label: "HLA-B27 positif" },
      { id: "ace_elevated_or_cxr_bhl", label: "ACE meningkat / CXR bilateral hilar lymphadenopathy" },
      { id: "syphilis_serology_positive", label: "Serologi sifilis positif" },
      { id: "toxoplasma_serology_positive", label: "Serologi toksoplasma IgG/IgM positif" },
    ],
  },
  {
    group: "Masquerade & Mimik Non-Inflamasi",
    tags: [
      { id: "masquerade_older_patient_poor_steroid_response", label: "Usia >50th, respon steroid buruk/parsial" },
      { id: "pseudohypopyon", label: "Pseudohipopion (bukan hipopion inflamasi sejati)" },
      { id: "child_spontaneous_hyphema", label: "Anak, hifema spontan" },
      { id: "unrecognized_trauma_history", label: "Riwayat trauma tidak disadari/tidak jelas" },
      { id: "pigment_cells_mimicking_inflammation", label: "Sel pigmen di BMD (mirip sel inflamasi)" },
      { id: "normal_fundus_severe_field_loss", label: "Fundus tampak normal, penurunan lapang pandang berat" },
      { id: "minimal_inflammation_severe_vision_loss", label: "Inflamasi minimal/tidak ada, penurunan visus berat" },
      { id: "family_history_night_blindness", label: "Riwayat keluarga buta senja/RP" },
      { id: "carotid_hypoperfusion_signs", label: "Tanda hipoperfusi okular (karotis)" },
      { id: "scleral_depression_reveals_detachment", label: "Depresi sklera: ablasio retina perifer tersembunyi" },
      { id: "chronic_indolent_unilateral_uveitis_unexplained", label: "Uveitis unilateral kronis tanpa penjelasan jelas" },
    ],
  },
  {
    group: "Pasca-Operasi / Iatrogenik",
    tags: [
      { id: "pseudophakic_iol_chafing", label: "Pseudofakia, gejala setelah operasi katarak (IOL)" },
      { id: "postop_sterile_acute_reaction", label: "Reaksi inflamasi akut steril pasca-operasi" },
      { id: "postop_recurrent_indolent_with_plaques", label: "Rekuren kronis pasca-operasi + plak intrakapsular" },
      { id: "recurrent_unilateral_iop_spike_mild_inflammation", label: "IOP naik rekuren unilateral, inflamasi ringan" },
      { id: "renal_disease_with_uveitis_async", label: "Kelainan ginjal menyertai uveitis (tidak selalu bersamaan)" },
    ],
  },
  {
    group: "Skleritis",
    tags: [
      { id: "scleritis_violaceous_diffuse", label: "Skleritis: kemerahan violaceous difus" },
      { id: "scleritis_nodule_tender", label: "Skleritis: nodul sklera nyeri tekan" },
      { id: "scleritis_necrotizing_avascular", label: "Skleritis: area avaskular/nekrotik" },
      { id: "scleritis_painless_white_patches", label: "Skleritis: plak putih tanpa nyeri (scleromalacia)" },
      { id: "scleritis_posterior_boring_pain", label: "Skleritis posterior: nyeri dalam/boring, visus turun" },
      { id: "scleritis_postsurgical_or_contaminated_wound", label: "Skleritis pasca-bedah / luka terkontaminasi" },
    ],
  },
  {
    group: "Vaskulitis Sistemik & Lain",
    tags: [
      { id: "ent_bloody_nasal_discharge", label: "Sinusitis + sekret hidung berdarah" },
      { id: "mononeuritis_multiplex", label: "Mononeuritis multipleks" },
      { id: "retinal_vasoocclusive_no_inflammation", label: "Vaso-oklusi retina tanpa tanda inflamasi jelas" },
      { id: "hearing_loss_encephalopathy_brao_triad", label: "Ensefalopati + gangguan dengar + BRAO (Susac)" },
      { id: "lung_sparing_vasculitis_skin_nodules", label: "Vaskulitis dengan paru relatif normal + nodul kulit" },
    ],
  },
  {
    group: "Infeksi Tropis/Sistemik & Arbovirus",
    tags: [
      { id: "mosquito_borne_febrile_illness", label: "Demam terkait gigitan nyamuk (endemis tropis)" },
      { id: "tropical_endemic_exposure", label: "Paparan lingkungan endemis tropis (air/tanah/hewan)" },
      { id: "animal_contact_exposure", label: "Riwayat kontak hewan (cakaran kucing/ternak/anjing)" },
      { id: "worm_visualized_subretinal", label: "Cacing/larva terlihat di subretina/vitreous" },
      { id: "hiv_aids_opportunistic_ocular", label: "AIDS dengan infeksi oportunistik okular" },
      // Tag pembeda spesifik per-arbovirus (sebelumnya dengue/chikungunya/zika/west nile/rift
      // valley cuma dipetakan ke 2 tag generik di atas dan selalu tampil seri di skor identik —
      // lihat kritik dummy-testing)
      { id: "subconjunctival_petechial_hemorrhage", label: "Perdarahan subkonjungtiva petekie" },
      { id: "delayed_foveolitis_1month_post_fever", label: "Foveolitis/skotoma sentral ~1 bulan pasca demam" },
      { id: "prominent_arthralgia_polyarthropathy", label: "Artralgia menonjol/poliartropati" },
      { id: "posterior_pole_retinitis_minimal_vitritis", label: "Retinitis posterior pole, vitritis minimal" },
      { id: "mild_self_limited_febrile_illness", label: "Demam ringan, sembuh sendiri dalam seminggu" },
      { id: "linear_chorioretinal_lesions_nerve_fiber_pattern", label: "Lesi korioretina linear mengikuti serat saraf" },
      { id: "macular_retinitis_sparing_fovea", label: "Retinitis makula/paramakula, fovea relatif terhindar" },
    ],
  },
];

export const ALL_TAGS: string[] = TAG_GROUPS.flatMap((g) => g.tags.map((t) => t.id));

export const TAG_LABELS: Record<string, string> = Object.fromEntries(
  TAG_GROUPS.flatMap((g) => g.tags.map((t) => [t.id, t.label]))
);

// Pemetaan manual: penyakit -> tag kanonis yang relevan (dari key_features + red-flag table)
export const DISEASE_TAGS: Record<string, string[]> = {
  aau_idiopathic_hlab27: ["hypopyon_immobile", "fibrin_ac", "painful_red_eye", "kp_fine", "joint_pain_back_stiffness", "hla_b27_positive"],
  behcet_uveitis: ["hypopyon_mobile", "eye_white_quiet_looking", "oral_genital_ulcers", "retinal_vasculitis_arteritis", "retinal_vasculitis_phlebitis", "vitritis_present"],
  fuchs_uveitis_syndrome: ["kp_stellate", "posterior_synechiae_absent", "eye_white_quiet_looking", "heterochromia", "iris_atrophy_diffuse"],
  jia_uveitis: ["injection_absent_despite_severity", "posterior_synechiae_present", "band_keratopathy", "child_asymptomatic_with_arthritis"],
  vkh_syndrome: ["tinnitus_vertigo_hearing_loss", "alopecia_vitiligo_poliosis", "exudative_rd", "chorioretinal_granuloma", "vitritis_present"],
  sympathetic_ophthalmia: ["prior_penetrating_trauma_or_vr_surgery", "chorioretinal_granuloma"],
  sarcoidosis_uveitis: ["kp_mutton_fat", "snowballs", "chorioretinal_granuloma", "retinal_vasculitis_phlebitis", "ace_elevated_or_cxr_bhl"],
  toxoplasmosis_retinitis: ["retinitis_satellite_to_old_scar", "disc_edema", "vitritis_present", "toxoplasma_serology_positive"],
  toxocariasis_ocular: ["chorioretinal_granuloma", "leukocoria_or_strabismus_child"],
  cmv_retinitis: ["retinitis_pizza_pie", "immunocompromised_hiv"],
  progressive_retinal_necrosis: ["retinitis_necrosis_minimal_inflammation", "vitritis_minimal", "immunocompromised_hiv"],
  acute_retinal_necrosis: ["retinitis_necrosis_prominent_inflammation", "vitritis_present", "retinal_vasculitis_arteritis"],
  poh_syndrome: ["histo_spots_no_vitritis"],
  tb_uveitis: ["chorioretinal_granuloma", "serpiginous_pattern", "retinal_vasculitis_phlebitis"],
  syphilitic_uveitis: ["placoid_lesion_posterior", "retinal_vasculitis_phlebitis", "syphilis_serology_positive"],
  lyme_uveitis: ["tick_bite_history"],
  endogenous_endophthalmitis: ["vitritis_present"],
  mewds: ["white_dots_evanescent", "young_myopic_female"],
  apmppe: ["placoid_lesion_posterior"],
  serpiginous_choroidopathy: ["serpiginous_pattern"],
  birdshot_retinochoroidopathy: ["choroidal_patches_radiating_disc", "middle_aged_female", "vitritis_present"],
  punctate_inner_choroidopathy: ["macular_yellow_spots_atrophic", "vitritis_minimal", "young_myopic_female"],
  acute_macular_neuroretinopathy: ["wedge_parafoveal_lesion", "flu_like_prodrome"],
  herpes_simplex_anterior_uveitis: ["iris_atrophy_sectoral"],
  vzv_anterior_uveitis: ["iris_atrophy_sectoral"],
  cmv_anterior_uveitis: ["posterior_synechiae_absent", "injection_absent_despite_severity"],
  lens_induced_uveitis: ["recent_cataract_surgery_or_lens_trauma"],

  // ── 64 disease baru di knowledge base v2 (AAO BCSC) ──────────────────────────
  tinu_syndrome: ["renal_disease_with_uveitis_async"],
  posner_schlossman_syndrome: ["recurrent_unilateral_iop_spike_mild_inflammation"],
  uveitis_glaucoma_hyphema_syndrome: ["pseudophakic_iol_chafing"],
  toxic_anterior_segment_syndrome: ["postop_sterile_acute_reaction"],
  chronic_postop_endophthalmitis_cutibacterium: ["postop_recurrent_indolent_with_plaques", "recent_cataract_surgery_or_lens_trauma"],
  granulomatosis_with_polyangiitis: ["ent_bloody_nasal_discharge", "mononeuritis_multiplex", "retinal_vasculitis_arteritis"],
  systemic_lupus_erythematosus_uveitis: ["retinal_vasoocclusive_no_inflammation"],
  multiple_sclerosis_uveitis: ["retinal_vasculitis_phlebitis", "vitritis_minimal"],
  vitreoretinal_lymphoma: ["masquerade_older_patient_poor_steroid_response", "vitritis_present"],
  uveal_lymphoma: ["masquerade_older_patient_poor_steroid_response", "chorioretinal_granuloma"],
  ocular_manifestations_systemic_lymphoma: ["pseudohypopyon", "vitritis_present", "retinal_vasculitis_phlebitis"],
  ocular_manifestations_leukemia: ["pseudohypopyon", "heterochromia"],
  uveal_melanoma_masquerade: ["masquerade_older_patient_poor_steroid_response"],
  retinoblastoma_masquerade: ["pseudohypopyon", "leukocoria_or_strabismus_child"],
  juvenile_xanthogranuloma: ["child_spontaneous_hyphema"],
  metastatic_tumors_masquerade: ["masquerade_older_patient_poor_steroid_response"],
  bilateral_diffuse_uveal_melanocytic_proliferation: ["exudative_rd", "chorioretinal_granuloma"],
  retinitis_pigmentosa_masquerade: ["family_history_night_blindness", "vitritis_minimal"],
  ocular_ischemic_syndrome_masquerade: ["carotid_hypoperfusion_signs"],
  chronic_rrd_schwartz_matsuo: ["scleral_depression_reveals_detachment", "chronic_indolent_unilateral_uveitis_unexplained"],
  intraocular_foreign_body_masquerade: ["unrecognized_trauma_history", "chronic_indolent_unilateral_uveitis_unexplained"],
  pigment_dispersion_syndrome_masquerade: ["pigment_cells_mimicking_inflammation"],
  phacolytic_uveitis: ["recent_cataract_surgery_or_lens_trauma"],
  pars_planitis: ["snowballs", "snowbanking", "retinal_vasculitis_phlebitis"],
  drug_induced_uveitis: [],
  blau_syndrome: ["chorioretinal_granuloma", "child_asymptomatic_with_arthritis"],
  multifocal_choroiditis_panuveitis: ["young_myopic_female", "vitritis_present"],
  subretinal_fibrosis_uveitis_syndrome: ["vitritis_present"],
  relentless_placoid_chorioretinitis: ["placoid_lesion_posterior", "serpiginous_pattern"],
  acute_retinal_pigment_epitheliitis: [],
  azoor: ["normal_fundus_severe_field_loss"],
  acute_idiopathic_maculopathy: ["flu_like_prodrome"],
  autoimmune_retinopathy: ["minimal_inflammation_severe_vision_loss"],
  polyarteritis_nodosa: ["mononeuritis_multiplex", "lung_sparing_vasculitis_skin_nodules", "retinal_vasculitis_arteritis"],
  susac_syndrome: ["hearing_loss_encephalopathy_brao_triad", "vitritis_minimal"],
  leptospirosis_uveitis: ["mosquito_borne_febrile_illness", "tropical_endemic_exposure", "retinal_vasculitis_phlebitis"],
  nocardiosis_uveitis: ["immunocompromised_hiv", "chorioretinal_granuloma"],
  cat_scratch_bartonellosis: ["animal_contact_exposure", "disc_edema"],
  whipple_disease_uveitis: ["chronic_diarrhea", "vitritis_present"],
  eales_disease: ["retinal_vasculitis_phlebitis"],
  dengue_uveitis: ["mosquito_borne_febrile_illness", "tropical_endemic_exposure", "subconjunctival_petechial_hemorrhage", "delayed_foveolitis_1month_post_fever"],
  chikungunya_uveitis: ["mosquito_borne_febrile_illness", "tropical_endemic_exposure", "prominent_arthralgia_polyarthropathy", "posterior_pole_retinitis_minimal_vitritis"],
  zika_virus_uveitis: ["mosquito_borne_febrile_illness", "tropical_endemic_exposure", "mild_self_limited_febrile_illness"],
  west_nile_virus_uveitis: ["mosquito_borne_febrile_illness", "retinal_vasculitis_arteritis", "linear_chorioretinal_lesions_nerve_fiber_pattern"],
  rift_valley_fever_uveitis: ["mosquito_borne_febrile_illness", "animal_contact_exposure", "macular_retinitis_sparing_fovea"],
  htlv1_uveitis: ["retinal_vasculitis_phlebitis"],
  ebola_virus_uveitis: ["chronic_indolent_unilateral_uveitis_unexplained"],
  covid19_uveitis: [],
  epstein_barr_virus_uveitis: ["kp_mutton_fat", "flu_like_prodrome"],
  nonnecrotizing_herpetic_retinopathy: ["retinal_vasculitis_arteritis"],
  cysticercosis_ocular: ["worm_visualized_subretinal", "tropical_endemic_exposure"],
  dusn: ["worm_visualized_subretinal"],
  onchocerciasis_ocular: ["tropical_endemic_exposure"],
  hiv_retinopathy: ["immunocompromised_hiv"],
  pneumocystis_jirovecii_choroiditis: ["hiv_aids_opportunistic_ocular", "vitritis_minimal"],
  cryptococcal_choroiditis: ["hiv_aids_opportunistic_ocular", "chorioretinal_granuloma"],
  endogenous_candida_endophthalmitis: ["immunocompromised_hiv", "vitritis_present"],
  endogenous_aspergillus_endophthalmitis: ["immunocompromised_hiv", "hypopyon_immobile"],
  diffuse_anterior_scleritis: ["scleritis_violaceous_diffuse"],
  nodular_anterior_scleritis: ["scleritis_nodule_tender"],
  necrotizing_scleritis: ["scleritis_necrotizing_avascular"],
  scleromalacia_perforans: ["scleritis_painless_white_patches"],
  posterior_scleritis: ["scleritis_posterior_boring_pain"],
  infectious_scleritis: ["scleritis_postsurgical_or_contaminated_wound", "scleritis_necrotizing_avascular"],
};

export interface PatternMatcher {
  requiredTags: string[];
  differential: string[];
  /** Alert keselamatan (amber) yang ditampilkan terpisah kalau matcher ini match — dari
   * field `action` di kb.quick_pattern_matchers (PRD section 4 poin 3). */
  action?: string;
  /** Disease id yang WAJIB tetap muncul di hasil (skor rendah pun) sebagai pengingat "jangan
   * lupa singkirkan ini juga" — dari field `must_exclude`. */
  mustExclude?: string;
}

// Konversi quick_pattern_matchers (teks bebas di JSON) -> kondisi AND berbasis tag
export const PATTERN_MATCHERS: PatternMatcher[] = [
  { requiredTags: ["hypopyon_mobile", "eye_white_quiet_looking"], differential: ["behcet_uveitis", "jia_uveitis"] },
  { requiredTags: ["hypopyon_immobile", "painful_red_eye"], differential: ["aau_idiopathic_hlab27"] },
  { requiredTags: ["heterochromia", "kp_stellate", "posterior_synechiae_absent"], differential: ["fuchs_uveitis_syndrome"] },
  { requiredTags: ["child_asymptomatic_with_arthritis"], differential: ["jia_uveitis"] },
  { requiredTags: ["retinitis_satellite_to_old_scar"], differential: ["toxoplasmosis_retinitis"] },
  { requiredTags: ["immunocompromised_hiv", "retinitis_pizza_pie"], differential: ["cmv_retinitis"] },
  { requiredTags: ["immunocompromised_hiv", "retinitis_necrosis_minimal_inflammation"], differential: ["progressive_retinal_necrosis"] },
  { requiredTags: ["retinitis_necrosis_prominent_inflammation"], differential: ["acute_retinal_necrosis"] },
  {
    requiredTags: ["leukocoria_or_strabismus_child", "chorioretinal_granuloma"],
    differential: ["toxocariasis_ocular"],
    mustExclude: "retinoblastoma_masquerade",
  },
  { requiredTags: ["tinnitus_vertigo_hearing_loss", "exudative_rd"], differential: ["vkh_syndrome"] },
  { requiredTags: ["prior_penetrating_trauma_or_vr_surgery"], differential: ["sympathetic_ophthalmia"] },
  { requiredTags: ["serpiginous_pattern"], differential: ["serpiginous_choroidopathy", "tb_uveitis", "syphilitic_uveitis"] },
  { requiredTags: ["young_myopic_female"], differential: ["mewds", "punctate_inner_choroidopathy"] },
  {
    requiredTags: ["placoid_lesion_posterior"],
    differential: ["apmppe"],
    action: "Kalau ada gejala neurologis (termasuk sakit kepala saja), rujuk segera untuk pencitraan SSP + LP — APMPPE punya asosiasi jarang tapi mengancam jiwa dengan vaskulitis serebral.",
  },

  // ── Pola baru v2 (masquerade, skleritis, infeksi pasca-operasi/tropis) ──────
  {
    requiredTags: ["masquerade_older_patient_poor_steroid_response"],
    differential: ["vitreoretinal_lymphoma"],
    action: "Usia 50-70 tahun dengan uveitis atipikal yang respon parsial/sementara terhadap steroid — jangan biarkan skor tinggi diagnosis lain menyingkirkan kecurigaan limfoma vitreoretina, rujuk untuk biopsi vitreous/MRI otak.",
  },
  {
    requiredTags: ["snowballs", "snowbanking"],
    differential: ["pars_planitis"],
    action: "Sel vitreous baru pada pasien >=50-60 tahun (lebih tua dari usia khas pars planitis) — jangan default ke pars planitis tanpa menyingkirkan limfoma vitreoretina terlebih dulu.",
  },
  {
    requiredTags: ["pseudohypopyon", "leukocoria_or_strabismus_child"],
    differential: ["retinoblastoma_masquerade"],
    mustExclude: "toxocariasis_ocular",
  },
  {
    requiredTags: ["scleritis_posterior_boring_pain"],
    differential: ["posterior_scleritis"],
    action: "Lakukan B-scan USG untuk mencari T-sign, terutama kalau tidak ada tanda inflamasi sklera anterior yang terlihat.",
  },
  {
    requiredTags: ["scleritis_postsurgical_or_contaminated_wound"],
    differential: ["infectious_scleritis"],
    action: "Ambil scleral scraping/biopsi untuk mikrobiologi SEBELUM memulai imunosupresi agresif.",
    mustExclude: "necrotizing_scleritis",
  },
  {
    requiredTags: ["postop_recurrent_indolent_with_plaques"],
    differential: ["chronic_postop_endophthalmitis_cutibacterium"],
    action: "Kalau inflamasi memburuk setelah terapi steroid, pertimbangkan pewarnaan/kultur/PCR jamur sebelum eskalasi steroid lebih lanjut.",
  },
  {
    requiredTags: ["postop_sterile_acute_reaction"],
    differential: ["toxic_anterior_segment_syndrome"],
    action: "Selalu singkirkan infeksi (B-scan/kultur) dulu sebelum menetapkan sebagai TASS steril, walau waktu onsetnya sangat khas.",
  },
  { requiredTags: ["ent_bloody_nasal_discharge", "mononeuritis_multiplex"], differential: ["granulomatosis_with_polyangiitis"] },
  { requiredTags: ["hearing_loss_encephalopathy_brao_triad"], differential: ["susac_syndrome"] },
  { requiredTags: ["mosquito_borne_febrile_illness", "tropical_endemic_exposure"], differential: ["dengue_uveitis", "chikungunya_uveitis", "zika_virus_uveitis"] },
  { requiredTags: ["worm_visualized_subretinal"], differential: ["dusn", "cysticercosis_ocular"] },
  {
    requiredTags: ["normal_fundus_severe_field_loss"],
    differential: ["azoor"],
    mustExclude: "autoimmune_retinopathy",
  },
];

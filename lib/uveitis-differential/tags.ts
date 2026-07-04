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
};

export interface PatternMatcher {
  requiredTags: string[];
  differential: string[];
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
  { requiredTags: ["leukocoria_or_strabismus_child", "chorioretinal_granuloma"], differential: ["toxocariasis_ocular"] },
  { requiredTags: ["tinnitus_vertigo_hearing_loss", "exudative_rd"], differential: ["vkh_syndrome"] },
  { requiredTags: ["prior_penetrating_trauma_or_vr_surgery"], differential: ["sympathetic_ophthalmia"] },
  { requiredTags: ["serpiginous_pattern"], differential: ["serpiginous_choroidopathy", "tb_uveitis", "syphilitic_uveitis"] },
  { requiredTags: ["young_myopic_female"], differential: ["mewds", "punctate_inner_choroidopathy"] },
  { requiredTags: ["placoid_lesion_posterior"], differential: ["apmppe"] },
];

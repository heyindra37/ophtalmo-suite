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
      { id: "dendritiform_corneal_lesion", label: "Lesi kornea dendritiform" },
      { id: "reduced_corneal_sensation", label: "Sensasi kornea menurun" },
      { id: "kp_ring_shaped_or_scant_white_domed", label: "KP ring-shaped / scant white-domed (khas CMV)" },
      { id: "recurrent_same_eye_episode", label: "Rekuren, selalu di mata yang sama" },
      { id: "treatment_resistant_antiviral_steroid", label: "Tidak respon terhadap antivirus/steroid" },
      { id: "very_high_iop_trabeculitis", label: "IOP sangat tinggi (50-60 mmHg), trabekulitis" },
      { id: "recurrent_microhyphema", label: "Mikrohifema rekuren" },
      { id: "koeppe_busacca_iris_nodules", label: "Nodul Koeppe/Busacca di iris" },
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
      { id: "candlewax_drippings_periphlebitis", label: "Candlewax drippings (taches de bougie)" },
      { id: "sunset_glow_fundus", label: "Fundus 'sunset glow'" },
      { id: "gass_plaques_arteriolar_deposits", label: "Gass plaques (deposit dinding arteriol)" },
      { id: "boxcar_segmentation_retinal_vessels", label: "Segmentasi 'boxcar' pembuluh retina" },
      { id: "lupus_choroidopathy_rpe_detachments", label: "Koroidopati lupus, detasemen RPE multifokal" },
      { id: "rd_combined_tractional_rhegmatogenous", label: "Ablasio retina kombinasi traksi-regmatogen" },
      { id: "posterior_pole_early_involvement", label: "Polus posterior terlibat sejak awal (bukan perifer dulu)" },
      { id: "birdshot_like_chorioretinopathy_mimic", label: "Korioretinopati mirip birdshot" },
      { id: "bilateral_occlusive_retinitis", label: "Retinitis oklusif bilateral" },
      { id: "iris_roseola_papulosa_nodosa", label: "Iris roseola/papulosa/nodosa (khas sifilis)" },
      { id: "punched_out_choroiditis_lesions", label: "Lesi koroiditis 'punched-out' multipel" },
      { id: "isolated_choroidal_subretinal_abscess_minimal_vitritis", label: "Abses koroid/subretina terisolasi, vitritis minimal" },
      { id: "macular_star_neuroretinitis", label: "Macular star + neuroretinitis" },
      { id: "parinaud_oculoglandular_syndrome", label: "Sindrom okuloglandular Parinaud" },
      { id: "undulating_scolex_cyst", label: "Kista dengan skoleks yang berundulasi" },
      { id: "transient_focal_graywhite_lesions_postequatorial", label: "Lesi fokal abu-putih transien, postequatorial" },
      { id: "microfilariae_swimming_ac_or_cornea", label: "Mikrofilaria terlihat berenang di BMD/kornea" },
      { id: "cotton_wool_spots_microaneurysms_hiv", label: "Cotton-wool spots + mikroaneurisma (konteks HIV)" },
      { id: "plaque_like_choroidal_lesion_minimal_vitritis", label: "Lesi koroid plak, vitritis minimal" },
      { id: "string_of_pearls_vitreous_opacities", label: "Opasitas vitreous 'string of pearls'" },
      { id: "multiple_bilateral_small_white_lesions", label: "Lesi putih kecil multipel bilateral, postequatorial" },
      { id: "rapid_onset_severe_pain_vision_loss", label: "Onset cepat, nyeri dan penurunan visus berat" },
      { id: "roth_spots_white_centered_hemorrhage", label: "Roth spot (perdarahan white-centered)" },
      { id: "bilateral_simultaneous_severe_ac_inflammation", label: "Inflamasi BMD berat bilateral simultan" },
      { id: "active_systemic_infection_signs", label: "Tanda infeksi sistemik aktif (demam, leukositosis)" },
      { id: "recurrent_unilateral_vitreous_hemorrhage_young_male", label: "Perdarahan vitreous unilateral rekuren, pria muda" },
      { id: "choroidal_tuberculoma_mass", label: "Massa tuberkuloma koroid" },
      { id: "orange_granular_fovea_peau_dorange", label: "Fovea granular oranye 'peau d'orange'" },
      { id: "large_placoid_lesions_multifocal_bilateral_acute", label: "Lesi placoid besar, multifokal, bilateral, akut" },
      { id: "cerebral_vasculitis_stroke_risk", label: "Risiko vaskulitis serebral/stroke terkait" },
      { id: "starts_peripapillary_contiguous_single_origin", label: "Mulai peripapiler, menjalar kontinu dari 1 titik" },
      { id: "recurrent_over_years_severe_va_loss", label: "Rekuren bertahun-tahun, risiko VA <6/60" },
      { id: "multifocal_distinctly_separate_peripheral_predates_posterior", label: "Lesi multifokal terpisah jelas, perifer, mendahului lesi posterior" },
      { id: "punched_out_atrophic_scars_pigmented_border", label: "Skar atrofi 'punched-out' bertepi pigmen" },
      { id: "peripapillary_predominant_lesions", label: "Lesi predominan peripapiler" },
      { id: "high_grade_ac_inflammation_anterior_prominent", label: "Inflamasi BMD derajat tinggi, lebih menonjol dari segmen posterior" },
      { id: "coalescing_subretinal_fibrosis", label: "Fibrosis subretina yang berkoalesensi" },
      { id: "honeycomb_fa_pattern_yellow_halo_spots", label: "Pola FA 'honeycomb', bercak dengan halo kuning" },
      { id: "abnormal_eog_normal_erg", label: "EOG abnormal, ERG normal" },
      { id: "photopsia_windmills_bubbles_sparkles", label: "Fotopsia khas: kincir angin/gelembung/kilatan" },
      { id: "white_annular_ring_disc", label: "Cincin putih anular sekitar diskus optik" },
      { id: "hfmd_coxsackievirus_exposure", label: "Riwayat/paparan HFMD atau coxsackievirus" },
      { id: "turbid_yellow_subretinal_fluid_macula", label: "Cairan subretina kuning keruh di makula" },
      { id: "photoaversion_dyschromatopsia_nyctalopia", label: "Fotoaversi, diskromatopsia, nyctalopia" },
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
      { id: "hzo_rash_1to3wk_before_uveitis", label: "Riwayat ruam zoster oftalmikus 1-3 minggu sebelumnya" },
      { id: "hutchinson_sign", label: "Hutchinson sign (vesikel ujung hidung)" },
      { id: "psoriasis_history", label: "Riwayat psoriasis" },
      { id: "meningismus_prodrome", label: "Prodromal meningismus (nyeri kepala, kaku leher)" },
      { id: "bilateral_after_unilateral_eye_injury", label: "Mata sebelahnya ikut meradang setelah cedera/operasi mata satunya" },
      { id: "familial_autosomal_dominant_granulomatosis", label: "Riwayat keluarga granulomatosis autosomal dominan (anak)" },
      { id: "cns_demyelinating_disease_history", label: "Riwayat/gejala penyakit demielinasi SSP" },
      { id: "htlv1_associated_myelopathy_ham_tsp", label: "Riwayat HAM/TSP (mielopati terkait HTLV-1)" },
      { id: "delayed_uveitis_weeks_after_viremia_resolution", label: "Uveitis muncul berminggu-minggu setelah viremia sistemik sembuh" },
      { id: "ebola_survivor_history", label: "Riwayat penyintas infeksi Ebola" },
      { id: "recent_covid19_infection_or_vaccination", label: "Riwayat infeksi/vaksinasi COVID-19 baru-baru ini" },
      { id: "infectious_mononucleosis_history", label: "Riwayat mononukleosis infeksiosa (EBV)" },
      { id: "low_cd4_count", label: "CD4+ rendah" },
      { id: "immune_recovery_uveitis_post_art", label: "Uveitis pasca-mulai ART (immune recovery uveitis)" },
      { id: "retinal_vascular_occlusion_covid_context", label: "Oklusi vaskular retina pada konteks COVID-19" },
      { id: "fungal_meningitis_history", label: "Riwayat meningitis jamur" },
      { id: "disseminated_fungal_infection_risk_factors", label: "Faktor risiko infeksi jamur diseminata (transplan, kanker, IV drug use)" },
      { id: "migratory_arthritis_gi_malabsorption", label: "Artritis migratori + malabsorpsi GI" },
      { id: "black_fly_river_exposure_africa", label: "Riwayat gigitan black fly / paparan sungai (Afrika)" },
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
      { id: "c_anca_pr3_positive", label: "c-ANCA/PR3 positif" },
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
      { id: "subretinal_sub_rpe_infiltrates_rpe_detachment", label: "Infiltrat subretina/sub-RPE krem-kuning + detasemen RPE" },
      { id: "multifocal_creamy_choroidal_lesions_mimicking_sarcoid_birdshot", label: "Lesi koroid krem multifokal, mirip sarkoid/birdshot" },
      { id: "salmon_pink_firmly_attached_episcleral_mass", label: "Massa episklera salmon-pink, melekat erat" },
      { id: "known_systemic_lymphoma_diagnosis", label: "Diagnosis limfoma sistemik yang sudah diketahui" },
      { id: "known_leukemia_diagnosis", label: "Diagnosis leukemia yang sudah diketahui" },
      { id: "choroidal_mass_lesion_suspected", label: "Kecurigaan massa koroid" },
      { id: "pseudohypopyon_shifts_with_head_position_white", label: "Pseudohipopion putih, bergeser sesuai posisi kepala" },
      { id: "no_calcification_on_imaging", label: "Tidak ada kalsifikasi pada pencitraan (anak)" },
      { id: "reddish_yellow_skin_lesions_infant", label: "Lesi kulit kemerahan-kuning pada bayi" },
      { id: "known_primary_cancer_lung_breast", label: "Riwayat kanker primer (paru/payudara/kulit)" },
      { id: "paraneoplastic_occult_malignancy", label: "Kecurigaan keganasan sistemik tersembunyi (paraneoplastik)" },
      { id: "pigmented_and_nonpigmented_placoid_nodules", label: "Nodul placoid iris/koroid berpigmen dan tidak berpigmen" },
      { id: "bone_spicule_pigmentary_pattern_erg_extinguished", label: "Pola pigmen bone-spicule + ERG padam" },
      { id: "flare_out_of_proportion_to_cells", label: "Flare BMD tidak sebanding dengan jumlah sel (lebih berat)" },
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
  vkh_syndrome: ["tinnitus_vertigo_hearing_loss", "alopecia_vitiligo_poliosis", "exudative_rd", "chorioretinal_granuloma", "vitritis_present", "sunset_glow_fundus", "meningismus_prodrome"],
  sympathetic_ophthalmia: ["prior_penetrating_trauma_or_vr_surgery", "chorioretinal_granuloma", "bilateral_after_unilateral_eye_injury"],
  sarcoidosis_uveitis: ["kp_mutton_fat", "snowballs", "chorioretinal_granuloma", "retinal_vasculitis_phlebitis", "ace_elevated_or_cxr_bhl", "koeppe_busacca_iris_nodules", "candlewax_drippings_periphlebitis"],
  toxoplasmosis_retinitis: ["retinitis_satellite_to_old_scar", "disc_edema", "vitritis_present", "toxoplasma_serology_positive"],
  toxocariasis_ocular: ["chorioretinal_granuloma", "leukocoria_or_strabismus_child"],
  cmv_retinitis: ["retinitis_pizza_pie", "immunocompromised_hiv", "low_cd4_count", "immune_recovery_uveitis_post_art"],
  progressive_retinal_necrosis: ["retinitis_necrosis_minimal_inflammation", "vitritis_minimal", "immunocompromised_hiv", "posterior_pole_early_involvement"],
  acute_retinal_necrosis: ["retinitis_necrosis_prominent_inflammation", "vitritis_present", "retinal_vasculitis_arteritis", "rd_combined_tractional_rhegmatogenous"],
  poh_syndrome: ["histo_spots_no_vitritis"],
  tb_uveitis: ["chorioretinal_granuloma", "serpiginous_pattern", "retinal_vasculitis_phlebitis", "choroidal_tuberculoma_mass"],
  syphilitic_uveitis: ["placoid_lesion_posterior", "retinal_vasculitis_phlebitis", "syphilis_serology_positive", "iris_roseola_papulosa_nodosa"],
  lyme_uveitis: ["tick_bite_history", "punched_out_choroiditis_lesions"],
  endogenous_endophthalmitis: ["vitritis_present", "roth_spots_white_centered_hemorrhage", "bilateral_simultaneous_severe_ac_inflammation", "active_systemic_infection_signs"],
  mewds: ["white_dots_evanescent", "young_myopic_female", "orange_granular_fovea_peau_dorange"],
  apmppe: ["placoid_lesion_posterior", "large_placoid_lesions_multifocal_bilateral_acute", "cerebral_vasculitis_stroke_risk"],
  serpiginous_choroidopathy: ["serpiginous_pattern", "starts_peripapillary_contiguous_single_origin", "recurrent_over_years_severe_va_loss"],
  birdshot_retinochoroidopathy: ["choroidal_patches_radiating_disc", "middle_aged_female", "vitritis_present"],
  punctate_inner_choroidopathy: ["macular_yellow_spots_atrophic", "vitritis_minimal", "young_myopic_female"],
  acute_macular_neuroretinopathy: ["wedge_parafoveal_lesion", "flu_like_prodrome"],
  herpes_simplex_anterior_uveitis: ["iris_atrophy_sectoral", "dendritiform_corneal_lesion", "reduced_corneal_sensation", "recurrent_same_eye_episode", "very_high_iop_trabeculitis"],
  vzv_anterior_uveitis: ["iris_atrophy_sectoral", "hzo_rash_1to3wk_before_uveitis", "hutchinson_sign", "very_high_iop_trabeculitis"],
  cmv_anterior_uveitis: ["posterior_synechiae_absent", "injection_absent_despite_severity", "kp_ring_shaped_or_scant_white_domed", "treatment_resistant_antiviral_steroid"],
  lens_induced_uveitis: ["recent_cataract_surgery_or_lens_trauma"],

  // ── 64 disease baru di knowledge base v2 (AAO BCSC) ──────────────────────────
  tinu_syndrome: ["renal_disease_with_uveitis_async", "posterior_synechiae_present"],
  posner_schlossman_syndrome: ["recurrent_unilateral_iop_spike_mild_inflammation", "kp_fine", "recurrent_same_eye_episode"],
  uveitis_glaucoma_hyphema_syndrome: ["pseudophakic_iol_chafing", "recurrent_microhyphema"],
  toxic_anterior_segment_syndrome: ["postop_sterile_acute_reaction"],
  chronic_postop_endophthalmitis_cutibacterium: ["postop_recurrent_indolent_with_plaques", "recent_cataract_surgery_or_lens_trauma"],
  granulomatosis_with_polyangiitis: ["ent_bloody_nasal_discharge", "mononeuritis_multiplex", "retinal_vasculitis_arteritis", "c_anca_pr3_positive"],
  systemic_lupus_erythematosus_uveitis: ["retinal_vasoocclusive_no_inflammation", "lupus_choroidopathy_rpe_detachments"],
  multiple_sclerosis_uveitis: ["retinal_vasculitis_phlebitis", "vitritis_minimal", "cns_demyelinating_disease_history"],
  vitreoretinal_lymphoma: ["masquerade_older_patient_poor_steroid_response", "vitritis_present", "subretinal_sub_rpe_infiltrates_rpe_detachment"],
  uveal_lymphoma: ["masquerade_older_patient_poor_steroid_response", "multifocal_creamy_choroidal_lesions_mimicking_sarcoid_birdshot", "salmon_pink_firmly_attached_episcleral_mass"],
  ocular_manifestations_systemic_lymphoma: ["pseudohypopyon", "vitritis_present", "retinal_vasculitis_phlebitis", "known_systemic_lymphoma_diagnosis"],
  ocular_manifestations_leukemia: ["pseudohypopyon", "heterochromia", "known_leukemia_diagnosis", "roth_spots_white_centered_hemorrhage"],
  uveal_melanoma_masquerade: ["masquerade_older_patient_poor_steroid_response", "choroidal_mass_lesion_suspected"],
  retinoblastoma_masquerade: ["pseudohypopyon", "leukocoria_or_strabismus_child", "pseudohypopyon_shifts_with_head_position_white", "no_calcification_on_imaging"],
  juvenile_xanthogranuloma: ["child_spontaneous_hyphema", "reddish_yellow_skin_lesions_infant"],
  metastatic_tumors_masquerade: ["masquerade_older_patient_poor_steroid_response", "known_primary_cancer_lung_breast"],
  bilateral_diffuse_uveal_melanocytic_proliferation: ["exudative_rd", "paraneoplastic_occult_malignancy", "pigmented_and_nonpigmented_placoid_nodules"],
  retinitis_pigmentosa_masquerade: ["family_history_night_blindness", "vitritis_minimal", "bone_spicule_pigmentary_pattern_erg_extinguished"],
  ocular_ischemic_syndrome_masquerade: ["carotid_hypoperfusion_signs", "flare_out_of_proportion_to_cells"],
  chronic_rrd_schwartz_matsuo: ["scleral_depression_reveals_detachment", "chronic_indolent_unilateral_uveitis_unexplained"],
  intraocular_foreign_body_masquerade: ["unrecognized_trauma_history", "chronic_indolent_unilateral_uveitis_unexplained"],
  pigment_dispersion_syndrome_masquerade: ["pigment_cells_mimicking_inflammation"],
  phacolytic_uveitis: ["recent_cataract_surgery_or_lens_trauma", "posterior_synechiae_absent"],
  pars_planitis: ["snowballs", "snowbanking", "retinal_vasculitis_phlebitis"],
  drug_induced_uveitis: [],
  blau_syndrome: ["chorioretinal_granuloma", "child_asymptomatic_with_arthritis", "familial_autosomal_dominant_granulomatosis"],
  multifocal_choroiditis_panuveitis: ["vitritis_present", "punched_out_atrophic_scars_pigmented_border", "peripapillary_predominant_lesions"],
  subretinal_fibrosis_uveitis_syndrome: ["vitritis_present", "high_grade_ac_inflammation_anterior_prominent", "coalescing_subretinal_fibrosis"],
  relentless_placoid_chorioretinitis: ["placoid_lesion_posterior", "multifocal_distinctly_separate_peripheral_predates_posterior"],
  acute_retinal_pigment_epitheliitis: ["honeycomb_fa_pattern_yellow_halo_spots", "abnormal_eog_normal_erg"],
  azoor: ["normal_fundus_severe_field_loss", "photopsia_windmills_bubbles_sparkles", "white_annular_ring_disc"],
  acute_idiopathic_maculopathy: ["flu_like_prodrome", "hfmd_coxsackievirus_exposure", "turbid_yellow_subretinal_fluid_macula"],
  autoimmune_retinopathy: ["minimal_inflammation_severe_vision_loss", "photoaversion_dyschromatopsia_nyctalopia", "paraneoplastic_occult_malignancy"],
  polyarteritis_nodosa: ["mononeuritis_multiplex", "lung_sparing_vasculitis_skin_nodules", "retinal_vasculitis_arteritis"],
  susac_syndrome: ["hearing_loss_encephalopathy_brao_triad", "vitritis_minimal", "gass_plaques_arteriolar_deposits", "boxcar_segmentation_retinal_vessels"],
  leptospirosis_uveitis: ["animal_contact_exposure", "tropical_endemic_exposure", "retinal_vasculitis_phlebitis"],
  nocardiosis_uveitis: ["immunocompromised_hiv", "chorioretinal_granuloma", "isolated_choroidal_subretinal_abscess_minimal_vitritis"],
  cat_scratch_bartonellosis: ["animal_contact_exposure", "disc_edema", "macular_star_neuroretinitis", "parinaud_oculoglandular_syndrome"],
  whipple_disease_uveitis: ["chronic_diarrhea", "vitritis_present", "migratory_arthritis_gi_malabsorption"],
  eales_disease: ["retinal_vasculitis_phlebitis", "recurrent_unilateral_vitreous_hemorrhage_young_male"],
  dengue_uveitis: ["mosquito_borne_febrile_illness", "tropical_endemic_exposure", "subconjunctival_petechial_hemorrhage", "delayed_foveolitis_1month_post_fever"],
  chikungunya_uveitis: ["mosquito_borne_febrile_illness", "tropical_endemic_exposure", "prominent_arthralgia_polyarthropathy", "posterior_pole_retinitis_minimal_vitritis"],
  zika_virus_uveitis: ["mosquito_borne_febrile_illness", "tropical_endemic_exposure", "mild_self_limited_febrile_illness"],
  west_nile_virus_uveitis: ["mosquito_borne_febrile_illness", "retinal_vasculitis_arteritis", "linear_chorioretinal_lesions_nerve_fiber_pattern"],
  rift_valley_fever_uveitis: ["mosquito_borne_febrile_illness", "animal_contact_exposure", "macular_retinitis_sparing_fovea"],
  htlv1_uveitis: ["retinal_vasculitis_phlebitis", "htlv1_associated_myelopathy_ham_tsp"],
  ebola_virus_uveitis: ["chronic_indolent_unilateral_uveitis_unexplained", "delayed_uveitis_weeks_after_viremia_resolution", "ebola_survivor_history"],
  covid19_uveitis: ["recent_covid19_infection_or_vaccination", "retinal_vascular_occlusion_covid_context"],
  epstein_barr_virus_uveitis: ["kp_mutton_fat", "flu_like_prodrome", "infectious_mononucleosis_history"],
  nonnecrotizing_herpetic_retinopathy: ["retinal_vasculitis_arteritis", "birdshot_like_chorioretinopathy_mimic", "treatment_resistant_antiviral_steroid", "bilateral_occlusive_retinitis"],
  cysticercosis_ocular: ["worm_visualized_subretinal", "tropical_endemic_exposure", "undulating_scolex_cyst"],
  dusn: ["worm_visualized_subretinal", "transient_focal_graywhite_lesions_postequatorial", "chronic_indolent_unilateral_uveitis_unexplained"],
  onchocerciasis_ocular: ["tropical_endemic_exposure", "microfilariae_swimming_ac_or_cornea", "black_fly_river_exposure_africa"],
  hiv_retinopathy: ["immunocompromised_hiv", "cotton_wool_spots_microaneurysms_hiv"],
  pneumocystis_jirovecii_choroiditis: ["hiv_aids_opportunistic_ocular", "vitritis_minimal", "plaque_like_choroidal_lesion_minimal_vitritis"],
  cryptococcal_choroiditis: ["hiv_aids_opportunistic_ocular", "chorioretinal_granuloma", "fungal_meningitis_history"],
  endogenous_candida_endophthalmitis: ["immunocompromised_hiv", "vitritis_present", "string_of_pearls_vitreous_opacities", "multiple_bilateral_small_white_lesions"],
  endogenous_aspergillus_endophthalmitis: ["immunocompromised_hiv", "hypopyon_immobile", "rapid_onset_severe_pain_vision_loss", "disseminated_fungal_infection_risk_factors"],
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

  // ── Batch 1: Anterior klasik & HLA-B27/spondyloarthropathy ──────────────────
  {
    requiredTags: ["dendritiform_corneal_lesion", "reduced_corneal_sensation"],
    differential: ["herpes_simplex_anterior_uveitis", "vzv_anterior_uveitis"],
  },
  {
    requiredTags: ["kp_ring_shaped_or_scant_white_domed"],
    differential: ["cmv_anterior_uveitis"],
  },
  {
    requiredTags: ["psoriasis_history"],
    differential: ["aau_idiopathic_hlab27"],
  },
  {
    requiredTags: ["recurrent_unilateral_iop_spike_mild_inflammation", "kp_fine"],
    differential: ["posner_schlossman_syndrome"],
  },
  {
    requiredTags: ["pseudophakic_iol_chafing", "recurrent_microhyphema"],
    differential: ["uveitis_glaucoma_hyphema_syndrome"],
  },
  {
    requiredTags: ["hzo_rash_1to3wk_before_uveitis"],
    differential: ["vzv_anterior_uveitis"],
    action: "Pertimbangkan tes HIV kalau pasien usia <50 tahun dengan lesi zoster wajah/kelopak mata — zoster di usia muda bisa jadi sentinel sign imunosupresi.",
  },
  {
    requiredTags: ["reduced_corneal_sensation", "recurrent_same_eye_episode"],
    differential: ["herpes_simplex_anterior_uveitis"],
  },

  // ── Batch 2: Granulomatous & inflamasi sistemik ─────────────────────────────
  {
    requiredTags: ["prior_penetrating_trauma_or_vr_surgery", "bilateral_after_unilateral_eye_injury", "chorioretinal_granuloma"],
    differential: ["sympathetic_ophthalmia", "vkh_syndrome"],
  },
  {
    requiredTags: ["tinnitus_vertigo_hearing_loss", "meningismus_prodrome", "exudative_rd"],
    differential: ["vkh_syndrome"],
  },
  {
    requiredTags: ["sunset_glow_fundus", "alopecia_vitiligo_poliosis"],
    differential: ["vkh_syndrome"],
  },
  {
    requiredTags: ["familial_autosomal_dominant_granulomatosis", "child_asymptomatic_with_arthritis", "chorioretinal_granuloma"],
    differential: ["blau_syndrome"],
  },
  {
    requiredTags: ["koeppe_busacca_iris_nodules", "kp_mutton_fat"],
    differential: ["sarcoidosis_uveitis"],
  },
  {
    requiredTags: ["cns_demyelinating_disease_history"],
    differential: ["multiple_sclerosis_uveitis"],
    action: "Kalau uveitis intermediate 'idiopatik' akan diterapi TNF inhibitor, lakukan MRI otak dulu utk skrining demielinasi — TNF inhibitor kontraindikasi/bisa memperburuk MS walau tanpa gejala neurologis.",
  },
  {
    requiredTags: ["retinal_vasculitis_phlebitis", "vitritis_minimal"],
    differential: ["multiple_sclerosis_uveitis"],
  },
  {
    requiredTags: ["ent_bloody_nasal_discharge", "c_anca_pr3_positive"],
    differential: ["granulomatosis_with_polyangiitis"],
  },
  {
    requiredTags: ["mononeuritis_multiplex", "lung_sparing_vasculitis_skin_nodules"],
    differential: ["polyarteritis_nodosa"],
  },
  {
    requiredTags: ["retinal_vasoocclusive_no_inflammation", "lupus_choroidopathy_rpe_detachments"],
    differential: ["systemic_lupus_erythematosus_uveitis"],
  },
  {
    requiredTags: ["gass_plaques_arteriolar_deposits", "boxcar_segmentation_retinal_vessels", "hearing_loss_encephalopathy_brao_triad"],
    differential: ["susac_syndrome"],
  },
  {
    requiredTags: ["renal_disease_with_uveitis_async"],
    differential: ["tinu_syndrome"],
  },

  // ── Batch 3: Infeksi viral ───────────────────────────────────────────────────
  {
    requiredTags: ["low_cd4_count", "retinitis_pizza_pie"],
    differential: ["cmv_retinitis"],
  },
  {
    requiredTags: ["mosquito_borne_febrile_illness", "delayed_foveolitis_1month_post_fever"],
    differential: ["dengue_uveitis"],
  },
  {
    requiredTags: ["prominent_arthralgia_polyarthropathy", "posterior_pole_retinitis_minimal_vitritis"],
    differential: ["chikungunya_uveitis"],
  },
  {
    requiredTags: ["mosquito_borne_febrile_illness", "mild_self_limited_febrile_illness"],
    differential: ["zika_virus_uveitis", "dengue_uveitis", "chikungunya_uveitis"],
  },
  {
    requiredTags: ["linear_chorioretinal_lesions_nerve_fiber_pattern"],
    differential: ["west_nile_virus_uveitis"],
  },
  {
    requiredTags: ["macular_retinitis_sparing_fovea", "animal_contact_exposure"],
    differential: ["rift_valley_fever_uveitis"],
  },
  {
    requiredTags: ["htlv1_associated_myelopathy_ham_tsp", "retinal_vasculitis_phlebitis"],
    differential: ["htlv1_uveitis"],
  },
  {
    requiredTags: ["ebola_survivor_history", "delayed_uveitis_weeks_after_viremia_resolution"],
    differential: ["ebola_virus_uveitis"],
  },
  {
    requiredTags: ["birdshot_like_chorioretinopathy_mimic", "treatment_resistant_antiviral_steroid"],
    differential: ["nonnecrotizing_herpetic_retinopathy"],
    action: "Coba antivirus sistemik kalau workup viral positif atau kecurigaan klinis tetap tinggi meski workup negatif.",
  },
  {
    requiredTags: ["immunocompromised_hiv", "retinitis_necrosis_minimal_inflammation", "posterior_pole_early_involvement"],
    differential: ["progressive_retinal_necrosis"],
  },
  {
    requiredTags: ["retinitis_necrosis_prominent_inflammation", "vitritis_present"],
    differential: ["acute_retinal_necrosis"],
  },

  // ── Batch 4: Infeksi bakteri/parasit/jamur ───────────────────────────────────
  {
    requiredTags: ["disseminated_fungal_infection_risk_factors", "active_systemic_infection_signs"],
    differential: ["endogenous_candida_endophthalmitis", "endogenous_aspergillus_endophthalmitis", "endogenous_endophthalmitis"],
  },
  {
    requiredTags: ["string_of_pearls_vitreous_opacities", "multiple_bilateral_small_white_lesions"],
    differential: ["endogenous_candida_endophthalmitis"],
  },
  {
    requiredTags: ["rapid_onset_severe_pain_vision_loss", "disseminated_fungal_infection_risk_factors"],
    differential: ["endogenous_aspergillus_endophthalmitis"],
  },
  {
    requiredTags: ["cotton_wool_spots_microaneurysms_hiv"],
    differential: ["hiv_retinopathy"],
  },
  {
    requiredTags: ["hiv_aids_opportunistic_ocular", "plaque_like_choroidal_lesion_minimal_vitritis"],
    differential: ["pneumocystis_jirovecii_choroiditis"],
  },
  {
    requiredTags: ["hiv_aids_opportunistic_ocular", "fungal_meningitis_history"],
    differential: ["cryptococcal_choroiditis"],
  },
  {
    requiredTags: ["undulating_scolex_cyst", "tropical_endemic_exposure"],
    differential: ["cysticercosis_ocular"],
  },
  {
    requiredTags: ["worm_visualized_subretinal", "transient_focal_graywhite_lesions_postequatorial"],
    differential: ["dusn"],
  },
  {
    requiredTags: ["microfilariae_swimming_ac_or_cornea", "black_fly_river_exposure_africa"],
    differential: ["onchocerciasis_ocular"],
  },
  {
    requiredTags: ["iris_roseola_papulosa_nodosa", "placoid_lesion_posterior"],
    differential: ["syphilitic_uveitis"],
  },
  {
    requiredTags: ["choroidal_tuberculoma_mass", "serpiginous_pattern"],
    differential: ["tb_uveitis"],
  },
  {
    requiredTags: ["recurrent_unilateral_vitreous_hemorrhage_young_male"],
    differential: ["eales_disease"],
  },
  {
    requiredTags: ["animal_contact_exposure", "tropical_endemic_exposure"],
    differential: ["leptospirosis_uveitis"],
  },
  {
    requiredTags: ["isolated_choroidal_subretinal_abscess_minimal_vitritis", "immunocompromised_hiv"],
    differential: ["nocardiosis_uveitis"],
  },
  {
    requiredTags: ["macular_star_neuroretinitis", "parinaud_oculoglandular_syndrome"],
    differential: ["cat_scratch_bartonellosis"],
  },
  {
    requiredTags: ["migratory_arthritis_gi_malabsorption"],
    differential: ["whipple_disease_uveitis"],
  },

  // ── Batch 5: Masquerade & mimik non-inflamasi ────────────────────────────────
  {
    requiredTags: ["recent_cataract_surgery_or_lens_trauma", "posterior_synechiae_absent"],
    differential: ["phacolytic_uveitis"],
  },
  {
    requiredTags: ["masquerade_older_patient_poor_steroid_response", "subretinal_sub_rpe_infiltrates_rpe_detachment"],
    differential: ["vitreoretinal_lymphoma"],
    action: "Jangan biarkan skor diagnosis lain menyingkirkan kecurigaan ini dari tampilan — skrining masquerade harus paralel, bukan bersaing peringkat.",
  },
  {
    requiredTags: ["multifocal_creamy_choroidal_lesions_mimicking_sarcoid_birdshot", "salmon_pink_firmly_attached_episcleral_mass"],
    differential: ["uveal_lymphoma"],
  },
  {
    requiredTags: ["exudative_rd", "known_leukemia_diagnosis"],
    differential: ["ocular_manifestations_leukemia"],
  },
  {
    requiredTags: ["paraneoplastic_occult_malignancy", "pigmented_and_nonpigmented_placoid_nodules"],
    differential: ["bilateral_diffuse_uveal_melanocytic_proliferation"],
  },
  {
    requiredTags: ["pseudohypopyon_shifts_with_head_position_white", "no_calcification_on_imaging"],
    differential: ["retinoblastoma_masquerade"],
    mustExclude: "toxocariasis_ocular",
  },
  {
    requiredTags: ["child_spontaneous_hyphema", "reddish_yellow_skin_lesions_infant"],
    differential: ["juvenile_xanthogranuloma"],
  },
  {
    requiredTags: ["scleral_depression_reveals_detachment", "chronic_indolent_unilateral_uveitis_unexplained"],
    differential: ["chronic_rrd_schwartz_matsuo"],
    action: "Selalu lakukan pemeriksaan fundus dilatasi DENGAN depresi sklera sebelum melabeli uveitis anterior kronis tak terjelaskan sebagai idiopatik.",
  },
  {
    requiredTags: ["flare_out_of_proportion_to_cells", "carotid_hypoperfusion_signs"],
    differential: ["ocular_ischemic_syndrome_masquerade"],
  },
  {
    requiredTags: ["unrecognized_trauma_history", "chronic_indolent_unilateral_uveitis_unexplained"],
    differential: ["intraocular_foreign_body_masquerade"],
  },

  // ── Batch 6: White dot syndrome & korioretinopati posterior ─────────────────
  {
    requiredTags: ["orange_granular_fovea_peau_dorange", "white_dots_evanescent"],
    differential: ["mewds"],
  },
  {
    requiredTags: ["large_placoid_lesions_multifocal_bilateral_acute", "cerebral_vasculitis_stroke_risk"],
    differential: ["apmppe"],
    action: "Kalau ada gejala CNS apa pun (termasuk sakit kepala saja) pada diferensial white dot syndrome, lakukan evaluasi neurologis urgent + pencitraan + LP — asosiasi vaskulitis serebral APMPPE jarang tapi mengancam jiwa.",
  },
  {
    requiredTags: ["starts_peripapillary_contiguous_single_origin", "recurrent_over_years_severe_va_loss"],
    differential: ["serpiginous_choroidopathy"],
  },
  {
    requiredTags: ["multifocal_distinctly_separate_peripheral_predates_posterior", "placoid_lesion_posterior"],
    differential: ["relentless_placoid_chorioretinitis"],
  },
  {
    requiredTags: ["young_myopic_female", "high_grade_ac_inflammation_anterior_prominent", "coalescing_subretinal_fibrosis"],
    differential: ["subretinal_fibrosis_uveitis_syndrome"],
  },
  {
    requiredTags: ["punched_out_atrophic_scars_pigmented_border", "peripapillary_predominant_lesions"],
    differential: ["multifocal_choroiditis_panuveitis"],
  },
  {
    requiredTags: ["honeycomb_fa_pattern_yellow_halo_spots", "abnormal_eog_normal_erg"],
    differential: ["acute_retinal_pigment_epitheliitis"],
  },
  {
    requiredTags: ["hfmd_coxsackievirus_exposure", "turbid_yellow_subretinal_fluid_macula"],
    differential: ["acute_idiopathic_maculopathy"],
  },
  {
    requiredTags: ["photoaversion_dyschromatopsia_nyctalopia", "minimal_inflammation_severe_vision_loss"],
    differential: ["autoimmune_retinopathy"],
    mustExclude: "retinitis_pigmentosa_masquerade",
  },
  {
    requiredTags: ["paraneoplastic_occult_malignancy", "minimal_inflammation_severe_vision_loss"],
    differential: ["autoimmune_retinopathy"],
    action: "Terapi keganasan primer adalah langkah pertama, bukan terapi mata lokal.",
  },
];

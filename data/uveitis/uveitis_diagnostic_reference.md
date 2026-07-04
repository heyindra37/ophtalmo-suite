# Uveitis Clinical Decision Reference
Sumber: Kanski's Clinical Ophthalmology, 10th Ed., Chapter 12 (Salmon, Elsevier)
Disusun untuk mendukung clinical decision tool (integrasi Claude Code) — bukan pengganti judgment klinis.

---

## 0. CARA PAKAI DOKUMEN INI

Alur bertingkat:
1. **STEP 1 — Klasifikasi anatomis (SUN)**: anterior / intermediate / posterior / panuveitis
2. **STEP 2 — Karakter klinis**: akut vs kronis, granulomatosa vs non-granulomatosa, unilateral vs bilateral
3. **STEP 3 — Red flags & pola khas** → menyempitkan ke kelompok etiologi (infeksi / non-infeksi / masquerade)
4. **STEP 4 — Diagnosis banding spesifik** dengan fitur pembeda kunci
5. **STEP 5 — Investigasi terarah** (bukan "shotgun panel")
6. **STEP 6 — Terapi berjenjang**

Definisi SUN penting untuk tool logic:
- **Anterior**: bilik mata depan sbg lokasi utama inflamasi
- **Intermediate**: vitreous (pars planitis, posterior cyclitis, hyalitis)
- **Posterior**: retina dan/atau koroid
- **Panuveitis**: seluruh struktur uvea
- **Onset**: sudden / insidious
- **Duration**: limited (≤3 bulan) / persistent
- **Course**: acute / recurrent (episode berulang dgn periode tenang tanpa terapi) / chronic (relaps <3 bulan setelah stop terapi)
- **Remission**: tidak ada sel selama ≥3 bulan

---

## STEP 1+2: KLASIFIKASI ANATOMIS × KARAKTER

### A. ANTERIOR UVEITIS

**Non-granulomatous, akut, unilateral (bergantian sisi):**
→ Idiopathic (~50%, tanpa asosiasi sistemik terdeteksi)
→ HLA-B27-associated (AAU khas: onset cepat, nyeri, fotofobia, hipopion, fibrin di AC)
→ Reactive arthritis, psoriatic arthritis, IBD-associated, ankylosing spondylitis (25% pasien AS punya AAU; 25% AAU pria → AS)
→ Behçet disease (hipopion mobile, mata relatif putih)
→ TINU (remaja perempuan, bilateral, riwayat nefritis)

**Granulomatous, kronis, sering bilateral:**
→ Sarkoidosis
→ VKH (fase uveitik akut)
→ Sympathetic ophthalmia (riwayat trauma tembus mata sebelahnya)
→ Sifilis
→ TB
→ Herpetic (HSV/VZV) — sering unilateral, sektoral iris atrophy, IOP naik
→ Lepra (KP "plasmoid", iris pearls patognomonik)

**Unilateral, KRONIS, hipokromik, TANPA sinekia posterior, mata PUTIH walau eksaserbasi:**
→ **Fuchs Uveitis Syndrome (FUS)** — sangat khas. KP stellate difus, iris atrophy difus, katarak subkapsular posterior, glaukoma (~60%). Investigasi minimal, TIDAK perlu topikal steroid jangka panjang.

**Anak, ASIMPTOMATIK, ditemukan skrining:**
→ **JIA-associated CAU** — TANPA injeksi walau parah, PS sering pada kasus lama, band keratopathy + katarak. WAJIB skrining slit lamp rutin (bukan menunggu gejala).

---

### B. INTERMEDIATE UVEITIS (IU)

Trias klinis: floaters + blurred vision insidious, TANPA nyeri/kemerahan, bilateral asimetris.

- **Pars planitis (PP)**: subset IU idiopatik dengan snowbanking/snowball — hanya dipakai jika TIDAK ada penyakit sistemik/infeksi yang teridentifikasi
- **Multiple sclerosis**: usia 20–50, wanita, periphlebitis perifer prominent → curiga bila ada gejala neurologis, cek MRI
- **Sarkoidosis**: cek ACE + CXR pada semua dewasa
- **Lyme disease**: dari area endemik, uveitis biasanya berat
- Diagnosis banding vitritis TANPA IU sejati: FUS, limfoma intraokular (usia tua), Toxocara granuloma, Whipple disease, endogenous Candida (riwayat IV drug use), toksoplasmosis

---

### C. POSTERIOR UVEITIS

Presentasi tergantung lokasi lesi: floaters (perifer) vs penurunan visus sentral (macula).

**Tiga entitas dasar**: retinitis (fokal/multifokal/geografik/difus, whitish, tepi indistinct saat aktif), choroiditis (round yellow nodule, jarang vitritis bila tanpa keterlibatan retina), vasculitis (arteritis/phlebitis, perivascular cuffing).

---

### D. PANUVEITIS

VKH, sympathetic ophthalmia, Behçet, sarkoidosis berat, TB, sifilis, endophthalmitis (infeksi/lens-induced/masquerade).

---

## STEP 3: RED FLAGS → BAGI KE KELOMPOK ETIOLOGI

| Red flag / fitur | Curigai |
|---|---|
| Riwayat trauma tembus / operasi vitreoretinal sebelumnya, mata sebelah kini ikut meradang | Sympathetic ophthalmia |
| Riwayat operasi katarak baru, fragmen lensa terlihat | Lens-induced (phacogenic) uveitis / endoftalmitis bakteri (DD penting) |
| Hipopion mobile pada mata RELATIF PUTIH | Behçet disease, JIA-associated uveitis |
| Hipopion IMMOBILE pada mata MERAH + nyeri | HLA-B27 AAU |
| Nyeri sendi + kaku punggung bawah pagi hari | Spondyloarthropathy (AS, ReA, psoriatic, IBD-associated) |
| Ulkus oral + genital + pathergy + | Behçet disease |
| Tinnitus/vertigo/kaku kuduk + rambut rontok/vitiligo kemudian | VKH |
| Heterochromia + KP stellate difus + TANPA PS | Fuchs uveitis syndrome |
| Anak dgn artritis, uveitis ASIMTOMATIK | JIA |
| Diare berdarah / nyeri perut kronis | IBD (UC/Crohn) |
| Riwayat gigitan kucing, papul di lokasi | Cat-scratch disease (neuroretinitis, macular star) |
| Riwayat gigitan kutu (tick), area endemik | Lyme disease |
| HIV+/imunosupresi + floaters + lesi retina "pizza pie" | CMV retinitis |
| Imunosupresi berat + nekrosis retina cepat TANPA vitritis/uveitis anterior signifikan | Progressive retinal necrosis (VZV) |
| Individu sehat + nyeri + nekrosis retina perifer + vitritis/uveitis anterior JELAS | Acute retinal necrosis (HSV/VZV) |
| Riwayat kontak kucing/tanah terkontaminasi + lesi retinitis fokal berdekatan skar lama ("satellite lesion") | Toxoplasmosis |
| Anak + leukokoria/strabismus + granuloma retina — DD retinoblastoma! | Toxocariasis |
| Area endemik Afrika + gatal kulit + nodul subkutan | Onchocerciasis |
| Nematoda subretinal motil tunggal, ERG subnormal | DUSN |
| Area endemik histoplasmosis, "histo spots" + peripapillary atrophy, TANPA vitritis | POHS |
| IV drug abuse / kateter menetap + creamy chorioretinitis | Endogenous Candida/bacterial endophthalmitis |
| Batuk kronis, BB turun, area endemik TB | TB-associated uveitis (granuloma koroid, periphlebitis oklusif, serpiginoid choroiditis) |
| Riwayat chancre/rash sekunder, roseolae iris | Sifilis (selalu cek meski gambaran mirip lain — "the great masquerader") |
| Wanita muda myopic, lesi kuning kecil macula, evolusi cepat MNV | PIC (Punctate inner choroidopathy) |
| Wanita muda, floaters/skotoma, lesi grey-white cepat menghilang | MEWDS (evanescent — imaging kunci, klinis sering sudah menghilang) |
| Bilateral, viral prodrome, lesi placoid besar posterior pole, ADA gejala neurologis (stroke risk) | APMPPE → cek pencitraan SSP jika ada gejala neuro |
| Progresif, mulai dari disc, menjalar serpiginosa, rekuren tahunan | Serpiginous choroidopathy (DD wajib: TB, sifilis — "serpiginoid") |
| Wanita paruh baya, HLA-A29(+) hampir selalu, floaters+nyctalopia+dyschromatopsia | Birdshot retinochoroidopathy — pantau dgn VISUAL FIELD bukan visus |
| Riwayat flu-like, wedge-shaped lesion parafoveal pada infrared, skotoma paracentral | Acute macular neuroretinopathy (AMN) |

---

## STEP 5: INVESTIGASI — KAPAN PERLU, KAPAN TIDAK

**TIDAK perlu investigasi jika:**
- Episode tunggal AAU unilateral ringan/sedang (tanpa hipopion), tanpa tanda sistemik/okular lain
- Diagnosis sistemik sudah confirmed (mis. sarkoidosis) dan gambaran cocok
- Gambaran klinis sangat khas untuk entitas yang memang tidak butuh investigasi (mis. Fuchs uveitis syndrome)

**Investigasi terarah DIPERLUKAN jika:**
- AAU rekuren / berat / bilateral / persisten-kronis-resisten
- Tanda granulomatosa
- Ada keterlibatan intermediate/posterior
- Ada tanda okular/sistemik lain yang mengarah ke penyakit sistemik

**Panel dasar (tailor sesuai temuan, BUKAN shotgun):**
- HLA-B27 (AAU rekuren/kronis non-granulomatosa)
- Serologi sifilis (treponemal ELISA + non-treponemal RPR/VDRL — WAJIB DUA-DUANYA)
- Serum ACE + lisozim + CXR/HRCT (sarkoidosis)
- Darah lengkap (leukositosis→infeksi; eosinofilia→parasit)
- IGRA/QuantiFERON-TB + CXR (TB) — sebelum mulai anti-TNF!
- ANA (anak — risiko CAU pada JIA), HLA-A29 (birdshot), HLA-B51 (Behçet)
- PCR aqueous/vitreous (viral: HSV/VZV/CMV/rubella; toxoplasma)
- OCT (makula, edema, integritas outer retina)
- FA / ICGA / FAF (posterior uveitis, koroiditis, evaluasi aktivitas)
- B-scan USG (jika media keruh)

---

## STEP 6: TERAPI BERJENJANG

### Anterior Uveitis (AAU)
1. **Steroid topikal** — prednisolone acetate 1% atau dexamethasone 0.1%, mulai tapering agresif:
   - 1 tetes/jam × 3 hari → q2h × 3 hari → 4×/hari × 1 minggu → 3×/hari × 1 minggu → 2×/hari × 1 minggu → 1×/hari × 1 minggu → stop (total ~5–6 minggu)
2. **Cycloplegic** (cyclopentolate/homatropine/atropine) — cegah & pecahkan sinekia posterior
3. Bila fibrin berat → pertimbangkan intracameral **tPA** (12.5–25 µg/0.1ml)
4. Bila resisten/non-compliant → **subconjunctival/regional steroid** (posterior sub-Tenon atau orbital floor)
5. **CAU**: target suppresi TOTAL (0 sel, 0 flare) — bukan sekadar "membaik", karena flare pun indikasi aktivitas & risiko komplikasi jangka panjang
6. Sistemik steroid jarang diperlukan untuk anterior murni

### Intermediate/Posterior/Panuveitis non-infeksi
- Steroid regional (orbital floor / posterior sub-Tenon) 4–6× interval 2–4 minggu + monitor IOP
- NSAID sistemik (naproxen 500mg 2×/hari) bila regional gagal
- Cryotherapy / laser perifer untuk snowbanking steroid-resisten
- Steroid sistemik (1–2mg/kgBB) bila bilateral simtomatik — tapering pelan bulanan
- **Immunomodulatory therapy (steroid-sparing)** — lihat tabel indikasi di bawah

### Indikasi IMT dini (bukan menunggu gagal steroid dulu):
- Sympathetic ophthalmia, VKH, birdshot, serpiginous choroidopathy, multifocal choroiditis+panuveitis, JIA-associated uveitis berat
- Lupus/Behçet dengan retinal vasculitis → **immediate** treatment (bukan "early", tapi SEGERA)

### Pemilihan agen imunosupresif (pendekatan berbasis imunologi Kanski):
| Tipe sel dominan | Contoh penyakit | Agen pilihan |
|---|---|---|
| T-cell critical | VKH, birdshot | Calcineurin inhibitor (cyclosporine, tacrolimus) |
| Neutrophil/macrophage critical | Behçet, sarkoidosis | Anti-TNF (infliximab, adalimumab) |
| B-cell critical | Scleritis ANCA+ | Rituximab |
- Steroid + antimetabolit (metotreksat/MMF/azatioprin) diharapkan efektif untuk SEMUA uveitis berat sebagai basis awal

### Infeksi — JANGAN steroid sistemik tanpa terapi kausal bersamaan!
| Penyakit | Terapi kausal | Catatan |
|---|---|---|
| Toxoplasmosis | Pirimetamin+sulfadiazin (+folinic acid) ATAU azitromisin+pirimetamin ATAU co-trimoxazole ATAU klindamisin; + prednisolon (setelah 24–48 jam antimikroba) | Indikasi terapi: lesi macula/papillomacular bundle/N.opticus/pembuluh besar, vitritis berat, imunokompromais |
| CMV retinitis | Valganciclovir oral (induksi 900mg 2×/hr → maintenance 900mg/hr) ± intravitreal ganciclovir/foscarnet/cidofovir | ART adalah kunci; skrining CD4 |
| ARN (HSV/VZV) | Aciclovir IV → oral 6–12 minggu; + steroid sistemik 24 jam SETELAH antiviral mulai | Laser retinopexy TIDAK menurunkan risiko RD |
| PRN | ART + antiviral agresif (IV+intravitreal) | Prognosis sangat buruk |
| TB uveitis | Multi-drug anti-TB (≥4 obat) + steroid bersamaan (kurangi paradoxical worsening) | Monitor optic neuropathy bila pakai ethambutol |
| Sifilis | Penisilin parenteral dosis tinggi, jangka lama | Waspada reaksi Jarisch-Herxheimer (eksaserbasi ocular sementara) |
| Endogenous bacterial/fungal endophthalmitis | Antibiotik/antifungal SISTEMIK (bukan hanya intravitreal!) + cari fokus sepsis | Vitrektomi pars plana dini pada kasus berat |
| Onchocerciasis | Ivermectin tahunan ± doksisiklin (target Wolbachia) | Steroid profilaksis bila mikrofilaria terlihat di AC |
| Toxocariasis | Steroid + antelmintik (mebendazole/thiabendazole, hati2 reaksi inflamasi saat cacing mati) | DD wajib: retinoblastoma |

---

## RINGKASAN "JANGAN LEWATKAN"

1. **Selalu singkirkan infeksi & keganasan (masquerade) sebelum imunosupresi jangka panjang** — terutama TB laten sebelum anti-TNF, dan pemeriksaan segmen posterior untuk singkirkan retinoblastoma/limfoma/RD pada kasus "uveitis" atipikal.
2. **AAU + hipopion + mata putih relatif** → pikirkan Behçet/JIA, bukan hanya HLA-B27.
3. **Fuchs uveitis syndrome** → jangan diberi steroid topikal jangka panjang untuk "flare kronis" — tidak membantu & CAU dgn are dianggap indikator aktivitas kecuali pada FUS yang justru exception.
4. **JIA** → skrining terjadwal WAJIB (bahkan sebelum ada gejala) karena uveitis-nya asimtomatik & silent progression ke buta.
5. **Sifilis** → selalu tes ganda (treponemal + non-treponemal), dan uveitis sifilis bisa memburuk sesaat setelah mulai terapi (reaksi J-H).
6. **Birdshot** → pantau dengan visual field, BUKAN visual acuity, untuk menilai progresi/respons terapi.
7. **CMV vs toxoplasma vs progressive retinal necrosis** dibedakan terutama dari derajat inflamasi anterior/vitritis (CMV & ARN = signifikan; PRN = minimal) dan pola lesi (pizza-pie vs satelit vs deep yellow-white cepat-meluas).

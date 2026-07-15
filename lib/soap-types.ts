import type { SaMode, FdMode, Category } from "./soap-presets";

export interface PalpebraFields {
  value: string; // "normal" | "edema-ringan" | "edema-sedang" | "edema-berat" | "hiperemis" | "hiperemi-lid-margin" | "ptosis-kongenital" | "ptosis-aponeurotik" | "entropion-sup" | "entropion-inf" | "ektropion" | "trikiasis" | "hordeolum" | "chalazion" | "massa" | "hematom" | "laserasi" | "manual"
  ptosisLevatorFungsi?: string;
  massaDesc?: string;
  laseasiDesc?: string;
  manual?: string;
  catatan?: string;
}

export interface KonjungtivaFields {
  hiperemi: "tidak" | "ringan" | "sedang" | "berat";
  injeksi: "none" | "konjungtiva" | "siliar" | "mix";
  sekret: "none" | "tidak-ada" | "mukoid" | "mukopurulen" | "purulen";
  reaksi: "none" | "papil" | "folikel";
  kemosis: boolean;
  perdarahanSubkonj: boolean;
  pterigium: boolean;
  pterigiumGrade?: string; // I / II / III
  pterigiumLokasi?: string; // nasal / temporal
  epifora: boolean;
  manual?: string;
  catatan?: string;
}

export interface CorneaFields {
  value: string; // "jernih" | "edema" | "edema-bullosa" | "infiltrat" | "ulkus" | "sikatrik" | "PEE" | "PEK" | "dendrit" | "flap" | "erosi" | "haziness" | "keruh-minimal" | "manual"
  infiltratLokasi?: string;
  infiltratDesc?: string;
  erosiKedalaman?: string; // "epitel" | "stroma"
  flStaining?: "" | "positif" | "negatif"; // berlaku utk value: infiltrat/ulkus/sikatrik/erosi
  erosiCatatanFoto?: string; // free text, mis. "sesuai foto"
  hazinessLokasi?: string; // "sentral" | "parasentral" | "perifer"
  // KP (keratic precipitates) — additive checkbox, bisa co-occur dgn value manapun (pola sama BMD flare/cell)
  kp?: boolean;
  kpJenis?: "halus" | "mutton-fat" | "custom";
  kpJenisCustomDesc?: string; // free text, hanya saat kpJenis === "custom"
  kpPigmentasi?: "" | "pigmented" | "non-pigmented";
  kpPersebaran?: string; // free text manual
  kpUkuran?: string; // free text manual
  manual?: string;
  catatan?: string;
}

export interface BMDFields {
  value: string; // "dalam" | "dangkal" | "sangat-dangkal"
  flare: boolean;
  flareGrade?: string; // ringan | +1 | +2 | +3 | +4
  cell: boolean;
  cellGrade?: string;
  hipopion: boolean;
  hifema: boolean;
  catatan?: string;
}

export interface IrisFields {
  value: string; // "radier" | "iridodenesis" | "sinekia-posterior" | "sinekia-anterior" | "neovaskularisasi" | "bombans" | "atrofi" | "heterokromia" | "manual"
  manual?: string;
  catatan?: string;
}

export interface PupilFields {
  value: string; // "bulat" | "ireguler" | "miosis" | "midriasis" | "leukokoria" | "manual"
  diameter?: string;
  rc?: string; // normal | lambat
  rapd: boolean;
  diameterMaksimal?: string; // khusus pre-op katarak, diukur setelah dilatasi maksimal
  manual?: string;
  catatan?: string; // dirender dalam kurung, mis. "(tanpa midri)"
}

export interface LensaFields {
  value: string; // "jernih" | "katarak-1" | "katarak-2" | "katarak-3" | "katarak-4" | "pseudofakia" | "subluksasi" | "afakia" | "manual"
  katarakSubtipe?: string; // PSC | nuklear | kortikal | posterior-polar
  pco?: boolean;
  subluksasiArah?: string;
  manual?: string;
  catatan?: string;
}

export interface SaEyeState {
  mode: SaMode;
  palpebra: PalpebraFields;
  konjungtiva: KonjungtivaFields;
  kornea: CorneaFields;
  bmd: BMDFields;
  iris: IrisFields;
  pupil: PupilFields;
  lensa: LensaFields;
  catatanTambahan?: string;
}

export interface FRFields {
  value: string; // "plus" | "plus-redup" | "plus-sulit" | "minus"
  sulitAlasan?: string;
}

export interface ONHFields {
  batas: string; // tegas | kabur | kabur-sebagian
  warna: string; // normal | hiperemi | pucat
  cdr: string;
  elevasi: boolean;
  elevasiKuadran?: string;
  nvd: boolean;
  label: string; // "Papil N. II" | "ONH"
  quickNormal?: boolean;
  manual?: string;
  catatan?: string;
}

export interface VitreousFields {
  value: string; // "jernih" | "floaters" | "perdarahan" | "sel" | "pvd" | "vitritis" | "snowball" | "opacity-nussenblatt" | "sulit" | "manual"
  perdarahanLokasi?: string;
  nussenblattGrade?: string; // "trace" | "0" | "1" | "2" | "3" | "4"
  manual?: string;
  catatan?: string;
}

export interface MakulaFields {
  value: string; // "refleks-plus" | "refleks-plus-menurun" | "refleks-minus" | "edema" | "macular-hole" | "erm" | "manual"
  mhGrade?: string; // 1 | 2 | 3 | 4
  drusen: boolean;
  drusenLokasi?: string; // "sentral" | "perifer"
  pigmenBerubah: boolean;
  pigmenDesc?: string; // default "kehitaman"
  catatanOCT?: string; // free text, mis. "menunjukkan dry AMD"
  manual?: string;
  catatan?: string;
}

export interface RetinaFields {
  value: string; // "attached" | "dot-blot" | "flame" | "eksudat" | "cws" | "ablasio" | "nve" | "mikroaneurisma" | "vaskulitis" | "robekan" | "chorioretinal-aktif" | "chorioretinal-scar" | "sulit" | "manual"
  dotBlotLokasi?: string;
  flameLokasi?: string;
  ablasioArea?: string;
  crLokasi?: string; // lokasi/kuadran chorioretinal lesion
  crWarna?: string; // default "putih kekuningan"
  crEtiologi?: string; // free text, mis. "suspek toxoplasmosis"
  manual?: string;
  catatan?: string;
}

export interface FdEyeState {
  mode: FdMode;
  fr: FRFields;
  onh: ONHFields;
  vitreous: VitreousFields;
  makula: MakulaFields;
  retina: RetinaFields;
  catatanTambahan?: string;
}

export interface GBMEyeState {
  value: string; // "bebas" | "hambatan"
  derajat?: string; // -1 | -2 | -3 | -4
  arah: string[]; // nasal | temporal | superior | inferior | superonasal | superotemporal | inferonasal | inferotemporal
  nyeri: boolean;
}

export type DeviasiType = "" | "ortoforia" | "esotropia" | "eksotropia" | "hipertropia" | "hipotropia";
export type Laterality = "OD" | "OS" | "ODS";
export type Frequency = "" | "constant" | "intermittent";
export type ControlGrade = "" | "poor" | "intermediate" | "good";

export interface CoverTestState {
  deviasi: DeviasiType;
  laterality: Laterality;
  frequency: Frequency;
  control: ControlGrade;
  catatan?: string; // mis. "mata kanan lebih sering"
  manual?: string;
}

export interface SoapState {
  category: string;
  diagnosis: string;
  saOD: SaEyeState;
  saOS: SaEyeState;
  fdOD: FdEyeState;
  fdOS: FdEyeState;
  showGBM: boolean;
  gbmOD: GBMEyeState;
  gbmOS: GBMEyeState;
  showCoverTest: boolean;
  coverTest: CoverTestState;
  catatanTambahan: string;
  postOpEye?: "OD" | "OS" | null;
}

export function defaultKonjungtiva(): KonjungtivaFields {
  return {
    hiperemi: "tidak",
    injeksi: "none",
    sekret: "none",
    reaksi: "none",
    kemosis: false,
    perdarahanSubkonj: false,
    pterigium: false,
    epifora: false,
  };
}

export function defaultSaEye(mode: SaMode = "full"): SaEyeState {
  return {
    mode,
    palpebra: { value: "normal" },
    konjungtiva: defaultKonjungtiva(),
    kornea: { value: "jernih" },
    bmd: { value: "dalam", flare: false, cell: false, hipopion: false, hifema: false },
    iris: { value: "radier" },
    pupil: { value: "bulat", diameter: "3", rc: "normal", rapd: false },
    lensa: { value: "jernih" },
  };
}

export function defaultFdEye(mode: FdMode = "full"): FdEyeState {
  return {
    mode,
    fr: { value: "plus" },
    onh: { batas: "tegas", warna: "normal", cdr: "0.3", elevasi: false, nvd: false, label: "Papil N. II" },
    vitreous: { value: "jernih" },
    makula: { value: "refleks-plus", drusen: false, pigmenBerubah: false },
    retina: { value: "attached" },
  };
}

export function defaultGBMEye(): GBMEyeState {
  return { value: "bebas", arah: [], nyeri: false };
}

export function defaultCoverTest(): CoverTestState {
  return { deviasi: "", laterality: "ODS", frequency: "", control: "" };
}

export function defaultSoapState(): SoapState {
  return {
    category: "",
    diagnosis: "",
    saOD: defaultSaEye("full"),
    saOS: defaultSaEye("full"),
    fdOD: defaultFdEye("full"),
    fdOS: defaultFdEye("full"),
    showGBM: false,
    gbmOD: defaultGBMEye(),
    gbmOS: defaultGBMEye(),
    showCoverTest: false,
    coverTest: defaultCoverTest(),
    catatanTambahan: "",
    postOpEye: null,
  };
}

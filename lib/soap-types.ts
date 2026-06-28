import type { SaMode, FdMode, Category } from "./soap-presets";

export interface PalpebraFields {
  value: string; // "normal" | "edema-ringan" | "edema-sedang" | "edema-berat" | "hiperemis" | "ptosis-kongenital" | "ptosis-aponeurotik" | "entropion-sup" | "entropion-inf" | "ektropion" | "trikiasis" | "hordeolum" | "chalazion" | "massa" | "hematom" | "laserasi" | "manual"
  ptosisLevatorFungsi?: string;
  massaDesc?: string;
  laseasiDesc?: string;
  manual?: string;
}

export interface KonjungtivaFields {
  value: string; // "tidak-hiperemi" | "hiperemi-ringan" | "hiperemi-sedang" | "hiperemi-berat" | "injeksi-konj" | "injeksi-siliar" | "injeksi-mix" | "kemosis" | "sekret-mukoid" | "sekret-mukopurulen" | "sekret-purulen" | "perdarahan-subkonj" | "pterigium" | "epifora" | "manual"
  pterigiumGrade?: string; // I / II / III
  pterigiumLokasi?: string; // nasal / temporal
  manual?: string;
}

export interface CorneaFields {
  value: string; // "jernih" | "edema" | "infiltrat" | "ulkus" | "sikatrik" | "PEE" | "PEK" | "dendrit" | "KP-halus" | "KP-mutton" | "flap" | "manual"
  infiltratLokasi?: string;
  infiltratDesc?: string;
  manual?: string;
}

export interface BMDFields {
  value: string; // "dalam" | "dangkal" | "sangat-dangkal"
  flare: boolean;
  flareGrade?: string; // ringan | +1 | +2 | +3 | +4
  cell: boolean;
  cellGrade?: string;
  hipopion: boolean;
  hifema: boolean;
}

export interface IrisFields {
  value: string; // "radier" | "iridodenesis" | "sinekia-posterior" | "sinekia-anterior" | "neovaskularisasi" | "bombans" | "atrofi" | "heterokromia" | "manual"
  manual?: string;
}

export interface PupilFields {
  value: string; // "bulat" | "ireguler" | "miosis" | "midriasis" | "leukokoria" | "manual"
  diameter?: string;
  rc?: string; // normal | lambat
  rapd: boolean;
  manual?: string;
}

export interface LensaFields {
  value: string; // "jernih" | "katarak-1" | "katarak-2" | "katarak-3" | "katarak-4" | "pseudofakia" | "subluksasi" | "afakia" | "manual"
  katarakSubtipe?: string; // PSC | nuklear | kortikal | posterior-polar
  pco?: boolean;
  subluksasiArah?: string;
  manual?: string;
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
  manual?: string;
}

export interface VitreousFields {
  value: string; // "jernih" | "floaters" | "perdarahan" | "sel" | "pvd" | "vitritis" | "snowball" | "sulit" | "manual"
  perdarahanLokasi?: string;
  manual?: string;
}

export interface MakulaFields {
  value: string; // "refleks-plus" | "refleks-plus-menurun" | "refleks-minus" | "edema" | "macular-hole" | "erm" | "manual"
  mhGrade?: string; // 1 | 2 | 3 | 4
  manual?: string;
}

export interface RetinaFields {
  value: string; // "attached" | "dot-blot" | "flame" | "eksudat" | "cws" | "ablasio" | "nve" | "mikroaneurisma" | "vaskulitis" | "robekan" | "sulit" | "manual"
  dotBlotLokasi?: string;
  flameLokasi?: string;
  ablasioArea?: string;
  manual?: string;
}

export interface FdEyeState {
  mode: FdMode;
  fr: FRFields;
  onh: ONHFields;
  vitreous: VitreousFields;
  makula: MakulaFields;
  retina: RetinaFields;
}

export interface GBMEyeState {
  value: string; // "bebas" | "hambatan"
  derajat?: string; // -1 | -2 | -3 | -4
  arah: string[]; // nasal | temporal | superior | inferior | superonasal | superotemporal | inferonasal | inferotemporal
  nyeri: boolean;
}

export type CoverTestValue = "ortoforia" | "esotropia-OD" | "esotropia-OS" | "esotropia-ODS" | "eksotropia-OD" | "eksotropia-OS" | "eksotropia-ODS" | "hipertropia-OD" | "hipertropia-OS" | "";

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
  coverTest: CoverTestValue;
  catatanTambahan: string;
}

export function defaultSaEye(mode: SaMode = "full"): SaEyeState {
  return {
    mode,
    palpebra: { value: "normal" },
    konjungtiva: { value: "tidak-hiperemi" },
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
    makula: { value: "refleks-plus" },
    retina: { value: "attached" },
  };
}

export function defaultGBMEye(): GBMEyeState {
  return { value: "bebas", arah: [], nyeri: false };
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
    coverTest: "",
    catatanTambahan: "",
  };
}

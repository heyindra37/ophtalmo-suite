import type {
  SaEyeState,
  FdEyeState,
  GBMEyeState,
  SoapState,
  PalpebraFields,
  KonjungtivaFields,
  CorneaFields,
  BMDFields,
  IrisFields,
  PupilFields,
  LensaFields,
} from "./soap-types";

// ── Segmen Anterior helpers ──────────────────────────────────────────────────

function palpebraText(f: PalpebraFields): string {
  if (f.manual) return f.manual;
  switch (f.value) {
    case "normal": return "normal";
    case "edema-ringan": return "edema ringan";
    case "edema-sedang": return "edema sedang";
    case "edema-berat": return "edema berat";
    case "hiperemis": return "hiperemis";
    case "ptosis-kongenital": return `ptosis kongenital${f.ptosisLevatorFungsi ? `, fungsi levator ${f.ptosisLevatorFungsi} mm` : ""}`;
    case "ptosis-aponeurotik": return `ptosis (+)${f.ptosisLevatorFungsi ? `, fungsi levator ${f.ptosisLevatorFungsi} mm` : ""}`;
    case "entropion-sup": return "entropion palpebra superior";
    case "entropion-inf": return "entropion palpebra inferior";
    case "ektropion": return "ektropion";
    case "trikiasis": return "trikiasis (+)";
    case "hordeolum": return "hordeolum (+)";
    case "chalazion": return "chalazion (+)";
    case "massa": return f.massaDesc ? `massa: ${f.massaDesc}` : "massa (+)";
    case "hematom": return "hematom periorbita";
    case "laserasi": return f.laseasiDesc ? `laserasi: ${f.laseasiDesc}` : "laserasi (+)";
    default: return f.value;
  }
}

function konjungtivaText(f: KonjungtivaFields): string {
  if (f.manual) return f.manual;
  switch (f.value) {
    case "tidak-hiperemi": return "tidak hiperemi";
    case "hiperemi-ringan": return "hiperemis ringan";
    case "hiperemi-sedang": return "hiperemis sedang";
    case "hiperemi-berat": return "hiperemis berat";
    case "injeksi-konj": return "injeksi konjungtiva";
    case "injeksi-siliar": return "injeksi siliar";
    case "injeksi-mix": return "injeksi konjungtiva dan siliar";
    case "kemosis": return "kemosis (+)";
    case "sekret-mukoid": return "sekret mukoid (+)";
    case "sekret-mukopurulen": return "sekret mukopurulen (+)";
    case "sekret-purulen": return "sekret purulen (+)";
    case "perdarahan-subkonj": return "perdarahan subkonjungtiva (+)";
    case "pterigium": return `pterigium grade ${f.pterigiumGrade || "I"}${f.pterigiumLokasi ? ` lokasi ${f.pterigiumLokasi}` : ""}`;
    case "epifora": return "epifora (+)";
    default: return f.value;
  }
}

function korneaText(f: CorneaFields): string {
  if (f.manual) return f.manual;
  switch (f.value) {
    case "jernih": return "jernih";
    case "edema": return "edema";
    case "edema-bullosa": return "edema bullosa";
    case "infiltrat": return `infiltrat${f.infiltratLokasi ? ` ${f.infiltratLokasi}` : ""}${f.infiltratDesc ? ` (${f.infiltratDesc})` : ""}`;
    case "ulkus": return "ulkus kornea";
    case "sikatrik": return "sikatrik";
    case "PEE": return "defek epitel (PEE)";
    case "PEK": return "defek epitel (PEK)";
    case "dendrit": return "dendrit (fluoresein +)";
    case "KP-halus": return "keratic precipitates halus (+)";
    case "KP-mutton": return "keratic precipitates mutton-fat (+)";
    case "flap": return "flap in situ (post LASIK)";
    default: return f.value;
  }
}

function bmdText(f: BMDFields): string {
  let base = "";
  switch (f.value) {
    case "dalam": base = "dalam"; break;
    case "dangkal": base = "dangkal"; break;
    case "sangat-dangkal": base = "sangat dangkal"; break;
    default: base = f.value;
  }
  const extras: string[] = [];
  if (f.flare) extras.push(`flare (+)${f.flareGrade ? ` grade ${f.flareGrade}` : ""}`);
  if (f.cell) extras.push(`cell (+)${f.cellGrade ? ` grade ${f.cellGrade}` : ""}`);
  if (f.hipopion) extras.push("hipopion (+)");
  if (f.hifema) extras.push("hifema (+)");
  if (extras.length > 0) return `${base}, ${extras.join(", ")}`;
  return base;
}

function irisText(f: IrisFields): string {
  if (f.manual) return f.manual;
  switch (f.value) {
    case "radier": return "radier";
    case "iridodenesis": return "iridodenesis (+)";
    case "sinekia-posterior": return "sinekia posterior (+)";
    case "sinekia-anterior": return "sinekia anterior (+)";
    case "neovaskularisasi": return "neovaskularisasi/rubeosis (+)";
    case "bombans": return "bombans (+)";
    case "atrofi": return "atrofi";
    case "heterokromia": return "heterokromia";
    default: return f.value;
  }
}

function pupilText(f: PupilFields): string {
  if (f.manual) return f.manual;
  let base = "";
  switch (f.value) {
    case "bulat":
      base = `bulat, diameter ${f.diameter || "3"} mm, RC: ${f.rc === "lambat" ? "lambat" : "normal"}`;
      break;
    case "ireguler": base = "tidak bulat/ireguler"; break;
    case "miosis": base = "miosis"; break;
    case "midriasis": base = `midriasis${f.diameter ? `, diameter ${f.diameter} mm` : ""}`; break;
    case "leukokoria": base = "leukokoria (+)"; break;
    default: base = f.value;
  }
  if (f.rapd) base += ", RAPD (+)";
  return base;
}

function lensaText(f: LensaFields): string {
  if (f.manual) return f.manual;
  switch (f.value) {
    case "jernih": return "jernih";
    case "katarak-1": return `keruh grade 1${f.katarakSubtipe ? ` (${f.katarakSubtipe})` : ""}`;
    case "katarak-2": return `keruh grade 2${f.katarakSubtipe ? ` (${f.katarakSubtipe})` : ""}`;
    case "katarak-3": return `keruh grade 3${f.katarakSubtipe ? ` (${f.katarakSubtipe})` : ""}`;
    case "katarak-4": return `keruh grade 4${f.katarakSubtipe ? ` (${f.katarakSubtipe})` : ""}`;
    case "pseudofakia": return `pseudofakia (IOL in situ)${f.pco ? ", PCO (+)" : ""}`;
    case "subluksasi": return `subluksasi${f.subluksasiArah ? ` ke arah ${f.subluksasiArah}` : ""}`;
    case "afakia": return "afakia";
    default: return f.value;
  }
}

export function buildSaOutput(label: string, eye: SaEyeState): string {
  if (eye.mode === "normal") return `Sa${label} : normal`;

  const hasPalpebraFinding = eye.palpebra.value !== "normal" || eye.palpebra.manual;

  const parts: string[] = [];
  if (hasPalpebraFinding) {
    parts.push(`Palpebra: ${palpebraText(eye.palpebra)}`);
  }
  parts.push(`Konjungtiva ${konjungtivaText(eye.konjungtiva)}`);
  parts.push(`Kornea ${korneaText(eye.kornea)}`);
  parts.push(`BMD ${bmdText(eye.bmd)}`);
  parts.push(`Iris ${irisText(eye.iris)}`);
  parts.push(`Pupil ${pupilText(eye.pupil)}`);
  parts.push(`Lensa ${lensaText(eye.lensa)}`);

  if (eye.mode === "partial") {
    const nonDefault = parts.filter((p) => {
      if (p.startsWith("Palpebra")) return true;
      if (p === "Konjungtiva tidak hiperemi") return false;
      if (p === "Kornea jernih") return false;
      if (p === "BMD dalam") return false;
      if (p === "Iris radier") return false;
      if (p.startsWith("Pupil bulat") && !eye.pupil.rapd) return false;
      if (p === "Lensa jernih") return false;
      return true;
    });
    if (nonDefault.length === 0) return `Sa${label} : normal`;
    return `Sa${label} : ${nonDefault.join(". ")}. Detail lain normal`;
  }

  return `Sa${label} : ${parts.join(". ")}`;
}

// ── Segmen Posterior helpers ─────────────────────────────────────────────────

function onhText(f: FdEyeState["onh"]): string {
  if (f.manual) return f.manual;
  let s = `${f.label} batas ${f.batas}, warna ${f.warna}, CDR ${f.cdr || "0.3"}`;
  if (f.elevasi) s += f.elevasiKuadran ? `, elevasi (+) kuadran ${f.elevasiKuadran}` : ", elevasi (+)";
  if (f.nvd) s += ", NVD (+)";
  return s;
}

function vitreousText(v: FdEyeState["vitreous"]): string {
  if (v.manual) return v.manual;
  switch (v.value) {
    case "jernih": return "";
    case "floaters": return "Vitreous: floaters (+)";
    case "perdarahan": return `Vitreous: perdarahan vitreous (+)${v.perdarahanLokasi ? ` (${v.perdarahanLokasi})` : ""}`;
    case "sel": return "Vitreous: sel vitreous (+)";
    case "pvd": return "Vitreous: PVD (+)";
    case "vitritis": return "Vitreous: keruh (vitritis)";
    case "snowball": return "Vitreous: snowball opacities (+)";
    case "sulit": return "Vitreous: detail sulit dievaluasi";
    default: return v.value ? `Vitreous: ${v.value}` : "";
  }
}

function makulaText(m: FdEyeState["makula"]): string {
  if (m.manual) return m.manual;
  switch (m.value) {
    case "refleks-plus": return "Makula refleks (+)";
    case "refleks-plus-menurun": return "Makula refleks (+) menurun";
    case "refleks-minus": return "Makula refleks (-)";
    case "edema": return "Makula: edema makula (+)";
    case "macular-hole": return `Makula: terdapat macular hole${m.mhGrade ? ` grade ${m.mhGrade}` : ""}`;
    case "erm": return "Makula: epiretinal membrane (+)";
    default: return m.value ? `Makula: ${m.value}` : "";
  }
}

function retinaText(r: FdEyeState["retina"]): string {
  if (r.manual) return r.manual;
  switch (r.value) {
    case "attached": return "Retina attached, tidak ada perdarahan maupun eksudat";
    case "dot-blot": return `Retina: perdarahan dot-blot (+)${r.dotBlotLokasi ? ` (${r.dotBlotLokasi})` : ""}`;
    case "flame": return `Retina: perdarahan flame-shaped (+)${r.flameLokasi ? ` (${r.flameLokasi})` : ""}`;
    case "eksudat": return "Retina: eksudat keras (+)";
    case "cws": return "Retina: cotton wool spot (+)";
    case "ablasio": return `Retina: ablasio retina (+)${r.ablasioArea ? ` (${r.ablasioArea})` : ""}`;
    case "nve": return "Retina: NVE (+)";
    case "mikroaneurisma": return "Retina: mikroaneurisma (+)";
    case "vaskulitis": return "Retina: vaskulitis retina (+)";
    case "robekan": return "Retina: robekan retina (+)";
    case "sulit": return "Retina: detail sulit dievaluasi";
    default: return r.value ? `Retina: ${r.value}` : "";
  }
}

export function buildFdOutput(label: string, eye: FdEyeState): string {
  if (eye.mode === "normal") return `Fd${label} : normal`;
  if (eye.mode === "tidak") return "";

  const { fr } = eye;
  if (fr.value === "minus") return `Fd${label} : FR (-)`;
  if (fr.value === "plus-sulit")
    return `Fd${label} : FR (+) detail sulit dievaluasi${fr.sulitAlasan ? ` (${fr.sulitAlasan})` : ""}`;

  const frBase = fr.value === "plus-redup" ? "FR (+) redup" : "FR (+)";
  const parts: string[] = [frBase];
  parts.push(onhText(eye.onh));
  const vit = vitreousText(eye.vitreous);
  if (vit) parts.push(vit);
  parts.push(makulaText(eye.makula));
  parts.push(retinaText(eye.retina));

  return `Fd${label} : ${parts.join(". ")}`;
}

export function buildGBMOutput(label: string, eye: GBMEyeState): string {
  if (eye.value === "bebas") return `GBM ${label} : bisa ke segala arah. Nyeri tidak ada`;
  const arahStr = eye.arah.length > 0 ? eye.arah.join(", ") : "...";
  return `GBM ${label} : hambatan gerak bola mata ${eye.derajat || "-1"} ke arah ${arahStr}. Nyeri ${eye.nyeri ? "ada" : "tidak ada"}`;
}

export function buildFullOutput(state: SoapState): string {
  const lines: string[] = [];

  // Sa OD dan OS
  const saODNormal = state.saOD.mode === "normal";
  const saOSNormal = state.saOS.mode === "normal";
  if (saODNormal && saOSNormal) {
    lines.push("SaODS : normal/normal");
  } else {
    lines.push(buildSaOutput("OD", state.saOD));
    lines.push(buildSaOutput("OS", state.saOS));
  }

  // Fd OD dan OS
  const fdODNormal = state.fdOD.mode === "normal";
  const fdOSNormal = state.fdOS.mode === "normal";
  const fdODTidak = state.fdOD.mode === "tidak";
  const fdOSTidak = state.fdOS.mode === "tidak";

  if (!fdODTidak && !fdOSTidak) {
    if (fdODNormal && fdOSNormal) {
      lines.push("FdODS : normal/normal");
    } else {
      if (!fdODTidak) lines.push(buildFdOutput("OD", state.fdOD));
      if (!fdOSTidak) lines.push(buildFdOutput("OS", state.fdOS));
    }
  }

  // GBM
  if (state.showGBM) {
    lines.push(buildGBMOutput("OD", state.gbmOD));
    lines.push(buildGBMOutput("OS", state.gbmOS));
  }

  // Cover Test
  if (state.showCoverTest && state.coverTest) {
    lines.push(`Cover Test : ${state.coverTest}`);
  }

  // Catatan tambahan
  if (state.catatanTambahan.trim()) {
    lines.push(state.catatanTambahan.trim());
  }

  return lines.filter(Boolean).join("\n");
}

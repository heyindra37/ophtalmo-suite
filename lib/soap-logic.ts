import type {
  SaEyeState,
  FdEyeState,
  GBMEyeState,
  SoapState,
  CoverTestState,
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
  let base: string;
  if (f.manual) base = f.manual;
  else {
    switch (f.value) {
      case "normal": base = "normal"; break;
      case "edema-ringan": base = "edema ringan"; break;
      case "edema-sedang": base = "edema sedang"; break;
      case "edema-berat": base = "edema berat"; break;
      case "hiperemis": base = "hiperemis"; break;
      case "hiperemi-lid-margin": base = "hiperemi lid margin"; break;
      case "ptosis-kongenital": base = `ptosis kongenital${f.ptosisLevatorFungsi ? `, fungsi levator ${f.ptosisLevatorFungsi} mm` : ""}`; break;
      case "ptosis-aponeurotik": base = `ptosis (+)${f.ptosisLevatorFungsi ? `, fungsi levator ${f.ptosisLevatorFungsi} mm` : ""}`; break;
      case "entropion-sup": base = "entropion palpebra superior"; break;
      case "entropion-inf": base = "entropion palpebra inferior"; break;
      case "ektropion": base = "ektropion"; break;
      case "trikiasis": base = "trikiasis (+)"; break;
      case "hordeolum": base = "hordeolum (+)"; break;
      case "chalazion": base = "chalazion (+)"; break;
      case "massa": base = f.massaDesc ? `massa: ${f.massaDesc}` : "massa (+)"; break;
      case "hematom": base = "hematom periorbita"; break;
      case "laserasi": base = f.laseasiDesc ? `laserasi: ${f.laseasiDesc}` : "laserasi (+)"; break;
      default: base = f.value;
    }
  }
  if (f.catatan) base += `, ${f.catatan}`;
  return base;
}

export function isKonjungtivaDefault(f: KonjungtivaFields): boolean {
  return (
    f.hiperemi === "tidak" &&
    f.injeksi === "none" &&
    f.sekret === "none" &&
    f.reaksi === "none" &&
    !f.kemosis &&
    !f.perdarahanSubkonj &&
    !f.pterigium &&
    !f.epifora &&
    !f.manual &&
    !f.catatan
  );
}

function konjungtivaText(f: KonjungtivaFields): string {
  if (f.manual) {
    let base = f.manual;
    if (f.catatan) base += `, ${f.catatan}`;
    return base;
  }
  const parts: string[] = [];
  parts.push(f.hiperemi === "tidak" ? "tidak hiperemi" : `hiperemis ${f.hiperemi}`);
  if (f.injeksi === "konjungtiva") parts.push("injeksi konjungtiva");
  else if (f.injeksi === "siliar") parts.push("injeksi siliar");
  else if (f.injeksi === "mix") parts.push("injeksi konjungtiva dan siliar");
  if (f.sekret === "tidak-ada") parts.push("sekret tidak ada");
  else if (f.sekret !== "none") parts.push(`sekret ${f.sekret} (+)`);
  if (f.reaksi === "papil") parts.push("di konjungtiva palpebra terdapat reaksi papil");
  else if (f.reaksi === "folikel") parts.push("di konjungtiva palpebra terdapat reaksi folikel");
  if (f.kemosis) parts.push("kemosis (+)");
  if (f.perdarahanSubkonj) parts.push("perdarahan subkonjungtiva (+)");
  if (f.pterigium) parts.push(`pterigium grade ${f.pterigiumGrade || "I"}${f.pterigiumLokasi ? ` lokasi ${f.pterigiumLokasi}` : ""}`);
  if (f.epifora) parts.push("epifora (+)");
  if (f.catatan) parts.push(f.catatan);
  return parts.join(", ");
}

function korneaText(f: CorneaFields): string {
  let base: string;
  if (f.manual) base = f.manual;
  else {
    switch (f.value) {
      case "jernih": base = "jernih"; break;
      case "edema": base = "edema"; break;
      case "edema-bullosa": base = "edema bullosa"; break;
      case "infiltrat": base = `infiltrat${f.infiltratLokasi ? ` ${f.infiltratLokasi}` : ""}${f.infiltratDesc ? ` (${f.infiltratDesc})` : ""}`; break;
      case "ulkus": base = "ulkus kornea"; break;
      case "sikatrik": base = "sikatrik"; break;
      case "PEE": base = "defek epitel (PEE)"; break;
      case "PEK": base = "defek epitel (PEK)"; break;
      case "dendrit": base = "dendrit (fluoresein +)"; break;
      case "KP-halus": base = "keratic precipitates halus (+)"; break;
      case "KP-mutton": base = "keratic precipitates mutton-fat (+)"; break;
      case "KP-custom": base = `tampak KP${f.kpWarna ? ` berwarna ${f.kpWarna}` : ""}${f.kpLokasi ? ` di ${f.kpLokasi}` : ""}`; break;
      case "flap": base = "flap in situ (post LASIK)"; break;
      case "erosi": {
        const kedalaman = f.erosiKedalaman ? ` sedalam ${f.erosiKedalaman}` : "";
        const staining = f.flStaining === "positif" ? "(+)" : f.flStaining === "negatif" ? "(-)" : "";
        const foto = f.erosiCatatanFoto ? ` ${f.erosiCatatanFoto}` : "";
        base = `erosi kornea${kedalaman}, fluorescein staining ${staining}${foto}`;
        break;
      }
      case "haziness": base = `stromal haziness di ${f.hazinessLokasi || "sentral"}`; break;
      case "keruh-minimal": base = "keruh minimal"; break;
      default: base = f.value;
    }
  }
  if (f.catatan) base += `, ${f.catatan}`;
  return base;
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
  if (extras.length > 0) base = `${base}, ${extras.join(", ")}`;
  if (f.catatan) base += `, ${f.catatan}`;
  return base;
}

function irisText(f: IrisFields): string {
  let base: string;
  if (f.manual) base = f.manual;
  else {
    switch (f.value) {
      case "radier": base = "radier"; break;
      case "iridodenesis": base = "iridodenesis (+)"; break;
      case "sinekia-posterior": base = "sinekia posterior (+)"; break;
      case "sinekia-anterior": base = "sinekia anterior (+)"; break;
      case "neovaskularisasi": base = "neovaskularisasi/rubeosis (+)"; break;
      case "bombans": base = "bombans (+)"; break;
      case "atrofi": base = "atrofi"; break;
      case "heterokromia": base = "heterokromia"; break;
      default: base = f.value;
    }
  }
  if (f.catatan) base += `, ${f.catatan}`;
  return base;
}

function pupilText(f: PupilFields): string {
  let base: string;
  if (f.manual) base = f.manual;
  else {
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
  }
  if (f.rapd) base += ", RAPD (+)";
  if (f.catatan) base += ` (${f.catatan})`;
  return base;
}

function lensaText(f: LensaFields): string {
  let base: string;
  if (f.manual) base = f.manual;
  else {
    switch (f.value) {
      case "jernih": base = "jernih"; break;
      case "katarak-1": base = `keruh grade 1${f.katarakSubtipe ? ` (${f.katarakSubtipe})` : ""}`; break;
      case "katarak-2": base = `keruh grade 2${f.katarakSubtipe ? ` (${f.katarakSubtipe})` : ""}`; break;
      case "katarak-3": base = `keruh grade 3${f.katarakSubtipe ? ` (${f.katarakSubtipe})` : ""}`; break;
      case "katarak-4": base = `keruh grade 4${f.katarakSubtipe ? ` (${f.katarakSubtipe})` : ""}`; break;
      case "pseudofakia": base = `pseudofakia (IOL in situ)${f.pco ? ", PCO (+)" : ""}`; break;
      case "subluksasi": base = `subluksasi${f.subluksasiArah ? ` ke arah ${f.subluksasiArah}` : ""}`; break;
      case "afakia": base = "afakia"; break;
      default: base = f.value;
    }
  }
  if (f.catatan) base += `, ${f.catatan}`;
  return base;
}

export function buildSaOutput(label: string, eye: SaEyeState): string {
  if (eye.mode === "normal") {
    let out = `Sa${label} : normal`;
    if (eye.catatanTambahan) out += `. ${eye.catatanTambahan}`;
    return out;
  }

  const hasPalpebraFinding = eye.palpebra.value !== "normal" || eye.palpebra.manual || eye.palpebra.catatan;

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

  let joined: string;
  if (eye.mode === "partial") {
    const nonDefault = parts.filter((p) => {
      if (p.startsWith("Palpebra")) return true;
      if (p === "Konjungtiva tidak hiperemi" && isKonjungtivaDefault(eye.konjungtiva)) return false;
      if (p === "Kornea jernih") return false;
      if (p === "BMD dalam") return false;
      if (p === "Iris radier") return false;
      if (p.startsWith("Pupil bulat") && !eye.pupil.rapd && !eye.pupil.catatan) return false;
      if (p === "Lensa jernih") return false;
      return true;
    });
    if (nonDefault.length === 0) joined = "normal";
    else joined = `${nonDefault.join(". ")}. Detail lain normal`;
  } else {
    joined = parts.join(". ");
  }

  let out = `Sa${label} : ${joined}`;
  if (eye.catatanTambahan) out += `. ${eye.catatanTambahan}`;
  return out;
}

// ── Segmen Posterior helpers ─────────────────────────────────────────────────

function onhText(f: FdEyeState["onh"]): string {
  let base: string;
  if (f.manual) base = f.manual;
  else if (f.quickNormal) base = `${f.label} normal`;
  else {
    base = `${f.label} batas ${f.batas}, warna ${f.warna}, CDR ${f.cdr || "0.3"}`;
    if (f.elevasi) base += f.elevasiKuadran ? `, elevasi (+) kuadran ${f.elevasiKuadran}` : ", elevasi (+)";
    if (f.nvd) base += ", NVD (+)";
  }
  if (f.catatan) base += `, ${f.catatan}`;
  return base;
}

function vitreousText(v: FdEyeState["vitreous"]): string {
  let base: string;
  if (v.manual) base = v.manual;
  else {
    switch (v.value) {
      case "jernih": base = ""; break;
      case "floaters": base = "Vitreous: floaters (+)"; break;
      case "perdarahan": base = `Vitreous: perdarahan vitreous (+)${v.perdarahanLokasi ? ` (${v.perdarahanLokasi})` : ""}`; break;
      case "sel": base = "Vitreous: sel vitreous (+)"; break;
      case "pvd": base = "Vitreous: PVD (+)"; break;
      case "vitritis": base = "Vitreous: keruh (vitritis)"; break;
      case "snowball": base = "Vitreous: snowball opacities (+)"; break;
      case "opacity-nussenblatt": base = `Vitreous: tampak vitreous opacity, nussenblatt grade ${v.nussenblattGrade || "1"}`; break;
      case "sulit": base = "Vitreous: detail sulit dievaluasi"; break;
      default: base = v.value ? `Vitreous: ${v.value}` : "";
    }
  }
  if (v.catatan) base = base ? `${base}, ${v.catatan}` : `Vitreous: ${v.catatan}`;
  return base;
}

function makulaText(m: FdEyeState["makula"]): string {
  let base: string;
  if (m.manual) base = m.manual;
  else {
    switch (m.value) {
      case "refleks-plus": base = "Makula refleks (+)"; break;
      case "refleks-plus-menurun": base = "Makula refleks (+) menurun"; break;
      case "refleks-minus": base = "Makula refleks (-)"; break;
      case "edema": base = "Makula: edema makula (+)"; break;
      case "macular-hole": base = `Makula: terdapat macular hole${m.mhGrade ? ` grade ${m.mhGrade}` : ""}`; break;
      case "erm": base = "Makula: epiretinal membrane (+)"; break;
      default: base = m.value ? `Makula: ${m.value}` : "";
    }
  }
  const extras: string[] = [];
  if (m.drusen) extras.push(`drusen di ${m.drusenLokasi || "sentral"}`);
  if (m.pigmenBerubah) extras.push(`warna makula ${m.pigmenDesc || "kehitaman"}`);
  if (m.catatanOCT) extras.push(`hasil OCT ${m.catatanOCT}`);
  if (m.catatan) extras.push(m.catatan);
  if (extras.length > 0) {
    base = base ? `${base}. ${extras.join(". ")}` : extras.join(". ");
  }
  return base;
}

function retinaText(r: FdEyeState["retina"]): string {
  let base: string;
  if (r.manual) base = r.manual;
  else {
    switch (r.value) {
      case "attached": base = "Retina attached, tidak ada perdarahan maupun eksudat"; break;
      case "dot-blot": base = `Retina: perdarahan dot-blot (+)${r.dotBlotLokasi ? ` (${r.dotBlotLokasi})` : ""}`; break;
      case "flame": base = `Retina: perdarahan flame-shaped (+)${r.flameLokasi ? ` (${r.flameLokasi})` : ""}`; break;
      case "eksudat": base = "Retina: eksudat keras (+)"; break;
      case "cws": base = "Retina: cotton wool spot (+)"; break;
      case "ablasio": base = `Retina: ablasio retina (+)${r.ablasioArea ? ` (${r.ablasioArea})` : ""}`; break;
      case "nve": base = "Retina: NVE (+)"; break;
      case "mikroaneurisma": base = "Retina: mikroaneurisma (+)"; break;
      case "vaskulitis": base = "Retina: vaskulitis retina (+)"; break;
      case "robekan": base = "Retina: robekan retina (+)"; break;
      case "chorioretinal-aktif": {
        const lokasi = r.crLokasi ? ` di ${r.crLokasi}` : "";
        const warna = r.crWarna || "putih kekuningan";
        const etiologi = r.crEtiologi ? `, ${r.crEtiologi}` : "";
        base = `Retina: tampak chorioretinal lesion aktif${lokasi}, warna ${warna}${etiologi}`;
        break;
      }
      case "chorioretinal-scar": base = `Retina: inactive scar${r.crLokasi ? ` di kuadran ${r.crLokasi}` : ""}`; break;
      case "sulit": base = "Retina: detail sulit dievaluasi"; break;
      default: base = r.value ? `Retina: ${r.value}` : "";
    }
  }
  if (r.catatan) base += `, ${r.catatan}`;
  return base;
}

export function buildFdOutput(label: string, eye: FdEyeState): string {
  if (eye.mode === "normal") {
    let out = `Fd${label} : normal`;
    if (eye.catatanTambahan) out += `. ${eye.catatanTambahan}`;
    return out;
  }
  if (eye.mode === "tidak") return "";

  const { fr } = eye;
  if (fr.value === "minus") {
    let out = `Fd${label} : FR (-)`;
    if (eye.catatanTambahan) out += `. ${eye.catatanTambahan}`;
    return out;
  }
  if (fr.value === "plus-sulit") {
    let out = `Fd${label} : FR (+) detail sulit dievaluasi${fr.sulitAlasan ? ` (${fr.sulitAlasan})` : ""}`;
    if (eye.catatanTambahan) out += `. ${eye.catatanTambahan}`;
    return out;
  }

  const frBase = fr.value === "plus-redup" ? "FR (+) redup" : "FR (+)";
  const parts: string[] = [frBase];
  parts.push(onhText(eye.onh));
  const vit = vitreousText(eye.vitreous);
  if (vit) parts.push(vit);
  parts.push(makulaText(eye.makula));
  parts.push(retinaText(eye.retina));

  let out = `Fd${label} : ${parts.join(". ")}`;
  if (eye.catatanTambahan) out += `. ${eye.catatanTambahan}`;
  return out;
}

export function buildGBMOutput(label: string, eye: GBMEyeState): string {
  if (eye.value === "bebas") return `GBM ${label} : bisa ke segala arah. Nyeri tidak ada`;
  const arahStr = eye.arah.length > 0 ? eye.arah.join(", ") : "...";
  return `GBM ${label} : hambatan gerak bola mata ${eye.derajat || "-1"} ke arah ${arahStr}. Nyeri ${eye.nyeri ? "ada" : "tidak ada"}`;
}

export function buildCoverTestOutput(ct: CoverTestState): string {
  if (ct.manual) return ct.manual;
  if (!ct.deviasi) return "";
  if (ct.deviasi === "ortoforia") return "Ortoforia";

  const label = ct.deviasi.charAt(0).toUpperCase() + ct.deviasi.slice(1);
  const parts: string[] = [`${label} ${ct.laterality}`];
  if (ct.frequency === "intermittent") parts.push("intermittent");
  else if (ct.frequency === "constant") parts.push("konstan");
  if (ct.catatan) parts.push(ct.catatan);
  if (ct.control) parts.push(`${ct.control} control`);
  return parts.join(", ");
}

export function buildFullOutput(state: SoapState): string {
  const lines: string[] = [];

  // Sa OD dan OS
  const saODNormal = state.saOD.mode === "normal";
  const saOSNormal = state.saOS.mode === "normal";
  const saNoCatatan = !state.saOD.catatanTambahan && !state.saOS.catatanTambahan;
  if (saODNormal && saOSNormal && saNoCatatan) {
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
  const fdNoCatatan = !state.fdOD.catatanTambahan && !state.fdOS.catatanTambahan;

  if (!fdODTidak && !fdOSTidak) {
    if (fdODNormal && fdOSNormal && fdNoCatatan) {
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
  if (state.showCoverTest) {
    const ctText = buildCoverTestOutput(state.coverTest);
    if (ctText) lines.push(`Cover Test : ${ctText}`);
  }

  // Catatan tambahan
  if (state.catatanTambahan.trim()) {
    lines.push(state.catatanTambahan.trim());
  }

  return lines.filter(Boolean).join("\n");
}

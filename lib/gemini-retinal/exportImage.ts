export type ImageFormat = "png" | "jpeg";
export type ExportScope = "ODS" | "OD" | "OS";

const EYE_LABEL: Record<"OD" | "OS", string> = { OD: "OD (mata kanan)", OS: "OS (mata kiri)" };

const MARGIN = 40;
const HEADER = 96;
const LABEL = 36;
const LINE_HEIGHT = 26;
const FONT = "'DM Sans', system-ui, sans-serif";

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) {
        out.push(line);
        line = word;
      } else line = next;
    }
    out.push(line);
  }
  return out;
}

/** Lays the chosen fundus maps side by side with a header and the narrative, on a white page. */
export function composeImage(
  maps: { eye: "OD" | "OS"; canvas: HTMLCanvasElement }[],
  narrative: string,
  when: Date,
  opts: { title?: string; subtitle?: string; empty?: string } = {}
): HTMLCanvasElement {
  const { title = "Retinal Drawing", subtitle = "peta fundus menghadap pasien (Amsler-Dubois)", empty = "Belum ada lesi yang digambar." } = opts;
  const mapW = maps[0].canvas.width;
  const mapH = maps[0].canvas.height;
  const scope = maps.length === 2 ? "ODS" : maps[0].eye;
  const width = MARGIN * (maps.length + 1) + mapW * maps.length;
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = `18px ${FONT}`;
  const lines = wrapLines(probe, narrative || empty, width - MARGIN * 2);
  const height = HEADER + LABEL + mapH + MARGIN + lines.length * LINE_HEIGHT + MARGIN;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#0f172a";
  ctx.font = `bold 30px 'Fraunces', Georgia, serif`;
  ctx.fillText(`${title} — ${scope}`, MARGIN, 52);
  ctx.fillStyle = "#64748b";
  ctx.font = `18px ${FONT}`;
  ctx.fillText(`${when.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })} · ${subtitle}`, MARGIN, 82);

  const top = HEADER + LABEL;
  ctx.fillStyle = "#0f766e";
  ctx.font = `bold 22px ${FONT}`;
  maps.forEach(({ eye, canvas: map }, i) => {
    const x = MARGIN + i * (MARGIN + mapW);
    ctx.fillText(EYE_LABEL[eye], x, top - 10);
    ctx.drawImage(map, x, top);
  });

  ctx.fillStyle = "#1e293b";
  ctx.font = `18px ${FONT}`;
  let y = top + mapH + MARGIN;
  for (const line of lines) {
    ctx.fillText(line, MARGIN, y);
    y += LINE_HEIGHT;
  }
  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, format: ImageFormat, scope: ExportScope, when: Date, prefix = "retinal-drawing") {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${when.getFullYear()}${pad(when.getMonth() + 1)}${pad(when.getDate())}-${pad(when.getHours())}${pad(when.getMinutes())}`;
  const a = document.createElement("a");
  a.href = canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.92);
  a.download = `${prefix}-${scope}-${stamp}.${format === "png" ? "png" : "jpg"}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export type ImageFormat = "png" | "jpeg";

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

/** Lays the OD and OS fundus maps side by side with a header and the narrative, on a white page. */
export function composeOdsImage(od: HTMLCanvasElement, os: HTMLCanvasElement, narrative: string, when: Date): HTMLCanvasElement {
  const mapW = od.width;
  const width = MARGIN * 3 + mapW * 2;
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = `18px ${FONT}`;
  const lines = wrapLines(probe, narrative || "Belum ada lesi yang digambar.", width - MARGIN * 2);
  const height = HEADER + LABEL + od.height + MARGIN + lines.length * LINE_HEIGHT + MARGIN;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#0f172a";
  ctx.font = `bold 30px 'Fraunces', Georgia, serif`;
  ctx.fillText("Retinal Drawing — ODS", MARGIN, 52);
  ctx.fillStyle = "#64748b";
  ctx.font = `18px ${FONT}`;
  ctx.fillText(`${when.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })} · peta fundus menghadap pasien (Amsler-Dubois)`, MARGIN, 82);

  const top = HEADER + LABEL;
  ctx.fillStyle = "#0f766e";
  ctx.font = `bold 22px ${FONT}`;
  ctx.fillText("OD (mata kanan)", MARGIN, top - 10);
  ctx.fillText("OS (mata kiri)", MARGIN * 2 + mapW, top - 10);
  ctx.drawImage(od, MARGIN, top);
  ctx.drawImage(os, MARGIN * 2 + mapW, top);

  ctx.fillStyle = "#1e293b";
  ctx.font = `18px ${FONT}`;
  let y = top + od.height + MARGIN;
  for (const line of lines) {
    ctx.fillText(line, MARGIN, y);
    y += LINE_HEIGHT;
  }
  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, format: ImageFormat, when: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${when.getFullYear()}${pad(when.getMonth() + 1)}${pad(when.getDate())}-${pad(when.getHours())}${pad(when.getMinutes())}`;
  const a = document.createElement("a");
  a.href = canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.92);
  a.download = `retinal-drawing-ODS-${stamp}.${format === "png" ? "png" : "jpg"}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

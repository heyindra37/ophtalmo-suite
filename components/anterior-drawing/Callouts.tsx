"use client";

import type { Ref } from "react";
import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import type Konva from "konva";
import {
  calloutMetrics,
  calloutY,
  leaderPath,
  legendLayout,
  legendSample,
  type PlacedCallout,
} from "@/lib/anterior-drawing/callouts";
import type { AnteriorDef } from "@/lib/anterior-drawing/narrative";
import { LesionNodes, type Projection } from "./LesionLayer";

const FONT = "Arial";
const INK = "#475569";

/** Text width in px, measured with the same font the Konva labels use. Browser only. */
export function makeMeasure(fs: number): (text: string) => number {
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `${fs}px ${FONT}`;
  return (t) => ctx.measureText(t).width;
}

/** Leader lines and boxes for one eye; lines are drawn first so a box never sits under another's line. */
export function CalloutLayer({
  callouts,
  stageHeight,
  fontSize,
  proj,
}: {
  callouts: PlacedCallout[];
  stageHeight: number;
  fontSize: number;
  proj: Projection;
}) {
  const m = calloutMetrics(fontSize);
  const placed = callouts.map((c) => {
    const y = calloutY(c, stageHeight, m);
    const a = proj.toScreen(c.anchor);
    return { c, y, a, path: leaderPath(c, stageHeight, m, a) };
  });
  return (
    <Group listening={false}>
      {placed.map(({ c, a, path }) => (
        <Group key={`l-${c.key}`}>
          <Line
            points={[path.p0.x, path.p0.y, path.c1.x, path.c1.y, path.c2.x, path.c2.y, path.p3.x, path.p3.y]}
            bezier
            stroke={INK}
            strokeWidth={1}
            opacity={0.8}
            lineCap="round"
          />
          <Circle x={a.x} y={a.y} radius={Math.max(2, fontSize * 0.25)} fill={INK} stroke="#ffffff" strokeWidth={1} />
        </Group>
      ))}
      {placed.map(({ c, y }) => (
        <Group key={`b-${c.key}`}>
          <Rect x={c.x} y={y} width={c.w} height={m.h} cornerRadius={4} fill="#ffffff" stroke={INK} strokeWidth={1} />
          <Rect
            x={c.x + m.inset}
            y={y + (m.h - m.chip) / 2}
            width={m.chip}
            height={m.chip}
            cornerRadius={2}
            fill={c.color}
            stroke={INK}
            strokeWidth={0.6}
          />
          <Text
            x={c.x + m.inset + m.chip + m.gap}
            y={y}
            height={m.h}
            verticalAlign="middle"
            text={c.text}
            fontSize={fontSize}
            fontFamily={FONT}
            fill="#0f172a"
            wrap="none"
          />
        </Group>
      ))}
    </Group>
  );
}

/** One legend for the listed lesion types; glyphs reuse the real drawing code, so they match the canvas. */
export function LegendStage({
  defs,
  width,
  fontSize,
  stageRef,
}: {
  defs: AnteriorDef[];
  width: number;
  fontSize: number;
  stageRef?: Ref<Konva.Stage>;
}) {
  const measure = makeMeasure(fontSize);
  const L = legendLayout(defs, width, fontSize, measure);
  const scale = fontSize * 1.1;
  return (
    <Stage width={width} height={L.height} ref={stageRef}>
      <Layer listening={false}>
        {L.cells.map(({ def, x, y }) => {
          const cx = x + L.glyphW / 2;
          const cy = y + L.rowH / 2;
          const proj: Projection = { scale, toScreen: (p) => ({ x: cx + p.x * scale, y: cy - p.y * scale }) };
          return (
            <Group key={def.id}>
              <Rect x={x} y={y + 2} width={L.glyphW} height={L.rowH - 4} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1} cornerRadius={3} />
              <Group clipX={x} clipY={y + 2} clipWidth={L.glyphW} clipHeight={L.rowH - 4}>
                <LesionNodes items={[legendSample(def)]} defs={[def]} proj={proj} />
              </Group>
              <Text
                x={x + L.glyphW + L.gap}
                y={y}
                height={L.rowH}
                verticalAlign="middle"
                text={def.name}
                fontSize={fontSize}
                fontFamily={FONT}
                fill="#0f172a"
                wrap="none"
              />
            </Group>
          );
        })}
      </Layer>
    </Stage>
  );
}

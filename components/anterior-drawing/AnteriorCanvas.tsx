"use client";

import { useRef, type Ref } from "react";
import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import type Konva from "konva";
import {
  EXTENT,
  FISSURE_HALF_W,
  R_LIMBUS,
  R_PUPIL,
  TARSAL,
  clockHour,
  lowerLid,
  upperLid,
  type Eye,
  type Pt,
} from "@/lib/anterior-drawing/geometry";
import type { AnteriorDef, DrawnItem } from "@/lib/anterior-drawing/narrative";
import type { PlacedCallout } from "@/lib/anterior-drawing/callouts";
import { LesionNodes, type Projection } from "./LesionLayer";
import { CalloutLayer } from "./Callouts";

const OUTLINE = "#64748b";

function lidCurve(f: (x: number) => number, proj: Projection, reverse = false): number[] {
  const out: number[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = reverse ? 40 - i : i;
    const x = -FISSURE_HALF_W + (t / 40) * 2 * FISSURE_HALF_W;
    const s = proj.toScreen({ x, y: f(x) });
    out.push(s.x, s.y);
  }
  return out;
}

function Anatomy({ proj, eye, pupilR }: { proj: Projection; eye: Eye; pupilR: number }) {
  const c = proj.toScreen({ x: 0, y: 0 });
  const k = proj.scale;
  const upper = lidCurve(upperLid, proj);
  const lower = lidCurve(lowerLid, proj);
  const fissure = [...upper, ...lidCurve(lowerLid, proj, true)];
  const nasalSign = eye === "OD" ? 1 : -1;
  const caruncle = proj.toScreen({ x: nasalSign * (FISSURE_HALF_W - 1.6), y: 0 });
  const tarsal = (sign: 1 | -1, label: string) => {
    const tl = proj.toScreen({ x: -TARSAL.halfW, y: sign === 1 ? TARSAL.outer : -TARSAL.inner });
    return (
      <Group>
        <Rect x={tl.x} y={tl.y} width={2 * TARSAL.halfW * k} height={(TARSAL.outer - TARSAL.inner) * k} cornerRadius={k * 1.5} fill="#fde2e4" stroke={OUTLINE} strokeWidth={1} />
        <Text x={tl.x + 6} y={tl.y + 4} text={label} fontSize={Math.max(9, k * 0.6)} fill="#9f1239" opacity={0.7} />
      </Group>
    );
  };
  return (
    <Group listening={false}>
      <Line points={[...upper, ...[proj.toScreen({ x: FISSURE_HALF_W + 1.5, y: 0 }), proj.toScreen({ x: 0, y: 11 }), proj.toScreen({ x: -FISSURE_HALF_W - 1.5, y: 0 })].flatMap((p) => [p.x, p.y])]} closed fill="#fdf0e6" tension={0.35} />
      <Line points={[...lower, ...[proj.toScreen({ x: FISSURE_HALF_W + 1.5, y: 0 }), proj.toScreen({ x: 0, y: -10.5 }), proj.toScreen({ x: -FISSURE_HALF_W - 1.5, y: 0 })].flatMap((p) => [p.x, p.y])]} closed fill="#fdf0e6" tension={0.35} />
      <Line points={fissure} closed fill="#ffffff" />
      <Circle x={caruncle.x} y={caruncle.y} radius={k * 0.9} fill="#fbcfe8" />
      <Circle x={c.x} y={c.y} radius={R_LIMBUS * k} fill="#f3ece4" stroke={OUTLINE} strokeWidth={1.5} />
      <Circle x={c.x} y={c.y} radius={pupilR * k} fill="#e2e8f0" stroke={OUTLINE} strokeWidth={1} />
      <Line points={upper} stroke="#334155" strokeWidth={2} tension={0} />
      <Line points={lower} stroke="#334155" strokeWidth={2} tension={0} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = Math.PI / 2 - (i * Math.PI) / 6;
        const p = proj.toScreen({ x: Math.cos(a) * (R_LIMBUS + 0.8), y: Math.sin(a) * (R_LIMBUS + 0.8) });
        const hour = clockHour({ x: Math.cos(a), y: Math.sin(a) });
        return <Text key={i} x={p.x - 10} y={p.y - 5} width={20} align="center" text={String(hour)} fontSize={Math.max(8, k * 0.55)} fill="#94a3b8" />;
      })}
      {tarsal(1, "Konjungtiva tarsal superior (eversi)")}
      {tarsal(-1, "Konjungtiva tarsal inferior (eversi)")}
    </Group>
  );
}

export function AnteriorCanvas({
  size,
  eye,
  items,
  defs,
  pupilSize,
  tool,
  brushWidth,
  onPin,
  onStroke,
  onErase,
  onActivate,
  callouts,
  bandTop = 0,
  bandBottom = 0,
  fontSize = 11,
  stageRef,
}: {
  size: number;
  eye: Eye;
  items: DrawnItem[];
  defs: AnteriorDef[];
  pupilSize?: number;
  tool?: "pin" | "brush" | "erase";
  brushWidth?: number;
  onPin?: (p: Pt) => void;
  onStroke?: (pts: Pt[]) => void;
  onErase?: (p: Pt) => void;
  /** Fired at the start of every pointer-down, so a parent can make this eye the active one. */
  onActivate?: () => void;
  /** Callouts for this eye, laid out for `size`; they sit in bands above and below the drawing. */
  callouts?: PlacedCallout[];
  bandTop?: number;
  bandBottom?: number;
  fontSize?: number;
  stageRef?: Ref<Konva.Stage>;
}) {
  const scale = size / (2 * EXTENT);
  const half = size / 2;
  const height = size + bandTop + bandBottom;
  const cy = bandTop + half; // the drawing stays centred in its own square; callout bands sit outside it
  const proj: Projection = { scale, toScreen: (p) => ({ x: half + p.x * scale, y: cy - p.y * scale }) };
  const drawing = useRef<Pt[] | null>(null);
  const liveLine = useRef<Konva.Line>(null);
  const interactive = !!tool;
  const pupilR = pupilSize && pupilSize > 0 && pupilSize < 2 * R_LIMBUS ? pupilSize / 2 : R_PUPIL;

  const pointer = (stage: Konva.Stage | null): Pt | null => {
    const pos = stage?.getPointerPosition();
    return pos ? { x: (pos.x - half) / scale, y: -(pos.y - cy) / scale } : null;
  };

  const down = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const p = pointer(e.target.getStage());
    if (!p) return;
    onActivate?.();
    if (Math.abs(p.y) > EXTENT) return; // a touch in a callout band is not a lesion
    if (tool === "erase") return onErase?.(p);
    if (tool === "pin") return onPin?.(p);
    drawing.current = [p];
    const s = proj.toScreen(p);
    liveLine.current?.points([s.x, s.y]);
  };
  const move = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!drawing.current) return;
    e.evt.preventDefault();
    const p = pointer(e.target.getStage());
    if (!p || Math.abs(p.y) > EXTENT) return;
    const last = drawing.current[drawing.current.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 0.15) return;
    drawing.current.push(p);
    const s = proj.toScreen(p);
    liveLine.current?.points([...(liveLine.current.points() ?? []), s.x, s.y]);
    liveLine.current?.getLayer()?.batchDraw();
  };
  const up = () => {
    const pts = drawing.current;
    drawing.current = null;
    liveLine.current?.points([]);
    if (pts?.length) onStroke?.(pts);
  };

  const nasalRight = eye === "OD";
  return (
    <Stage
      width={size}
      height={height}
      ref={stageRef}
      {...(interactive
        ? { onMouseDown: down, onTouchStart: down, onMouseMove: move, onTouchMove: move, onMouseUp: up, onTouchEnd: up, onMouseLeave: up }
        : {})}
      style={interactive ? { touchAction: "none", cursor: tool === "erase" ? "not-allowed" : "crosshair" } : undefined}
    >
      <Layer>
        <Rect x={0} y={0} width={size} height={height} fill="#ffffff" listening={false} />
        <Anatomy proj={proj} eye={eye} pupilR={pupilR} />
        <LesionNodes items={items} defs={defs} proj={proj} />
        {callouts && callouts.length > 0 && <CalloutLayer callouts={callouts} stageHeight={height} fontSize={fontSize} proj={proj} />}
        <Line ref={liveLine} points={[]} stroke="#0d9488" strokeWidth={(brushWidth ?? 1) * scale} opacity={0.5} lineCap="round" lineJoin="round" listening={false} />
        <Text x={6} y={cy - 6} text={nasalRight ? "T" : "N"} fontSize={13} fontStyle="bold" fill="#0f766e" listening={false} />
        <Text x={size - 16} y={cy - 6} text={nasalRight ? "N" : "T"} fontSize={13} fontStyle="bold" fill="#0f766e" listening={false} />
      </Layer>
    </Stage>
  );
}

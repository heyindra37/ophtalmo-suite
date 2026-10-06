"use client";

import { useRef } from "react";
import { Arrow, Circle, Group, Layer, Line, Stage, Text } from "react-konva";
import type Konva from "konva";
import {
  DISC_RADIUS,
  R_EQUATOR,
  R_ORA,
  R_PARS_PLANA,
  VIEWPORT_RADIUS,
  discCenter,
  gazeOffset,
  globalToLocal,
  onhPointer,
  localToGlobal,
  type Eye,
  type Gaze,
  type Pt,
} from "@/lib/gemini-retinal/geometry";
import type { DrawnItem, LesionDef } from "@/lib/gemini-retinal/narrative";
import { LesionNodes, type Projection } from "./LesionLayer";

const LANDMARK = "#94a3b8";

/** Equator, ora serrata, pars plana, 12 meridians, disc and fovea — drawn through any projection. */
function Landmarks({ proj, eye, labels }: { proj: Projection; eye: Eye; labels: boolean }) {
  const c = proj.toScreen({ x: 0, y: 0 });
  const disc = proj.toScreen(discCenter(eye));
  const rings: [number, string][] = [
    [R_EQUATOR, "Ekuator"],
    [R_ORA, "Ora serrata"],
    [R_PARS_PLANA, "Pars plana"],
  ];
  return (
    <Group listening={false}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        const inner = proj.toScreen({ x: Math.cos(a) * 0.12, y: Math.sin(a) * 0.12 });
        const outer = proj.toScreen({ x: Math.cos(a) * R_PARS_PLANA, y: Math.sin(a) * R_PARS_PLANA });
        return <Line key={`m${i}`} points={[inner.x, inner.y, outer.x, outer.y]} stroke="#e2e8f0" strokeWidth={1} />;
      })}
      {rings.map(([r, label]) => (
        <Group key={label}>
          <Circle x={c.x} y={c.y} radius={r * proj.scale} stroke={LANDMARK} strokeWidth={r === R_ORA ? 1.8 : 1.2} dash={r === R_PARS_PLANA ? [6, 4] : undefined} />
          {labels && (
            // Placed along the 4:30 direction so ring names never collide with clock-hour labels.
            <Text x={c.x + r * proj.scale * 0.72} y={c.y + r * proj.scale * 0.7} text={label} fontSize={10} fill={LANDMARK} />
          )}
        </Group>
      ))}
      <Circle x={disc.x} y={disc.y} radius={DISC_RADIUS * proj.scale} stroke="#d97706" strokeWidth={1.2} dash={[3, 3]} fill="#f59e0b" opacity={0.4} />
      <Text x={disc.x - 12} y={disc.y + DISC_RADIUS * proj.scale + 2} width={24} align="center" text="ONH" fontSize={9} fontStyle="bold" fill="#b45309" opacity={0.75} />
      <Circle x={c.x} y={c.y} radius={4} fill="#475569" />
      {labels &&
        Array.from({ length: 12 }, (_, i) => {
          const hour = i === 0 ? 12 : i;
          const a = Math.PI / 2 - (i * Math.PI) / 6;
          const p = proj.toScreen({ x: Math.cos(a) * (R_PARS_PLANA + 0.07), y: Math.sin(a) * (R_PARS_PLANA + 0.07) });
          return <Text key={`h${i}`} x={p.x - 12} y={p.y - 6} width={24} align="center" text={String(hour)} fontSize={11} fill="#64748b" />;
        })}
    </Group>
  );
}

export function GlobalMapCanvas({
  size,
  eye,
  gaze,
  items,
  defs,
}: {
  size: number;
  eye: Eye;
  gaze: Gaze;
  items: DrawnItem[];
  defs: LesionDef[];
}) {
  const scale = size / 2 / (R_PARS_PLANA + 0.16);
  const proj: Projection = {
    scale,
    toScreen: (p) => ({ x: size / 2 + p.x * scale, y: size / 2 - p.y * scale }),
  };
  const vc = proj.toScreen(gazeOffset(gaze));
  const nasalRight = eye === "OD";
  return (
    <Stage width={size} height={size}>
      <Layer>
        <Landmarks proj={proj} eye={eye} labels />
        <LesionNodes items={items} defs={defs} proj={proj} />
        <Circle x={vc.x} y={vc.y} radius={VIEWPORT_RADIUS * scale} stroke="#0d9488" strokeWidth={2} dash={[8, 5]} listening={false} />
        <Text x={6} y={size / 2 + 10} text={nasalRight ? "T" : "N"} fontSize={12} fontStyle="bold" fill="#0f766e" />
        <Text x={size - 14} y={size / 2 + 10} text={nasalRight ? "N" : "T"} fontSize={12} fontStyle="bold" fill="#0f766e" />
      </Layer>
    </Stage>
  );
}

/** When the optic disc lies outside the lens, show a faint ghost just inside the rim in its direction. */
function OffLensOnh({
  eye,
  gaze,
  half,
  scale,
  toLocalScreen,
}: {
  eye: Eye;
  gaze: Gaze;
  half: number;
  scale: number;
  toLocalScreen: (p: Pt) => Pt;
}) {
  const o = onhPointer(eye, gaze);
  if (o.inside) return null;
  const ux = o.local.x / o.distance;
  const uy = o.local.y / o.distance;
  const at = toLocalScreen({ x: ux * VIEWPORT_RADIUS * 0.8, y: uy * VIEWPORT_RADIUS * 0.8 });
  const tip = toLocalScreen({ x: ux * VIEWPORT_RADIUS * 0.97, y: uy * VIEWPORT_RADIUS * 0.97 });
  return (
    <Group listening={false} opacity={0.75}>
      <Circle x={at.x} y={at.y} radius={DISC_RADIUS * scale} stroke="#d97706" strokeWidth={1.2} dash={[3, 3]} fill="#f59e0b" opacity={0.4} />
      <Arrow points={[at.x + ux * DISC_RADIUS * scale * 1.2, at.y - uy * DISC_RADIUS * scale * 1.2, tip.x, tip.y]} stroke="#d97706" fill="#d97706" strokeWidth={1.5} pointerLength={6} pointerWidth={6} />
      <Text x={at.x - 36} y={uy < 0 ? at.y - DISC_RADIUS * scale - 12 : at.y + DISC_RADIUS * scale + 2} width={72} align="center" wrap="none" text="ONH (di luar)" fontSize={9} fontStyle="bold" fill="#b45309" />
    </Group>
  );
}

export function ViewportCanvas({
  size,
  eye,
  gaze,
  items,
  defs,
  tool,
  brushWidth,
  onPin,
  onStroke,
}: {
  size: number;
  eye: Eye;
  gaze: Gaze;
  items: DrawnItem[];
  defs: LesionDef[];
  tool: "pin" | "brush";
  brushWidth: number;
  onPin: (global: Pt) => void;
  onStroke: (globalPoints: Pt[]) => void;
}) {
  const scale = size / 2 / VIEWPORT_RADIUS;
  const half = size / 2;
  const toLocalScreen = (local: Pt): Pt => ({ x: half + local.x * scale, y: half - local.y * scale });
  const proj: Projection = { scale, rotateDeg: 180, toScreen: (g) => toLocalScreen(globalToLocal(g, gaze)) };
  const drawing = useRef<Pt[] | null>(null);
  const liveLine = useRef<Konva.Line>(null);

  const pointerLocal = (stage: Konva.Stage | null): Pt | null => {
    const pos = stage?.getPointerPosition();
    if (!pos) return null;
    const local = { x: (pos.x - half) / scale, y: -(pos.y - half) / scale };
    return Math.hypot(local.x, local.y) <= VIEWPORT_RADIUS ? local : null;
  };

  const down = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const local = pointerLocal(e.target.getStage());
    if (!local) return;
    if (tool === "pin") {
      onPin(localToGlobal(local, gaze));
      return;
    }
    drawing.current = [local];
    liveLine.current?.points([toLocalScreen(local).x, toLocalScreen(local).y]);
  };

  const move = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!drawing.current) return;
    e.evt.preventDefault();
    const local = pointerLocal(e.target.getStage());
    if (!local) return;
    const last = drawing.current[drawing.current.length - 1];
    if (Math.hypot(local.x - last.x, local.y - last.y) < 0.006) return;
    drawing.current.push(local);
    const s = toLocalScreen(local);
    liveLine.current?.points([...(liveLine.current.points() ?? []), s.x, s.y]);
    liveLine.current?.getLayer()?.batchDraw();
  };

  const up = () => {
    const pts = drawing.current;
    drawing.current = null;
    liveLine.current?.points([]);
    if (pts && pts.length) onStroke(pts.map((p) => localToGlobal(p, gaze)));
  };

  return (
    <Stage
      width={size}
      height={size}
      onMouseDown={down}
      onTouchStart={down}
      onMouseMove={move}
      onTouchMove={move}
      onMouseUp={up}
      onTouchEnd={up}
      onMouseLeave={up}
      style={{ touchAction: "none", cursor: "crosshair" }}
    >
      <Layer>
        <Circle x={half} y={half} radius={half - 1} fill="#fff7ed" />
        <Group clipFunc={(ctx) => ctx.arc(half, half, half - 1, 0, Math.PI * 2)}>
          <Landmarks proj={proj} eye={eye} labels={false} />
          <LesionNodes items={items} defs={defs} proj={proj} />
          <OffLensOnh eye={eye} gaze={gaze} half={half} scale={scale} toLocalScreen={toLocalScreen} />
          <Line ref={liveLine} points={[]} stroke="#0d9488" strokeWidth={brushWidth * scale} opacity={0.5} lineCap="round" lineJoin="round" listening={false} />
        </Group>
        <Circle x={half} y={half} radius={half - 1} stroke="#0f172a" strokeWidth={2} listening={false} />
      </Layer>
    </Stage>
  );
}

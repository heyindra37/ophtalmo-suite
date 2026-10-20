"use client";

import type { ReactNode } from "react";
import { Circle, Group, Line, Rect } from "react-konva";
import { R_LIMBUS, type Pt } from "@/lib/anterior-drawing/geometry";
import type { AnteriorDef, DrawnItem } from "@/lib/anterior-drawing/narrative";

/** `scale` = pixels per millimetre. */
export interface Projection {
  toScreen: (p: Pt) => Pt;
  scale: number;
}

const PIN = 0.45; // mm

function flat(points: Pt[]): number[] {
  return points.flatMap((p) => [p.x, p.y]);
}

function resample(points: Pt[], step: number): Pt[] {
  if (points.length < 2) return points;
  const out: Pt[] = [points[0]];
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    acc += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    if (acc >= step) {
      out.push(points[i]);
      acc = 0;
    }
  }
  return out;
}

function PinShape({ def, at, proj }: { def: AnteriorDef; at: Pt; proj: Projection }) {
  const c = proj.toScreen(at);
  const r = PIN * proj.scale;
  switch (def.shape) {
    case "outlined_circle":
      return <Circle x={c.x} y={c.y} radius={r * 1.1} stroke={def.color} strokeWidth={Math.max(1.5, r * 0.3)} />;
    case "dendrite": {
      // Branching epithelial lesion with terminal bulbs.
      const arms = [[-1.6, 0.2], [1.6, -0.2], [-0.6, 1.3], [0.7, -1.3]];
      return (
        <Group>
          <Line points={[c.x - r * 1.6, c.y - r * 0.2, c.x + r * 1.6, c.y + r * 0.2]} stroke={def.color} strokeWidth={Math.max(1.5, r * 0.3)} lineCap="round" />
          {arms.slice(2).map(([dx, dy], i) => (
            <Line key={i} points={[c.x + dx * 0.3 * r, c.y, c.x + dx * r, c.y + dy * r]} stroke={def.color} strokeWidth={Math.max(1.2, r * 0.25)} lineCap="round" />
          ))}
          {arms.map(([dx, dy], i) => (
            <Circle key={`b${i}`} x={c.x + dx * r} y={c.y + (i < 2 ? -dy : dy) * r} radius={Math.max(1.5, r * 0.28)} fill={def.color} />
          ))}
        </Group>
      );
    }
    case "kp_dots":
      return (
        <Group>
          {[[0, 0], [-0.9, 0.6], [0.9, 0.5], [-0.4, -0.8], [0.6, -0.7]].map(([dx, dy], i) => (
            <Circle key={i} x={c.x + dx * r} y={c.y + dy * r} radius={Math.max(1.3, r * 0.22)} fill={def.color} />
          ))}
        </Group>
      );
    case "papil_dots":
      return (
        <Group>
          {[[-0.6, -0.5], [0.6, -0.5], [-0.6, 0.6], [0.6, 0.6]].map(([dx, dy], i) => (
            <Circle key={i} x={c.x + dx * r} y={c.y + dy * r} radius={r * 0.45} stroke={def.color} strokeWidth={1} fill="#fecaca" />
          ))}
        </Group>
      );
    case "suture_x":
      return (
        <Group>
          <Line points={[c.x - r, c.y - r, c.x + r, c.y + r]} stroke={def.color} strokeWidth={1.5} />
          <Line points={[c.x - r, c.y + r, c.x + r, c.y - r]} stroke={def.color} strokeWidth={1.5} />
        </Group>
      );
    case "triangle":
      return <Line points={[c.x, c.y - r, c.x - r * 0.9, c.y + r * 0.7, c.x + r * 0.9, c.y + r * 0.7]} closed fill={def.color} />;
    case "synechia":
      return <Line points={[c.x - r, c.y + r * 0.5, c.x, c.y - r * 0.6, c.x + r, c.y + r * 0.5]} closed fill={def.color} tension={0.3} />;
    case "hordeolum":
      return (
        <Group>
          <Circle x={c.x} y={c.y} radius={r * 1.2} fill={def.color} opacity={0.5} />
          <Circle x={c.x} y={c.y} radius={r * 0.45} fill="#FACC15" />
        </Group>
      );
    default:
      return <Circle x={c.x} y={c.y} radius={r * 0.6} fill={def.color} />;
  }
}

function AreaShape({ def, item, proj }: { def: AnteriorDef; item: DrawnItem; proj: Projection }) {
  const pts = item.points.map(proj.toScreen);
  const w = (item.width ?? 1) * proj.scale;
  const common = { points: flat(pts), lineCap: "round" as const, lineJoin: "round" as const, tension: 0.3 };
  switch (def.shape) {
    case "outline_fill":
      return (
        <Group>
          <Line {...common} stroke={def.color} strokeWidth={w} opacity={0.35} />
          <Line {...common} stroke={def.color} strokeWidth={Math.max(1.2, w * 0.12)} />
        </Group>
      );
    case "ring_dots":
      return (
        <Group>
          {resample(item.points, 0.35).map((p, i) => {
            const s = proj.toScreen(p);
            const jx = Math.sin(i * 12.9898) * w * 0.3;
            const jy = Math.cos(i * 78.233) * w * 0.3;
            return <Circle key={i} x={s.x + jx} y={s.y + jy} radius={Math.max(1.5, w * 0.12)} stroke={def.color} strokeWidth={1} />;
          })}
        </Group>
      );
    case "vessel_lines":
      return (
        <Group>
          <Line {...common} stroke={def.color} strokeWidth={Math.max(1.2, w * 0.12)} />
          {resample(item.points, 0.8).map((p, i) => {
            const s = proj.toScreen(p);
            const d = w * 0.4;
            const sgn = i % 2 ? 1 : -1;
            return <Line key={i} points={[s.x, s.y, s.x + d * 0.6, s.y + sgn * d, s.x + d, s.y + sgn * d * 1.3]} stroke={def.color} strokeWidth={1} tension={0.4} />;
          })}
        </Group>
      );
    case "line":
      return <Line {...common} stroke={def.color} strokeWidth={Math.max(1.5, w * 0.15)} />;
    default:
      return <Line {...common} stroke={def.color} strokeWidth={w} />;
  }
}

/** Hypopyon / hyphaema: fluid filling the anterior chamber up to the clicked level. */
function LevelShape({ def, at, proj }: { def: AnteriorDef; at: Pt; proj: Projection }) {
  const c = proj.toScreen({ x: 0, y: 0 });
  const R = R_LIMBUS * proj.scale;
  const top = proj.toScreen(at).y;
  return (
    <Group clipFunc={(ctx) => ctx.arc(c.x, c.y, R, 0, Math.PI * 2)}>
      <Rect x={c.x - R} y={top} width={2 * R} height={c.y + R - top} fill={def.color} opacity={0.85} />
      <Line points={[c.x - R, top, c.x + R, top]} stroke={def.id === "hipopion" ? "#B45309" : "#7F1D1D"} strokeWidth={1.5} />
    </Group>
  );
}

export function LesionNodes({ items, defs, proj }: { items: DrawnItem[]; defs: AnteriorDef[]; proj: Projection }) {
  const groups: ReactNode[] = [];
  for (const def of defs) {
    const mine = items.filter((i) => i.lesionId === def.id);
    if (!mine.length) continue;
    const nodes: ReactNode[] = [];
    if (def.type === "level") {
      const last = mine[mine.length - 1];
      nodes.push(<LevelShape key={last.uid} def={def} at={last.points[0]} proj={proj} />);
    } else
      for (const it of mine) {
        if (it.kind === "pin") nodes.push(<PinShape key={it.uid} def={def} at={it.points[0]} proj={proj} />);
        else if (def.type === "area") nodes.push(<AreaShape key={it.uid} def={def} item={it} proj={proj} />);
        else resample(it.points, PIN * 2.6).forEach((p, i) => nodes.push(<PinShape key={`${it.uid}-${i}`} def={def} at={p} proj={proj} />));
      }
    groups.push(
      <Group key={def.id} opacity={def.fill_opacity ?? 1}>
        {nodes}
      </Group>
    );
  }
  return <>{groups}</>;
}

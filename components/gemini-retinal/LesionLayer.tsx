"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Circle, Ellipse, Group, Line } from "react-konva";
import type Konva from "konva";
import type { Pt } from "@/lib/gemini-retinal/geometry";
import type { DrawnItem, LesionDef } from "@/lib/gemini-retinal/narrative";

/** Maps a global-map point to canvas pixels. `scale` = pixels per map unit. */
export interface Projection {
  toScreen: (p: Pt) => Pt;
  scale: number;
  /** 180 when the projection is the optically inverted viewport, so oriented glyphs flip too. */
  rotateDeg?: number;
}

const PIN = 0.03; // map units

function flat(points: Pt[]): number[] {
  return points.flatMap((p) => [p.x, p.y]);
}

function resample(points: Pt[], step: number): Pt[] {
  if (points.length < 2) return points;
  const out: Pt[] = [points[0]];
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    acc += d;
    if (acc >= step) {
      out.push(b);
      acc = 0;
    }
  }
  return out;
}

function PinShape({ def, at, proj, k }: { def: LesionDef; at: Pt; proj: Projection; k: string }) {
  const c = proj.toScreen(at);
  const r = PIN * proj.scale;
  switch (def.shape) {
    case "outlined_circle":
      return <Circle key={k} x={c.x} y={c.y} radius={r} stroke={def.color} strokeWidth={Math.max(1.5, r * 0.35)} />;
    case "brush_stroke": {
      // Flame haemorrhage: elongated along the radial (nerve-fibre) direction from the posterior pole.
      const angle = (Math.atan2(-at.y, at.x) * 180) / Math.PI + (proj.rotateDeg ?? 0);
      return <Ellipse key={k} x={c.x} y={c.y} radiusX={r * 1.6} radiusY={r * 0.55} rotation={angle} fill={def.color} />;
    }
    case "beaded_line": {
      const beads = [-1, 0, 1].map((i) => (
        <Circle key={`${k}-b${i}`} x={c.x + i * r * 1.1} y={c.y} radius={r * 0.45} fill={def.color} />
      ));
      return (
        <Group key={k}>
          <Line points={[c.x - r * 1.8, c.y, c.x + r * 1.8, c.y]} stroke={def.color} strokeWidth={Math.max(1, r * 0.25)} />
          {beads}
        </Group>
      );
    }
    case "horseshoe_svg": {
      // U-shaped tear, open side facing the periphery (flap toward the ora).
      const outward = Math.atan2(-at.y, at.x) + ((proj.rotateDeg ?? 0) * Math.PI) / 180;
      const pts: number[] = [];
      for (let t = 0; t <= 16; t++) {
        const a = outward + Math.PI / 2 + (t / 16) * Math.PI;
        pts.push(c.x + Math.cos(a) * r * 1.1, c.y + Math.sin(a) * r * 1.1);
      }
      return <Line key={k} points={pts} stroke={def.color} strokeWidth={Math.max(2, r * 0.45)} lineCap="round" />;
    }
    default:
      return <Circle key={k} x={c.x} y={c.y} radius={r * 0.8} fill={def.color} />;
  }
}

function AreaShape({ def, item, proj }: { def: LesionDef; item: DrawnItem; proj: Projection }) {
  const pts = item.points.map(proj.toScreen);
  const w = (item.width ?? 0.06) * proj.scale;
  const base = <Line points={flat(pts)} stroke={def.color} strokeWidth={w} lineCap="round" lineJoin="round" tension={0.3} />;
  switch (def.shape) {
    case "dotted_brush":
      return (
        <Group>
          {resample(item.points, 0.025).map((p, i) => {
            const s = proj.toScreen(p);
            return <Circle key={i} x={s.x} y={s.y} radius={Math.max(1.5, w * 0.18)} fill={def.color} stroke="#a16207" strokeWidth={0.5} />;
          })}
        </Group>
      );
    case "crosshatch_pattern":
      return (
        <Group>
          <Line points={flat(pts)} stroke={def.color} strokeWidth={w} opacity={0.25} lineCap="round" lineJoin="round" />
          {resample(item.points, 0.02).map((p, i) => {
            const s = proj.toScreen(p);
            const d = w * 0.35;
            return (
              <Group key={i}>
                <Line points={[s.x - d, s.y - d, s.x + d, s.y + d]} stroke={def.color} strokeWidth={1.2} />
                <Line points={[s.x - d, s.y + d, s.x + d, s.y - d]} stroke={def.color} strokeWidth={1.2} />
              </Group>
            );
          })}
        </Group>
      );
    case "crinkled_lines": {
      const zig: number[] = [];
      resample(item.points, 0.012).forEach((p, i) => {
        const s = proj.toScreen(p);
        const off = (i % 2 === 0 ? 1 : -1) * w * 0.3;
        zig.push(s.x + off, s.y - off);
      });
      return <Line points={zig} stroke={def.color} strokeWidth={2} lineJoin="round" />;
    }
    case "branching_lines":
      return (
        <Group>
          <Line points={flat(pts)} stroke={def.color} strokeWidth={Math.max(1.5, w * 0.2)} lineCap="round" tension={0.3} />
          {resample(item.points, 0.04).map((p, i) => {
            const s = proj.toScreen(p);
            const d = w * 0.45;
            return (
              <Group key={i}>
                <Line points={[s.x, s.y, s.x + d, s.y - d]} stroke={def.color} strokeWidth={1.2} />
                <Line points={[s.x, s.y, s.x - d, s.y - d]} stroke={def.color} strokeWidth={1.2} />
              </Group>
            );
          })}
        </Group>
      );
    default:
      return base;
  }
}

/**
 * Strokes of one lesion type are drawn opaque inside a cached group, then the whole group gets the
 * lesion's opacity once — so strokes laid from different gazes merge into one area instead of
 * darkening where they overlap.
 */
function UnionGroup({ opacity, children, version }: { opacity: number; children: ReactNode; version: string }) {
  const ref = useRef<Konva.Group>(null);
  useEffect(() => {
    const g = ref.current;
    if (!g) return;
    g.clearCache();
    if (g.getChildren().length > 0) {
      try {
        g.cache({ pixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1 });
      } catch {
        // empty bounds (e.g. zero-size stroke) cannot be cached; drawing uncached is still correct
      }
    }
    g.getLayer()?.batchDraw();
  }, [version]);
  return (
    <Group ref={ref} opacity={opacity}>
      {children}
    </Group>
  );
}

export function LesionNodes({ items, defs, proj }: { items: DrawnItem[]; defs: LesionDef[]; proj: Projection }) {
  const byId = new Map(defs.map((d) => [d.id, d]));
  const groups: ReactNode[] = [];
  for (const def of defs) {
    const mine = items.filter((i) => i.lesionId === def.id);
    if (!mine.length) continue;
    const nodes: ReactNode[] = [];
    for (const it of mine) {
      if (it.kind === "pin") {
        nodes.push(<PinShape key={it.uid} def={def} at={it.points[0]} proj={proj} k={it.uid} />);
      } else if (def.type === "area") {
        nodes.push(<AreaShape key={it.uid} def={def} item={it} proj={proj} />);
      } else {
        resample(it.points, PIN * 2.4).forEach((p, i) =>
          nodes.push(<PinShape key={`${it.uid}-${i}`} def={def} at={p} proj={proj} k={`${it.uid}-${i}`} />)
        );
      }
    }
    const opacity = byId.get(def.id)?.fill_opacity ?? 1;
    const version = `${mine.map((m) => `${m.uid}:${m.points.length}`).join("|")}@${proj.scale.toFixed(2)}`;
    groups.push(
      opacity < 1 ? (
        <UnionGroup key={def.id} opacity={opacity} version={version}>
          {nodes}
        </UnionGroup>
      ) : (
        <Group key={def.id}>{nodes}</Group>
      )
    );
  }
  return <>{groups}</>;
}

import type { WfdtResponse } from "@/lib/worth-four-dot/interpret";

type Dot = { x: number; y: number; c: "r" | "g" | "w" };

const FILL = { r: "#ef4444", g: "#84cc16", w: "#ffffff" };

const PATTERNS: Record<Exclude<WfdtResponse, "bergantian">, Dot[]> = {
  empat: [
    { x: 50, y: 20, c: "r" },
    { x: 25, y: 45, c: "g" },
    { x: 75, y: 45, c: "g" },
    { x: 50, y: 70, c: "w" },
  ],
  "dua-merah": [
    { x: 50, y: 20, c: "r" },
    { x: 50, y: 70, c: "r" },
  ],
  "tiga-hijau": [
    { x: 25, y: 35, c: "g" },
    { x: 75, y: 35, c: "g" },
    { x: 50, y: 65, c: "g" },
  ],
  "lima-uncrossed": [
    { x: 14, y: 45, c: "g" },
    { x: 46, y: 45, c: "g" },
    { x: 30, y: 72, c: "g" },
    { x: 84, y: 20, c: "r" },
    { x: 84, y: 72, c: "r" },
  ],
  "lima-crossed": [
    { x: 16, y: 20, c: "r" },
    { x: 16, y: 72, c: "r" },
    { x: 54, y: 45, c: "g" },
    { x: 86, y: 45, c: "g" },
    { x: 70, y: 72, c: "g" },
  ],
};

function Dots({ dots, r = 9 }: { dots: Dot[]; r?: number }) {
  return (
    <>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={r} fill={FILL[d.c]} stroke="#334155" strokeWidth={0.8} />
      ))}
    </>
  );
}

export default function DotPattern({ response }: { response: WfdtResponse }) {
  if (response === "bergantian") {
    return (
      <svg viewBox="0 0 100 90" className="w-full h-auto" aria-hidden>
        <g className="wfdt-alt-a">
          <Dots dots={PATTERNS["tiga-hijau"]} />
        </g>
        <g className="wfdt-alt-b">
          <Dots dots={PATTERNS["dua-merah"]} />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 90" className="w-full h-auto" aria-hidden>
      <Dots dots={PATTERNS[response]} />
    </svg>
  );
}

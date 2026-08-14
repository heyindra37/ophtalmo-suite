/**
 * Rotating clock-face diagram: shows streak orientation (dashed line) vs. sweep/movement
 * direction (solid double-headed arrow), always perpendicular to each other.
 *
 * `meridianDeg` follows the clinical axis convention (0/180 = horizontal, increasing
 * counterclockwise as seen by the examiner facing the patient) and represents the SWEEP
 * direction — the neutralized meridian, not the streak orientation.
 *
 * Because SVG's y-axis points down, converting to screen space: svgAngle = 180 - meridianDeg.
 * Worked check: meridianDeg=90 ("streak horizontal, gerak ↕") -> svgAngle=90 -> straight down
 * -> vertical sweep arrow, horizontal dashed streak. meridianDeg=180 ("streak vertikal, gerak
 * ↔") -> svgAngle=0 -> horizontal sweep arrow, vertical dashed streak. Both match their PRD
 * labels.
 */
function pointsForAngle(meridianDeg: number, cx: number, cy: number, r: number) {
  const svgAngleRad = ((180 - meridianDeg) * Math.PI) / 180;
  const dx = Math.cos(svgAngleRad);
  const dy = Math.sin(svgAngleRad);
  return {
    x1: cx - r * dx,
    y1: cy - r * dy,
    x2: cx + r * dx,
    y2: cy + r * dy,
  };
}

export default function ClockFaceDiagram({
  meridianDeg,
  size = 96,
}: {
  meridianDeg: number;
  size?: number;
}) {
  const cx = 50;
  const cy = 50;
  const r = 40;
  const sweep = pointsForAngle(meridianDeg, cx, cy, r);
  const streak = pointsForAngle(meridianDeg - 90, cx, cy, r);
  const markerId = `rt-arrow-${Math.round(meridianDeg * 100)}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`Diagram meridian ${Math.round(meridianDeg)} derajat`}
    >
      <defs>
        <marker
          id={markerId}
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#0d9488" />
        </marker>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={1.5} />
      <line
        x1={streak.x1}
        y1={streak.y1}
        x2={streak.x2}
        y2={streak.y2}
        stroke="#94a3b8"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <line
        x1={sweep.x1}
        y1={sweep.y1}
        x2={sweep.x2}
        y2={sweep.y2}
        stroke="#0d9488"
        strokeWidth={2.5}
        markerStart={`url(#${markerId})`}
        markerEnd={`url(#${markerId})`}
      />
    </svg>
  );
}

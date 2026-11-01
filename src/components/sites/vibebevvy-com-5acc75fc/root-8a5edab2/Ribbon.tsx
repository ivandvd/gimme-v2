"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";

interface RibbonProps {
  /** the sentence set along the wave; the component sets it in capitals */
  line: string;
  /** mirror the wave so it drifts down to the right, and run the text the other way */
  mirror?: boolean;
}

/* The wave's centre line, in the 1920×300 box the band is drawn in: two
   periods across the box, drifting upward to the right like the reference.
   The band is this path stroked 150 wide; the text rides it. */
const VIEW_W = 1920;
const VIEW_H = 300;
const PERIOD = 1180;
const AMP = 55;
const MID = 170;
const PHASE = 0.6;
const SLOPE = 36 / VIEW_W;
/* how much higher the band sits one period further right */
const DRIFT = SLOPE * PERIOD;
/* samples per period: aligned to the period, so every period is drawn the same */
const STEP = PERIOD / 8;
/* user units per second, as before */
const SPEED = 80;
/* a first guess at the width of one character, until the real line is measured */
const CHAR_GUESS = 31;

const centre = (x: number, mirror: boolean) => {
  const y = MID - x * SLOPE + AMP * Math.sin((x / PERIOD) * Math.PI * 2 + PHASE);
  return mirror ? VIEW_H - y : y;
};

type Pt = [number, number];

const bezierLength = (p0: Pt, c1: Pt, c2: Pt, p1: Pt) => {
  let length = 0;
  let last = p0;
  for (let i = 1; i <= 24; i++) {
    const t = i / 24;
    const u = 1 - t;
    const x = u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0];
    const y = u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1];
    length += Math.hypot(x - last[0], y - last[1]);
    last = [x, y];
  }
  return length;
};

/* Catmull-Rom through the samples from 0 to `width`, as cubic Béziers. The
   neighbours past both ends take part too, so the first and last pieces bend
   like all the others. Also returns the arc length of one period. */
function wavePath(width: number, mirror: boolean): { d: string; periodLength: number } {
  const n = Math.round(width / STEP);
  const pts: Pt[] = [];
  for (let i = -1; i <= n + 1; i++) pts.push([i * STEP, centre(i * STEP, mirror)]);
  const at = (i: number) => pts[i + 1];
  let d = `M 0 ${at(0)[1].toFixed(1)}`;
  let periodLength = 0;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    if (i < 8) periodLength += bezierLength(p1, c1, c2, p2);
  }
  return { d, periodLength };
}

/* The geometry that makes the loop seamless. The band repeats every period
   (one period on is the same curve, DRIFT higher), so sliding the whole
   drawing a whole number of periods left and DRIFT down per period shows the
   same picture again. For the text to repeat with it, a whole number of
   copies of the line must fill a whole number of periods: `textLength`
   stretches or squeezes the spacing a few percent to make that exact. */
function layout(unit: number, mirror: boolean) {
  const { periodLength } = wavePath(PERIOD, mirror);
  let best = { m: 1, n: 1, error: Infinity };
  for (let m = 1; m <= 4; m++) {
    for (let n = 1; n <= 8; n++) {
      const error = Math.abs(n * unit - m * periodLength) / (m * periodLength);
      if (error < best.error - 1e-9) best = { m, n, error };
    }
  }
  const patternX = best.m * PERIOD;
  const repeats = Math.ceil((VIEW_W + patternX) / patternX);
  const width = repeats * patternX;
  return {
    width,
    d: wavePath(width, mirror).d,
    copies: best.n * repeats,
    textLength: repeats * best.m * periodLength,
    duration: patternX / SPEED,
    dx: -(patternX / width) * 100,
    dy: ((best.m * DRIFT) / VIEW_H) * 100 * (mirror ? -1 : 1),
  };
}

/**
 * Wavy text marquee: a thick band on a sine path with a line set along it.
 * The whole drawing is wider than the box and slides as one composited layer
 * (vibe.css `vibe-ribbon-run`), so nothing is laid out or painted per frame;
 * an earlier version advanced the text's start offset every frame, which
 * re-laid-out the text on the path and repainted the band 60 times a second.
 * Still under prefers-reduced-motion. House rule: no "can" in the line.
 */
export function Ribbon({ line, mirror = false }: RibbonProps) {
  const id = useId();
  const pathId = `vibe-ribbon-path-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  const unitText = `${line.toUpperCase()} `;
  const measureRef = useRef<SVGTextElement>(null);
  /* the natural length of one copy of the line, in user units */
  const [unit, setUnit] = useState<number | null>(null);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const measure = () => {
      try {
        const length = el.getSubStringLength(0, unitText.length);
        if (length > 0) setUnit((current) => (current !== null && Math.abs(current - length) < 0.5 ? current : length));
      } catch {
        /* not rendered yet */
      }
    };
    measure();
    document.fonts.ready.then(measure);
  }, [unitText]);

  const geo = useMemo(() => layout(unit ?? CHAR_GUESS * unitText.length, mirror), [unit, unitText.length, mirror]);

  return (
    <div
      className={`vibe-ribbon${mirror ? " vibe-ribbon--mirror" : ""}`}
      aria-hidden="true"
      style={
        {
          "--ribbon-w": geo.width,
          "--ribbon-dx": `${geo.dx.toFixed(4)}%`,
          "--ribbon-dy": `${geo.dy.toFixed(4)}%`,
          "--ribbon-dur": `${geo.duration.toFixed(2)}s`,
        } as CSSProperties
      }
    >
      <svg viewBox={`0 0 ${geo.width} ${VIEW_H}`} preserveAspectRatio="xMinYMid meet" focusable="false">
        <defs>
          <path id={pathId} d={geo.d} />
        </defs>
        <use href={`#${pathId}`} className="vibe-ribbon__band" />
        <text className="vibe-ribbon__text" textLength={geo.textLength.toFixed(1)} lengthAdjust="spacing">
          <textPath href={`#${pathId}`} startOffset="0">
            {unitText.repeat(geo.copies)}
          </textPath>
        </text>
        {/* two copies of the line off the drawing, to measure one at its natural width */}
        <text ref={measureRef} className="vibe-ribbon__text" x="0" y="-1000" visibility="hidden">
          {unitText.repeat(2)}
        </text>
      </svg>
    </div>
  );
}

export default Ribbon;

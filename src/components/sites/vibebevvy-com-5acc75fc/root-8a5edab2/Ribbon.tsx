"use client";

import { useEffect, useRef } from "react";

/* One sentence, repeated along the wave. House rule: the word "can" never
   appears in copy. */
const LINE = "Health that tastes like a treat. Real fruit. Zero sugar. One job each.";
const UNIT = `${LINE.toUpperCase()} `;
const COPIES = 6;
/* user units per second; the band is drawn 1:1 at 1920 wide */
const SPEED = 80;

/* The wave's centre line: two periods across a 1920 box, drifting upward to
   the right like the reference, overshooting both edges so the band never
   shows an end. The ribbon is this path stroked thick; the text rides it. */
function wavePath(): string {
  const pts: [number, number][] = [];
  for (let x = -320; x <= 2240; x += 160) {
    const y = 170 - (x / 1920) * 36 + 55 * Math.sin((x / 1180) * Math.PI * 2 + 0.6);
    pts.push([x, y]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0]} ${p2[1].toFixed(1)}`;
  }
  return d;
}

const PATH = wavePath();

/**
 * Wavy text marquee between the variety packs and the banner: a thick
 * lavender band on a sine path with the line set along it in plum. The text's start offset
 * is advanced every frame and wraps every repeat, so the loop is seamless;
 * it pauses off-screen and stays still under prefers-reduced-motion.
 */
export function Ribbon() {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const pathRef = useRef<SVGTextPathElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    const textPath = pathRef.current;
    if (!root || !text || !textPath) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let unit = 0;
    let raf = 0;
    let visible = false;
    let last = 0;
    let offset = 0;

    const measure = () => {
      try {
        unit = text.getSubStringLength(0, UNIT.length);
      } catch {
        unit = 0;
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      if (!unit) measure();
      if (unit) {
        const dt = last ? Math.min(now - last, 100) : 0;
        offset = (offset + (dt / 1000) * SPEED) % unit;
        textPath.setAttribute("startOffset", (-offset).toFixed(2));
      }
      last = now;
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(root);
    document.fonts.ready.then(measure);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className="vibe-ribbon" aria-hidden="true">
      <svg viewBox="0 0 1920 300" preserveAspectRatio="xMinYMid slice" focusable="false">
        <defs>
          <path id="vibe-ribbon-path" d={PATH} />
        </defs>
        <use href="#vibe-ribbon-path" className="vibe-ribbon__band" />
        <text ref={textRef} className="vibe-ribbon__text">
          <textPath ref={pathRef} href="#vibe-ribbon-path" startOffset="0">
            {UNIT.repeat(COPIES)}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

export default Ribbon;

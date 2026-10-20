"use client";

import { useEffect, useId, useRef } from "react";

import { cn } from "@/lib/utils";

interface RibbonProps {
  /** the sentence set along the wave; the component sets it in capitals */
  line: string;
  /** lavender band with plum type (default), or the inverse */
  variant?: "lavender" | "plum";
  /** mirror the wave so it drifts down to the right, and run the text the other way */
  mirror?: boolean;
}

const COPIES = 6;
/* user units per second; the band is drawn 1:1 at 1920 wide */
const SPEED = 80;

/* The wave's centre line: two periods across a 1920 box, drifting upward to
   the right like the reference (or the mirror image), overshooting both
   edges so the band never shows an end. The ribbon is this path stroked
   thick; the text rides it. */
function wavePath(mirror: boolean): string {
  const sign = mirror ? -1 : 1;
  const pts: [number, number][] = [];
  for (let x = -320; x <= 2240; x += 160) {
    const y = 170 - sign * ((x / 1920) * 36) + sign * 55 * Math.sin((x / 1180) * Math.PI * 2 + 0.6);
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

const PATHS = { normal: wavePath(false), mirror: wavePath(true) };

/**
 * Wavy text marquee: a thick band on a sine path with a line set along it.
 * The text's start offset is advanced every frame and wraps every repeat, so
 * the loop is seamless; it pauses off-screen and stays still under
 * prefers-reduced-motion. House rule: no "can" in the line.
 */
export function Ribbon({ line, variant = "lavender", mirror = false }: RibbonProps) {
  const id = useId();
  const pathId = `vibe-ribbon-path-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  const unitText = `${line.toUpperCase()} `;
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
        unit = text.getSubStringLength(0, unitText.length);
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
        textPath.setAttribute("startOffset", (mirror ? offset - unit : -offset).toFixed(2));
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
  }, [mirror, unitText]);

  return (
    <div ref={rootRef} className={cn("vibe-ribbon", variant === "plum" && "vibe-ribbon--plum")} aria-hidden="true">
      <svg viewBox="0 0 1920 300" preserveAspectRatio="xMinYMid slice" focusable="false">
        <defs>
          <path id={pathId} d={mirror ? PATHS.mirror : PATHS.normal} />
        </defs>
        <use href={`#${pathId}`} className="vibe-ribbon__band" />
        <text ref={textRef} className="vibe-ribbon__text">
          <textPath ref={pathRef} href={`#${pathId}`} startOffset="0">
            {unitText.repeat(COPIES)}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

export default Ribbon;

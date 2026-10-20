"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  /** one set of items; the component repeats and clones them itself */
  children: ReactNode;
  /** live `data-speed-factor` (25 on the promo ticker): speed = sqrt(copies) × factor seconds */
  speedFactor?: number;
  /** force a fixed loop duration instead of the computed one */
  fixedSpeedSeconds?: number;
  /** `--marquee-gap` in px (24 on the live tickers) */
  gap?: number;
  direction?: "normal" | "reverse";
  className?: string;
  style?: CSSProperties;
}

/**
 * Port of the theme `marquee-component` (marquee.js):
 * 1. measure one set of items and the container, copies = ceil(container / items)
 * 2. repeat the set `copies` times inside `.marquee__content`
 * 3. clone the whole content once (aria-hidden) so the loop is seamless
 * 4. `--marquee-speed` = sqrt(copies) × speedFactor, animated by `marquee-motion`
 *    to translate3d(calc(-50% - gap/2)) (see vibe.css)
 */
export function Marquee({
  children,
  speedFactor = 25,
  fixedSpeedSeconds,
  gap = 24,
  direction = "normal",
  className,
  style,
}: MarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(1);
  const [speed, setSpeed] = useState<number | undefined>(fixedSpeedSeconds);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const items = itemsRef.current;
    if (!root || !items) return;

    const compute = () => {
      const marqueeWidth = root.clientWidth;
      const itemsWidth = items.getBoundingClientRect().width;
      const n = itemsWidth === 0 ? 1 : Math.ceil(marqueeWidth / itemsWidth);
      setCopies(n);
      if (fixedSpeedSeconds == null) setSpeed(Math.sqrt(n) * speedFactor);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(root);
    document.fonts.ready.then(compute);
    return () => ro.disconnect();
  }, [speedFactor, fixedSpeedSeconds]);

  const renderContent = (clone: boolean) => (
    <div className="marquee__content" aria-hidden={clone || undefined}>
      {Array.from({ length: copies }, (_, i) => (
        <div key={i} className="marquee__repeated-items" ref={!clone && i === 0 ? itemsRef : undefined}>
          {children}
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={cn("vibe-marquee", className)}
      style={
        {
          "--marquee-gap": `${gap}px`,
          "--marquee-direction": direction,
          "--marquee-speed": speed != null ? `${speed}s` : undefined,
          ...style,
        } as CSSProperties
      }
    >
      <div className="marquee__wrapper">
        {renderContent(false)}
        {renderContent(true)}
      </div>
    </div>
  );
}

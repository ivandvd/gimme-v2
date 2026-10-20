import type { CSSProperties } from "react";

import { Marquee } from "@/components/sites/vibebevvy-com-5acc75fc/shared/Marquee";

const PRESS_BASE = "/sites/vibebevvy-com-5acc75fc/shared/press";

/* Publication wordmarks (Wikimedia Commons SVGs) drawn as currentColor masks,
   so they all take the plum ink. `height` balances the different letterforms
   to one visual size; `aspect` comes from each file's own dimensions. */
const LOGOS = [
  { id: "vogue", label: "Vogue", aspect: 1544 / 410, height: 28 },
  { id: "wsj", label: "The Wall Street Journal", aspect: 301 / 28, height: 21 },
  { id: "marie-claire", label: "Marie Claire", aspect: 52.3929634 / 7.5997567, height: 27 },
  { id: "bazaar", label: "Harper’s Bazaar", aspect: 438 / 107, height: 34 },
  { id: "forbes", label: "Forbes", aspect: 200 / 54, height: 32 },
];

/* same band as the live light ticker: 36px padding around a 37px row, so the
   strip stays 109px tall; the gap between marks is the wide one from the
   reference */
const VARS = {
  "--vibe-mq-bg": "transparent",
  "--vibe-mq-fg": "#1f0229",
  "--vibe-mq-pad": "var(--press-pad, 36px)",
  "--marquee-gap": "clamp(60px, 12vw, 240px)",
} as CSSProperties;

/**
 * Press strip in the slot of vibebevvy.com's "Fermented, Not Forced" ticker:
 * the same marquee mechanism (measure, repeat, clone, translate), with the
 * fruit icons and label swapped for five publication wordmarks.
 */
export function PressMarquee() {
  return (
    <section className="vibe-marquee-section press-marquee w-full bg-(--vibe-bg)">
      <Marquee gap={60} style={VARS}>
        {LOGOS.map((logo) => (
          <span key={logo.id} className="press-logo-cell">
            <span
              className="press-logo"
              role="img"
              aria-label={logo.label}
              style={
                {
                  "--press-logo": `url(${PRESS_BASE}/${logo.id}.svg)`,
                  "--press-aspect": logo.aspect,
                  "--press-h": `${logo.height}px`,
                } as CSSProperties
              }
            />
          </span>
        ))}
      </Marquee>
    </section>
  );
}

export default PressMarquee;

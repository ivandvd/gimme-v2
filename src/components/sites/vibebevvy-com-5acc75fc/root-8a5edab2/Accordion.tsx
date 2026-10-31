"use client";

import { useRef } from "react";

import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import { useVibeParallax } from "@/components/sites/vibebevvy-com-5acc75fc/shared/useVibeParallax";

const PHOTO = "/sites/vibebevvy-com-5acc75fc/shared/photos/gimme-accordion-calm-film.webp";

/* approved 2026-10-19; same shape as the original ("Everything a cocktail
   should be. Nothing it usually is.") */
const HEADING = "Everything a good day needs. Nothing it doesn’t.";

interface AccordionItem {
  id: string;
  heading: string;
  body: string;
  defaultOpen?: boolean;
}

/* gimme rows, approved 2026-10-19. House rule: the word "can" never appears in copy. */
const ITEMS: AccordionItem[] = [
  {
    id: "job",
    heading: "One job each",
    body: "Energy, focus, calm, sleep, glow. Pick what you need, skip what you don’t.",
    defaultOpen: true,
  },
  {
    id: "sweet",
    heading: "Sweet, not sugary",
    body: "Real fruit does the sweet part. Zero sugar, low calorie, low carb, every single time.",
  },
  {
    id: "caffeine",
    heading: "Caffeine where it counts",
    body: "Only Energy and Focus carry it, from green tea. The other three are clean, so Calm and Sleep are safe after dark.",
  },
  {
    id: "tested",
    heading: "Tested, every batch",
    body: "Every batch is checked before it ships. No big promises, just a drink that does its job.",
  },
];

/* the theme's plus icon: on open the upright bar turns flat and the flat bar
   turns upright while fading, leaving a minus (CSS in vibe.css) */
function PlusIcon() {
  return (
    <span className="svg-wrapper icon-plus" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path className="vertical" d="M2.75 7H11.25" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path className="horizontal" d="M7 2.75L7 11.25" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/**
 * vibebevvy.com `.vibe-accordion` (pass 2, from the live CSS): a 697.5fr/675fr
 * grid from 750px, the photo in a bordered, rounded box capped at 83.34vh with
 * the "parallax" scroll effect (drift + zoom) on the image, the heading with
 * the letter-pop entrance, native <details> rows with the first one open.
 * On phones the content comes first and the photo second.
 */
export function Accordion() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  useVibeParallax(mediaRef, imageRef);

  return (
    <section className="vibe-accordion-section">
      <section className="vibe-accordion">
        <div className="vibe-accordion__inner">
          <div ref={mediaRef} className="vibe-accordion__media vibe-parallax" data-vibe-scroll-effect="parallax">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={PHOTO}
              width={1322}
              height={1190}
              sizes="(min-width: 750px) 48vw, 100vw"
              alt="A woman in orange sunglasses sipping a Gimme Calm, White Peach, in the sun"
              loading="lazy"
            />
          </div>

          <div className="vibe-accordion__content">
            <RevealOnScroll as="h2" className="vibe-accordion__heading">
              {HEADING}
            </RevealOnScroll>
            <div className="vibe-accordion__rows">
              {ITEMS.map((item) => (
                <div key={item.id} className="vibe-accordion__item">
                  <details className="details" open={item.defaultOpen}>
                    <summary className="details__header vibe-accordion__row-title">
                      {item.heading}
                      <PlusIcon />
                    </summary>
                    <div className="details-content">
                      <p className="vibe-accordion__row-body">{item.body}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Accordion;

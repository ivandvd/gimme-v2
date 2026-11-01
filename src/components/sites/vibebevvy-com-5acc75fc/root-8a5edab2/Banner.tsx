"use client";

import { useRef } from "react";

import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import { useVibeParallax } from "@/components/sites/vibebevvy-com-5acc75fc/shared/useVibeParallax";

/* His orchard shot (mango on the right third, soft foliage on the left),
   through the house grade. */
const PHOTO = "/sites/vibebevvy-com-5acc75fc/shared/photos/banner-orchard-g25.webp";

/* The paper card and the quote, in the voice of the Charlie's Organics
   reference he sent, with gimme's approved claims only (real fruit, zero
   sugar, tested every batch). The organic, pesticide and never-from-
   concentrate lines of the reference are not approved claims and stay out
   until he confirms them. House rule: the word "can" never appears in copy. */
const HEADLINE = "Real fruit. No fine print.";
const STORY = [
  "Before a gimme ends up cold in your hand, it begins somewhere a lot more earthy. In an orchard, on a branch, in the dirt. No shortcuts. Just sun, rain, and farmers who take the long way because the long way is the right way.",
  "We start with real fruit and keep it that way. Zero sugar, so there’s nothing to hide behind, and what you taste is what went in. From the tree to the fridge, we keep the chain short and the flavour full.",
  "Because the best drink you’ll ever crack open wasn’t invented in a lab. It was grown in a field. The lab is just where we test every batch.",
];
/* Certification marks, as he asked. These are third-party marks that need
   the actual certification or membership before the site goes live. */
const SEALS_BASE = "/sites/vibebevvy-com-5acc75fc/shared/seals";
const SEALS = [
  { src: `${SEALS_BASE}/fair-trade-certified.png`, alt: "Fair Trade Certified", width: 74, height: 125 },
  { src: `${SEALS_BASE}/usda-organic.svg`, alt: "USDA Organic", width: 500, height: 500 },
  { src: `${SEALS_BASE}/one-percent-for-the-planet.png`, alt: "1% for the Planet", width: 274, height: 115 },
];
const QUOTE = "“From the farm to your hand, no detours.”";

/**
 * vibebevvy.com `.vibe-banner` frame (the accordion's bordered, rounded media
 * box at 1395:750, capped at 83.34vh, with the same drift-and-zoom scroll
 * effect on the photo and 150/1440vw of air below), carrying a slightly
 * crooked cream paper card on the left and a big cream quote over the photo
 * on the right. On phones the card and the quote stack in flow and the box
 * grows to fit them.
 */
export function Banner() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  useVibeParallax(mediaRef, imageRef);

  return (
    <section className="vibe-banner-section">
      <section className="vibe-banner">
        <div className="vibe-banner__inner">
          <div
            ref={mediaRef}
            className="vibe-banner__media vibe-banner__media--story vibe-parallax"
            data-vibe-scroll-effect="parallax"
          >
            {/* served as the file itself, not through the image optimizer: its
                recompression softened the photo visibly */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imageRef} src={PHOTO} width={1704} height={923} sizes="97vw" alt="" loading="lazy" />

            <div className="vibe-banner__card">
              <RevealOnScroll as="h2" className="vibe-banner__headline">
                {HEADLINE}
              </RevealOnScroll>
              <div className="vibe-banner__text">
                {STORY.map((paragraph, index) => (
                  <RevealOnScroll key={index} as="p" className="vibe-banner__body" delay={0.1 + index * 0.1}>
                    {paragraph}
                  </RevealOnScroll>
                ))}
              </div>
              <div className="vibe-banner__seals">
                {SEALS.map((seal) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={seal.alt} className="vibe-banner__seal" src={seal.src} alt={seal.alt} width={seal.width} height={seal.height} loading="lazy" />
                ))}
              </div>
            </div>

            <RevealOnScroll as="p" className="vibe-banner__quote" delay={0.3}>
              {QUOTE}
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Banner;

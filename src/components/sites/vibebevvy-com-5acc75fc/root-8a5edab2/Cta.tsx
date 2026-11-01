"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties } from "react";

import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import { useVibeParallax } from "@/components/sites/vibebevvy-com-5acc75fc/shared/useVibeParallax";

/* His beach shot (the pair in the surf at dusk, Gimme Sleep in hand), through
   the house grade. */
const PHOTO = "/sites/vibebevvy-com-5acc75fc/shared/photos/gimme-cta-beach-4k.webp";

/* After the "For the bold, the baked, and the blissed out" reference: a
   three-beat headline, a two-line lead, two actions. House rules: the word
   "can" never appears in copy, and no fixed count of drinks (more flavours
   are coming). */
const HEADLINE = "For the early birds, the night owls, and everyone in between.";
const LEAD = "A drink for every kind of day, zero sugar in all of them. Pick yours, or let a pack do the picking.";
const PRIMARY = { label: "Shop the lineup", href: "/collections/shop-all" };
const SECONDARY = { label: "Build a pack", href: "/collections/packs" };

/**
 * Full-bleed photo call to action between the three doors and the social
 * strip: the hero's text system (display headline with the letter pop, a
 * Henrietta lead with the mask reveal, the blob button) over the photo with
 * a plum gradient for legibility, the drift-and-zoom scroll effect on the
 * photo like the accordion and banner, and an outlined cream pill as the
 * second action.
 */
export function Cta() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  useVibeParallax(mediaRef, imageRef);

  return (
    <section className="vibe-cta" aria-label={HEADLINE}>
      <div ref={mediaRef} className="vibe-cta__media">
        {/* the owner's 4K render (3840x1629, 21:9) through the optimizer at quality
            90; the picture covers a box squarer than itself, so it is drawn about
            1.2x the viewport's width on desktop, and phones show a slice of it */}
        <Image ref={imageRef} src={PHOTO} width={3840} height={1629} sizes="(max-width: 749px) 800px, 120vw" quality={90} alt="" />
        <div className="vibe-cta__overlay" aria-hidden="true" />
        <div className="vibe-cta__inner">
          <div className="vibe-cta__text">
            <RevealOnScroll as="h2" className="vibe-cta__headline">
              {HEADLINE}
            </RevealOnScroll>
            <RevealOnScroll as="p" className="vibe-cta__lead" delay={0.25}>
              {LEAD}
            </RevealOnScroll>
            <div className="vibe-cta__actions" data-vibe-pop="" style={{ "--vibe-pop-delay": "0.5s" } as CSSProperties}>
              <PillButton href={PRIMARY.href}>{PRIMARY.label}</PillButton>
              <Link href={SECONDARY.href} className="vibe-cta__link">
                {SECONDARY.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Cta;

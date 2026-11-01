"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";

const SHARED = "/sites/vibebevvy-com-5acc75fc/shared";

const HEADING = "The good stuff.";

interface Benefit {
  id: string;
  tag: string;
  title: string;
  href: string;
  image: string;
  alt: string;
}

/* Three doors, in the slot vibebevvy.com uses for cocktail recipes: health
   benefits (ingredients and what they do), sustainability (how the fruit is
   grown and what goes back to the farmers), impact (women and under-voiced
   communities; no figures, at his request). The cover images bring the
   wording; under each card a short teaser and a "Read more" lead to the
   page. The teasers are placeholders. Every door lands on the
   coming-soon page for now. House rule: the word "can" never appears in copy. */
const BENEFITS: Benefit[] = [
  {
    id: "health",
    tag: "Health benefits",
    title: "Every drink has a job to do. Here’s what’s in each one, what it does, and why we chose it.",
    href: "/pages/health-benefits",
    image: `${SHARED}/benefits/gimme-health-claims-clean.jpg`,
    alt: "A Gimme Energy, Citrus Melt, with its claims called out: B vitamins and probiotics, zero grams of added sugar, caffeine free, low calories",
  },
  {
    id: "sustainability",
    tag: "Sustainability",
    title: "Real fruit comes from real farms. Here’s how we grow it, and how we give back to the people who do.",
    href: "/pages/sustainability",
    image: `${SHARED}/benefits/gimme-sustainability-2-clean.jpg`,
    alt: "Two pairs of hands sorting freshly picked red fruit on a wooden table at a farm",
  },
  {
    id: "impact",
    tag: "Impact",
    title: "We’re on a mission to make everyday life a little brighter, and to back the women and communities who don’t always get heard. Every drink plays a part.",
    href: "/pages/impact",
    image: `${SHARED}/benefits/gimme-impact-clean.jpg`,
    alt: "Two friends laughing together on the grass in the sun, one holding a Gimme Focus",
  },
];
const MORE = "Read more";

/**
 * vibebevvy.com `.vibe-recipes` frame, rules verbatim: a hairline, the
 * centred display heading with the letter pop, three bordered rounded card
 * links with a mono tag and a title, on the page cream. No sticker. Phones get the
 * snap-scrolling row with dots.
 */
export function Benefits() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const row = rowRef.current;
    const card = row?.firstElementChild as HTMLElement | null;
    if (!row || !card) return;
    const step = card.offsetWidth + 12;
    setActive(Math.max(0, Math.min(BENEFITS.length - 1, Math.round(row.scrollLeft / step))));
  }, []);

  const goTo = (index: number) => {
    const row = rowRef.current;
    const card = row?.firstElementChild as HTMLElement | null;
    if (!row || !card) return;
    row.scrollTo({ left: index * (card.offsetWidth + 12), behavior: "smooth" });
  };

  return (
    <section className="vibe-recipes" id="benefits">
      <div className="vibe-recipes__divider" aria-hidden="true" />

      <div className="vibe-recipes__wrapper">
        <RevealOnScroll as="h2" className="vibe-recipes__heading">
          {HEADING}
        </RevealOnScroll>

        <div className="vibe-recipes__row-zone">
          <div ref={rowRef} className="vibe-recipes__row" onScroll={onScroll}>
            {BENEFITS.map((benefit) => (
              <Link key={benefit.id} href={benefit.href} className="vibe-recipes__card">
                <div className="vibe-recipes__media">
                  <Image src={benefit.image} alt={benefit.alt} fill sizes="(min-width: 750px) 31vw, 88vw" quality={85} />
                </div>
                <div className="vibe-recipes__meta">
                  <p className="vibe-recipes__tag">{benefit.tag}</p>
                  <p className="vibe-recipes__title">{benefit.title}</p>
                  <span className="vibe-recipes__more">
                    {MORE}
                    <svg viewBox="0 0 22 14" fill="none" aria-hidden="true">
                      <path d="M1 7h18M14 1l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="vibe-recipes__dots" role="tablist" aria-label="More from gimme">
            {BENEFITS.map((benefit, index) => (
              <button
                key={benefit.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Show ${benefit.tag}`}
                className={`vibe-recipes__dot${index === active ? " is-active" : ""}`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Benefits;

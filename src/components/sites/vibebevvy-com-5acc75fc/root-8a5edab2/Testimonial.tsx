"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import { SliderArrow } from "@/components/sites/vibebevvy-com-5acc75fc/shared/SliderArrow";
import type { VibeTestimonial } from "@/components/sites/vibebevvy-com-5acc75fc/shared/types";

const AVATARS = "/sites/vibebevvy-com-5acc75fc/shared/avatars";
const ICONS = "/sites/vibebevvy-com-5acc75fc/root-8a5edab2/icons";

/* gimme quotes and portraits (2026-10-20). House rule: the word "can" never
   appears in copy. A slide without `avatar` falls back to the person's initials. */
const TESTIMONIALS: VibeTestimonial[] = [
  {
    id: "priya-natarajan",
    avatar: `${AVATARS}/priya-natarajan-film.jpg`,
    quote: "Focus got me through the week. Sleep got me through Sunday.",
    author: "Priya Natarajan",
    role: "Software Engineer",
  },
  {
    id: "felix-okonkwo",
    avatar: `${AVATARS}/felix-okonkwo-film.jpg`,
    quote: "Zero sugar and it still tastes like something. Didn’t think that was allowed.",
    author: "Felix Okonkwo",
    role: "Pastry Chef",
  },
  {
    id: "elena-moreau",
    avatar: `${AVATARS}/elena-moreau-film.jpg`,
    quote: "Calm at four, Sleep at ten. My evenings finally have a plan.",
    author: "Elena Moreau",
    role: "Night-shift Nurse",
  },
  {
    id: "marcus-bell",
    avatar: `${AVATARS}/marcus-bell-film.jpg`,
    quote: "I came for the Energy. I stayed for the whole lineup.",
    author: "Marcus Bell",
    role: "Cycling Coach",
  },
  {
    id: "tomas-herrera",
    avatar: `${AVATARS}/tomas-herrera-film.jpg`,
    quote: "Gut sorted, nerves sorted. My clients get the good version of me.",
    author: "Tomás Herrera",
    role: "Barber",
  },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * vibebevvy.com `.vibe-testimonial` (pass 2, from the live CSS and markup):
 * 150px of top padding, a 1.5px rule, a stage with a scroll-snap slideshow of
 * quotes (arrows on desktop, dots that follow the scroller, wrapping at both
 * ends), and a second rule.
 */
export function Testimonial() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = TESTIMONIALS.length;

  /* the live inline script: page = round(scrollLeft / clientWidth) */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const page = Math.round(scroller.scrollLeft / Math.max(1, scroller.clientWidth));
        setActive(Math.max(0, Math.min(count - 1, page)));
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [count]);

  const goTo = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: index * scroller.clientWidth, behavior: "smooth" });
  }, []);

  /* read the current page off the scroller itself, so a click mid-scroll or
     before React has caught up still lands on the right neighbour */
  const step = useCallback(
    (direction: 1 | -1) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const page = Math.round(scroller.scrollLeft / Math.max(1, scroller.clientWidth));
      goTo((page + direction + count) % count);
    },
    [count, goTo],
  );

  return (
    <section className="vibe-testimonial-section">
      <section className="vibe-testimonial" id="reviews">
        <div className="vibe-testimonial__divider" aria-hidden="true" />
        {/* the eye doodle, as on the live section */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="vibe-testimonial__mascot" src={`${ICONS}/testimonial-mascot.svg`} width={132} height={151} alt="" aria-hidden="true" loading="lazy" />

        <div className="vibe-testimonial__stage">
          <div className="vibe-testimonial__slideshow">
            <div className="vibe-testimonial__arrows">
              <button
                type="button"
                className="vibe-testimonial__arrow vibe-testimonial__arrow--prev"
                onClick={() => step(-1)}
                aria-label="Previous quote"
              >
                <SliderArrow />
              </button>
              <button
                type="button"
                className="vibe-testimonial__arrow"
                onClick={() => step(1)}
                aria-label="Next quote"
              >
                <SliderArrow />
              </button>
            </div>

            <div ref={scrollerRef} className="vibe-testimonial__scroller" tabIndex={-1}>
              {TESTIMONIALS.map((testimonial) => (
                <div key={testimonial.id} className="vibe-testimonial__slide-wrap">
                  <div className="vibe-testimonial__slide">
                    <RevealOnScroll as="blockquote" className="vibe-testimonial__quote">
                      “{testimonial.quote}”
                    </RevealOnScroll>
                    <div className="vibe-testimonial__who">
                      {testimonial.avatar ? (
                        <span className="vibe-testimonial__pic">
                          <Image src={testimonial.avatar} alt="" width={72} height={72} />
                        </span>
                      ) : (
                        <span className="vibe-testimonial__pic vibe-testimonial__pic--initials" aria-hidden="true">
                          {initials(testimonial.author)}
                        </span>
                      )}
                      <RevealOnScroll as="p" delay={0.15} className="vibe-testimonial__author">
                        {testimonial.author}, {testimonial.role}
                      </RevealOnScroll>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="vibe-testimonial__dots">
            {TESTIMONIALS.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                className={`vibe-testimonial__dot${index === active ? " is-active" : ""}`}
                onClick={() => goTo(index)}
                aria-label={`Quote ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
              />
            ))}
          </div>
        </div>

        <div className="vibe-testimonial__divider" aria-hidden="true" />

      </section>
    </section>
  );
}

export default Testimonial;

"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { SliderArrow } from "@/components/sites/vibebevvy-com-5acc75fc/shared/SliderArrow";
import { SplitTitle } from "@/components/sites/vibebevvy-com-5acc75fc/shared/SplitTitle";

/**
 * vibe-scroll-effects.js, "hero" mode: as the hero scrolls away the photo drifts
 * down (min(scrolled·0.15, h·0.08)) and scales up (1 + progress·0.18), both
 * eased with a 0.1 lerp per frame, and the section bottom corners peel into
 * a radius of up to min(56, max(24, vw·0.028))px over the first 35% of travel.
 */
function useHeroScrollEffect(sectionRef: RefObject<HTMLElement | null>, imageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = sectionRef.current;
    const image = imageRef.current;
    if (!el || !image) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let dirty = true;
    let initialized = false;
    let y = 0;
    let scale = 1;
    let targetY = 0;
    let targetScale = 1;
    let radius = "";
    let lastTransform: string | null = null;
    let lastRadius: string | null = null;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const height = rect.height || 1;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(scrolled / height, 1);
      targetY = Math.min(scrolled * 0.15, height * 0.08);
      targetScale = 1 + progress * 0.18;
      const peel = Math.max(0, Math.min(1, -rect.top / (height * 0.35)));
      radius = (peel * Math.min(56, Math.max(24, window.innerWidth * 0.028))).toFixed(1) + "px";
    };

    const tick = () => {
      raf = 0;
      if (document.hidden || motion.matches) return;
      if (dirty) {
        dirty = false;
        measure();
      }
      let moving = false;
      if (initialized) {
        y += (targetY - y) * 0.1;
        scale += (targetScale - scale) * 0.1;
      } else {
        y = targetY;
        scale = targetScale;
      }
      if (Math.abs(targetY - y) <= 0.01 && Math.abs(targetScale - scale) <= 1e-4) {
        y = targetY;
        scale = targetScale;
      } else {
        moving = true;
      }
      const s = scale.toFixed(4);
      const transform = `translate3d(0,${y.toFixed(2)}px,0) scale3d(${s},${s},1)`;
      if (transform !== lastTransform) {
        image.style.transform = transform;
        lastTransform = transform;
      }
      if (radius !== lastRadius) {
        el.style.borderBottomLeftRadius = radius;
        el.style.borderBottomRightRadius = radius;
        lastRadius = radius;
      }
      initialized = true;
      if (moving) schedule();
    };

    const schedule = () => {
      if (!raf && !document.hidden && !motion.matches) raf = requestAnimationFrame(tick);
    };
    const invalidate = () => {
      dirty = true;
      schedule();
    };

    const restore = () => {
      image.style.transform = "";
      el.style.borderBottomLeftRadius = "";
      el.style.borderBottomRightRadius = "";
      initialized = false;
      lastTransform = null;
      lastRadius = null;
    };
    const onMotion = () => {
      if (motion.matches) {
        cancelAnimationFrame(raf);
        raf = 0;
        restore();
      } else invalidate();
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else invalidate();
    };

    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    document.fonts.ready.then(invalidate);
    invalidate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
      restore();
    };
  }, [sectionRef, imageRef]);
}

const PHOTOS = "/sites/vibebevvy-com-5acc75fc/shared/photos";

/* Hero slideshow: each photo carries its own headline and subhead; the copy
   crossfades with the photo and replays the letter-pop entrance. All files
   are 1916x981 (extended at the top so the subject meets the ticker) and
   graded with scripts/grade-photo.py. --pos-m frames phones, --pos-d 750px up. */
const HERO_SLIDES = [
  {
    src: `${PHOTOS}/gimme-hero-pool-2.webp`,
    posMobile: "25% 50%",
    posDesktop: "50% 50%",
    headline: "Sip happens.",
    subhead: "A drink for every kind of day.",
  },
  {
    src: `${PHOTOS}/gimme-hero-car.webp`,
    posMobile: "55% 50%",
    posDesktop: "50% 50%",
    headline: "Stay golden.",
    subhead: "A drink for the long way home.",
  },
  {
    src: `${PHOTOS}/gimme-hero-focus.webp`,
    posMobile: "50% 50%",
    posDesktop: "50% 50%",
    headline: "Lock in.",
    subhead: "A drink for the deep work hours.",
  },
];
const SLIDE_MS = 9000;
/* the second and third photos are fetched once the first is in (or after this long) */
const WARM_MS = 2500;

const HERO_VARS = {
  "--vibe-hero-overlay": "#000000",
  "--vibe-hero-overlay-opacity": "0.2",
  "--vibe-hero-text": "#fff1e7",
  "--vibe-hero-pad-top": "0px",
  "--vibe-hero-pad-bottom": "0px",
} as CSSProperties;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  useHeroScrollEffect(sectionRef, imageRef);
  const count = HERO_SLIDES.length;
  const [active, setActive] = useState(0);
  const [round, setRound] = useState(0);
  const textRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mounted = useRef(false);
  /* only the first photo is in the HTML (preloaded, the page's largest paint);
     the others mount once it has loaded, so they never compete with it */
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setWarm(true), WARM_MS);
    return () => window.clearTimeout(id);
  }, []);

  /* arrows: change the slide and restart the countdown */
  const goTo = useCallback(
    (index: number) => {
      setActive(((index % count) + count) % count);
      setRound((r) => r + 1);
    },
    [count],
  );

  /* advance the slideshow; stays on the first photo under reduced motion */
  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [count, round]);

  /* replay the entrance on the incoming copy: drop `is-in` with transitions
     off, then put it back so the chars pop and the subhead slides again */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const block = textRefs.current[active];
    if (!block) return;
    const parts = block.querySelectorAll<HTMLElement>("[data-vibe-title], [data-vibe-reveal]");
    block.classList.add("is-resetting");
    parts.forEach((el) => el.classList.remove("is-in"));
    void block.offsetWidth;
    block.classList.remove("is-resetting");
    void block.offsetWidth;
    parts.forEach((el) => el.classList.add("is-in"));
  }, [active]);

  return (
    <section className="vibe-hero-section">
      <section
        ref={sectionRef}
        className="vibe-hero"
        data-vibe-scroll-effect="hero"
        data-vibe-parallax=""
        style={HERO_VARS}
      >
        <div ref={imageRef} className="vibe-hero__bgs">
          {HERO_SLIDES.map((slide, index) =>
            index === 0 || warm ? (
              <Image
                key={slide.src}
                src={slide.src}
                alt=""
                fill
                sizes="100vw"
                quality={90}
                priority={index === 0}
                onLoad={index === 0 ? () => setWarm(true) : undefined}
                className={`vibe-hero__bg${index === active ? " is-active" : ""}`}
                style={{ "--pos-m": slide.posMobile, "--pos-d": slide.posDesktop } as CSSProperties}
              />
            ) : null,
          )}
        </div>
        <div className="vibe-hero__overlay" />

        <div className="vibe-hero__inner">
          <div className="vibe-hero__text">
            {HERO_SLIDES.map((slide, index) => (
              <div
                key={slide.src}
                ref={(el) => {
                  textRefs.current[index] = el;
                }}
                className={`vibe-hero__text-slide${index === active ? " is-current" : ""}`}
                aria-hidden={index !== active}
              >
                <h1 className="vibe-hero__headline" data-vibe-title="" aria-label={slide.headline}>
                  <SplitTitle text={slide.headline} />
                </h1>
                <p
                  className="vibe-hero__subhead"
                  data-vibe-reveal=""
                  style={{ "--vibe-reveal-delay": "0.15s" } as CSSProperties}
                >
                  <span className="vibe-reveal__inner">{slide.subhead}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="vibe-hero__cta-row" data-vibe-pop="" style={{ "--vibe-pop-delay": "0.55s" } as CSSProperties}>
            <PillButton href="/collections/all" className="vibe-hero__cta">
              Shop Now
            </PillButton>
          </div>
        </div>

        {count > 1 ? (
          <div className="vibe-hero__arrows">
            <button
              type="button"
              className="vibe-hero__arrow vibe-hero__arrow--prev"
              onClick={() => goTo(active - 1)}
              aria-label="Previous photo"
            >
              <SliderArrow />
            </button>
            <button type="button" className="vibe-hero__arrow" onClick={() => goTo(active + 1)} aria-label="Next photo">
              <SliderArrow />
            </button>
          </div>
        ) : null}
      </section>
    </section>
  );
}

export default Hero;

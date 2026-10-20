"use client";

import { useEffect, type RefObject } from "react";

/**
 * vibebevvy.com `vibe-scroll-effects.js`, "parallax" mode (the accordion and
 * banner photos, `[data-vibe-scroll-effect="parallax"]`): as the element
 * travels through the viewport, progress p = clamp((vh − top) / (vh + h)),
 * the image drifts by (p − .5)·.15·h and scales 1 → 1.18, both eased with a
 * 0.1 lerp per frame. Off under prefers-reduced-motion, paused while hidden.
 */
export function useVibeParallax(
  elementRef: RefObject<HTMLElement | null>,
  imageRef: RefObject<HTMLImageElement | null>,
) {
  useEffect(() => {
    const el = elementRef.current;
    const image = imageRef.current;
    if (!el || !image) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let dirty = true;
    let initialized = false;
    let visible = true;
    let y = 0;
    let scale = 1;
    let targetY = 0;
    let targetScale = 1;
    let lastTransform: string | null = null;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const height = rect.height || 1;
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + height)));
      targetY = (progress - 0.5) * 0.15 * height;
      targetScale = 1 + progress * 0.18;
    };

    const tick = () => {
      raf = 0;
      if (document.hidden || motion.matches || !visible) return;
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
      initialized = false;
      lastTransform = null;
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

    const intersection = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
        });
        invalidate();
      },
      { rootMargin: "20% 0px" },
    );
    intersection.observe(el);
    const resize = new ResizeObserver(invalidate);
    resize.observe(el);

    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    document.fonts.ready.then(invalidate);
    invalidate();

    return () => {
      cancelAnimationFrame(raf);
      intersection.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
      restore();
    };
  }, [elementRef, imageRef]);
}

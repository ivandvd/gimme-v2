"use client";

import { useEffect } from "react";

/**
 * vibebevvy.com entrance runner, ported from the live inline script.
 *
 * - `[data-vibe-title]`  → `.is-in` once in view (chars pop; the split is rendered by <SplitTitle>)
 * - `[data-vibe-reveal]` → `.is-in` once in view (mask slide of `.vibe-reveal__inner`)
 * - `[data-vibe-pop]`    → `.is-in` once in view (whole-element scale pop, full-viewport margin)
 * - `[data-vibe-wipe]`   → a `.vibe-wipe-mask` curtain scrubbed to scroll:
 *                          p = clamp((0.7·vh − top) / (0.7·vh)), translateY(p·200%) rotate(p·−10deg)
 *
 * Hidden initial states are pure CSS, so nothing flashes while the loader plays;
 * only the reveals wait for `vibe:loader-done` (or a 4.5s failsafe) when
 * <html> carries `vibe-loading`.
 */
export function VibeEntrances() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wipes: HTMLElement[] = [];
    const masks = new WeakMap<HTMLElement, HTMLSpanElement>();
    const lastP = new WeakMap<HTMLElement, number>();
    const observed = new WeakSet<Element>();
    let wipeRaf: number | null = null;
    let armed = false;
    let textIO: IntersectionObserver | null = null;
    let popIO: IntersectionObserver | null = null;

    function updateWipes() {
      wipeRaf = null;
      const start = window.innerHeight * 0.7;
      const positions = wipes.map((el) => {
        const p = (start - el.getBoundingClientRect().top) / start;
        return Math.max(0, Math.min(1, p));
      });
      wipes.forEach((el, i) => {
        const p = positions[i];
        if (p === lastP.get(el)) return;
        lastP.set(el, p);
        const mask = masks.get(el);
        if (mask) mask.style.transform = `translate3d(0,${(p * 200).toFixed(2)}%,0) rotate(${(p * -10).toFixed(2)}deg)`;
      });
    }
    function scheduleWipes() {
      if (wipeRaf !== null || !wipes.length) return;
      wipeRaf = requestAnimationFrame(updateWipes);
    }

    function prepare() {
      if (reduced) return;
      document.querySelectorAll<HTMLElement>("[data-vibe-wipe]").forEach((el) => {
        if (masks.has(el)) return;
        if (getComputedStyle(el).position === "static") el.style.position = "relative";
        // reuse a mask left by a previous run (React strict-mode remount) instead of stacking another
        let mask = el.querySelector<HTMLSpanElement>(":scope > .vibe-wipe-mask");
        if (!mask) {
          mask = document.createElement("span");
          mask.className = "vibe-wipe-mask";
          mask.setAttribute("aria-hidden", "true");
          el.appendChild(mask);
        }
        masks.set(el, mask);
        wipes.push(el);
      });
      scheduleWipes();
    }

    function observeAll() {
      if (!armed) return;
      const texts = document.querySelectorAll("[data-vibe-title], [data-vibe-reveal]");
      const pops = document.querySelectorAll("[data-vibe-pop]");
      const t = textIO;
      const p = popIO;
      if (!t || !p) {
        texts.forEach((el) => el.classList.add("is-in"));
        pops.forEach((el) => el.classList.add("is-in"));
        return;
      }
      texts.forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        t.observe(el);
      });
      pops.forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        p.observe(el);
      });
    }

    function arm() {
      if (armed) return;
      armed = true;
      if (!reduced && "IntersectionObserver" in window) {
        const make = (margin: string) =>
          new IntersectionObserver(
            (entries, io) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("is-in");
                  io.unobserve(entry.target);
                }
              });
            },
            { rootMargin: margin },
          );
        textIO = make("0px 0px -12% 0px");
        popIO = make("0px"); // pops can sit at the very bottom edge (hero CTA) — full viewport
      }
      observeAll();
    }

    prepare();

    const docEl = document.documentElement;
    let loaderTimer: ReturnType<typeof setTimeout> | undefined;
    const go = () => arm();
    if (docEl.classList.contains("vibe-loading") && docEl.dataset.vibeLoaderDone !== "1") {
      document.addEventListener("vibe:loader-done", go, { once: true });
      loaderTimer = setTimeout(go, 4500);
    } else if (docEl.classList.contains("vibe-pt-covered")) {
      document.addEventListener("vibe:pt-revealed", go, { once: true });
      loaderTimer = setTimeout(go, 3000);
    } else {
      arm();
    }

    // late-mounted sections (client components hydrating after us) get picked up
    // here; one pass per frame however many mutations arrive
    let sweep: number | null = null;
    const mo = new MutationObserver(() => {
      if (sweep !== null) return;
      sweep = requestAnimationFrame(() => {
        sweep = null;
        prepare();
        observeAll();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", scheduleWipes, { passive: true });
    window.addEventListener("resize", scheduleWipes);

    return () => {
      mo.disconnect();
      if (sweep !== null) cancelAnimationFrame(sweep);
      document.removeEventListener("vibe:loader-done", go);
      document.removeEventListener("vibe:pt-revealed", go);
      clearTimeout(loaderTimer);
      window.removeEventListener("scroll", scheduleWipes);
      window.removeEventListener("resize", scheduleWipes);
      if (wipeRaf !== null) cancelAnimationFrame(wipeRaf);
      textIO?.disconnect();
      popIO?.disconnect();
    };
  }, []);

  return null;
}

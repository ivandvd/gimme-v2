"use client";

import { useEffect } from "react";

import { BRAND_LOGO_SRC } from "./BrandLogo";
import { LOADER_SCRIBBLE_PATH } from "./loaderArtwork";

/**
 * vibebevvy.com page intro, ported from the live inline loader script.
 *
 * Gate: an inline head script (see app/layout.tsx) adds `vibe-loading` to <html>
 * once per session (sessionStorage `vibe-loader-seen`). CSS paints a solid
 * lavender cover (`html.vibe-loading::after`) until this component builds the
 * loader DOM and adds `vibe-loader-live`.
 *
 * Timeline: hold 0.25s, then a 2s unwind of a scribble stroke (Power2.easeInOut
 * on dash offset, custom cubic on stroke width 31% → 8% of the viewBox normal);
 * the solid fill fades out over the first 18% of the unwind, the logo hides at
 * 0.95s, the nav glide (`vibe-compose`) starts at 50%, `vibe:loader-done` fires
 * 250ms later, and the state classes clear 1.1s after the loader is removed.
 */
export function VibeLoader() {
  useEffect(() => {
    const docEl = document.documentElement;

    if (!docEl.classList.contains("vibe-loading")) {
      docEl.dataset.vibeLoaderDone = "1";
      document.dispatchEvent(new CustomEvent("vibe:loader-done"));
      return;
    }

    try {
      sessionStorage.setItem("vibe-loader-seen", "1");
    } catch {
      /* storage unavailable */
    }

    function bezier(x1: number, y1: number, x2: number, y2: number) {
      const f = (t: number, a: number, b: number) => {
        const u = 1 - t;
        return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
      };
      return (x: number) => {
        let t = x;
        for (let i = 0; i < 5; i++) {
          const cx = f(t, x1, x2) - x;
          const dx = 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
          if (Math.abs(dx) < 1e-6) break;
          t -= cx / dx;
          t = Math.max(0, Math.min(1, t));
        }
        return f(t, y1, y2);
      };
    }
    const power2InOut = bezier(0.645, 0.045, 0.355, 1); // GSAP Power2.easeInOut
    const scribbleEase = bezier(0.75, 0.15, 0.15, 1); // the custom scribble cubic

    const wrap = document.createElement("div");
    wrap.className = "vibe-loader";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML =
      '<div class="vibe-loader__fill"></div>' +
      '<svg class="vibe-loader__scribble" viewBox="0 0 3222 3114" preserveAspectRatio="none">' +
      `<path d="${LOADER_SCRIBBLE_PATH}"/>` +
      "</svg>" +
      '<span class="vibe-loader__logo">' +
      `<img src="${BRAND_LOGO_SRC}" alt="" width="1767" height="599" decoding="sync">` +
      "</span>";
    document.body.appendChild(wrap);
    docEl.classList.add("vibe-loader-live");

    const path = wrap.querySelector("path") as SVGPathElement;
    const fill = wrap.querySelector(".vibe-loader__fill") as HTMLElement;
    const logo = wrap.querySelector(".vibe-loader__logo") as HTMLElement;
    const L = path.getTotalLength();
    path.style.strokeDasharray = `${L} ${L}`;
    path.style.strokeDashoffset = "0";

    // stroke widths: 31% / 8% of the viewBox normal (~3168 units)
    const NORM = Math.sqrt((3222 * 3222 + 3114 * 3114) / 2);
    const W_FULL = NORM * 0.31;
    const W_END = NORM * 0.08;
    path.style.strokeWidth = String(W_FULL);

    const DELAY = 0.25;
    const DUR = 2;
    const t0 = performance.now();
    let done = false;
    let disposed = false;
    let entrancesFired = false;
    let raf = 0;
    let composeTimer: ReturnType<typeof setTimeout> | undefined;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;

    function finish() {
      wrap.remove();
      document.dispatchEvent(new CustomEvent("vibe:loader-done"));
      // keep ALL state classes until the nav glide completes
      clearTimer = setTimeout(() => {
        docEl.classList.remove("vibe-loading");
        docEl.classList.remove("vibe-compose");
        docEl.classList.remove("vibe-loader-live");
      }, 1100);
    }

    function fireEntrances() {
      if (entrancesFired) return;
      entrancesFired = true;
      docEl.classList.add("vibe-compose"); // nav first…
      composeTimer = setTimeout(() => {
        // the flag lets a runner that mounts after this moment (late hydration) arm immediately
        docEl.dataset.vibeLoaderDone = "1";
        document.dispatchEvent(new CustomEvent("vibe:loader-done")); // …then the text entrances a beat later
      }, 250);
    }

    function frame(now: number) {
      if (done || disposed) return;
      const t = (now - t0) / 1000 - DELAY;
      if (t < 0) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const p = Math.min(t / DUR, 1);
      path.style.strokeDashoffset = String(-L * power2InOut(p));
      path.style.strokeWidth = String(W_FULL + (W_END - W_FULL) * scribbleEase(p));
      fill.style.opacity = String(Math.max(0, 1 - p / 0.18));
      if (t >= 0.95) logo.style.opacity = "0";
      if (p >= 0.5) fireEntrances();
      if (p < 1) raf = requestAnimationFrame(frame);
      else {
        done = true;
        finish();
      }
    }
    raf = requestAnimationFrame(frame);

    // failsafe: the page is never stuck behind the loader
    const failsafe = setTimeout(() => {
      if (!done && !disposed) {
        done = true;
        finish();
      }
    }, 4000);

    return () => {
      // React strict-mode re-run: tear down this instance only; the next run rebuilds it
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      clearTimeout(composeTimer);
      if (!done) wrap.remove();
      else if (clearTimer) {
        clearTimeout(clearTimer);
        docEl.classList.remove("vibe-loading", "vibe-compose", "vibe-loader-live");
      }
    };
  }, []);

  return null;
}

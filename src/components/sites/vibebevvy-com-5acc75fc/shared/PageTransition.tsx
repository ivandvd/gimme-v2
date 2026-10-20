"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/* vibebevvy.com's morphing page transition (the inline "vibe-mpt" script),
   ported to client-side navigation. A 200vh lavender mover (a solid block
   plus an SVG wave whose path morphs between these two shapes) slides across
   the viewport in 1100ms: on a link click it rises from the bottom and
   covers the page, the route changes underneath, then it slides up and away. */
const PATH_FROM =
  "M -44,-50 C -52.71,28.52 15.86,8.186 184,14.69 383.3,22.39 462.5,12.58 638,14 835.5,15.6 987,6.4 1194,13.86 1661,30.68 1652,-36.74 1582,-140.1 1512,-243.5 15.88,-589.5 -44,-50 Z";
const PATH_TO =
  "M -44,-50 C -137.1,117.4 67.86,445.5 236,452 435.3,459.7 500.5,242.6 676,244 873.5,245.6 957,522.4 1154,594 1593,753.7 1793,226.3 1582,-126 1371,-478.3 219.8,-524.2 -44,-50 Z";
const DUR = 1100;
const MORPH_STEPS = 132;
const FLAG = "vibe-pt";

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeInQuad = (t: number) => t * t;
const easeOutQuad = (t: number) => t * (2 - t);

let frames: string[] | null = null;

/* the morph as fixed keyframes, one per 120Hz frame, with the shape progress
   eased into each; building path strings per frame drops frames */
function pathFrames(): string[] {
  if (frames) return frames;
  const numRe = /-?\d*\.?\d+/g;
  const from = (PATH_FROM.match(numRe) ?? []).map(Number);
  const to = (PATH_TO.match(numRe) ?? []).map(Number);
  const template = PATH_FROM.replace(numRe, "@");
  const canMorph = from.length === to.length;
  const out: string[] = [];
  for (let s = 0; s <= MORPH_STEPS; s++) {
    const p = easeOutQuad(s / MORPH_STEPS);
    if (!canMorph) {
      out.push(PATH_FROM);
      continue;
    }
    let i = 0;
    out.push(
      template.replace(/@/g, () => {
        const v = from[i] + (to[i] - from[i]) * p;
        i++;
        return v.toFixed(2);
      }),
    );
  }
  frames = out;
  return out;
}

function buildLayer(exit: boolean): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.className = "vibe-mpt is-active" + (exit ? " vibe-mpt--exit" : "");
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML =
    '<div class="vibe-mpt__mover">' +
    '<div class="vibe-mpt__solid"></div>' +
    '<svg class="vibe-mpt__wave" viewBox="0 0 1440 800" preserveAspectRatio="none"><path d="' +
    PATH_FROM +
    '"/></svg>' +
    "</div>";
  document.body.appendChild(wrap);
  return wrap;
}

/* one 1100ms pass; slide 0 = covering the viewport, 1 = fully away */
function play(layer: HTMLDivElement, slideFrom: number, slideTo: number, done: () => void) {
  const mover = layer.querySelector<HTMLElement>(".vibe-mpt__mover");
  const wave = layer.querySelector<SVGElement>(".vibe-mpt__wave");
  const path = layer.querySelector<SVGPathElement>("path");
  if (!mover || !wave || !path) {
    done();
    return;
  }
  const keyframes = pathFrames();
  mover.style.transform = `translate3d(0,${-200 * slideFrom}vh,0)`;
  const t0 = performance.now();
  let lastStep = -1;
  const frame = (now: number) => {
    const t = Math.min((now - t0) / DUR, 1);
    const slide = slideFrom + (slideTo - slideFrom) * easeInOutSine(t);
    mover.style.transform = `translate3d(0,${-200 * slide}vh,0)`;
    const s = t < 0.5 ? 0.8 + (1.8 - 0.8) * easeInQuad(t / 0.5) : 1.8 + (1 - 1.8) * easeOutQuad((t - 0.5) / 0.5);
    wave.style.transform = `scaleY(${s.toFixed(4)})`;
    const step = Math.round(t * MORPH_STEPS);
    if (step !== lastStep) {
      lastStep = step;
      path.setAttribute("d", keyframes[step]);
    }
    if (t < 1) requestAnimationFrame(frame);
    else done();
  };
  requestAnimationFrame(frame);
}

function clearFlag() {
  try {
    sessionStorage.removeItem(FLAG);
  } catch {
    /* storage unavailable */
  }
}

/* the covered page slides open; entrances fire 500ms in, as on the live site */
function reveal(onRevealed?: () => void) {
  const docEl = document.documentElement;
  docEl.classList.add("vibe-pt-js");
  const layer = buildLayer(false);
  let revealed = false;
  const done = () => {
    if (revealed) return;
    revealed = true;
    docEl.classList.remove("vibe-pt-covered");
    document.dispatchEvent(new CustomEvent("vibe:pt-revealed"));
    onRevealed?.();
  };
  play(layer, 0, 1, () => {
    done();
    layer.remove();
  });
  window.setTimeout(done, 500);
  window.setTimeout(() => layer.remove(), 2600);
}

interface Pending {
  covered: boolean;
  arrived: boolean;
  finished: boolean;
  layer: HTMLDivElement;
}

/**
 * Mounted once in the root layout. Intercepts same-origin link clicks, covers
 * the page with the wave, pushes the route, and reveals once both the cover
 * and the new page are in. `html.vibe-pt-covered` holds the entrances (see
 * VibeEntrances) until `vibe:pt-revealed`. A hard-load arrival flagged by the
 * previous page (sessionStorage) is covered by the layout's inline script
 * before paint and revealed here on mount.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<Pending | null>(null);
  const lastPath = useRef(pathname);

  /* runs when the route lands; the cover is always complete by then */
  const settle = (p: Pending) => {
    if (p.finished || !p.covered || !p.arrived) return;
    p.finished = true;
    pending.current = null;
    clearFlag();
    reveal();
    p.layer.remove();
  };

  /* the route landed */
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    const p = pending.current;
    if (p) {
      p.arrived = true;
      settle(p);
    } else {
      clearFlag();
    }
  });

  /* first mount: a flagged hard-load arrival */
  useEffect(() => {
    const docEl = document.documentElement;
    let flagged = false;
    try {
      flagged = sessionStorage.getItem(FLAG) === "1";
    } catch {
      /* storage unavailable */
    }
    clearFlag();
    docEl.classList.add("vibe-pt-js");
    if (docEl.classList.contains("vibe-loading")) {
      docEl.classList.remove("vibe-pt-covered");
      return;
    }
    if (flagged || docEl.classList.contains("vibe-pt-covered")) {
      docEl.classList.add("vibe-pt-covered");
      reveal();
    }
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      clearFlag();
      docEl.classList.remove("vibe-pt-covered");
      document.querySelectorAll(".vibe-mpt").forEach((el) => el.remove());
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  /* link clicks */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const docEl = document.documentElement;

    const onClick = (event: MouseEvent) => {
      if (pending.current || event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      /* a released drag inside a carousel is not a click */
      const swiperEl = anchor.closest(".swiper") as (HTMLElement & { swiper?: { allowClick?: boolean } }) | null;
      if (swiperEl?.swiper && swiperEl.swiper.allowClick === false) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      try {
        sessionStorage.setItem(FLAG, "1");
      } catch {
        /* storage unavailable */
      }
      docEl.classList.add("vibe-pt-covered");
      const state: Pending = { covered: false, arrived: false, finished: false, layer: buildLayer(true) };
      pending.current = state;
      const destination = url.pathname + url.search + url.hash;
      /* warm the route while the wave rises; the page itself only changes once
         the viewport is fully covered, so the destination is never seen early */
      router.prefetch(destination);
      play(state.layer, 1, 0, () => {
        state.covered = true;
        router.push(destination);
      });
      /* failsafe: if the route never lands, let go of the page */
      window.setTimeout(() => {
        if (state.finished) return;
        state.finished = true;
        pending.current = null;
        clearFlag();
        state.layer.remove();
        docEl.classList.remove("vibe-pt-covered");
        document.dispatchEvent(new CustomEvent("vibe:pt-revealed"));
      }, 6000);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}

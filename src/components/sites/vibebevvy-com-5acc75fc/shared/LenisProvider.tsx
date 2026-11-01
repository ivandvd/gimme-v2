"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

const NESTED =
  'dialog, .vibe-cart, .vibe-search, .vibe-account, .vibe-overlay, .menu-drawer, .menu-drawer__submenu, .vibe-mm__body, .localization-form__list, .country-selector-form__wrapper, textarea, select, [contenteditable="true"]';

/**
 * vibebevvy.com smooth scroll (vibe-smooth-scroll.js): Lenis with lerp 0.1,
 * wheel only, no touch sync, enabled only for fine pointers without
 * reduced-motion. The live site scrolls its `.page-wrapper` on desktop; here
 * the window scrolls, which is visually identical and keeps sticky/fixed
 * elements relative to the viewport.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let lenis: Lenis | null = null;
    let frame = 0;

    /* Lenis's own loop (autoRaf) would run every frame for the life of the
       page and keep the renderer in a per-frame commit even when nothing
       moves. This one runs only while a scroll is in flight: woken by input,
       it stops once Lenis reports the scroll settled. The clock is reset on
       waking so the first frame after a pause is a normal step, not a jump
       to the target. */
    const loop = (time: number) => {
      frame = 0;
      if (!lenis) return;
      lenis.raf(time);
      if (lenis.isScrolling || lenis.targetScroll !== lenis.animatedScroll) frame = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (frame || !lenis) return;
      lenis.time = performance.now();
      frame = requestAnimationFrame(loop);
    };

    const destroy = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lenis?.destroy();
      lenis = null;
    };
    const configure = () => {
      destroy();
      if (reduced.matches || !finePointer.matches) return;
      lenis = new Lenis({
        autoRaf: false,
        smoothWheel: true,
        lerp: 0.1,
        syncTouch: false,
        anchors: false,
        prevent: (node) => node.matches(NESTED),
        virtualScroll: ({ deltaX, deltaY, event }) => !event.ctrlKey && Math.abs(deltaY) >= Math.abs(deltaX),
      });
      lenis.on("virtual-scroll", wake);
    };
    const cancelInertia = () => {
      if (lenis && !lenis.isStopped) lenis.scrollTo(lenis.actualScroll, { immediate: true });
    };
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"].includes(event.key)) {
        const t = event.target as Element | null;
        if (!t?.closest('input, textarea, select, [contenteditable="true"]')) cancelInertia();
      }
    };

    configure();
    reduced.addEventListener("change", configure);
    finePointer.addEventListener("change", configure);
    document.addEventListener("keydown", onKey, { capture: true });
    document.addEventListener("pointerdown", cancelInertia, { passive: true, capture: true });
    window.addEventListener("popstate", cancelInertia);

    return () => {
      reduced.removeEventListener("change", configure);
      finePointer.removeEventListener("change", configure);
      document.removeEventListener("keydown", onKey, { capture: true });
      document.removeEventListener("pointerdown", cancelInertia, { capture: true });
      window.removeEventListener("popstate", cancelInertia);
      destroy();
    };
  }, []);

  return <div className="page-wrapper">{children}</div>;
}

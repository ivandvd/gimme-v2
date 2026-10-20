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

    const destroy = () => {
      lenis?.destroy();
      lenis = null;
    };
    const configure = () => {
      destroy();
      if (reduced.matches || !finePointer.matches) return;
      lenis = new Lenis({
        autoRaf: true,
        smoothWheel: true,
        lerp: 0.1,
        syncTouch: false,
        anchors: false,
        prevent: (node) => node.matches(NESTED),
        virtualScroll: ({ deltaX, deltaY, event }) => !event.ctrlKey && Math.abs(deltaY) >= Math.abs(deltaX),
      });
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

import { cn } from "@/lib/utils";
import { PRODUCTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/products";
import { SliderArrow } from "@/components/sites/vibebevvy-com-5acc75fc/shared/SliderArrow";

/* Left column, after the live panel (Bevvies / Merch / Shop All). */
const LINKS = [
  { label: "Drinks", href: "/collections/drinks" },
  { label: "Variety Packs", href: "/collections/packs" },
];
const BOTTOM_LINK = { label: "Shop All", href: "/collections/shop-all" };
/* tiles across, like the live panel; the rest scroll in with the arrows */
const COLS = 4;

interface MegaMenuProps {
  open: boolean;
  /** viewport y of the header's bottom edge, measured when the panel opens */
  top: number;
  panelRef: RefObject<HTMLDivElement | null>;
}

/**
 * vibebevvy.com's desktop Products panel (`.vibe-mega`, rules verbatim): a
 * fixed cream sheet under the header bar with a 1.5px plum rule, the
 * collection links in display type on the left and a row of product tiles
 * (290:420, rounded, the on-ice shots) with their names. Four tiles show at
 * once; the theme's hand-drawn arrows page the row through all seven. Hover
 * behaviour lives in Header.tsx. Hidden under 750px, where the drawer takes over.
 */
export function MegaMenu({ open, top, panelRef }: MegaMenuProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const index = useRef(0);
  const busyUntil = useRef(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const step = (row: HTMLElement) => {
    const tile = row.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    return tile ? tile.offsetWidth + gap : 0;
  };

  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    const s = step(row);
    if (s && Date.now() > busyUntil.current) index.current = Math.round(row.scrollLeft / s);
    setEdges({ start: row.scrollLeft <= 2, end: row.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => ro.disconnect();
  }, [measure]);

  const page = (direction: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;
    const s = step(row);
    if (!s) return;
    const last = Math.max(0, PRODUCTS.length - COLS);
    index.current = Math.max(0, Math.min(last, index.current + direction));
    busyUntil.current = Date.now() + 700;
    /* arrows reflect the target right away, not when the scroll lands */
    setEdges({ start: index.current === 0, end: index.current === last });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollTo({ left: index.current * s, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div
      ref={panelRef}
      className={cn("vibe-mega", open && "is-open")}
      style={{ top, "--vm-cols": COLS } as CSSProperties}
      inert={!open}
    >
      <div className="vibe-mega__inner">
        <nav className="vibe-mega__links" aria-label="Products">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="vibe-mega__link">
              {link.label}
            </Link>
          ))}
          <Link href={BOTTOM_LINK.href} className="vibe-mega__link vibe-mega__link--bottom">
            {BOTTOM_LINK.label}
          </Link>
        </nav>

        <div className="vibe-mega__row">
          <div ref={rowRef} className="vibe-mega__tiles" onScroll={measure}>
            {PRODUCTS.map((product) => (
              <Link key={product.slug} href={`/products/${product.slug}`} className="vibe-mega__tile">
                <span className="vibe-mega__tile-media">
                  <Image
                    src={product.hoverImage ?? product.primaryImage}
                    alt=""
                    fill
                    sizes="(min-width: 750px) 19vw, 50vw"
                    draggable={false}
                  />
                </span>
                <span className="vibe-mega__tile-title">{product.name}</span>
              </Link>
            ))}
          </div>
          <button
            type="button"
            className="vibe-mega__arrow vibe-mega__arrow--prev"
            aria-label="Previous drinks"
            disabled={edges.start}
            onClick={() => page(-1)}
          >
            <SliderArrow />
          </button>
          <button
            type="button"
            className="vibe-mega__arrow vibe-mega__arrow--next"
            aria-label="More drinks"
            disabled={edges.end}
            onClick={() => page(1)}
          >
            <SliderArrow />
          </button>
        </div>
      </div>
    </div>
  );
}

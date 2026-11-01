"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

import { cn } from "@/lib/utils";
import { PACKS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/packs";
import { PRODUCTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/products";
import { SliderArrow } from "@/components/sites/vibebevvy-com-5acc75fc/shared/SliderArrow";
import { SUPPLEMENTS } from "@/components/sites/vibebevvy-com-5acc75fc/shared/supplements";

interface Tile {
  key: string;
  href: string;
  image: string;
  name: string;
  /** a square picture shown whole on the cream, not cropped to the tile */
  contain?: boolean;
}

type GroupKey = "drinks" | "supplements" | "packs";

interface Group {
  key: GroupKey;
  label: string;
  href: string;
  tiles: Tile[];
}

/* Left column, after the live panel (Bevvies / Merch / Shop All): each name
   has its own row of tiles, shown while the name is under the pointer. The
   drinks show their on-ice shots, the softgels their studio shots. */
const GROUPS: Group[] = [
  {
    key: "drinks",
    label: "Drinks",
    href: "/collections/drinks",
    tiles: PRODUCTS.map((p) => ({ key: p.slug, href: `/products/${p.slug}`, image: p.hoverImage ?? p.primaryImage, name: p.name })),
  },
  {
    key: "supplements",
    label: "Supplements",
    href: "/collections/supplements",
    tiles: SUPPLEMENTS.map((s) => ({ key: s.slug, href: `/products/${s.slug}`, image: s.tileImage ?? s.hoverImage ?? s.primaryImage, name: s.name })),
  },
  {
    key: "packs",
    label: "Variety Packs",
    href: "/collections/packs",
    tiles: PACKS.map((p) => ({ key: p.id, href: "/collections/packs", image: p.image, name: p.name, contain: true })),
  },
];
const BOTTOM_LINK = { label: "Shop All", href: "/collections/shop-all" };
/* tiles across; a group with more pages with the arrows, a smaller one leaves room */
const COLS = 5;

interface MegaMenuProps {
  open: boolean;
  /** viewport y of the header's bottom edge, measured when the panel opens */
  top: number;
  panelRef: RefObject<HTMLDivElement | null>;
}

/**
 * vibebevvy.com's desktop Products panel (`.vibe-mega`, rules verbatim): a
 * fixed cream sheet under the header bar with a 1.5px plum rule, the
 * collection names in display type on the left and a row of product tiles
 * (290:420, rounded) with their names. Hovering a name shows that group's
 * tiles (the drinks when the panel opens); the theme's hand-drawn arrows
 * page a row wider than five. Open/close behaviour lives in Header.tsx.
 * Hidden under 750px, where the drawer takes over.
 */
export function MegaMenu({ open, top, panelRef }: MegaMenuProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const index = useRef(0);
  /* a timer while a paging scroll is in flight, so measure() leaves the
     target index alone until it lands */
  const busy = useRef(0);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [active, setActive] = useState<GroupKey>("drinks");
  /* every opening starts on the drinks (state adjusted as the prop changes,
     during render, as React's docs have it) */
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setActive("drinks");
      setEdges({ start: true, end: true });
    }
  }
  const group = GROUPS.find((g) => g.key === active) ?? GROUPS[0];

  /* a new group starts at its first tile; five always fit, so only a group
     with more than five tiles has a page to the right */
  const select = (g: Group) => {
    if (g.key === active) return;
    index.current = 0;
    window.clearTimeout(busy.current);
    busy.current = 0;
    rowRef.current?.scrollTo({ left: 0, behavior: "auto" });
    setActive(g.key);
    setEdges({ start: true, end: g.tiles.length <= COLS });
  };

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
    if (s && !busy.current) index.current = Math.round(row.scrollLeft / s);
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
    const last = Math.max(0, group.tiles.length - COLS);
    index.current = Math.max(0, Math.min(last, index.current + direction));
    window.clearTimeout(busy.current);
    busy.current = window.setTimeout(() => {
      busy.current = 0;
    }, 700);
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
          {GROUPS.map((g) => (
            <Link
              key={g.key}
              href={g.href}
              className={cn("vibe-mega__link", g.key === active && "is-active")}
              onMouseEnter={() => select(g)}
              onFocus={() => select(g)}
            >
              {g.label}
            </Link>
          ))}
          <Link href={BOTTOM_LINK.href} className="vibe-mega__link vibe-mega__link--bottom">
            {BOTTOM_LINK.label}
          </Link>
        </nav>

        <div className="vibe-mega__row">
          <div ref={rowRef} className="vibe-mega__tiles" onScroll={measure}>
            {group.tiles.map((tile, i) => (
              <Link
                key={`${group.key}-${tile.key}`}
                href={tile.href}
                className={cn("vibe-mega__tile", tile.contain && "vibe-mega__tile--contain")}
                style={{ "--i": i } as CSSProperties}
              >
                <span className="vibe-mega__tile-media">
                  <Image src={tile.image} alt="" fill sizes="(min-width: 750px) 15vw, 50vw" quality={85} draggable={false} />
                </span>
                <span className="vibe-mega__tile-title">{tile.name}</span>
              </Link>
            ))}
          </div>
          <button
            type="button"
            className="vibe-mega__arrow vibe-mega__arrow--prev"
            aria-label="Previous products"
            disabled={edges.start}
            onClick={() => page(-1)}
          >
            <SliderArrow />
          </button>
          <button
            type="button"
            className="vibe-mega__arrow vibe-mega__arrow--next"
            aria-label="More products"
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

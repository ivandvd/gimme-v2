import { UNIT_PRICE } from "./products";
import { SUPPLEMENT_PRICE } from "./supplements";

export const PACKS_BASE = "/sites/vibebevvy-com-5acc75fc/shared/packs";

export interface PackSize {
  label: string;
  /** drinks in the pack */
  count: number;
  /** jars of softgels in the pack */
  jars?: number;
  price: number;
}

/** fixed: what is in the box is set; mix: pick your own drinks */
export type PackKind = "fixed" | "mix";

export interface Pack {
  id: string;
  kind: PackKind;
  name: string;
  /** the mono line under the name */
  contents: string;
  /** a sentence under that, for a set whose name does not say what is in it */
  blurb?: string;
  /** the card picture, and the box from another angle for the pointer */
  image: string;
  hoverImage?: string;
  alt: string;
  badge?: string;
  sizes: PackSize[];
}

/** the balanced mix a pick-your-own pack starts with, per 12 drinks, in PRODUCTS order */
export const DEFAULT_MIX = [3, 3, 2, 2, 2];

/* The packs (2026-11-01): one to try, one to live on, one set with the
   softgels in; a third set (a duo, or the softgels together) is on its way
   from the owner. The Starter Pack and the Glow Set are his renders
   (scripts/square-pack.py frames them); the Lineup's picture is a stand-in
   composed from the cut-outs (scripts/compose-pack.py) until its render
   arrives. Prices are placeholders on the ladder he agreed: the starter at
   the single price, the 12 about a tenth under, the 24 about a fifth under,
   a set about an eighth under its contents bought apart. House rule: the
   word "can" never appears in copy. */
export const PACKS: Pack[] = [
  {
    id: "starter-pack",
    kind: "fixed",
    name: "Starter Pack",
    contents: "Two of each, try all five",
    image: `${PACKS_BASE}/starter-pack.jpg`,
    hoverImage: `${PACKS_BASE}/starter-pack-angle.jpg`,
    alt: "The gimme Starter Pack: a cream carton with a lavender lid and the five drinks showing through its window",
    sizes: [{ label: "10-pack", count: 10, price: 24.99 }],
  },
  {
    id: "the-lineup",
    kind: "mix",
    name: "The Lineup",
    contents: "Your mix of the five",
    image: `${PACKS_BASE}/the-lineup-stand-in.jpg`,
    alt: "The five gimme drinks in a row, Calm in front",
    badge: "Most popular",
    sizes: [
      { label: "12-pack", count: 12, price: 26.99 },
      { label: "24-pack", count: 24, price: 49.99 },
    ],
  },
  {
    id: "glow-set",
    kind: "fixed",
    name: "Glow Set",
    contents: "6 drinks + 1 supplement",
    blurb: "Glow and Sleep drinks, with a month of Glow softgels.",
    image: `${PACKS_BASE}/glow-set.jpg`,
    hoverImage: `${PACKS_BASE}/glow-set-angle.jpg`,
    alt: "The gimme Glow Set: a pink carton of Glow and Sleep drinks with a jar of Glow softgels in a tray beside it",
    sizes: [{ label: "Glow Set", count: 6, jars: 1, price: 34.99 }],
  },
];

/** what a size's contents cost bought one by one */
export function separately(size: PackSize): number {
  return size.count * UNIT_PRICE + (size.jars ?? 0) * SUPPLEMENT_PRICE;
}

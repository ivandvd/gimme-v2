import { PRODUCTS, UNIT_PRICE } from "./products";
import { SUPPLEMENT_PRICE } from "./supplements";

export const PACKS_BASE = "/sites/vibebevvy-com-5acc75fc/shared/packs";

export interface PackSize {
  label: string;
  /** drinks in the pack */
  count: number;
  /** jars of softgels in the pack */
  jars?: number;
  price: number;
  /** a size that is a box of its own (the trio beside the duo): its own name,
      words and picture, and the pack's options do not apply to it */
  name?: string;
  contents?: string;
  blurb?: string;
  image?: string;
  hoverImage?: string;
  alt?: string;
}

/** one way a pack comes (one of the sets, or the duo's pairs), with its own
    picture and, where it differs from the pack's, its own name and words */
export interface PackOption {
  key: string;
  /** the switch's label */
  label: string;
  name?: string;
  blurb?: string;
  image: string;
  hoverImage?: string;
  alt: string;
}

/** fixed: what is in the box is set; mix: pick your own drinks */
export type PackKind = "fixed" | "mix";

export interface Pack {
  id: string;
  kind: PackKind;
  name: string;
  /** the mono line under the name */
  contents: string;
  /** a sentence under that */
  blurb: string;
  /** the card picture, and the box from another angle for the pointer */
  image: string;
  hoverImage?: string;
  /** the box on the mega menu's portrait tile (the front view, taller) */
  tileImage?: string;
  alt: string;
  badge?: string;
  /** a choice of what goes in, each with its own picture; the first is shown at rest */
  options?: PackOption[];
  optionsLabel?: string;
  sizes: PackSize[];
}

/** the mix a pick-your-own pack starts with: an even split of the five, any
    remainder going to the first flavours (ten is two of each, twenty four) */
export function defaultMix(count: number): number[] {
  const base = Math.floor(count / 5);
  const extra = count % 5;
  return PRODUCTS.map((_, i) => base + (i < extra ? 1 : 0));
}

/* The three packs (2026-11-01): the Starter Pack (ten drinks a box, an even
   split or your own mix across however many boxes), the sets (six drinks
   and a jar of softgels: Glow, Cycle Care or Daily Care) and the Supplement
   Duo (the softgels in pairs, or all three as the Trio). All the pictures
   are the owner's renders, framed by scripts/square-pack.py. Prices are
   placeholders on the ladder he agreed: the starter at the single price, a
   set or duo about an eighth under its contents bought apart, the trio a
   fifth under. House rule: the word "can" never appears in copy. */
export const PACKS: Pack[] = [
  {
    id: "starter-pack",
    kind: "mix",
    name: "Starter Pack",
    contents: "Two of each, try all five",
    blurb: "An even mix of the five to start, or set your own.",
    image: `${PACKS_BASE}/starter-pack-2.jpg`,
    hoverImage: `${PACKS_BASE}/starter-pack-angle-2.jpg`,
    tileImage: `${PACKS_BASE}/starter-pack-tile-2.jpg`,
    alt: "The gimme Starter Pack: a cream carton with a lavender lid and the five drinks showing through its window",
    badge: "Most popular",
    /* one box of ten; the quantity stepper counts boxes and the mix spans them */
    sizes: [{ label: "10-pack", count: 10, price: 24.99 }],
  },
  {
    id: "set",
    kind: "fixed",
    name: "Glow Set",
    contents: "6 drinks + 1 supplement",
    blurb: "Glow and Sleep drinks, with a month of Glow softgels.",
    image: `${PACKS_BASE}/glow-set-2.jpg`,
    hoverImage: `${PACKS_BASE}/glow-set-angle-2.jpg`,
    tileImage: `${PACKS_BASE}/glow-set-tile-2.jpg`,
    alt: "The gimme Glow Set: a pink carton of Glow and Sleep drinks with a jar of Glow softgels in a tray beside it",
    optionsLabel: "Set",
    options: [
      {
        key: "glow",
        label: "Glow",
        name: "Glow Set",
        blurb: "Glow and Sleep drinks, with a month of Glow softgels.",
        image: `${PACKS_BASE}/glow-set-2.jpg`,
        hoverImage: `${PACKS_BASE}/glow-set-angle-2.jpg`,
        alt: "The gimme Glow Set: a pink carton of Glow and Sleep drinks with a jar of Glow softgels in a tray beside it",
      },
      {
        key: "cycle-care",
        label: "Cycle Care",
        name: "Cycle Care Set",
        blurb: "Calm and Sleep drinks, with a month of PMS Relief softgels.",
        image: `${PACKS_BASE}/cycle-care-set-2.jpg`,
        hoverImage: `${PACKS_BASE}/cycle-care-set-angle-2.jpg`,
        alt: "The gimme Cycle Care Set: a pink and lilac carton of Calm and Sleep drinks with a jar of PMS Relief softgels in a tray beside it",
      },
      {
        key: "daily-care",
        label: "Daily Care",
        name: "Daily Care Set",
        blurb: "Energy, Calm and Focus drinks, with a month of Urinary Health softgels.",
        image: `${PACKS_BASE}/daily-care-set-3.jpg`,
        hoverImage: `${PACKS_BASE}/daily-care-set-angle-3.jpg`,
        alt: "The gimme Daily Care Set: a sage and orange carton of Energy, Calm and Focus drinks with a jar of Urinary Health softgels in a tray beside it",
      },
    ],
    sizes: [{ label: "Set", count: 6, jars: 1, price: 34.99 }],
  },
  {
    id: "supplement-duo",
    kind: "fixed",
    name: "Supplement Duo",
    contents: "2 supplements, your pair",
    blurb: "Two jars in one box, a month of each.",
    image: `${PACKS_BASE}/supplement-duo-glow-pms-front-2.jpg`,
    tileImage: `${PACKS_BASE}/supplement-duo-tile-2.jpg`,
    alt: "The gimme Supplement Duo: an open gift box holding two jars of softgels",
    optionsLabel: "Pair",
    options: [
      {
        key: "glow-pms",
        label: "Glow + PMS",
        image: `${PACKS_BASE}/supplement-duo-glow-pms-front-2.jpg`,
        hoverImage: `${PACKS_BASE}/supplement-duo-glow-pms-angle-2.jpg`,
        alt: "The Supplement Duo box open, with the Glow and PMS Relief jars inside",
      },
      {
        key: "glow-urinary",
        label: "Glow + Urinary",
        image: `${PACKS_BASE}/supplement-duo-glow-urinary-front-2.jpg`,
        hoverImage: `${PACKS_BASE}/supplement-duo-glow-urinary-angle-2.jpg`,
        alt: "The Supplement Duo box open, with the Glow and Urinary Health jars inside",
      },
      {
        key: "pms-urinary",
        label: "PMS + Urinary",
        image: `${PACKS_BASE}/supplement-duo-pms-urinary-front-2.jpg`,
        hoverImage: `${PACKS_BASE}/supplement-duo-pms-urinary-angle-2.jpg`,
        alt: "The Supplement Duo box open, with the Urinary Health and PMS Relief jars inside",
      },
    ],
    /* the duo, or the trio beside it on the quantity row; the trio is its own
       box and takes the pairs out of play */
    sizes: [
      { label: "Duo", count: 0, jars: 2, price: 42.99 },
      {
        label: "Trio",
        count: 0,
        jars: 3,
        price: 59.99,
        name: "Supplement Trio",
        contents: "3 supplements, the full set",
        blurb: "Glow, Urinary Health and PMS Relief, a month of each.",
        image: `${PACKS_BASE}/supplement-trio-front-2.jpg`,
        hoverImage: `${PACKS_BASE}/supplement-trio-angle-2.jpg`,
        alt: "The gimme Supplement Trio: an open gift box holding the Glow, Urinary Health and PMS Relief jars",
      },
    ],
  },
];

/** what a size's contents cost bought one by one */
export function separately(size: PackSize): number {
  return size.count * UNIT_PRICE + (size.jars ?? 0) * SUPPLEMENT_PRICE;
}

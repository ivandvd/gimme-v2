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

/** starter: a fixed set; mix: pick your own drinks; routine: pick your drinks and a softgel */
export type PackKind = "starter" | "mix" | "routine";

export interface Pack {
  id: string;
  kind: PackKind;
  name: string;
  /** the mono line under the name */
  contents: string;
  /** the card picture; the routine has one per softgel, keyed by its slug */
  image: string;
  images?: Record<string, string>;
  alt: string;
  badge?: string;
  sizes: PackSize[];
}

/** the balanced mix a pick-your-own pack starts with, per 12 drinks, in PRODUCTS order */
export const DEFAULT_MIX = [3, 3, 2, 2, 2];

/* The three packs (2026-11-01): one to try, one to live on, one with the
   softgels in. Prices are placeholders on the ladder the owner agreed: the
   starter at the single price, the 12 about a tenth under, the 24 about a
   fifth under, the routine about an eighth under the two bought apart.
   The pictures are stand-ins composed from the cut-outs (scripts/
   compose-pack.py) until his pack renders arrive. House rule: the word
   "can" never appears in copy. */
export const PACKS: Pack[] = [
  {
    id: "starter-pack",
    kind: "starter",
    name: "Starter Pack",
    contents: "Two of each, try all five",
    image: `${PACKS_BASE}/starter-pack-stand-in.jpg`,
    alt: "Ten gimme drinks, two of each, standing in two rows",
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
    id: "the-routine",
    kind: "routine",
    name: "The Routine",
    contents: "Your mix + a month of softgels",
    image: `${PACKS_BASE}/the-routine-pms-relief-stand-in.jpg`,
    images: {
      "gimme-pms-relief": `${PACKS_BASE}/the-routine-pms-relief-stand-in.jpg`,
      "gimme-glow-softgels": `${PACKS_BASE}/the-routine-glow-softgels-stand-in.jpg`,
      "gimme-urinary-health": `${PACKS_BASE}/the-routine-urinary-health-stand-in.jpg`,
    },
    alt: "Two gimme drinks beside a jar of gimme softgels",
    sizes: [
      { label: "12 + jar", count: 12, jars: 1, price: 44.99 },
      { label: "24 + jar", count: 24, jars: 1, price: 64.99 },
    ],
  },
];

/** what a routine size would cost as the lineup of the same count plus its jars */
export function separately(size: PackSize): number {
  const lineup = PACKS.find((p) => p.id === "the-lineup")?.sizes.find((s) => s.count === size.count);
  return (lineup?.price ?? size.price) + (size.jars ?? 0) * SUPPLEMENT_PRICE;
}

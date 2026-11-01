export const PACKS_BASE = "/sites/vibebevvy-com-5acc75fc/shared/packs";

export interface PackSize {
  label: string;
  count: number;
  price: number;
}

export interface Pack {
  id: string;
  name: string;
  contents: string;
  image: string;
  alt: string;
  sizes: PackSize[];
}

/* The two variety packs, shared by the packs section and the mega menu.
   Prices are placeholders at about $2.40 a drink against the $2.49 single.
   House rule: the word "can" never appears in copy. */
export const PACKS: Pack[] = [
  {
    id: "the-lineup",
    name: "The Lineup",
    contents: "One of each",
    image: `${PACKS_BASE}/the-lineup-clean.jpg`,
    alt: "The Lineup carton with one of each gimme drink visible through the window, and the Energy drink standing in front",
    sizes: [
      { label: "5-pack", count: 5, price: 11.99 },
      { label: "10-pack", count: 10, price: 22.99 },
    ],
  },
  {
    id: "day-and-night",
    name: "Day & Night",
    contents: "Two each of Energy, Focus, Calm and Sleep",
    image: `${PACKS_BASE}/day-and-night-clean.jpg`,
    alt: "Energy, Focus, Calm and Sleep drinks standing together on a periwinkle backdrop",
    sizes: [
      { label: "8-pack", count: 8, price: 18.99 },
      { label: "16-pack", count: 16, price: 35.99 },
    ],
  },
];

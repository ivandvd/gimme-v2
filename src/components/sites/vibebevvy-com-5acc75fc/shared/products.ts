import type { VibeProduct } from "./types";

export const CAN_BASE = "/sites/vibebevvy-com-5acc75fc/shared/products";
export const PRICE = "$2.49";

/* gimme lineup, the graded "-film" copies of the cut-outs (scripts/cut-can.py).
   Five drinks in the new can designs (2026-10-31); Probiotics, Him and Her
   left the line that day.
   Shared by the catalogue carousel and the search modal. The `hoverImage` is
   the on-ice shot of the same design (4:5, graded), shown as a tile over the
   can on hover. `color` is the can's own band colour, for the carousel glow. */
export const PRODUCTS: VibeProduct[] = [
  {
    slug: "gimme-energy",
    name: "Gimme Energy",
    flavorSubtitle: "Citrus Melt",
    benefit: "Natural energy and alertness, no crash",
    color: "#D6681B",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-energy-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-energy-on-ice-grade.jpg`,
  },
  {
    slug: "gimme-focus",
    name: "Gimme Focus",
    flavorSubtitle: "Crisp Green Apple",
    benefit: "Concentration and a clear head",
    color: "#59932A",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-focus-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-focus-on-ice-grade.jpg`,
  },
  {
    slug: "gimme-calm",
    name: "Gimme Calm",
    flavorSubtitle: "White Peach",
    benefit: "Relaxes and eases stress without making you sleepy",
    color: "#CF4068",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-calm-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-calm-on-ice-grade.jpg`,
  },
  {
    slug: "gimme-sleep",
    name: "Gimme Sleep",
    flavorSubtitle: "Midnight Berry",
    benefit: "Helps you unwind and sleep better",
    color: "#6459A1",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-sleep-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-sleep-on-ice-grade.jpg`,
  },
  {
    slug: "gimme-glow",
    name: "Gimme Glow",
    flavorSubtitle: "Pearl Lychee",
    benefit: "Skin glow, hair and nails",
    color: "#D89D84",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-glow-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-glow-on-ice-grade.jpg`,
  },
];

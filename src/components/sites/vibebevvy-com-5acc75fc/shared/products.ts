import type { VibeProduct } from "./types";

export const CAN_BASE = "/sites/vibebevvy-com-5acc75fc/shared/products";
export const PRICE = "$2.49";

/* gimme lineup, final can designs (2026-10-20), the graded "-film" copies of
   his cut-outs. Shared by the catalogue carousel and the search modal. The
   `hoverImage` is his on-ice shot of the same design (4:5, graded lightly),
   shown as a tile over the can on hover. */
export const PRODUCTS: VibeProduct[] = [
  {
    slug: "gimme-energy",
    name: "Gimme Energy",
    flavorSubtitle: "Mango Passionfruit",
    benefit: "Natural energy and alertness, no crash",
    color: "#EAB221",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-energy-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-energy-on-ice-film.jpg`,
  },
  {
    slug: "gimme-focus",
    name: "Gimme Focus",
    flavorSubtitle: "Lime Yuzu",
    benefit: "Concentration and a clear head",
    color: "#02958B",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-focus-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-focus-on-ice-film.jpg`,
  },
  {
    slug: "gimme-probiotics",
    name: "Gimme Probiotics",
    flavorSubtitle: "Green Apple",
    benefit: "Digestion and gut health, less bloating",
    color: "#73B351",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-probiotics-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-probiotics-on-ice-film.jpg`,
  },
  {
    slug: "gimme-calm",
    name: "Gimme Calm",
    flavorSubtitle: "Lavender Lemonade",
    benefit: "Relaxes and eases stress without making you sleepy",
    color: "#B791C6",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-calm-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-calm-on-ice-film.jpg`,
  },
  {
    slug: "gimme-sleep",
    name: "Gimme Sleep",
    flavorSubtitle: "Blueberry Vanilla",
    benefit: "Helps you unwind and sleep better",
    color: "#697DC3",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-sleep-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-sleep-on-ice-film.jpg`,
  },
  {
    slug: "gimme-her",
    name: "Gimme Her",
    flavorSubtitle: "Strawberry Hibiscus",
    benefit: "Skin glow, hair and nails",
    color: "#DE6076",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-her-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-her-on-ice-film.jpg`,
  },
  {
    slug: "gimme-him",
    name: "Gimme Him",
    flavorSubtitle: "Black Cherry",
    benefit: "Stamina and daily vitality",
    color: "#B8314F",
    price: PRICE,
    primaryImage: `${CAN_BASE}/gimme-him-can-film.png`,
    hoverImage: `${CAN_BASE}/gimme-him-on-ice-film.jpg`,
  },
];

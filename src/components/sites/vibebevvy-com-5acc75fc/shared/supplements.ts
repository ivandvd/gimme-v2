import type { VibeSupplement } from "./types";

export const SUPPLEMENT_BASE = "/sites/vibebevvy-com-5acc75fc/shared/supplements";
/* placeholder, kept on 2026-10-31 until the real price is set; subscribers get
   the packs' 20% off on top */
export const SUPPLEMENT_PRICE = 24.99;
const PRICE = `$${SUPPLEMENT_PRICE.toFixed(2)}`;

/* The three softgels (2026-10-31). `primaryImage` is the jar cut-out, graded
   with scripts/grade-cutout.py at 0.7; `hoverImage` the open jar with its
   ingredient, graded with scripts/grade-photo.py at 0.8; both 1200x1200.
   Shared by the supplements section, the search modal and the mega menu, so
   the names here are the ones that sit next to the drinks: the Glow softgels
   share their name with the Glow drink and get "Softgels" and their own slug.
   The lines are the jars' own sublines. */
export const SUPPLEMENTS: VibeSupplement[] = [
  {
    kind: "supplement",
    slug: "gimme-pms-relief",
    name: "Gimme PMS Relief",
    shortName: "PMS Relief",
    flavorSubtitle: "Mood + bloat + cycle support",
    benefit: "Calcium, magnesium, saffron, vitamins B6 and D3 and vitex, for less bloating and a steadier mood",
    color: "#983520",
    price: PRICE,
    unitPrice: SUPPLEMENT_PRICE,
    count: 60,
    primaryImage: `${SUPPLEMENT_BASE}/gimme-pms-relief-jar-film.png`,
    hoverImage: `${SUPPLEMENT_BASE}/gimme-pms-relief-scene-film.jpg`,
    sceneAlt: "An open jar of Gimme PMS Relief softgels beside a bowl of saffron threads and a purple crocus",
  },
  {
    kind: "supplement",
    slug: "gimme-glow-softgels",
    name: "Gimme Glow Softgels",
    shortName: "Glow",
    flavorSubtitle: "Sea moss softgels",
    benefit: "Sea moss with collagen peptides, vitamin C and biotin, for hydrated skin and a clear complexion",
    color: "#223b25",
    price: PRICE,
    unitPrice: SUPPLEMENT_PRICE,
    count: 60,
    primaryImage: `${SUPPLEMENT_BASE}/gimme-glow-softgels-jar-film.png`,
    hoverImage: `${SUPPLEMENT_BASE}/gimme-glow-softgels-scene-film.jpg`,
    sceneAlt: "An open jar of Gimme Glow softgels beside golden sea moss and a slice of orange",
  },
  {
    kind: "supplement",
    slug: "gimme-urinary-health",
    name: "Gimme Urinary Health",
    shortName: "Urinary Health",
    flavorSubtitle: "Cranberry extract, 36 mg PACs",
    benefit: "Cranberry extract standardised to 36 mg of PACs, for the urinary tract and everyday wellness",
    color: "#3d1b3e",
    price: PRICE,
    unitPrice: SUPPLEMENT_PRICE,
    count: 60,
    primaryImage: `${SUPPLEMENT_BASE}/gimme-urinary-health-jar-film.png`,
    hoverImage: `${SUPPLEMENT_BASE}/gimme-urinary-health-scene-film.jpg`,
    sceneAlt: "An open jar of Gimme Urinary Health softgels beside a bowl of fresh cranberries",
  },
];

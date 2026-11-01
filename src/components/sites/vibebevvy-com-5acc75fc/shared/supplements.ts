import type { VibeSupplement } from "./types";

export const SUPPLEMENT_BASE = "/sites/vibebevvy-com-5acc75fc/shared/supplements";
/* placeholder, kept on 2026-10-31 until the real price is set; subscribers get
   the packs' 20% off on top */
export const SUPPLEMENT_PRICE = 24.99;
const PRICE = `$${SUPPLEMENT_PRICE.toFixed(2)}`;

/* The three softgels in the owner's pastel jars (2026-11-01 renders).
   `primaryImage` is the jar cut-out framed on the 1200x1200 card canvas
   (scripts/cut-jar.py) and graded with scripts/grade-cutout.py at 0.7;
   `hoverImage` the studio shot of the same jar, graded with
   scripts/grade-photo.py at 0.8 without grain; sources sit next to them.
   `color` is the cap's colour. Shared by the supplements section, the search
   modal and the mega menu, so the names here are the ones that sit next to
   the drinks: the Glow softgels share their name with the Glow drink and get
   "Softgels" and their own slug. The lines are the jars' own sublines. */
export const SUPPLEMENTS: VibeSupplement[] = [
  {
    kind: "supplement",
    slug: "gimme-pms-relief",
    name: "Gimme PMS Relief",
    shortName: "PMS Relief",
    flavorSubtitle: "Mood + bloat + cycle support",
    benefit: "Calcium, magnesium, saffron, vitamins B6 and D3 and vitex, for less bloating and a steadier mood",
    color: "#cbb5d9",
    price: PRICE,
    unitPrice: SUPPLEMENT_PRICE,
    count: 60,
    primaryImage: `${SUPPLEMENT_BASE}/gimme-pms-relief-jar-v2-film.png`,
    hoverImage: `${SUPPLEMENT_BASE}/gimme-pms-relief-scene-v2-clean.jpg`,
    sceneAlt: "A lavender jar of Gimme PMS Relief softgels with two softgels in front, on a warm studio backdrop",
  },
  {
    kind: "supplement",
    slug: "gimme-glow-softgels",
    name: "Gimme Glow Softgels",
    shortName: "Glow",
    flavorSubtitle: "Skin health from within",
    benefit: "Sea moss with collagen peptides, vitamin C and biotin, for hydrated skin and a clear complexion",
    color: "#e4acb2",
    price: PRICE,
    unitPrice: SUPPLEMENT_PRICE,
    count: 60,
    primaryImage: `${SUPPLEMENT_BASE}/gimme-glow-softgels-jar-v2-film.png`,
    hoverImage: `${SUPPLEMENT_BASE}/gimme-glow-softgels-scene-v2-clean.jpg`,
    sceneAlt: "A blush-pink jar of Gimme Glow softgels with three softgels in front, on a warm studio backdrop",
  },
  {
    kind: "supplement",
    slug: "gimme-urinary-health",
    name: "Gimme Urinary Health",
    shortName: "Urinary Health",
    flavorSubtitle: "Cranberry extract, 36 mg PACs",
    benefit: "Cranberry extract standardised to 36 mg of PACs, for the urinary tract and everyday wellness",
    color: "#a5b6a7",
    price: PRICE,
    unitPrice: SUPPLEMENT_PRICE,
    count: 60,
    primaryImage: `${SUPPLEMENT_BASE}/gimme-urinary-health-jar-v2-film.png`,
    hoverImage: `${SUPPLEMENT_BASE}/gimme-urinary-health-scene-v2-clean.jpg`,
    sceneAlt: "A sage-green jar of Gimme Urinary Health softgels with three amber softgels in front, on a warm studio backdrop",
  },
];

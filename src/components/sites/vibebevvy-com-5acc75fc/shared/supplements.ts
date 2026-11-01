import type { VibeSupplement } from "./types";

export const SUPPLEMENT_BASE = "/sites/vibebevvy-com-5acc75fc/shared/supplements";
/* placeholder, kept on 2026-10-31 until the real price is set; subscribers get
   the packs' 20% off on top */
export const SUPPLEMENT_PRICE = 24.99;
const PRICE = `$${SUPPLEMENT_PRICE.toFixed(2)}`;

/* The three softgels in the owner's pastel jars (2026-11-01 renders).
   `primaryImage` is the jar cut out of his studio render and framed on the
   1200x1200 card canvas (scripts/cut-jar.py), graded with
   scripts/grade-cutout.py at 0.7; `hoverImage` his flat-lay of the jar among
   its ingredient (2:3), graded with scripts/grade-photo.py at 0.5 without
   grain; the sources sit next to them.
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
    primaryImage: `${SUPPLEMENT_BASE}/gimme-pms-relief-jar-v3-film.png`,
    hoverImage: `${SUPPLEMENT_BASE}/gimme-pms-relief-flatlay-clean.jpg`,
    sceneAlt: "A lavender jar of Gimme PMS Relief softgels from above, among saffron threads and purple crocus flowers on lavender",
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
    primaryImage: `${SUPPLEMENT_BASE}/gimme-glow-softgels-jar-v3-film.png`,
    hoverImage: `${SUPPLEMENT_BASE}/gimme-glow-softgels-flatlay-clean.jpg`,
    sceneAlt: "A blush-pink jar of Gimme Glow softgels from above, among golden sea moss on coral",
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
    primaryImage: `${SUPPLEMENT_BASE}/gimme-urinary-health-jar-v3-film.png`,
    hoverImage: `${SUPPLEMENT_BASE}/gimme-urinary-health-flatlay-clean.jpg`,
    sceneAlt: "A sage-green jar of Gimme Urinary Health softgels from above, among fresh cranberries and leaves on green",
  },
];

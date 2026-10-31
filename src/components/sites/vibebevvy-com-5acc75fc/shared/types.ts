export interface VibeProduct {
  /** drinks come on a 600x1384 canvas, supplements on a square one */
  kind?: "drink" | "supplement";
  slug: string;
  name: string;
  flavorSubtitle: string;
  price?: string;
  primaryImage: string;
  hoverImage?: string;
  benefit?: string;
  color?: string;
  badge?: string;
}

/** a softgel jar: the product shape the search and menu read, plus what its card needs */
export interface VibeSupplement extends VibeProduct {
  kind: "supplement";
  /** the name on the card, where the section already says gimme */
  shortName: string;
  hoverImage: string;
  sceneAlt: string;
  unitPrice: number;
  count: number;
}

export interface VibeTestimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export interface VibeRecipe {
  id: string;
  name: string;
  image: string;
}

export interface VibeSocialTile {
  id: string;
  image: string;
  tall: boolean;
}

export interface VibeNavLink {
  label: string;
  href: string;
}

export interface VibeFooterColumn {
  heading?: string;
  links: VibeNavLink[];
}

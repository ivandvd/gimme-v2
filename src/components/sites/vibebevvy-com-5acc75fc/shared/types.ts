export interface VibeProduct {
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

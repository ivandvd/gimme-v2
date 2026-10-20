import type { Metadata } from "next";
import { Suspense } from "react";

import { NoticePage } from "@/components/sites/vibebevvy-com-5acc75fc/shared/NoticePage";

export const metadata: Metadata = {
  title: "Coming soon · Gimme Drinks",
  description: "This part of gimme is still in the works. The drinks aren’t.",
};

/* Every link and button on the site that has no page behind it yet, with the
   label shown above the headline. These are prerendered; any other path that
   reaches this catch-all renders the same page on its first request. Replace
   an entry with a real route when that page gets built. */
const LABELS: Record<string, string> = {
  "products/gimme-energy": "Gimme Energy",
  "products/gimme-focus": "Gimme Focus",
  "products/gimme-probiotics": "Gimme Probiotics",
  "products/gimme-calm": "Gimme Calm",
  "products/gimme-sleep": "Gimme Sleep",
  "products/gimme-her": "Gimme Her",
  "products/gimme-him": "Gimme Him",
  "collections/all": "All products",
  "collections/drinks": "Drinks",
  "collections/shop-all": "All products",
  "collections/packs": "Variety packs",
  story: "Our story",
  reviews: "Reviews",
  "pages/contact": "Contact",
  "pages/health-benefits": "Health benefits",
  "pages/sustainability": "Sustainability",
  "pages/impact": "Impact",
  "account/login": "Account",
  "pages/subscribe": "Subscription",
  "account/orders": "Orders",
  "account/profile": "Profile",
  search: "Search",
  cart: "Cart",
};

export function generateStaticParams() {
  return Object.keys(LABELS).map((path) => ({ slug: path.split("/") }));
}

/* Only the label reads the URL, inside its own Suspense boundary, so the
   rest of the page stays part of the instant static shell (Next flags
   `params` read outside Suspense on a navigation). */
async function Label({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <>{LABELS[slug.join("/")] ?? "Gimme Drinks"}</>;
}

export default function ComingSoon({ params }: { params: Promise<{ slug: string[] }> }) {
  return (
    <NoticePage
      eyebrow={
        <Suspense fallback={"\u00a0"}>
          <Label params={params} />
        </Suspense>
      }
      headline="Coming soon."
      subhead="This page is still in the works. The drinks aren’t."
    />
  );
}

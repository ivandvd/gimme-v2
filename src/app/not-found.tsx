import type { Metadata } from "next";

import { NoticePage } from "@/components/sites/vibebevvy-com-5acc75fc/shared/NoticePage";

export const metadata: Metadata = {
  title: "Page not found · Gimme Drinks",
  description: "That page isn’t here. The drinks are.",
};

/**
 * Branded 404 for URLs no route claims. Links on the site never land here:
 * every page that does not exist yet is served by the coming-soon catch-all
 * (src/app/[...slug]/page.tsx), because `next dev` reload-loops on 404s.
 */
export default function NotFound() {
  return <NoticePage eyebrow="Error 404" headline="Sip happens." subhead="That page isn’t ready yet. The drinks are." />;
}

import type { Metadata } from "next";

import { LenisProvider } from "@/components/sites/vibebevvy-com-5acc75fc/shared/LenisProvider";
import { VibeEntrances } from "@/components/sites/vibebevvy-com-5acc75fc/shared/VibeEntrances";
import { Accordion } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Accordion";
import { Banner } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Banner";
import { Benefits } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Benefits";
import { Cta } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Cta";
import { PressMarquee } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/PressMarquee";
import { Footer } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Footer";
import { Header } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Header";
import { Hero } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Hero";
import { Mascot } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Mascot";
import { ProductGrid } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/ProductGrid";
import { Ribbon } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Ribbon";
import { Social } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Social";
import { Subscription } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Subscription";
import { Supplements } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Supplements";
import { Testimonial } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Testimonial";
import { VarietyPacks } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/VarietyPacks";

export const metadata: Metadata = {
  title: "Gimme Drinks",
  description:
    "Zero-sugar drinks made with real fruit, each with a job to do. Energy, focus, calm, sleep and glow. Whatever you need, there’s a gimme for that.",
};

/* Mirrors the live DOM: .page-wrapper > #header-group (ticker, sticky header,
   megamenu spacer) > main#MainContent > sections, then the footer. */
export default function Home() {
  return (
    <LenisProvider>
      <div id="header-group">
        <Header />
      </div>
      <main id="MainContent">
        <Hero />
        <PressMarquee />
        <ProductGrid />
        <VarietyPacks />
        <Supplements />
        <Ribbon line="Health that tastes like a treat. Real fruit. Zero sugar. One job each." />
        <Benefits />
        <Testimonial />
        <Subscription />
        <Mascot />
        <Accordion />
        <Banner />
        <Ribbon line="Whatever you need, there’s a gimme for that. Day and night." mirror />
        <Cta />
        <Social />
      </main>
      <Footer />
      {/* mounted inside the page segment so its effect runs after this content has hydrated */}
      <VibeEntrances />
    </LenisProvider>
  );
}

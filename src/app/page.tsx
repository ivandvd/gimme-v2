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
import { Testimonial } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Testimonial";
import { VarietyPacks } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/VarietyPacks";

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
        <ProductGrid />
        <Accordion />
        <Testimonial />
        <PressMarquee />
        <VarietyPacks />
        <Subscription />
        <Ribbon />
        <Banner />
        <Mascot />
        <Benefits />
        <Cta />
        <Social />
      </main>
      <Footer />
      {/* mounted inside the page segment so its effect runs after this content has hydrated */}
      <VibeEntrances />
    </LenisProvider>
  );
}

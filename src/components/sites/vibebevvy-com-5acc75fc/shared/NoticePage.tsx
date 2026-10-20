import type { CSSProperties, ReactNode } from "react";

import { Footer } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Footer";
import { Header } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Header";
import { LenisProvider } from "@/components/sites/vibebevvy-com-5acc75fc/shared/LenisProvider";
import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import { SplitTitle } from "@/components/sites/vibebevvy-com-5acc75fc/shared/SplitTitle";
import { VibeEntrances } from "@/components/sites/vibebevvy-com-5acc75fc/shared/VibeEntrances";

interface NoticePageProps {
  eyebrow: ReactNode;
  headline: string;
  subhead: string;
}

/**
 * One-message page with the site's chrome (ticker, sticky header, footer):
 * a plum hero-sized block, so the transparent header reads cream over it the
 * way it does over the hero photos, with the hero's text system (mono
 * eyebrow, display headline with the letter pop, blob button). Used by the
 * 404 and by the coming-soon catch-all.
 */
export function NoticePage({ eyebrow, headline, subhead }: NoticePageProps) {
  return (
    <LenisProvider>
      <div id="header-group">
        <Header />
      </div>
      <main id="MainContent">
        <section className="vibe-notice-section">
          <section className="vibe-notice">
            <div className="vibe-notice__inner">
              <RevealOnScroll as="p" className="vibe-notice__eyebrow">
                {eyebrow}
              </RevealOnScroll>
              <h1 className="vibe-notice__headline" data-vibe-title="" aria-label={headline}>
                <SplitTitle text={headline} />
              </h1>
              <RevealOnScroll as="p" className="vibe-notice__subhead" delay={0.2}>
                {subhead}
              </RevealOnScroll>
              <div className="vibe-notice__cta" data-vibe-pop="" style={{ "--vibe-pop-delay": "0.55s" } as CSSProperties}>
                <PillButton href="/">Back home</PillButton>
              </div>
            </div>
          </section>
        </section>
      </main>
      <Footer />
      <VibeEntrances />
    </LenisProvider>
  );
}

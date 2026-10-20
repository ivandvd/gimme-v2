import type { ReactNode } from "react";

import { Footer } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Footer";
import { Header } from "@/components/sites/vibebevvy-com-5acc75fc/root-8a5edab2/Header";
import { LenisProvider } from "@/components/sites/vibebevvy-com-5acc75fc/shared/LenisProvider";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import { VibeEntrances } from "@/components/sites/vibebevvy-com-5acc75fc/shared/VibeEntrances";

export interface LegalSection {
  heading: string;
  /** paragraphs, or a list when an item is an array of strings */
  body: (string | string[])[];
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  /** one line at the foot, for example who to contact */
  outro?: ReactNode;
}

/**
 * Long-form page for the policies: the site's chrome, a plum title band
 * pulled under the transparent header (so the bar reads cream over it, like
 * the hero), then the text on cream in a reading column with Henrietta
 * headings and body, mono for the small print.
 */
export function LegalPage({ eyebrow, title, updated, intro, sections, outro }: LegalPageProps) {
  return (
    <LenisProvider>
      <div id="header-group">
        <Header />
      </div>
      <main id="MainContent">
        <section className="vibe-legal-section">
          <div className="vibe-legal__head">
            <div className="vibe-legal__head-inner">
              <RevealOnScroll as="p" className="vibe-legal__eyebrow">
                {eyebrow}
              </RevealOnScroll>
              <RevealOnScroll as="h1" className="vibe-legal__title" delay={0.1}>
                {title}
              </RevealOnScroll>
              <RevealOnScroll as="p" className="vibe-legal__updated" delay={0.2}>
                Last updated {updated}
              </RevealOnScroll>
            </div>
          </div>
          <article className="vibe-legal__body">
            <p className="vibe-legal__intro">{intro}</p>
            {sections.map((section, index) => (
              <section key={section.heading} className="vibe-legal__block" aria-labelledby={`legal-${index}`}>
                <h2 id={`legal-${index}`} className="vibe-legal__heading">
                  {section.heading}
                </h2>
                {section.body.map((item, i) =>
                  Array.isArray(item) ? (
                    <ul key={i} className="vibe-legal__list">
                      {item.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i} className="vibe-legal__text">
                      {item}
                    </p>
                  ),
                )}
              </section>
            ))}
            {outro ? <p className="vibe-legal__outro">{outro}</p> : null}
          </article>
        </section>
      </main>
      <Footer />
      <VibeEntrances />
    </LenisProvider>
  );
}

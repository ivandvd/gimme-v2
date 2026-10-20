import Image from "next/image";

import { PillButton } from "@/components/sites/vibebevvy-com-5acc75fc/shared/PillButton";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";

const ASSET_BASE = "/sites/vibebevvy-com-5acc75fc/root-8a5edab2";

/* The gimme story (approved 2026-10-20). House rule: the word "can" never
   appears in copy. */
const STORY = [
  "Gimme started with a craving we couldn’t shake: something cold and sweet that actually did us good.",
  "We grew up in families where food was medicine and nobody showed up to a gathering empty-handed. So we made drinks that do both. Each with its own job, for day and night, for him and her.",
  "Real fruit. Ingredients that work. Zero sugar. Health that tastes like a treat.",
];

/**
 * vibebevvy.com `.vibe-mascot` layout (illustration left, centred story and
 * blob button right), with the art capped so it stays an accent on wide
 * screens and the column widened for the three-paragraph story. The walking
 * globe is Vibe's and stays only as a placeholder until the gimme character
 * is drawn.
 */
export function Mascot() {
  return (
    <section className="vibe-mascot-section">
      <section className="vibe-mascot">
        <div className="vibe-mascot__inner">
          <div className="vibe-mascot__art">
            <Image
              src={`${ASSET_BASE}/icons/globe-mascot.svg`}
              width={587}
              height={481}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          </div>
          <div className="vibe-mascot__content">
            <div className="vibe-mascot__text">
              {STORY.map((paragraph, index) => (
                <RevealOnScroll key={index} as="p" className="vibe-mascot__body" delay={index * 0.1}>
                  {paragraph}
                </RevealOnScroll>
              ))}
            </div>
            <PillButton href="/story">Our Story</PillButton>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Mascot;

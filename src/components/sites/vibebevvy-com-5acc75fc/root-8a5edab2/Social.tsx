import Image from "next/image";
import type { CSSProperties } from "react";

import { Marquee } from "@/components/sites/vibebevvy-com-5acc75fc/shared/Marquee";
import { RevealOnScroll } from "@/components/sites/vibebevvy-com-5acc75fc/shared/RevealOnScroll";
import { SplitTitle } from "@/components/sites/vibebevvy-com-5acc75fc/shared/SplitTitle";

const ASSET_BASE = "/sites/vibebevvy-com-5acc75fc/root-8a5edab2";
/* His seven shots, resized to 1000px wide and run through scripts/grade-photo.py (the house film grade). */
const SOCIAL_BASE = "/sites/vibebevvy-com-5acc75fc/shared/social";

const HEADING = "Gimme a look.";
/* The handle is a placeholder until the real accounts exist. */
const BODY =
  "Tag @gimmedrinks and there’s a good chance you land here. We repost the ones we love, and we love most of them. Blurry, badly lit, mid-sip, all welcome.";

/* The live row shows three circles with no targets; ours has four (Instagram
   added) and they become links once the accounts exist. */
const SOCIAL_ICONS = [
  { name: "Instagram", icon: `${ASSET_BASE}/icons/social-icon-instagram.svg` },
  { name: "Facebook", icon: `${ASSET_BASE}/icons/social-icon-facebook.svg` },
  { name: "TikTok", icon: `${ASSET_BASE}/icons/social-icon-tiktok.svg` },
  { name: "YouTube", icon: `${ASSET_BASE}/icons/social-icon-youtube.svg` },
];

/* All cards the tall 310.5:450 size (his call; the live strip alternates
   square and tall and carries a club poster in slot 2). The square shots are
   nudged with an object-position where the centre crop would lose the drink:
   1 Energy on pineapples, 8 the surf cap with Focus, 3 the sweater on the
   beach, 4 Her with the cherry bag, 9 the lake with Him, 5 the lavender
   poster, 6 three in hand, 7 Sleep on the car hood. */
/* the pour shot (2) moved to the benefits section */
const PHOTOS: { n: number; pos?: string }[] = [{ n: 1 }, { n: 8, pos: "32% 50%" }, { n: 3 }, { n: 4 }, { n: 9 }, { n: 5 }, { n: 6 }, { n: 7 }];

/* The ticker component with its lavender band and padding switched off. */
const MARQUEE_VARS = { "--vibe-mq-bg": "transparent", "--vibe-mq-pad": "0px" } as CSSProperties;

/**
 * vibebevvy.com `.vibe-social`: heading with the letter pop beside a mono
 * paragraph with the mask reveal, then the card strip driven by the same
 * marquee component as the tickers (22px gap, speed factor 25, pointer events
 * off), then the three social circles. 150/1440vw of air above, none below:
 * the footer brings its own.
 */
export function Social() {
  return (
    <section className="vibe-social">
      <div className="vibe-social__wrapper">
        <div className="vibe-social__header">
          <h2 className="vibe-social__heading" data-vibe-title="" aria-label={HEADING}>
            <SplitTitle text={HEADING} />
          </h2>
          <RevealOnScroll as="p" className="vibe-social__body">
            {BODY}
          </RevealOnScroll>
        </div>

        <Marquee className="vibe-social__marquee" gap={22} speedFactor={25} style={MARQUEE_VARS}>
          {PHOTOS.map(({ n, pos }) => (
            <div key={n} className="vibe-social__card">
              <Image
                src={`${SOCIAL_BASE}/gimme-social-${n}-film.jpg`}
                alt=""
                fill
                sizes="(min-width: 750px) 21.56vw, 44vw"
                style={pos ? { objectPosition: pos } : undefined}
              />
            </div>
          ))}
        </Marquee>

        <div className="vibe-social__links">
          {SOCIAL_ICONS.map((item) => (
            <span key={item.name} className="vibe-social__circle" aria-hidden="true">
              <Image src={item.icon} alt="" width={21} height={21} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Social;
